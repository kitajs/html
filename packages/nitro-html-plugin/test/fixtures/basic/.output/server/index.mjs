globalThis.__nitro_main__ = import.meta.url
import { promises } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  r as defineHandler,
  t as H3Core,
  n as HTTPError,
  a as NodeResponse,
  o as serve,
  i as toEventHandler
} from './_libs/h3+rou3+srvx.mjs'
import {
  t as decodePath,
  n as joinURL,
  r as withLeadingSlash,
  i as withoutTrailingSlash
} from './_libs/ufo.mjs'
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {}
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__))
  return promises.readFile(resolve(serverDir, public_assets_data_default[id].path))
}
//#endregion
//#region #nitro/virtual/public-assets
const publicAssetBases = {}
function isPublicAssetURL(id = '') {
  if (public_assets_data_default[id]) return true
  for (const base in publicAssetBases) if (id.startsWith(base)) return true
  return false
}
function getAsset(id) {
  return public_assets_data_default[id]
}
//#endregion
//#region ../../../../../node_modules/.pnpm/nitro@3.0.260610-beta_chokidar@5.0.0_dotenv@8.6.0_jiti@2.7.0_lru-cache@11.5.2_vite@7.3._984059561140f35ba0ed11c58e1c3609/node_modules/nitro/dist/runtime/internal/static.mjs
const METHODS = /* @__PURE__ */ new Set(['HEAD', 'GET'])
const EncodingMap = {
  gzip: '.gz',
  br: '.br',
  zstd: '.zst'
}
var static_default = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) return
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)))
  let asset
  const encodings = [
    ...(event.req.headers.get('accept-encoding') || '')
      .split(',')
      .map((e) => EncodingMap[e.trim()])
      .filter(Boolean)
      .sort(),
    ''
  ]
  for (const encoding of encodings)
    for (const _id of [id + encoding, joinURL(id, 'index.html' + encoding)]) {
      const _asset = getAsset(_id)
      if (_asset) {
        asset = _asset
        id = _id
        break
      }
    }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete('Cache-Control')
      throw new HTTPError({ status: 404 })
    }
    return
  }
  if (encodings.length > 1) event.res.headers.append('Vary', 'Accept-Encoding')
  if (event.req.headers.get('if-none-match') === asset.etag) {
    event.res.status = 304
    event.res.statusText = 'Not Modified'
    return ''
  }
  const ifModifiedSinceH = event.req.headers.get('if-modified-since')
  const mtimeDate = new Date(asset.mtime)
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304
    event.res.statusText = 'Not Modified'
    return ''
  }
  if (asset.type) event.res.headers.set('Content-Type', asset.type)
  if (asset.etag && !event.res.headers.has('ETag'))
    event.res.headers.set('ETag', asset.etag)
  if (asset.mtime && !event.res.headers.has('Last-Modified'))
    event.res.headers.set('Last-Modified', mtimeDate.toUTCString())
  if (asset.encoding && !event.res.headers.has('Content-Encoding'))
    event.res.headers.set('Content-Encoding', asset.encoding)
  if (asset.size > 0 && !event.res.headers.has('Content-Length'))
    event.res.headers.set('Content-Length', asset.size.toString())
  return readAsset(id)
})
//#endregion
//#region #nitro/virtual/routing
const globalMiddleware = [toEventHandler(static_default)].filter(Boolean)
//#endregion
//#region ../../../../../node_modules/.pnpm/nitro@3.0.260610-beta_chokidar@5.0.0_dotenv@8.6.0_jiti@2.7.0_lru-cache@11.5.2_vite@7.3._984059561140f35ba0ed11c58e1c3609/node_modules/nitro/dist/runtime/internal/error/prod.mjs
const errorHandler = (error, event) => {
  const res = defaultHandler(error, event)
  return new NodeResponse(
    typeof res.body === 'string' ? res.body : JSON.stringify(res.body, null, 2),
    res
  )
}
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error)
  const { status = 500, statusText = '' } = unhandled ? {} : error
  if (status === 404) {
    const url = event.url || new URL(event.req.url)
    const baseURL = '/'
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL))
      return {
        status: 302,
        headers: new Headers({
          location: `${baseURL}${url.pathname.slice(1)}${url.search}`
        })
      }
  }
  const headers = new Headers(unhandled ? {} : error.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  return {
    status,
    statusText,
    headers,
    body: {
      error: true,
      ...(unhandled
        ? {
            status,
            unhandled: true
          }
        : typeof error.toJSON === 'function'
          ? error.toJSON()
          : {
              status,
              statusText,
              message: error.message
            })
    }
  }
}
//#endregion
//#region #nitro/virtual/error-handler
const errorHandlers = [errorHandler]
async function error_handler_default(error, event) {
  for (const handler of errorHandlers)
    try {
      const response = await handler(error, event, { defaultHandler })
      if (response) return response
    } catch (error) {
      console.error(error)
    }
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors
      if (errors)
        errors.push({
          error,
          context: errorCtx
        })
    }
  }
  const h3App = createH3App({
    onError(error, event) {
      return error_handler_default(error, event)
    }
  })
  let appHandler = (req) => {
    req.context ||= {}
    req.context.nitro = req.context.nitro || { errors: [] }
    return h3App.fetch(req)
  }
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  }
}
function createH3App(config) {
  const h3App = new H3Core(config)
  h3App['~middleware'].push(...globalMiddleware)
  return h3App
}
//#endregion
//#region ../../../../../node_modules/.pnpm/nitro@3.0.260610-beta_chokidar@5.0.0_dotenv@8.6.0_jiti@2.7.0_lru-cache@11.5.2_vite@7.3._984059561140f35ba0ed11c58e1c3609/node_modules/nitro/dist/runtime/internal/app.mjs
const APP_ID = 'default'
function useNitroApp() {
  let instance = useNitroApp._instance
  if (instance) return instance
  instance = useNitroApp._instance = createNitroApp()
  globalThis.__nitro__ = globalThis.__nitro__ || {}
  globalThis.__nitro__[APP_ID] = instance
  return instance
}
//#endregion
//#region ../../../../../node_modules/.pnpm/nitro@3.0.260610-beta_chokidar@5.0.0_dotenv@8.6.0_jiti@2.7.0_lru-cache@11.5.2_vite@7.3._984059561140f35ba0ed11c58e1c3609/node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
  console.error(`[${type}]`, error)
  useNitroApp().captureError?.(error, { tags: [type] })
}
function trapUnhandledErrors() {
  process.on('unhandledRejection', (error) => _captureError(error, 'unhandledRejection'))
  process.on('uncaughtException', (error) => _captureError(error, 'uncaughtException'))
}
//#endregion
//#region #nitro/virtual/tracing
const tracingSrvxPlugins = []
//#endregion
//#region ../../../../../node_modules/.pnpm/nitro@3.0.260610-beta_chokidar@5.0.0_dotenv@8.6.0_jiti@2.7.0_lru-cache@11.5.2_vite@7.3._984059561140f35ba0ed11c58e1c3609/node_modules/nitro/dist/presets/node/runtime/node-server.mjs
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? '')
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort
const host = process.env.NITRO_HOST || process.env.HOST
const cert = process.env.NITRO_SSL_CERT
const key = process.env.NITRO_SSL_KEY
const nitroApp = useNitroApp()
serve({
  port,
  hostname: host,
  tls:
    cert && key
      ? {
          cert,
          key
        }
      : void 0,
  fetch: nitroApp.fetch,
  plugins: [...tracingSrvxPlugins]
})
trapUnhandledErrors()
var node_server_default = {}
//#endregion
export { node_server_default as default }
