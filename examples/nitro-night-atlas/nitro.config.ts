import { nitroKitaHtml } from '@kitajs/nitro-html-plugin'
import { defineConfig } from 'nitro'

export default defineConfig({
  serverDir: './server',
  modules: [nitroKitaHtml()],
  routeRules: {
    '/objects/**': { headers: { 'cache-control': 'public, max-age=60' } }
  }
})
