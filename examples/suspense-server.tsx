import http from 'http';
import { setTimeout } from 'timers/promises';
import Html from '../index';
import { Suspense, SuspenseGenerator, pipeHtml } from '../suspense';

function renderLayout(rid: number | string) {
  return (
    <html>
      <body>
        <Suspense rid={rid} fallback={<div>Carregando tabela 1...</div>}>
          <Tabela />
        </Suspense>
        <hr />
        <Suspense rid={rid} fallback={<div>Carregando tabela 2...</div>}>
          <Tabela />
        </Suspense>
        <hr />
        <Suspense rid={rid} fallback={<div>Carregando tabela 3...</div>}>
          <Tabela />
        </Suspense>
        <hr />
        <Suspense rid={rid} fallback={<div>Carregando gerador...</div>}>
          <Gerador rid={rid} />
        </Suspense>
      </body>
    </html>
  );
}

async function Tabela() {
  // conecta no banco
  await setTimeout(Math.random() * 500);
  return (
    <div>
      <h2>Tabela</h2>
      <div>Dado 1</div>
      <div>Dado 1</div>
      <div>Dado 1</div>
    </div>
  );
}

async function Gerador({ rid }: Html.PropsWithChildren<{ rid: number | string }>) {
  // conecta no banco
  await setTimeout(1000);

  return (
    <div>
      <h2>Gerador</h2>
      <div style={{ maxHeight: '500px' ,overflow:'scroll'}}>
        <SuspenseGenerator rid={rid} source={SleepGenerator()} />
      </div>
    </div>
  );
}

async function* SleepGenerator() {
  for (let i = 0; i < 5_000; i++) {
    // await setTimeout(500);
    yield <div>{Math.random()}</div>;
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

    pipeHtml(renderLayout(id), rep, id);
  })
  .listen(8080, () => {
    console.log('Listening to http://localhost:8080 ' + Math.random());
  });
