import { nitroKitaHtml } from '@kitajs/nitro-html-plugin'
import { defineConfig } from 'nitro'

// Every file in server/pages becomes a lazy GET/HEAD route.
export default defineConfig({
  serverDir: './server',
  modules: [nitroKitaHtml()]
})
