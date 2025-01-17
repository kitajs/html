import { join } from 'path';
import pug from 'pug';

const templates = {
  purchase: pug.compileFile(join(__dirname, 'templates/purchase.pug')),
  layout: pug.compileFile(join(__dirname, 'templates/layout.pug')),
  head: pug.compileFile(join(__dirname, 'templates/head.pug')),
  main: pug.compileFile(join(__dirname, 'templates/main.pug')),
  userProfile: pug.compileFile(join(__dirname, 'templates/user-profile.pug')),
  sidebar: pug.compileFile(join(__dirname, 'templates/sidebar.pug')),
  pageContent: pug.compileFile(join(__dirname, 'templates/page_content.pug')),
  footer: pug.compileFile(join(__dirname, 'templates/footer.pug'))
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
      ${templates.sidebar({ purchases })}
      ${templates.pageContent()}
      ${templates.footer({ name })}
    `
  });

  return templates.layout({
    head,
    children: `
      ${mainContent}
    `
  });
}
