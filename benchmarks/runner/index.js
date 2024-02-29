process.env.NODE_ENV = 'production';

import { bench, group, run } from 'mitata';

import KitaHtmlJSXRuntimeRenderers from '@kitajs/bench-html-kitajs';
import ReactJSXRuntimeRenderers from '@kitajs/bench-html-reactjsx';
import StringTemplateRenderers from '@kitajs/bench-html-templates';
import TypedHtmlRenderers from '@kitajs/bench-html-typed-html';

import CommonTags from 'common-tags';
import ReactDOMServer from 'react-dom/server';
import { assertHtml } from './assertions.js';

assertHtml();

// EXECUTE THE BENCHMARKS
group('Many Components (31.4kb)', () => {
  bench('KitaJS/Html', () => KitaHtmlJSXRuntimeRenderers.ManyComponents('Hello World!'));
  bench('Typed Html', () => TypedHtmlRenderers.ManyComponents('Hello World!'));
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactJSXRuntimeRenderers.ManyComponents('Hello World!')
    )
  );
  bench('Common Tags', () =>
    StringTemplateRenderers.TemplateManyComponents(CommonTags.html, 'Hello World!')
  );
  // bench('Ghtml', () =>
  //   StringTemplateRenderers.TemplateManyComponents(gHtml.html, 'Hello World!')
  // );
});

group('Many Props (7.4kb)', () => {
  bench('KitaJS/Html', () => KitaHtmlJSXRuntimeRenderers.ManyProps('Hello World!'));
  bench('Typed Html', () => TypedHtmlRenderers.ManyProps('Hello World!'));
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactJSXRuntimeRenderers.ManyProps('Hello World!')
    )
  );
  bench('Common Tags', () =>
    StringTemplateRenderers.TemplateManyProps(CommonTags.html, 'Hello World!')
  );
  // bench('Ghtml', () =>
  //   StringTemplateRenderers.TemplateManyProps(gHtml.html, 'Hello World!')
  // );
});

group('MdnHomepage (66.7Kb)', () => {
  bench('KitaJS/Html', () => KitaHtmlJSXRuntimeRenderers.MdnHomepage('Hello World!'));
  bench('Typed Html', () => TypedHtmlRenderers.MdnHomepage('Hello World!'));
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(
      ReactJSXRuntimeRenderers.MdnHomepage('Hello World!')
    )
  );
  bench('Common Tags', () =>
    StringTemplateRenderers.TemplateMdnHomepage(CommonTags.html, 'Hello World!')
  );
  // bench('Ghtml', () =>
  //   StringTemplateRenderers.TemplateMdnHomepage(gHtml.html, 'Hello World!')
  // );
});

run().catch(console.error);
