import HonoRuntimeRenderers from '@kitajs/bench-html-honojsx'
import KitaHtmlJSXRuntimeRenderers from '@kitajs/bench-html-kitajs'
import PreactRuntimeRenderers from '@kitajs/bench-html-preact'
import ReactRuntimeRenderers from '@kitajs/bench-html-react'
import ReactJSXRuntimeRenderers from '@kitajs/bench-html-reactjsx'

import * as PreactRenderToString from 'preact-render-to-string'
import ReactDOMServer from 'react-dom/server'

export function KitaJs(name, purchases) {
  return KitaHtmlJSXRuntimeRenderers.RealWorldPage(name, purchases)
}
KitaJs.baseline = true

export function ReactJsx(name, purchases) {
  return ReactDOMServer.renderToStaticMarkup(
    ReactJSXRuntimeRenderers.RealWorldPage(name, purchases)
  )
}
ReactJsx.baseline = false

export function Preact(name, purchases) {
  return PreactRenderToString.render(
    PreactRuntimeRenderers.RealWorldPage(name, purchases)
  )
}
Preact.baseline = false

export function React(name, purchases) {
  return ReactDOMServer.renderToStaticMarkup(
    ReactRuntimeRenderers.RealWorldPage(name, purchases)
  )
}
React.baseline = false

export function HonoJsx(name, purchases) {
  return HonoRuntimeRenderers.RealWorldPage(name, purchases).toString()
}
HonoJsx.baseline = false

export const RunnersFn = [KitaJs, ReactJsx, Preact, React, HonoJsx]
