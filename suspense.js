const { contentsToString } = require('./index');
const { PassThrough, Writable, pipeline, Transform } = require('stream');

// Avoids double initialization in case this file is not cached by
// module bundlers.
if (!globalThis.SUSPENSE_ROOT) {
  /* global SUSPENSE_ROOT */
  globalThis.SUSPENSE_ROOT = {
    requests: new Map(),
    requestCounter: 1,
    enabled: false,
    autoScript: true
  };
}

/**
 * Simple IE11 compatible replace child scripts to replace the template streamed by the
 * server.
 *
 * As this script is the only residue of this package that is actually sent to the client,
 * it's important to keep it as small as possible and also include the license to avoid
 * legal issues.
 */
// Pending data-sr elements are kept pending if their fallback has not yet been
// rendered, on each render a try to switch all pending data-sr is attempted until
// no elements are substituted.
const SuspenseScript = /* html */ `
      <script id="kita-html-suspense">
        /*! Apache-2.0 https://kita.js.org */
        // i is the id of the template
        // g is the flag append element before instead of replacing
        function $KITA_RC(i,g){
          // simple aliases
          var d=document,q=d.querySelector.bind(d),
            // div sent as the fallback wrapper
            v=q((g?'template':'div')+'#B'+i+'[data-sf]'),
            // template and script sent after promise finishes
            t=q('template#N'+i+'[data-sr]'),
            s=q('script#S'+i+'[data-ss]'),
            // fragment created to avoid inserting element one by one
            f=d.createDocumentFragment(),
            // used by iterators
            c,j,
            // all pending hydrations
            r;

          // if div or template is not found, let this hydration as pending
          if(t&&v&&s){
            // appends into the fragment
            while(c=t.content.firstChild)
              f.appendChild(c);

            // replaces the div and removes the script and template
            if(g) v.parentNode.insertBefore(f,v);
            else v.parentNode.replaceChild(f,v);

            t.remove();
            s.remove();

            // looks for pending templates
            r=d.querySelectorAll('template[id][data-sr]');

            do{
              // resets j from previous loop
              j=0;

              // loops over every found pending template and 
              for(c=0;c<r.length;c++)
                if(r[c]!=t)
                  // let j as true while at least on $KITA_RC call returns true
                  j=$KITA_RC(r[c].id.slice(2),g)?!0:j;
            }while(j)

            // we know at least the original template was substituted
            return!0;
          }
        }
      </script>
    `
  // Removes comment lines
  .replace(/^\s*\/\/.*/gm, '')
  // Removes line breaks added for readability
  .replace(/\n\s*/g, '');

/** @type {import('./suspense').SuspenseGenerator} */
function SuspenseGenerator(props) {
  // There's no actual way of knowing if this component is being
  // rendered inside a renderToString call, so we have to rely on
  // this simple check: If the First Suspense render is called without
  // `enabled` being true, it means no renderToString was called before.
  // This is not 100% accurate, but it's the best estimation we can do.
  if (!SUSPENSE_ROOT.enabled) {
    throw new Error('Cannot use SuspenseGenerator outside of a `renderToStream` call.');
  }

  if (!props.rid) {
    throw new Error('SuspenseGenerator requires a `rid` to be specified.');
  }

  let data = SUSPENSE_ROOT.requests.get(props.rid);

  if (!data) {
    throw new Error('No request data was found for the provided `rid`.');
  }

  // Deref is not a expensive call,
  const stream = data.stream.deref();

  // Stream was probably already closed/cleared out.
  if (!stream || stream.closed) {
    throw new Error('Stream was already closed.');
  }

  const hasMap = 'map' in props;

  // Gets the current run number for this yielded value
  const run = ++data.running;

  pipeline(
    // Using pipeline is good because it broader the compatibility
    // with iterators, generators and streams.
    props.source,

    new Transform({
      // When a mapper is not defined, we can ensure the original stream will be
      // of type string or buffer
      objectMode: hasMap,

      transform(chunk, encoding, callback) {
        chunk = hasMap ? props.map(chunk, encoding) : chunk.toString('utf8');

        // Handles promise recursively
        if (chunk instanceof Promise) {
          return chunk.then(pushTemplate, callback);
        } else {
          return pushTemplate(chunk);
        }

        /** @param {string} html */
        function pushTemplate(html) {
          const data = SUSPENSE_ROOT.requests.get(props.rid);

          if (!data) {
            return callback(
              new Error('No request data was found for the provided `rid`.')
            );
          }

          // prettier-ignore
          html = '<template id="N' + run + '" data-sr>' + html + '</template><script id="S' + run + '" data-ss>$KITA_RC(' + run + ',1)</script>'

          // Appends the script to the template to save a TCP round-trip.
          if (SUSPENSE_ROOT.autoScript && data.sent === false) {
            html = SuspenseScript + html;
            data.sent = true;
          }

          return callback(null, html);
        }
      }
    }),

    // Pipes the transformed stream to the write stream, probably a
    // http.ServerResponse or a fs.WriteStream
    stream,

    function handleFatalError(error) {
      const data = SUSPENSE_ROOT.requests.get(props.rid);

      if (!data) {
        /* c8 ignore next 2 */
        if (error) {
          // Nothing else to do if no catch or listener was found
          console.error(error);
        }

        return;
      }

      // handles possible error
      if (error) {
        const stream = data.stream.deref();

        // stream.emit returns true if there's a listener
        // so we can safely ignore the error
        if (stream && stream.emit('error', error)) {
          return;
        }
      }

      // reduces current suspense id
      if (data.running > 1) {
        data.running -= 1;

        // Last suspense component, runs cleanup
      } else {
        const stream = data.stream.deref();

        if (stream && !stream.closed) {
          stream.end();
        }

        // Removes the current state
        SUSPENSE_ROOT.requests.delete(props.rid);
      }
    }
  );

  return '<template id="B' + run + '" data-sf></template>';
}

