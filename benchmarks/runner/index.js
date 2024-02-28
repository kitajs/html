process.env.NODE_ENV = 'production';

import { bench, group, run } from 'mitata';

import KitaHtmlJSXRuntimeRenderers from 'benchmark-kitajs';
import ReactJSXRuntimeRenderers from 'benchmark-react';
import StringTemplateRenderers from 'benchmark-templates';
import TypedHtmlRenderers from 'benchmark-typed-html';

import CommonTags from 'common-tags';
import * as gHtml from 'ghtml';
import ReactDOMServer from 'react-dom/server';

import assert from 'node:assert';

// ENSURE THAT ALL RENDERERS PRODUCE THE SAME OUTPUT AGAINST KITAJS/HTML
// Ensures that Kitajs/html and react produce the same output
assert.equal(
  KitaHtmlJSXRuntimeRenderers.ManyComponents('Hello World!'),
  ReactDOMServer.renderToStaticMarkup(
    ReactJSXRuntimeRenderers.ManyComponents('Hello World!')
  )
);

// Ensures that Kitajs/html and common-tags produce the same output
assert.equal(
  KitaHtmlJSXRuntimeRenderers.ManyComponents('Hello World!'),
  // Simply removes spaces and newlines
  StringTemplateRenderers.TemplateManyComponents(CommonTags.html, 'Hello World!')
    .split('\n')
    .map((l) => l.trim())
    .join('')
);

// Ensures that Kitajs/html and ghtml produce the same output
assert.equal(
  KitaHtmlJSXRuntimeRenderers.ManyComponents('Hello World!'),
  // Simply removes spaces and newlines
  StringTemplateRenderers.TemplateManyComponents(gHtml.html, 'Hello World!')
    .split('\n')
    .map((l) => l.trim())
    .join('')
);

// Kitajs/html and typed html does produces the same output, however typed-html appends spaces between tags
assert.equal(
  KitaHtmlJSXRuntimeRenderers.ManyComponents('Hello World!'),
  // Simply removes spaces and newlines
  TypedHtmlRenderers.ManyComponents('Hello World!')
    .toString()
    .replace(/< \//g, '</')
    .replace(/\n/g, '')
);

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
  bench('Ghtml', () =>
    StringTemplateRenderers.TemplateManyComponents(gHtml.html, 'Hello World!')
  );
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
  bench('Ghtml', () =>
    StringTemplateRenderers.TemplateManyProps(gHtml.html, 'Hello World!')
  );
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
  bench('Ghtml', () =>
    StringTemplateRenderers.TemplateMdnHomepage(gHtml.html, 'Hello World!')
  );
});

run().catch(console.error);
