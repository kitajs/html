import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig, type UserConfig } from '@rspress/core';
import { pluginClientRedirects } from '@rspress/plugin-client-redirects';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import { pluginTwoslash } from '@rspress/plugin-twoslash';
import { pluginTypeDoc, PluginTypeDocOptions } from '@rspress/plugin-typedoc';
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from '@shikijs/transformers';
import path from 'node:path';
import { pluginOpenGraph } from 'rsbuild-plugin-open-graph';
import pluginFileTree from 'rspress-plugin-file-tree';
import pluginOg from 'rspress-plugin-og';

/** Shared TypeDoc setup for compact, public-only API docs. */
function configureTypeDoc(publicPath: string, tsconfig?: string) {
  return (app: Parameters<Exclude<PluginTypeDocOptions['setup'], undefined>>[0]) => {
    if (tsconfig) {
      app.options.setValue('tsconfig', tsconfig);
    }
    app.options.setValue('excludeInternal', true);
    app.options.setValue('excludePrivate', true);
    app.options.setValue('excludeProtected', true);
    app.options.setValue('hidePageHeader', true);
    app.options.setValue('hideBreadcrumbs', true);
    app.options.setValue('useCodeBlocks', true);
    app.options.setValue('flattenOutputFiles', true);
    app.options.setValue('mergeReadme', true);
    app.options.setValue('readme', 'none');
    app.options.setValue('formatWithPrettier', true);
    app.options.setValue('publicPath', publicPath);
  };
}

/** Creates a renamed pluginTypeDoc instance to allow multiple registrations. */
function namedTypeDoc(name: string, options: Parameters<typeof pluginTypeDoc>[0]) {
  const plugin = pluginTypeDoc(options);
  return { ...plugin, name };
}

// Allow hostname override via env var
const DOCS_HOSTNAME = process.env.DOCS_HOSTNAME || 'html.kitajs.org';
const DOCS_URL = `https://${DOCS_HOSTNAME}`;

export default defineConfig({
  title: 'Kita Html',
  description: 'Fast and type safe HTML templates using TypeScript',
  lang: 'en',
  icon: 'https://kitajs.org/doug-head-glasses.svg',
  outDir: 'dist',
  logo: {
    dark: 'https://kitajs.org/kita-horizontal-white.svg',
    light: 'https://kitajs.org/kita-horizontal-black.svg'
  },

  plugins: [
    pluginTwoslash(),
    pluginSitemap({
      siteUrl: DOCS_URL
    }),
    pluginFileTree(),
    pluginOg({
      domain: DOCS_URL
    }),
    namedTypeDoc('typedoc-html', {
      entryPoints: [
        path.join(__dirname, '../html/src/index.ts'),
        path.join(__dirname, '../html/src/jsx-runtime.ts'),
        path.join(__dirname, '../html/src/suspense.ts'),
        path.join(__dirname, '../html/src/error-boundary.ts')
      ],
      outDir: 'api/html',
      setup: configureTypeDoc('/api/html/', path.join(__dirname, 'tsconfig.typedoc.json'))
    }),
    namedTypeDoc('typedoc-fastify', {
      entryPoints: [path.join(__dirname, '../fastify-html-plugin/src/index.ts')],
      outDir: 'api/fastify',
      setup: configureTypeDoc('/api/fastify/')
    }),
    pluginClientRedirects({
      redirects: [
        { from: '/k601', to: '/guide/xss/error-codes#k601' },
        { from: '/k602', to: '/guide/xss/error-codes#k602' },
        { from: '/k603', to: '/guide/xss/error-codes#k603' },
        { from: '/k604', to: '/guide/xss/error-codes#k604' },
        { from: '/packages/ts-html-plugin', to: '/guide/xss/error-codes' },
        { from: '/packages/fastify-html-plugin', to: '/integrations/frameworks/fastify' }
      ]
    })
  ],

  builderConfig: {
    html: {
      // Privacy-friendly analytics by Plausible
      // https://metrics.arthur.one/html.kitajs.org
      tags: [
        {
          tag: 'script',
          attrs: {
            async: true,
            src: 'https://metrics.arthur.one/js/pa-AKhE0bhhuBYoXQ-4fvapz.js'
          }
        },
        {
          tag: 'script',
          children: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`
        }
      ]
    },
    plugins: [
      pluginSass(),
      pluginOpenGraph({
        title: 'Kita Html',
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
      docRepoBaseUrl: 'https://github.com/kitajs/html/tree/master/packages/docs-new/docs'
    }
  },

  markdown: {
    shiki: {
      langs: [
        'tsx',
        'typescript',
        'ts',
        'jsx',
        'javascript',
        'js',
        'json',
        'bash',
        'html',
        'css'
      ],
      transformers: [
        transformerNotationDiff(),
        transformerNotationErrorLevel(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerNotationHighlight(),
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
} satisfies UserConfig);
