/** @import * as Dts from './suspense' */

const { contentsToString, contentToString } = require('./index');
const { Readable, PassThrough } = require('node:stream');

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

/** @type {typeof Dts.RcInsert} */
const RcInsert = {
  REPLACE: 0,
  APPEND: 1,
  L_APPEND: 2
};

/** @type {Dts.SuspenseScript} */
// Pending data-sr elements are kept pending if their fallback has not yet been
// rendered, on each render a try to switch all pending data-sr is attempted until
// no elements are substituted.
const SuspenseScript = /* html */ `
      <script id="kita-html-suspense">
        /*! MIT License https://html.kitajs.org*/
        // i is the id of the template
        // g is the flag append element before instead of replacing (2 means last item)
        // h is how many elements should be kept in the fragment
        function $KITA_RC(i,g,h){
          // simple aliases
          var d=document,q=d.querySelector.bind(d),
            // div sent as the fallback wrapper
            v=q('div[id="B:'+i+'"][data-sf]'),
            // another alias
            p=v&&v.parentNode,
            // template and script sent after promise finishes
            t=q('template[id="N:'+i+'"][data-sr]'),
            s=q('script[id="S:'+i+'"][data-ss]'),
            // fragment created to avoid inserting element one by one
            f=d.createDocumentFragment(),
            // used by iterators
            c,j,
            // all pending hydrations
            r;

          // if div cannot be found, let this hydration as pending
          // template is not present when is RcInsert.L_APPEND
          if(v&&s){
            // appends into the fragment
            while(t&&(c=t.content.firstChild))
              f.appendChild(c);

            // replaces the div and removes the script and template (insert == 0, so is false)
            p[g?'insertBefore':'replaceChild'](f,v);

            // if maximum elements are set, removes the first ones
            // until the limit is reached
            if(h)
              while(p.children.length-1>h)
                p.removeChild(p.firstChild);

            // removes both template and script after being replaced
            t&&t.remove();
            s.remove();

            // removes the initial template when the generator finishes
            g==${RcInsert.L_APPEND}&&v.remove();

            // looks for pending templates
            r=d.querySelectorAll('template[id][data-sr]');

            do{
              // resets j & c from previous loop
              c=j=0;

              // loops over every found pending template and
              for(;c<r.length;c++)
                if(r[c]!=t)
                  // let j as true while at least on $KITA_RC call returns true
                  j=$KITA_RC(r[c].id.slice(2),g)?!0:j;
            }while(t&&j)

            // we know at least the original template was substituted
            return!0;
          }
        }
      </script>
    `
  // Removes comment lines
  .replace(/^\s*\/\/.*/gm, '')
  // Removes line breaks added for readability
  .replace(/\n\s*/g, '')
  // Removes padding spaces
  .trim();

/** @type {typeof Dts.Suspense} */
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

  const data = useRequestData(props.rid);

  // Gets the current run number for this request
  // Increments first so we can differ 0 as no suspenses
  // were used and 1 as the first suspense component
  const run = ++data.running;

  void children
    .then(function pushResult(result) {
      data.stream.push(createHtmlTemplate(run, data, RcInsert.REPLACE, result));
    })
    .catch(function errorRecover(error) {
      return recoverPromiseRejection(data, run, props.catch, RcInsert.REPLACE, error);
    })
    .catch(function writeFatalError(error) {
      data.stream.emit('error', error);
    })
    .finally(function final() {
      clearRequestData(props.rid, data);
    });

  // Always will be a single children because multiple
  // root tags aren't a valid JSX syntax
  const fallback = contentToString(props.fallback);

  if (typeof fallback !== 'string') {
    return fallback.then((html) => createHtmlFallback(run, html));
  }

  return createHtmlFallback(run, fallback);
}

/** @type {typeof Dts.Generator} */
function Generator(props) {
  if (!props.rid) {
    throw new Error('Generator requires a `rid` to be specified.');
  }

  if (props.chunkSize === undefined || props.chunkSize < 0) {
    props.chunkSize = 8192; // 8KB
  }

  const data = useRequestData(props.rid);

  // Gets the current run number for this request
  // Increments first so we can differ 0 as no suspenses
  // were used and 1 as the first suspense component
  const run = ++data.running;

  void consumeGenerator(
    run,
    data,
    props.map,
    props.source,
    props.childLimit,
    props.chunkSize
  )
    .catch(function errorRecovery(error) {
      return recoverPromiseRejection(data, run, props.catch, RcInsert.APPEND, error);
    })
    .catch(function writeFatalError(error) {
      data.stream.emit('error', error);
    })
    .finally(function final() {
      clearRequestData(props.rid, data);
    });

  return createHtmlFallback(run, '');
}

/**
 * @param {number} run
 * @param {Dts.RequestData} data
 * @param {((value: any) => JSX.Element) | undefined} mapper
 * @param {AsyncIterable<any>} source
 * @param {number | undefined} limit
 * @param {number} chunkSize
 */
async function consumeGenerator(run, data, mapper, source, limit, chunkSize) {
  let buffer = '';
  let size = 0;

  for await (let chunk of source) {
    if (mapper) {
      chunk = mapper(chunk);

      if (typeof chunk !== 'string') {
        chunk = await chunk;
      }
    }

    size += Buffer.byteLength(chunk);
    buffer += chunk;

    if (size >= chunkSize) {
      data.stream.push(createHtmlTemplate(run, data, RcInsert.APPEND, buffer, limit));
      buffer = '';
      size = 0;
    }
  }

  data.stream.push(createHtmlTemplate(run, data, RcInsert.L_APPEND, buffer, limit));
}

