import KitaHtmlJSXRuntimeRenderers from '@kitajs/bench-html-kitajs';
import ReactJSXRuntimeRenderers from '@kitajs/bench-html-reactjsx';
import StringTemplateRenderers from '@kitajs/bench-html-templates';
import TypedHtmlRenderers from '@kitajs/bench-html-typed-html';

import CommonTags from 'common-tags';
import * as gHtml from 'ghtml';
import ReactDOMServer from 'react-dom/server';

import assert from 'node:assert';

export function assertHtml() {
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
}
