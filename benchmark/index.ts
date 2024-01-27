//@ts-nocheck - disable messing with source types

/// <reference path="../jsx.d.ts" />
/// <reference path="../index.d.ts" />
/// <reference path="../all-types.d.ts" />

import assert from 'assert';
import { bench, group, run } from 'mitata';
import { ManyComponents, TemplateManyComponents } from './renderers/many-components.js';
import { ManyProps, TemplateManyProps } from './renderers/many-props.js';
import { MdnHomepage, TemplateMdnHomepage } from './renderers/mdn-homepage.js';

process.env.NODE_ENV = 'production';

//@ts-expect-error - dynamic import from cjs js file.
const KitaHtml = (await import('../../index.js')).default;
const TypedHtml = await import('typed-html');
const React = await import('react');
const ReactDOMServer = await import('react-dom/server');
const CommonTags = await import('common-tags');
const gHtml = await import('ghtml');

// Ensures that Kitajs/html and react produce the same output
assert.equal(
  ReactDOMServer.renderToStaticMarkup(ManyComponents(React, 'Hello World!') as any),
  // Simply removes spaces and newlines
  ManyComponents(KitaHtml, 'Hello World!')
);

// Ensures that Kitajs/html and common-tags produce the same output
assert.equal(
  ManyComponents(KitaHtml, 'Hello World!'),
  // Simply removes spaces and newlines
  TemplateManyComponents(CommonTags.html, 'Hello World!')
    .split('\n')
    .map((l: string) => l.trim())
    .join('')
);

// Ensures that Kitajs/html and ghtml produce the same output
assert.equal(
  ManyComponents(KitaHtml, 'Hello World!'),
  // Simply removes spaces and newlines
  TemplateManyComponents(gHtml.html, 'Hello World!')
    .split('\n')
    .map((l: string) => l.trim())
    .join('')
);

// Kitajs/html and typed html does produces the same output, however typed-html appends spaces between tags
assert.equal(
  ManyComponents(KitaHtml, 'Hello World!'),
  // Simply removes spaces and newlines
  ManyComponents(TypedHtml, 'Hello World!')
    .toString()
    .replace(/< \//g, '</')
    .replace(/\n/g, '')
);

group('Many Components (31.4kb)', () => {
  bench('Typed Html', () => ManyComponents(TypedHtml, 'Hello World!'));
  bench('KitaJS/Html', () => ManyComponents(KitaHtml, 'Hello World!'));
  bench('Common Tags', () => TemplateManyComponents(CommonTags.html, 'Hello World!'));
  bench('Ghtml', () => TemplateManyComponents(gHtml.html, 'Hello World!'));
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(ManyComponents(React, 'Hello World!') as any)
  );
});

group('MdnHomepage (66.7Kb)', () => {
  bench('Typed Html', () => MdnHomepage(TypedHtml, 'Hello World!'));
  bench('KitaJS/Html', () => MdnHomepage(KitaHtml, 'Hello World!'));
  bench('Common Tags', () => TemplateMdnHomepage(CommonTags.html, 'Hello World!'));
  bench('Ghtml', () => TemplateMdnHomepage(gHtml.html, 'Hello World!'));
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(MdnHomepage(React, 'Hello World!') as any)
  );
});

group('Many Props (7.4kb)', () => {
  bench('Typed Html', () => ManyProps(TypedHtml, 'Hello World!'));
  bench('KitaJS/Html', () => ManyProps(KitaHtml, 'Hello World!'));
  bench('Common Tags', () => TemplateManyProps(CommonTags.html, 'Hello World!'));
  bench('Ghtml', () => TemplateManyProps(gHtml.html, 'Hello World!'));
  bench('React', () =>
    ReactDOMServer.renderToStaticMarkup(ManyProps(React, 'Hello World!') as any)
  );
});

run().catch(console.error);
