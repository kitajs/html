const purchases = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  price: Math.random() * 10,
  quantity: Math.floor(Math.random() * 10) + 1
}));

function Purchase({ id, name, price, quantity }) {
  return (
    <div className="purchase purchase-card">
      <div className="purchase-name">{name}</div>
      <div className="purchase-price">{price}</div>
      <div className="purchase-quantity">{quantity}</div>
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
      <title>{title}</title>
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
      <script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dev/index.bundle.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dist/index.bundle.js"></script>
    </div>
  );
}

function Header({ name }) {
  return (
    <header className="header">
      <h1 className="header-title">Hello {name}</h1>
      <nav className="header-nav">
        <ul className="header-ul">
          <li className="header-item">
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
    <footer className="footer">
      <p className="footer-year">
        © {new Date().getFullYear()} {name}
      </p>

      <p className="footer">
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
      <main className="main-content">{children}</main>
      <Footer name={name} />
    </div>
  );
}

function UserProfile({ name }) {
  return (
    <section className="user-profile">
      <h2 className="user-profile title">User Profile</h2>
      <p className="user-profile name">Name: {name}</p>
      <p className="user-profile info">Email: example@example.com</p>
      <p className="user-profile info">Address: 123 Main St, City, Country</p>
      <p className="user-profile info">Phone: 123-456-7890</p>
    </section>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="purchase title">Recent Purchases</h2>
      <ul className="purchase list">
        {purchases.slice(0, 3).map((purchase, index) => (
          <li key={index} className="purchase-preview">
            {purchase.name} - ${purchase.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PageContent() {
  return (
    <div className="page-content">
      <h2 className="title mb-4 h2">Welcome to our store</h2>
      <p className="p text mb-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis magna id
        dolor ultricies, eget pretium ligula sodales. Cras sit amet turpis nec lacus
        blandit placerat. Sed vestibulum est sit amet enim ultrices rutrum. Vivamus in
        nulla vel nunc interdum vehicula.
      </p>
      <p className="p text mb-0">
        Pellentesque efficitur tellus id velit vehicula laoreet. Proin et neque ac dolor
        hendrerit elementum. Fusce auctor metus non ligula tincidunt, id gravida odio
        sollicitudin.
      </p>
    </div>
  );
}

export function RealWorldPage(name: string) {
  return (
    <Layout head={<Head title="Real World Example" />}>
      <Main name={name}>
        <h2>Purchases</h2>

        <div className="purchases">
          {purchases.map((purchase, index) => (
            <Purchase
              key={index}
              id={purchase.id}
              name={purchase.name}
              price={purchase.price}
              quantity={purchase.quantity}
            />
          ))}
        </div>

        <UserProfile name={name} />
        <Sidebar />
        <PageContent />
      </Main>
    </Layout>
  );
}
