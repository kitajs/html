import Html, { type PropsWithChildren } from '@kitajs/html'
import {
  Suspense,
  SuspenseRoot,
  SuspenseScript as safeSuspenseScript
} from '@kitajs/html/suspense'
import express from 'express'
import { JSDOM } from 'jsdom'
import { setTimeout } from 'node:timers/promises'
import { afterEach, describe, expect, test } from 'vitest'
import { expressKitaHtml } from '../src'
import { getServerUrl, startServer } from './server'

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await setTimeout(ms * 50)
  return Html.contentsToString([children || String(ms)])
}

describe('Suspense', () => {
  afterEach(() => {
    expect(SuspenseRoot.requests.size).toBe(0)

    SuspenseRoot.autoScript = true
    SuspenseRoot.requestCounter = 1
    SuspenseRoot.requests.clear()
  })

  test('sync without suspense', async () => {
    const app = express()
    app.use(expressKitaHtml())
    app.get('/', (_, res) => res.html(<div />))

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.text()).toBe('<div></div>')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
  })

  test('suspense sync children', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <div>2</div>
        </Suspense>
      )
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.text()).toBe('<div>2</div>')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
  })

  test('suspense async children', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(await res.text()).toBe(
      '<div id="B:req-1:1" data-sf><div>1</div></div>' +
        safeSuspenseScript +
        '<template id="N:req-1:1" data-sr>2</template><script id="S:req-1:1" data-ss>$KITA_RC("req-1:1")</script>'
    )
  })

  test('suspense async fallback sync children', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <div>2</div>
        </Suspense>
      )
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.text()).toBe('<div>2</div>')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
  })

  test('multiple async renders cleanup', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    )

    await using server = await startServer(app)
    const url = `${getServerUrl(server)}/`

    await Promise.all(
      Array.from({ length: 50 }, async () => {
        const res = await fetch(url)
        const body = await res.text()

        expect(res.status).toBe(200)
        expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
        expect(body).toContain('data-sf')
        expect(body).toContain('data-sr')
        expect(body).toContain('$KITA_RC("req-')
        expect(body).toContain(safeSuspenseScript)
      })
    )
  })

  test('multiple children', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) =>
      res.html(
        <div>
          <Suspense rid={req.id} fallback={<div>1</div>}>
            <SleepForMs ms={4} />
          </Suspense>
          <Suspense rid={req.id} fallback={<div>2</div>}>
            <SleepForMs ms={5} />
          </Suspense>
          <Suspense rid={req.id} fallback={<div>3</div>}>
            <SleepForMs ms={6} />
          </Suspense>
        </div>
      )
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(await res.text()).toBe(
      '<div><div id="B:req-1:1" data-sf><div>1</div></div><div id="B:req-1:2" data-sf><div>2</div></div><div id="B:req-1:3" data-sf><div>3</div></div></div>' +
        safeSuspenseScript +
        '<template id="N:req-1:1" data-sr>4</template><script id="S:req-1:1" data-ss>$KITA_RC("req-1:1")</script>' +
        '<template id="N:req-1:2" data-sr>5</template><script id="S:req-1:2" data-ss>$KITA_RC("req-1:2")</script>' +
        '<template id="N:req-1:3" data-sr>6</template><script id="S:req-1:3" data-ss>$KITA_RC("req-1:3")</script>'
    )
  })

  test('concurrent renders', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) => {
      const seconds = Number(req.query.seconds)
      res.setHeader('seconds', seconds)

      return res.html(
        <div>
          {Array.from({ length: seconds }, (_, i) => (
            <Suspense rid={req.id} fallback={<div>{seconds - i} loading</div>}>
              <SleepForMs ms={seconds - i}>{seconds - i}</SleepForMs>
            </Suspense>
          ))}
        </div>
      )
    })

    await using server = await startServer(app)
    const baseUrl = getServerUrl(server)
    const secondsArray = [9, 4, 7]
    const results = await Promise.all(
      secondsArray.map((seconds) => fetch(`${baseUrl}/?seconds=${seconds}`))
    )

    for (const result of results) {
      const seconds = Number(result.headers.get('seconds'))
      const body = await result.text()

      expect(result.status).toBe(200)
      expect(result.headers.get('content-type')).toBe('text/html; charset=utf-8')
      expect(body).toContain(safeSuspenseScript)
      expect(body.match(/<div id="B:/g)?.length).toBe(seconds)
      expect(body.match(/<template id="N:/g)?.length).toBe(seconds)
      expect(body.match(/<script id="S:/g)?.length).toBe(seconds)
    }
  })

  test('works with parallel deep suspense calls resolving first', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) =>
      res.html(
        <div>
          {Array.from({ length: 5 }, (_, i) => (
            <Suspense rid={req.id} fallback={<div>{i} fb outer</div>}>
              <div>Outer {i}!</div>

              <SleepForMs ms={i % 2 === 0 ? i / 2 : i}>
                <Suspense rid={req.id} fallback={<div>{i} fb inner!</div>}>
                  <SleepForMs ms={i}>
                    <div>Inner {i}!</div>
                  </SleepForMs>
                </Suspense>
              </SleepForMs>
            </Suspense>
          ))}
        </div>
      )
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(body).toContain('<div id="B:req-1:2" data-sf><div>0 fb outer</div></div>')
    expect(body).toContain(
      '<template id="N:req-1:1" data-sr><div>Inner 0!</div></template>'
    )
    expect(body).toContain(
      '<template id="N:req-1:10" data-sr><div>Outer 4!</div><div id="B:req-1:9" data-sf><div>4 fb inner!</div></div></template>'
    )

    expect(
      new JSDOM(body, { runScripts: 'dangerously' }).window.document.body.innerHTML
    ).toBe(
      '<div><div>Outer 0!</div><div>Inner 0!</div><div>Outer 1!</div><div>Inner 1!</div><div>Outer 2!</div><div>Inner 2!</div><div>Outer 3!</div><div>Inner 3!</div><div>Outer 4!</div><div>Inner 4!</div></div>' +
        safeSuspenseScript
    )
  })

  test('tests suspense with function error boundary', async () => {
    const app = express()
    app.use(expressKitaHtml())
    const err = new Error('component failed')

    app.get('/', (req, res) =>
      res.html(
        <Suspense
          rid={req.id}
          fallback={<div>1</div>}
          catch={(err2) => {
            expect(err2).toBe(err)
            return <div>3</div>
          }}
        >
          {Promise.reject(err) as Promise<'safe'>}
        </Suspense>
      )
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(await res.text()).toBe(
      '<div id="B:req-1:1" data-sf><div>1</div></div>' +
        safeSuspenseScript +
        '<template id="N:req-1:1" data-sr><div>3</div></template><script id="S:req-1:1" data-ss>$KITA_RC("req-1:1")</script>'
    )
  })

  test('stream outputs raw html', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>loading</div>}>
          <SleepForMs ms={1} />
        </Suspense>
      )
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body.startsWith('<div id="B:req-1:1"')).toBe(true)
    expect(body).not.toMatch(/^[0-9a-f]+\r\n/i)
  })
})