/** @type {import('./suspense').Suspense} */
function Suspense(props) {
  // There's no actual way of knowing if this component is being
  // rendered inside a renderToString call, so we have to rely on
  // this simple check: If the First Suspense render is called without
  // `enabled` being true, it means no renderToString was called before.
  // This is not 100% accurate, but it's the best estimation we can do.
  if (!SUSPENSE_ROOT.enabled) {
    throw new Error('Cannot use Suspense outside of a `renderToStream` call.');
  }

  if (!props.rid) {
    throw new Error('Suspense requires a `rid` to be specified.');
  }

  // fallback may be async.
  const fallback = contentsToString([props.fallback]);

  if (!props.children) {
    return '';
  }

  const children = contentsToString([props.children]);

  // Returns content if it's not a promise
  if (typeof children === 'string') {
    return children;
  }

  let data = SUSPENSE_ROOT.requests.get(props.rid);

  if (!data) {
    throw new Error(
      'Request data was deleted before all suspense components were resolved.'
    );
  }

  // Gets the current run number for this request
  // Increments first so we can differ 0 as no suspenses
  // were used and 1 as the first suspense component
  const run = ++data.running;

  children
    .then(writeStreamTemplate)
    .catch(function errorRecover(error) {
      // No catch block was specified, so we can
      // re-throw the error.
      if (!props.catch) {
        throw error;
      }

      let html;

      // unwraps error handler
      if (typeof props.catch === 'function') {
        html = props.catch(error);
      } else {
        html = props.catch;
      }

      // handles if catch block returns a string
      if (typeof html === 'string') {
        return writeStreamTemplate(html);
      }

      // must be a promise
      return html.then(writeStreamTemplate);
    })
    .catch(function writeFatalError(error) {
      if (data) {
        const stream = data.stream.deref();

        // stream.emit returns true if there's a listener
        // so we can safely ignore the error
        if (stream && stream.emit('error', error)) {
          return;
        }
      }
      /* c8 ignore next 2 */
      // Nothing else to do if no catch or listener was found
      console.error(error);
    })
    .finally(function clearRequestData() {
      // Reloads the request data as it may have been closed
      data = SUSPENSE_ROOT.requests.get(props.rid);

      if (!data) {
        return;
      }

      // reduces current suspense id
      if (data.running > 1) {
        data.running -= 1;

        // Last suspense component, runs cleanup
      } else {
        const stream = data.stream.deref();

        if (stream && !stream.closed) {
          stream.end();
        }

        // Removes the current state
        SUSPENSE_ROOT.requests.delete(props.rid);
      }
    });

  // Keeps string return type
  if (typeof fallback === 'string') {
    return '<div id="B' + run + '" data-sf>' + fallback + '</div>';
  }

  return fallback.then(function resolveCallback(resolved) {
    return '<div id="B' + run + '" data-sf>' + resolved + '</div>';
  });

  /**
   * This function may be called by the catch handler in case the error could be handled.
   *
   * @param {string} result
   */
  function writeStreamTemplate(result) {
    // Reloads the request data as it may have been closed
    data = SUSPENSE_ROOT.requests.get(props.rid);

    if (!data) {
      return;
    }

    const stream = data.stream.deref();

    // Stream was probably already closed/cleared out.
    // We can safely ignore this.
    if (!stream || stream.closed) {
      return;
    }

    // prettier-ignore
    result = '<template id="N' + run + '" data-sr>' + result + '</template><script id="S' + run + '" data-ss>$KITA_RC(' + run + ')</script>';

    // Concatenates the suspense script to save a TCP round-trip.
    if (SUSPENSE_ROOT.autoScript && data.sent === false) {
      result = SuspenseScript + result;
      data.sent = true;
    }

    // Writes the chunk
    stream.write(result);
  }
}

