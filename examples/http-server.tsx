import Html, { type PropsWithChildren } from '@kitajs/html';
import { Suspense, renderToStream } from '@kitajs/html/suspense';
import http from 'node:http';
import { setTimeout } from 'node:timers/promises';

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await setTimeout(ms * 2);
  return Html.contentsToString([children || String(ms)]);
}

function renderLayout(rid: number | string) {
  return (
    <html>
      <div>
        {Array.from({ length: 5 }, (_, i) => (
          <Suspense rid={rid} fallback={<div>{i} Fallback Outer!</div>}>
            <div>Outer {i}!</div>

            <SleepForMs ms={i % 2 === 0 ? i * 2500 : i * 5000}>
              <Suspense rid={rid} fallback={<div>{i} Fallback Inner!</div>}>
                <SleepForMs ms={i * 5000}>
                  <div>Inner {i}!</div>
                </SleepForMs>
              </Suspense>
            </SleepForMs>
          </Suspense>
        ))}
      </div>
    </html>
  );
}

http
  .createServer((req, response) => {
    // This simple webserver only has a index.html file
    if (req.url !== '/' && req.url !== '/index.html') {
      response.end();
      return;
    }

    // ⚠️ Charset utf8 is important to avoid old browsers utf7 xss attacks
    response.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Creates the html stream
    const htmlStream = renderToStream(renderLayout);

    // Pipes it into the response
    htmlStream.pipe(response);

    // If it's a fastify server just use
    // response.type('text/html; charset=utf-8').send(htmlStream);
  })
  .listen(8080, () => {
    console.log('Listening to http://localhost:8080');
  });
