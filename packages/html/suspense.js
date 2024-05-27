const { contentsToString, contentToString } = require('./index');
const { Readable } = require('node:stream');

// Avoids double initialization in case this file is not cached by
// module bundlers.
if (!globalThis.SUSPENSE_ROOT) {
  /* global SUSPENSE_ROOT */
  globalThis.SUSPENSE_ROOT = {
    requests: new Map(),
    requestCounter: 1,
    autoScript: true
  };
}

function noop() {}

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
        function $KITA_RC(i){
          // simple aliases
          var d=document,q=d.querySelector.bind(d),
            // div sent as the fallback wrapper
            v=q('div[id="B:'+i+'"][data-sf]'),
            // template and script sent after promise finishes
            t=q('template[id="N:'+i+'"][data-sr]'),s=q('script[id="S:'+i+'"][data-ss]'),
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
            v.parentNode.replaceChild(f,v);
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
                  j=$KITA_RC(r[c].id.slice(2))?!0:j;
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

/** @type {import('./suspense').Suspense} */
function Suspense(props) {
  const children = Array.isArray(props.children)
    ? contentsToString(props.children)
    : contentToString(props.children);

  // Returns content if it's not a promise
  if (typeof children === 'string') {
    return children;
  }

  if (!props.rid) {
    throw new Error('Suspense requires a `rid` to be specified.');
  }

  let data = SUSPENSE_ROOT.requests.get(props.rid);

  if (!data) {
    // Creating the request data lazily allows
    // faster render() calls when no suspense
    // components are used.
    data = {
      stream: new Readable({ read: noop }),
      running: 0,
      sent: false
    };

    SUSPENSE_ROOT.requests.set(props.rid, data);
  }

  // Gets the current run number for this request
  // Increments first so we can differ 0 as no suspenses
  // were used and 1 as the first suspense component
  const run = ++data.running;

  void children
    .then(writeStreamTemplate)
    .catch(function errorRecover(error) {
      // No catch block was specified, so we can
      // re-throw the error.
      if (!props.catch) {
        throw error;
      }

      let html;

      // Unwraps error handler
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
      data.stream.emit('error', error);
    })
    .finally(function clearRequestData() {
      // reduces current suspense id
      if (data && data.running > 1) {
        data.running -= 1;
        return;
      }

      // Last suspense component, runs cleanup
      if (data && !data.stream.closed) {
        data.stream.push(null);
      }

      // Removes the current state
      SUSPENSE_ROOT.requests.delete(props.rid);
    });

  // Always will be a single children because multiple
  // root tags aren't a valid JSX syntax
  const fallback = contentToString(props.fallback);

  // Keeps string return type
  if (typeof fallback === 'string') {
    return '<div id="B:' + run + '" data-sf>' + fallback + '</div>';
  }

  return fallback.then(function resolveCallback(resolved) {
    return '<div id="B:' + run + '" data-sf>' + resolved + '</div>';
  });

  /**
   * This function may be called by the catch handler in case the error could be handled.
   *
   * @param {string} result
   */
  function writeStreamTemplate(result) {
    if (
      // Ensures the stream is still open (.closed may not be already defined at this point)
      !SUSPENSE_ROOT.requests.has(props.rid) ||
      // just to typecheck
      !data ||
      // Stream was already closed/cleared out.
      data.stream.closed
    ) {
      return;
    }

    // Writes the suspense script if its the first
    // suspense component in this request data. This way following
    // templates+scripts can be executed
    if (SUSPENSE_ROOT.autoScript && data.sent === false) {
      data.stream.push(SuspenseScript);
      data.sent = true;
    }

    // Writes the chunk
    data.stream.push(
      // prettier-ignore
      `<template id="N:${run}" data-sr>${result}</template><script id="S:${run}" data-ss>$KITA_RC(${run})</script>`
    );
  }
}

/** @type {import('./suspense').renderToStream} */
function renderToStream(html, rid) {
  if (!rid) {
    rid = SUSPENSE_ROOT.requestCounter++;
  } else if (SUSPENSE_ROOT.requests.has(rid)) {
    // Ensures the request id is unique within the current request
    // error here to keep original stack trace
    const error = new Error(`The provided Request Id is already in use: ${rid}.`);

    // returns errored stream to avoid throws
    return new Readable({
      read() {
        this.emit('error', error);
        this.push(null);
      }
    });
  }

  if (typeof html === 'function') {
    try {
      html = html(rid);
    } catch (error) {
      // Avoids memory leaks by removing the request data
      SUSPENSE_ROOT.requests.delete(rid);

      // returns errored stream to avoid throws
      return new Readable({
        read() {
          this.emit('error', error);
          this.push(null);
        }
      });
    }
  }

  // If no suspense component was used, this will not be defined.
  const requestData = SUSPENSE_ROOT.requests.get(rid);

  // No suspense was used, just return the HTML as a stream
  if (!requestData) {
    if (typeof html === 'string') {
      return Readable.from([html]);
    }

    return new Readable({
      read() {
        void html
          .then((result) => {
            this.push(result);
            this.push(null);
          })
          .catch((error) => {
            this.emit('error', error);
          });
      }
    });
  }

  return writeFallback(html, requestData.stream);
}

/** @type {import('./suspense').writeFallback} */
function writeFallback(fallback, readable) {
  // Impossible to sync templates have their
  // streams being written before the fallback
  if (typeof fallback === 'string') {
    readable.push(fallback);
    return readable;
  }

  // The fallback might resolve after a suspense resolves,
  // so we need to ensure the fallback is written and sent
  // before anything the requestData.stream might already have.

  const copy = new Readable({ read: noop });

  void fallback
    .then(async (result) => {
      copy.push(result);

      for await (const chunk of readable) {
        copy.push(chunk);
      }

      copy.push(null);
    })
    .catch((error) => {
      copy.emit('error', error);
    });

  return copy;
}

exports.Suspense = Suspense;
exports.renderToStream = renderToStream;
exports.writeFallback = writeFallback;
exports.SuspenseScript = SuspenseScript;