// the real reason this is a extra function is because fastify-html-plugin and
// future plugins may want to reuse streams and this function avoids forcing
// them to reimplement the suspense logic.
/** @type {import('./suspense').pipeHtml} */
function pipeHtml(html, stream, rid) {
  // When the HTML is a string, it means there were no other async components
  // or async Suspense's fallbacks. We can just pipe the HTML to the stream
  // and try to close it.
  if (typeof html === 'string') {
    stream.write(html);

    const requestData = SUSPENSE_ROOT.requests.get(rid);

    // This request data was already resolved or no suspenses were used.
    if (!requestData || requestData.running === 0) {
      stream.end();
      SUSPENSE_ROOT.requests.delete(rid);
    }

    return;
  }

  html
    .then(function writeStreamHtml(html) {
      stream.write(html);
    })
    .catch(function catchError(error) {
      // Emits the error down the stream or
      // prints it to the console if there's no
      // listener (default node impl always has a listener)

      /* c8 ignore next 4 */
      if (stream.emit('error', error) === false) {
        console.error(error);
      }
    })
    .finally(function endStream() {
      const requestData = SUSPENSE_ROOT.requests.get(rid);

      // This request data already resolved or no suspenses were used.
      if (!requestData || requestData.running === 0) {
        stream.end();
        SUSPENSE_ROOT.requests.delete(rid);
      }
    });
}

/** @type {import('./suspense').renderToStream} */
function renderToStream(factory, rid) {
  // Enables suspense if it's not enabled yet
  if (SUSPENSE_ROOT.enabled === false) {
    SUSPENSE_ROOT.enabled = true;
  }

  // Ensures the request id is unique
  if (!rid) {
    rid = SUSPENSE_ROOT.requestCounter++;
  } else if (SUSPENSE_ROOT.requests.has(rid)) {
    throw new Error(`The provided Request Id is already in use: ${rid}.`);
  }

  const stream = new PassThrough();

  SUSPENSE_ROOT.requests.set(rid, {
    stream: new WeakRef(stream),
    running: 0,
    sent: false
  });

  try {
    // Loads the template
    const html = factory(rid);

    // Pipes the HTML to the stream
    pipeHtml(html, stream, rid);

    return stream;
  } catch (renderError) {
    // Could not generate even the loading template.
    // This means a sync error was thrown and there's
    // nothing we can do unless closing the stream
    // and re-throwing the error.
    stream.end();
    SUSPENSE_ROOT.requests.delete(rid);

    throw renderError;
  }
}

/** @type {import('./suspense').renderToString} */
function renderToString(factory, rid) {
  // Enables suspense if it's not enabled yet
  if (SUSPENSE_ROOT.enabled === false) {
    SUSPENSE_ROOT.enabled = true;
  }

  // Ensures the request id is unique
  if (!rid) {
    rid = SUSPENSE_ROOT.requestCounter++;
  } else if (SUSPENSE_ROOT.requests.has(rid)) {
    throw new Error(`The provided Request Id is already in use: ${rid}.`);
  }

  let finalHtml = '';

  const stream = new Writable({
    write(chunk, _, callback) {
      finalHtml += chunk.toString();
      callback();
    }
  });

  SUSPENSE_ROOT.requests.set(rid, {
    stream: new WeakRef(stream),
    running: 0,
    sent: false
  });

  try {
    // Loads the template
    const html = factory(rid);

    // Pipes the HTML to the stream
    pipeHtml(html, stream, rid);

    return new Promise((res, rej) => {
      stream.once('finish', () => res(finalHtml));
      stream.once('error', rej);
    }).finally(() => {
      //@ts-expect-error - We know it's rid
      SUSPENSE_ROOT.requests.delete(rid);
    });
  } catch (renderError) {
    // Could not generate even the loading template.
    // This means a sync error was thrown and there's
    // nothing we can do unless closing the stream
    // and re-throwing the error.
    stream.end();
    SUSPENSE_ROOT.requests.delete(rid);

    throw renderError;
  }
}

module.exports.Suspense = Suspense;
module.exports.SuspenseGenerator = SuspenseGenerator;
module.exports.pipeHtml = pipeHtml;
module.exports.renderToStream = renderToStream;
module.exports.renderToString = renderToString;
module.exports.SuspenseScript = SuspenseScript;
