export function TemplateManyComponents(html: Function, name: string) {
  for (let i = 0; i < 10000; i++) {
    html`<div>${name}</div>`;
  }

  return html`<div>${name}</div>`;
}