/** @type {typeof Dts.recoverPromiseRejection} */
async function recoverPromiseRejection(data, run, _catch, mode, error) {
  // No catch block was specified, so we can
  // re-throw the error.
  if (!_catch) {
    throw error;
  }

  let html;

  // Unwraps error handler
  if (typeof _catch === 'function') {
    html = _catch(error);
  } else {
    html = _catch;
  }

  if (typeof html !== 'string') {
    html = await html;
  }

  data.stream.push(createHtmlTemplate(run, data, mode, html));
}

/**
 * @type {typeof Dts.renderToStream}
 * @param {any} html
 * @param {any} rid
 */
function renderToStream(html, rid) {
  if (!rid) {
    rid = SUSPENSE_ROOT.requestCounter++;
  } else if (SUSPENSE_ROOT.requests.has(rid)) {
    // Ensures the request id is unique within the current request
    // error here to keep original stack trace and returns errored stream to avoid throws
    return errorToReadable(new Error(`The provided Rid is already in use: ${rid}.`));
  }

  if (typeof html === 'function') {
    try {
      html = html(rid);
    } catch (error) {
      // Avoids memory leaks by removing the request data
      SUSPENSE_ROOT.requests.delete(rid);

      // returns errored stream to avoid throws
      return errorToReadable(error);
    }
  }

  // If no suspense component was used, this will not be defined.
  const requestData = SUSPENSE_ROOT.requests.get(rid);

  // No suspense was used, just return the HTML as a stream
  if (!requestData) {
    return typeof html === 'string' ? Readable.from(html) : promiseToReadable(html);
  }

  return resolveHtmlStream(html, requestData);
}

/** @type {typeof Dts.resolveHtmlStream} */
function resolveHtmlStream(template, requestData) {
  // Due to event loop, its impossible to sync templates have their
  // streams being written (sent = true) before the fallback
  if (typeof template === 'string') {
    requestData.stream.push(template);
    return requestData.stream;
  }

  const prepended = new PassThrough();

  void template.then(
    (result) => {
      prepended.push(result);
      requestData.stream.pipe(prepended);
    },
    (error) => {
      prepended.emit('error', error);
    }
  );

  return prepended;
}

/** @type {typeof Dts.useRequestData} */
function useRequestData(rid) {
  let data = SUSPENSE_ROOT.requests.get(rid);

  if (!data) {
    // Creating the request data lazily allows
    // faster render() calls when no suspense
    // components are used.
    data = {
      stream: new Readable({ read: noop }),
      running: 0,
      sent: false
    };

    SUSPENSE_ROOT.requests.set(rid, data);
  }

  return data;
}

/** @type {typeof Dts.clearRequestData} */
function clearRequestData(rid, data) {
  // reduces current suspense id
  if (data.running > 1) {
    data.running -= 1;
    return;
  }

  // Last suspense component, runs cleanup
  if (!data.stream.closed) {
    data.stream.push(null);
  }

  // Removes the current state
  SUSPENSE_ROOT.requests.delete(rid);
}

/** @type {typeof Dts.createHtmlTemplate} */
function createHtmlTemplate(run, data, mode, content, limit) {
  // content might be available in the L_APPEND if chunkSize doesn't fills the buffer
  if (content) {
    content = `<template id="N:${run}" data-sr>${content}</template><script id="S:${run}" data-ss>$KITA_RC(${mode ? (limit ? `${run},${mode},${limit}` : `${run},${mode}`) : run})</script>`;
  } else {
    content = `<script id="S:${run}" data-ss>$KITA_RC(${run},${limit ? `${mode},${limit}` : mode})</script>`;
  }

  // Appends the suspense script if its the first suspense component in this
  // request data. This way following templates+scripts can be executed
  if (SUSPENSE_ROOT.autoScript && data.sent === false) {
    data.sent = true;
    return SuspenseScript + content;
  }

  return content;
}

/** @type {typeof Dts.createHtmlFallback} */
function createHtmlFallback(run, fallback) {
  return `<div id="B:${run}" data-sf>${fallback}</div>`;
}

exports.clearRequestData = clearRequestData;
exports.createHtmlTemplate = createHtmlTemplate;
exports.createHtmlTemplate = createHtmlTemplate;
exports.Generator = Generator;
exports.RcInsert = RcInsert;
exports.recoverPromiseRejection = recoverPromiseRejection;
exports.renderToStream = renderToStream;
exports.resolveHtmlStream = resolveHtmlStream;
exports.Suspense = Suspense;
exports.SuspenseScript = SuspenseScript;
exports.useRequestData = useRequestData;

/** @param {unknown} error */
function errorToReadable(error) {
  return new Readable({
    read() {
      this.emit('error', error);
      this.push(null);
    }
  });
}

/** @param {Promise<unknown>} promise */
function promiseToReadable(promise) {
  return new Readable({
    async read() {
      try {
        this.push(await promise);
        this.push(null);
      } catch (error) {
        this.emit('error', error);
      }
    }
  });
}
