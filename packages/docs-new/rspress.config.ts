import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rspress/core';
import { transformerCompatibleMetaHighlight } from '@rspress/core/shiki-transformers';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import { pluginTwoslash } from '@rspress/plugin-twoslash';
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from '@shikijs/transformers';
import { pluginOpenGraph } from 'rsbuild-plugin-open-graph';
import pluginFileTree from 'rspress-plugin-file-tree';
import pluginOg from 'rspress-plugin-og';
import * as path from 'node:path';

// Allow hostname override via env var
const DOCS_HOSTNAME = process.env.DOCS_HOSTNAME || 'html.kitajs.org';
const DOCS_URL = `https://${DOCS_HOSTNAME}`;

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'KitaJS Html',
  description: 'Fast and type safe HTML templates using TypeScript',
  icon: 'https://kitajs.org/logo.svg',
  logo: 'https://kitajs.org/doug-head-glasses.svg',

  plugins: [
    pluginTwoslash(),
    pluginSitemap({
      siteUrl: DOCS_URL
    }),
    pluginFileTree(),
    pluginOg({
      domain: DOCS_URL
    })
  ],

  builderConfig: {
    plugins: [
      pluginSass(),
      pluginOpenGraph({
        title: 'KitaJS Html',
        description: 'Fast and type safe HTML templates using TypeScript',
        url: DOCS_URL,
        twitter: {
          site: '@kitajs',
          card: 'summary_large_image'
        }
      })
    ]
  },

  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/kitajs/html'
      },
      {
        icon: 'npm',
        mode: 'link',
        content: 'https://npmjs.com/package/@kitajs/html'
      },
      {
        icon: 'discord',
        mode: 'link',
        content: 'https://kitajs.org/discord'
      }
    ],
    footer: {
      message: 'Released under the MIT License.'
    },
    lastUpdated: true,
    editLink: {
      docRepoBaseUrl:
        'https://github.com/kitajs/html/tree/master/packages/docs-new/docs'
    }
  },

  markdown: {
    shiki: {
      langs: ['tsx', 'typescript', 'ts', 'jsx', 'javascript', 'js', 'json', 'bash', 'html', 'css'],
      transformers: [
        transformerNotationDiff(),
        transformerNotationErrorLevel(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerCompatibleMetaHighlight(),
        transformerRemoveNotationEscape()
      ]
    },
    showLineNumbers: true
  },

  route: {
    cleanUrls: true
  },

  // Enable LLM-friendly documentation export
  llms: true
});
