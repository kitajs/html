import KitaHtmlJSXRuntimeRenderers from '@kitajs/bench-html-kitajs';
import PreactRuntimeRenderers from '@kitajs/bench-html-preact';
//import ReactRuntimeRenderers from '@kitajs/bench-html-react'; same as reactjsx
import JSXTERuntimeRenderers from '@kitajs/bench-html-jsxte';
import ReactJSXRuntimeRenderers from '@kitajs/bench-html-reactjsx';
import StringTemplateRenderers from '@kitajs/bench-html-templates';
import TypedHtmlRenderers from '@kitajs/bench-html-typed-html';
import VHtmlRenderers from '@kitajs/bench-html-vhtml';

import CommonTags from 'common-tags';
import * as gHtml from 'ghtml';
import * as JSXTE from 'jsxte';
import * as PreactRenderToString from 'preact-render-to-string';
import ReactDOMServer from 'react-dom/server';

import { minify } from 'html-minifier';
import assert from 'node:assert';
import { mkdirSync, writeFileSync } from 'node:fs';
import prettier from 'prettier';

const MINIFY_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  html5: true
};

const NAME_VAR = 'Arthur Fiorette';

mkdirSync('./samples', { recursive: true });

function saveHtml(name, code) {
  return (
    prettier
      // minifies and format to ensure consistency
      .format(minify(code, MINIFY_OPTIONS), {
        parser: 'html',
        arrowParens: 'always',
        bracketSpacing: true,
        endOfLine: 'lf',
        insertPragma: false,
        bracketSameLine: false,
        jsxSingleQuote: false,
        printWidth: 90,
        proseWrap: 'always',
        quoteProps: 'as-needed',
        requirePragma: false,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'none',
        useTabs: false,
        vueIndentScriptAndStyle: false,
        tsdoc: true
      })
      .then((code) => writeFileSync('./samples/' + name + '.html', code))
      .then(() => console.log('Saved ' + name + '.html sample file.'))
  );
}

// Ensures that Kitajs/html and react produce the same output
assert.equal(
  KitaHtmlJSXRuntimeRenderers.RealWorldPage(NAME_VAR),
  ReactDOMServer.renderToStaticMarkup(ReactJSXRuntimeRenderers.RealWorldPage(NAME_VAR))
);

await Promise.all([
  saveHtml(
    'react',
    ReactDOMServer.renderToStaticMarkup(ReactJSXRuntimeRenderers.RealWorldPage(NAME_VAR))
  ),
  saveHtml('kitajs', KitaHtmlJSXRuntimeRenderers.RealWorldPage(NAME_VAR)),
  saveHtml('typed-html', TypedHtmlRenderers.RealWorldPage(NAME_VAR)),
  saveHtml('vhtml', VHtmlRenderers.RealWorldPage(NAME_VAR)),
  saveHtml(
    'common-tags',
    StringTemplateRenderers.RealWorldPage(CommonTags.html, NAME_VAR).replace(/!/g, '')
  ),
  saveHtml('ghtml', StringTemplateRenderers.RealWorldPage(gHtml.html, NAME_VAR)),
  saveHtml(
    'preact',
    PreactRenderToString.render(PreactRuntimeRenderers.RealWorldPage(NAME_VAR))
  ),
  saveHtml('jsxte', JSXTE.renderToHtml(JSXTERuntimeRenderers.RealWorldPage(NAME_VAR)))
]);
