process.env.NODE_ENV = 'production';

import { bench, group, run } from 'mitata';

import JSXTERuntimeRenderers from '@kitajs/bench-html-jsxte';
import KitaHtmlJSXRuntimeRenderers from '@kitajs/bench-html-kitajs';
import PreactRuntimeRenderers from '@kitajs/bench-html-preact';
import ReactRuntimeRenderers from '@kitajs/bench-html-react';
import ReactJSXRuntimeRenderers from '@kitajs/bench-html-reactjsx';
import StringTemplateRenderers from '@kitajs/bench-html-templates';
import TypedHtmlRenderers from '@kitajs/bench-html-typed-html';
import VHtmlRenderers from '@kitajs/bench-html-vhtml';

import CommonTags from 'common-tags';
import * as gHtml from 'ghtml';
import * as JSXTE from 'jsxte';
import * as PreactRenderToString from 'preact-render-to-string';
import ReactDOMServer from 'react-dom/server';

import './assertions.js';

group('Real World Scenario', () => {
  bench('KitaJS/Html', () => KitaHtmlJSXRuntimeRenderers.RealWorldPage('Hello World!'));
  bench('Typed Html', () => TypedHtmlRenderers.RealWorldPage('Hello World!'));
  bench('VHtml', () => VHtmlRenderers.RealWorldPage('Hello World!'));
  bench('React JSX', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactJSXRuntimeRenderers.RealWorldPage('Hello World!')
    )
  );
  bench('Preact', () =>
    PreactRenderToString.render(PreactRuntimeRenderers.RealWorldPage('Hello World!'))
  );
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactRuntimeRenderers.RealWorldPage('Hello World!')
    )
  );
  bench('Common Tags', () =>
    StringTemplateRenderers.RealWorldPage(CommonTags.html, 'Hello World!')
  );
  bench('Ghtml', () => StringTemplateRenderers.RealWorldPage(gHtml.html, 'Hello World!'));
  bench('JSXTE', () =>
    JSXTE.renderToHtml(JSXTERuntimeRenderers.RealWorldPage('Hello World!'))
  );
});

group('Component Creation', () => {
  bench('KitaJS/Html', () => KitaHtmlJSXRuntimeRenderers.ManyComponents('Hello World!'));
  bench('Typed Html', () => TypedHtmlRenderers.ManyComponents('Hello World!'));
  bench('VHtml', () => VHtmlRenderers.ManyComponents('Hello World!'));
  bench('React JSX', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactJSXRuntimeRenderers.ManyComponents('Hello World!')
    )
  );
  bench('Preact', () =>
    PreactRenderToString.render(PreactRuntimeRenderers.ManyComponents('Hello World!'))
  );
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactRuntimeRenderers.ManyComponents('Hello World!')
    )
  );
  bench('Common Tags', () =>
    StringTemplateRenderers.TemplateManyComponents(CommonTags.html, 'Hello World!')
  );
  bench('Ghtml', () =>
    StringTemplateRenderers.TemplateManyComponents(gHtml.html, 'Hello World!')
  );
  bench('JSXTE', () =>
    JSXTE.renderToHtml(JSXTERuntimeRenderers.ManyComponents('Hello World!'))
  );
});

group('Attributes Serialization', () => {
  bench('KitaJS/Html', () => KitaHtmlJSXRuntimeRenderers.ManyProps('Hello World!'));
  bench('Typed Html', () => TypedHtmlRenderers.ManyProps('Hello World!'));
  bench('VHtml', () => VHtmlRenderers.ManyProps('Hello World!'));
  bench('React JSX', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactJSXRuntimeRenderers.ManyProps('Hello World!')
    )
  );
  bench('Preact', () =>
    PreactRenderToString.render(PreactRuntimeRenderers.ManyProps('Hello World!'))
  );
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(ReactRuntimeRenderers.ManyProps('Hello World!'))
  );
  bench('Common Tags', () =>
    StringTemplateRenderers.TemplateManyProps(CommonTags.html, 'Hello World!')
  );
  bench('Ghtml', () =>
    StringTemplateRenderers.TemplateManyProps(gHtml.html, 'Hello World!')
  );
  bench('JSXTE', () =>
    JSXTE.renderToHtml(JSXTERuntimeRenderers.ManyProps('Hello World!'))
  );
});

run().catch(console.error);
