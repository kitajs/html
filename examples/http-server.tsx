import { Generator, renderToStream } from '@kitajs/html/suspense';
import http from 'node:http';
import { setTimeout } from 'timers/promises';

http
  .createServer((req, response) => {
    // This simple webserver only has a index.html file
    if (req.url !== '/' && req.url !== '/index.html') {
      response.end();
      return;
    }
    console.time('Generator');

    // ⚠️ Charset utf8 is important to avoid old browsers utf7 xss attacks
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('connection', 'keep-alive');

    // Creates the html stream
    const htmlStream = renderToStream((rid) => <RealWorldPage rid={rid} />);

    // Pipes it into the response
    htmlStream.pipe(response);

    response.on('close', () => {
      console.timeEnd('Generator');
    });

    // If it's a fastify server just use
    // response.type('text/html; charset=utf-8').send(htmlStream);
  })
  .listen(8080, () => {
    console.log('Listening to http://localhost:8080');
  });

function Purchase({ name, price, quantity }) {
  return (
    <div class="purchase purchase-card">
      <div class="purchase-name" safe>
        {name}
      </div>
      <div class="purchase-price">{price}</div>
      <div class="purchase-quantity">{quantity}</div>
    </div>
  );
}

function Layout({ children, head }) {
  return (
    <html lang="en">
      <head>{head}</head>
      <body>{children}</body>
    </html>
  );
}

function Head({ title }) {
  return (
    <div>
      <title safe>{title}</title>
      <meta name="description" content="A description" />
      <meta name="keywords" content="some, keywords" />
      <meta name="author" content="Some Author" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="styles.css" />
      <script src="script.js"></script>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@site" />
      <meta name="twitter:title" content="Title" />
      <meta name="twitter:description" content="A description" />
      <meta name="twitter:creator" content="@creator" />
      <meta name="twitter:image" content="image.jpg" />
      <meta content="Title" />
      <meta content="website" />
      <script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dev/index.bundle.js" />
      <script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dist/index.bundle.js"></script>
    </div>
  );
}

function Header({ name }) {
  return (
    <header class="header">
      <h1 class="header-title" safe>
        Hello {name}
      </h1>
      <nav class="header-nav">
        <ul class="header-ul">
          <li class="header-item">
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function Footer({ name }) {
  return (
    <footer class="footer">
      <p class="footer-year" safe>
        © {new Date().getFullYear()} {name}
      </p>

      <p class="footer">
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </p>
    </footer>
  );
}

function Main({ children, name }) {
  return (
    <div>
      <Header name={name} />
      <main class="main-content">{children}</main>
      <Footer name={name} />
    </div>
  );
}

function UserProfile({ name }) {
  return (
    <section class="user-profile">
      <h2 class="user-profile title">User Profile</h2>
      <p class="user-profile name" safe>
        Name: {name}
      </p>
      <p class="user-profile info">Email: example@example.com</p>
      <p class="user-profile info">Address: 123 Main St, City, Country</p>
      <p class="user-profile info">Phone: 123-456-7890</p>
    </section>
  );
}

function Sidebar({ purchases }) {
  return (
    <aside class="sidebar">
      <h2 class="purchase title">Recent Purchases</h2>
      <ul class="purchase list">
        {purchases.slice(0, 3).map((purchase) => (
          <li class="purchase-preview" safe>
            {purchase.name} - ${purchase.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PageContent() {
  return (
    <div class="page-content">
      <h2 class="title mb-4 h2">Welcome to our store</h2>
      <p class="p text mb-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis magna id
        dolor ultricies, eget pretium ligula sodales. Cras sit amet turpis nec lacus
        blandit placerat. Sed vestibulum est sit amet enim ultrices rutrum. Vivamus in
        nulla vel nunc interdum vehicula.
      </p>
      <p class="p text mb-0">
        Pellentesque efficitur tellus id velit vehicula laoreet. Proin et neque ac dolor
        hendrerit elementum. Fusce auctor metus non ligula tincidunt, id gravida odio
        sollicitudin.
      </p>
    </div>
  );
}

async function* generate() {
  for (let i = 0; i <= 2; i++) {
    yield { i };
    await setTimeout(1000000);
  }
}

export function RealWorldPage({ name = 'Arthur', rid }: { name?: string; rid: number }) {
  return (
    <Layout head={<Head title="Real World Example" />}>
      <Main name={name}>
        <h2>Purchases</h2>

        <div class="purchases">
          <Generator
            rid={rid}
            source={generate()}
            chunkSize={1}
            childLimit={2}
            map={({ i }) => <Purchase name={i + 'i'} price={i} quantity={i} />}
          />
        </div>

        <UserProfile name={name} />
        {/* <Sidebar purchases={purchases} /> */}
        <PageContent />
      </Main>
    </Layout>
  );
}
