import { defineConfig } from '@rspress/core';
import * as path from 'node:path';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'KitaJS Html',
  description: 'Fast and type safe HTML templates using TypeScript',
  icon: '/logo.png',
  logo: {
    light: '/logo.png',
    dark: '/logo.png'
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/kitajs/html'
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
    lastUpdated: true
  },
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'kitajs, html, jsx, tsx, typescript, server-side, ssr, templates, xss, security, htmx, alpine'
          }
        }
      ]
    }
  }
});
