import pug from 'pug';

const templates = {
  purchase: pug.compile(`
.purchase.purchase-card
  .purchase-name= name
  .purchase-price= price
  .purchase-quantity= quantity
`),

  layout: pug.compile(`
doctype html
html(lang="en")
  head
    != head
  body
    != children
`),

  head: pug.compile(`
div
  title= title
  meta(name="description" content="A description")
  meta(name="keywords" content="some, keywords")
  meta(name="author" content="Some Author")
  meta(name="viewport" content="width=device-width, initial-scale=1.0")
  link(rel="stylesheet" href="styles.css")
  script(src="script.js")
  meta(name="twitter:card" content="summary")
  meta(name="twitter:site" content="@site")
  meta(name="twitter:title" content="Title")
  meta(name="twitter:description" content="A description")
  meta(name="twitter:creator" content="@creator")
  meta(name="twitter:image" content="image.jpg")
  meta(content="Title")
  meta(content="website")
  script(src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dev/index.bundle.js")
  script(src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dist/index.bundle.js")
`),

  main: pug.compile(`
main.main
  header.header
    h1.header-title Hello #{name}
    nav.header-nav
      ul.header-ul
        li.header-item
          a(href="/") Home
        li
          a(href="/about") About
  != children
`),

  userProfile: pug.compile(`
section.user-profile
  h2.user-profile.title User Profile: #{name}
  p.user-profile.info Email: user@example.com
  p.user-profile.info Address: 123 Main St, City, Country
  p.user-profile.info Phone: 123-456-7890
`),

  sidebar: pug.compile(`
aside.sidebar
  h2.purchase.title Recent Purchases
  ul.purchase.list
    li.purchase-preview Purchase number 1 - $0.00
`),

  pageContent: pug.compile(`
.page-content
  h2.title.mb-4.h2 Welcome to our store
  p.p.text.mb-0
    | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis magna
    | id dolor ultricies, eget pretium ligula sodales. Cras sit amet turpis nec
    | lacus blandit placerat. Sed vestibulum est sit amet enim ultrices rutrum.
    | Vivamus in nulla vel nunc interdum vehicula.
  p.p.text.mb-0
    | Pellentesque efficitur tellus id velit vehicula laoreet. Proin et neque ac
    | dolor hendrerit elementum. Fusce auctor metus non ligula tincidunt, id gravida
    | odio sollicitudin.
`),

  footer: pug.compile(`
footer.footer
  p.footer-year © 2024 Sample
  p.footer
    a(href="/terms") Terms
    a(href="/privacy") Privacy
`)
};

export function RealWorldPage(name: string, purchases: any[]) {
  const head = templates.head({ title: 'Real World Example' });
  const purchasesHtml = purchases
    .map((purchase) =>
      templates.purchase({
        name: purchase.name,
        price: purchase.price,
        quantity: purchase.quantity
      })
    )
    .join('');

  const mainContent = templates.main({
    name,
    children: `
      <h2>Purchases</h2>
      <div class="purchases">${purchasesHtml}</div>
      ${templates.userProfile({ name })}
      ${templates.sidebar()}
      ${templates.pageContent()}
    `
  });

  return templates.layout({
    head,
    children: `
      <div>
        ${mainContent}
        ${templates.footer()}
      </div>
    `
  });
}
