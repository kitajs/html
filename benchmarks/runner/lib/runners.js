import HonoRuntimeRenderers from '@kitajs/bench-html-honojsx';
import JSXTERuntimeRenderers from '@kitajs/bench-html-jsxte';
import KitaHtmlJSXRuntimeRenderers from '@kitajs/bench-html-kitajs';
import PreactRuntimeRenderers from '@kitajs/bench-html-preact';
import PugRenderers from '@kitajs/bench-html-pug';
import ReactRuntimeRenderers from '@kitajs/bench-html-react';
import ReactJSXRuntimeRenderers from '@kitajs/bench-html-reactjsx';
import StringTemplateRenderers from '@kitajs/bench-html-templates';
import TypedHtmlRenderers from '@kitajs/bench-html-typed-html';
import VHtmlRenderers from '@kitajs/bench-html-vhtml';

import * as CommonTagsRender from 'common-tags';
import * as gHtml from 'ghtml';
import * as HonoHtmlRender from 'hono/html';
import * as JSXTE from 'jsxte';
// import * as Nano from 'nano-jsx';
import * as PreactRenderToString from 'preact-render-to-string';
import ReactDOMServer from 'react-dom/server';

export const RunnerType = {
  jsx: 1,
  template: 2
};

for (const key in RunnerType) {
  RunnerType[RunnerType[key]] = key;
}

export function KitaJs(name, purchases) {
  return KitaHtmlJSXRuntimeRenderers.RealWorldPage(name, purchases);
}
KitaJs.type = RunnerType.jsx;
KitaJs.baseline = true;

export function TypedHtml(name, purchases) {
  return TypedHtmlRenderers.RealWorldPage(name, purchases);
}
TypedHtml.type = RunnerType.jsx;
TypedHtml.baseline = false;

export function vHtml(name, purchases) {
  return VHtmlRenderers.RealWorldPage(name, purchases);
}
vHtml.type = RunnerType.jsx;
vHtml.baseline = false;

export function ReactJsx(name, purchases) {
  return ReactDOMServer.renderToStaticMarkup(
    ReactJSXRuntimeRenderers.RealWorldPage(name, purchases)
  );
}
ReactJsx.type = RunnerType.jsx;
ReactJsx.baseline = false;

export function Preact(name, purchases) {
  return PreactRenderToString.render(
    PreactRuntimeRenderers.RealWorldPage(name, purchases)
  );
}
Preact.type = RunnerType.jsx;
Preact.baseline = false;

export function React(name, purchases) {
  return ReactDOMServer.renderToStaticMarkup(
    ReactRuntimeRenderers.RealWorldPage(name, purchases)
  );
}
React.type = RunnerType.jsx;
React.baseline = false;

export function Jsxte(name, purchases) {
  return JSXTE.renderToHtml(JSXTERuntimeRenderers.RealWorldPage(name, purchases));
}
Jsxte.type = RunnerType.jsx;
Jsxte.baseline = false;

export function CommonTags(name, purchases) {
  return StringTemplateRenderers.Normal.RealWorldPage(
    CommonTagsRender.html,
    name,
    purchases
  );
}
CommonTags.type = RunnerType.template;
CommonTags.baseline = false;

export function Ghtml(name, purchases) {
  return StringTemplateRenderers.Ghtml.RealWorldPage(gHtml.html, name, purchases);
}
Ghtml.type = RunnerType.template;
Ghtml.baseline = false;

export function HonoHtml(name, purchases) {
  return StringTemplateRenderers.Normal.RealWorldPage(
    HonoHtmlRender.html,
    name,
    purchases
  ).toString();
}
HonoHtml.type = RunnerType.template;
HonoHtml.baseline = false;

export function HonoJsx(name, purchases) {
  return HonoRuntimeRenderers.RealWorldPage(name, purchases).toString();
}
HonoJsx.type = RunnerType.jsx;
HonoJsx.baseline = false;

export function Pug(name, purchases) {
  return PugRenderers.RealWorldPage(name, purchases);
}
Pug.type = RunnerType.template;
Pug.baseline = false;

// NanoJSX was so slow that it was increasing the scale of the graph, making it hard to read
// Nano.renderSSR();
// /** @param {string} name */
// export function NanoJsx(name, purchases) {
//   return StringTemplateRenderers.Normal.RealWorldPage(Nano.jsx, name, purchases);
// };
// NanoJsx.type = RunnerType.template;
// NanoJsx.baseline = false;

export const RunnersFn = [
  KitaJs,
  TypedHtml,
  vHtml,
  ReactJsx,
  Preact,
  React,
  Jsxte,
  CommonTags,
  Ghtml,
  HonoHtml,
  HonoJsx,
  Pug
  // NanoJsx
].sort((a, b) => a.type - b.type);
