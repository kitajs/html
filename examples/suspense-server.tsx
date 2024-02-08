import http from 'http';
import { setTimeout } from 'timers/promises';
import Html from '../index';
import { SuspenseGenerator, pipeHtml } from '../suspense';

function renderLayout(rid: number | string) {
  return (
    <html>
      <body>
        <SuspenseGenerator rid={rid} source={SleepGenerator()} />
      </body>
    </html>
  );
}

async function* SleepGenerator() {
  for (let i = 0; i < 10; i++) {
    await setTimeout(i * 200);
    yield 'Slept for ' + i * 200 + 'ms';
  }
}

SUSPENSE_ROOT.enabled = true;

http
  .createServer((req, rep) => {
    // This simple webserver only has a index.html file
    if (req.url !== '/' && req.url !== '/index.html') {
      rep.statusCode = 404;
      rep.statusMessage = 'Not Found';
      rep.end();
      return;
    }

    // Creates the request map
    const id = SUSPENSE_ROOT.requestCounter++;
    SUSPENSE_ROOT.requests.set(id, {
      stream: new WeakRef(rep),
      running: 0,
      sent: false
    });

    // ⚠️ Charset utf8 is important to avoid old browsers utf7 xss attacks
    rep.writeHead(200, 'OK', { 'content-type': 'text/html; charset=utf-8' });

    rep.flushHeaders;

    pipeHtml(renderLayout(id), rep, id);
  })
  .listen(8080, () => {
    console.log('Listening to http://localhost:8080 ' + Math.random());
  });
