import { renderToStream } from '@kitajs/html/suspense';
import http from 'node:http';

type PageRenderer = (rid: number | string) => JSX.Element;

export function createServer(renderPage: PageRenderer, port = 1228) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // Only serve the index page
    if (url.pathname !== '/' && url.pathname !== '/index.html') {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    // Set proper content type with charset to prevent UTF-7 XSS attacks
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Create the HTML stream from the page renderer
    const htmlStream = renderToStream(renderPage);

    // Pipe the stream to the response
    htmlStream.pipe(res);
  });

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Watch the page load progressively with streaming HTML!');
  });

  return server;
}
