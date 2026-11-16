import { renderToStream, Suspense } from '@kitajs/html/suspense'
import { text } from 'node:stream/consumers'
import { RealWorldPage } from '../../kitajs/index.js'

// Each scenario stresses one Kita Html feature, so a profile of it shows where that
// feature spends its time without the noise of a full page.

const purchases = Array.from({ length: 1000 }, (_, i) => ({
  name: `Purchase "${i + 1}" & <co> 'ltd'`,
  price: i * 2,
  quantity: i * 5
}))

const rows = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  name: `Row <${i}> "quoted" & 'single'`,
  plain: `Row number ${i}`,
  active: i % 3 === 0,
  tag: i % 2 ? 'b' : null,
  color: i % 2 ? 'red' : 'blue'
}))

function Card({ title, footer, children }) {
  return (
    <article class="card">
      <h3 safe>{title}</h3>
      {children}
      {footer && <footer>{footer}</footer>}
    </article>
  )
}

function Wrapper({ children }) {
  return (
    <section>
      <div class="wrapper">{children}</div>
    </section>
  )
}

async function AsyncRow({ row }) {
  return (
    <tr>
      <td>{row.id}</td>
      <td safe>{row.plain}</td>
    </tr>
  )
}

function deepTree(depth: number): JSX.Element {
  return depth === 0 ? (
    <span>leaf</span>
  ) : (
    <div class={'d' + (depth % 10)}>{deepTree(depth - 1)}</div>
  )
}

export const scenarios: Record<string, () => JSX.Element> = {
  realWorldPage: () => RealWorldPage(`Bench & "co" <mark> 'it'`, purchases),

  attributes: () => (
    <div>
      {rows.map((r) => (
        <input
          id={'row-' + r.id}
          type="checkbox"
          name="rows"
          value={r.plain}
          data-id={r.id}
          checked={r.active}
          disabled={false}
          data-name={r.name}
          aria-label={r.plain}
          tabindex={0}
          hidden={undefined}
          title={null}
        />
      ))}
    </div>
  ),

  classArrays: () => (
    <ul>
      {rows.map((r) => (
        <li class={['item', r.active && 'active', r.tag, 'row-' + (r.id % 5)]}>
          <span className="label">{r.plain}</span>
        </li>
      ))}
    </ul>
  ),

  styleObject: () => (
    <div>
      {rows.map((r) => (
        <div
          style={{
            backgroundColor: r.color,
            fontSize: '12px',
            zIndex: r.id,
            marginTop: '4px',
            borderTopLeftRadius: '2px',
            WebkitTransform: 'none',
            display: r.active ? 'block' : undefined
          }}
        >
          {r.plain}
        </div>
      ))}
    </div>
  ),

  styleString: () => (
    <div>
      {rows.map((r) => (
        <div style={'background-color:' + r.color + ';font-size:12px'}>{r.plain}</div>
      ))}
    </div>
  ),

  escapeHeavy: () => (
    <div>
      {rows.map((r) => (
        <p safe>{r.name}</p>
      ))}
    </div>
  ),

  escapeClean: () => (
    <div>
      {rows.map((r) => (
        <p safe>{r.plain}</p>
      ))}
    </div>
  ),

  escapeMixedChildren: () => (
    <div>
      {rows.map((r) => (
        <p safe>
          Name: {r.name} ({r.id})
        </p>
      ))}
    </div>
  ),

  listsWithSiblings: () => (
    <table>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      {rows.map((r) => (
        <tr>
          <td>{r.id}</td>
          {rows.slice(0, 5).map((c) => (
            <td>{c.plain}</td>
          ))}
          <td>{r.plain}</td>
        </tr>
      ))}
      <tfoot />
    </table>
  ),

  fragments: () => (
    <>
      {rows.map((r) => (
        <>
          <dt>{r.plain}</dt>
          <dd>{r.id}</dd>
        </>
      ))}
    </>
  ),

  deepNesting: () => deepTree(500),

  componentsWithChildren: () => (
    <main>
      {rows.map((r) => (
        <Card title={r.plain} footer={r.active ? 'active' : null}>
          <p>{r.id}</p>
        </Card>
      ))}
    </main>
  ),

  dynamicTag: () => (
    <div>
      {rows.map((r) => (
        <tag of={r.active ? 'custom-a' : 'custom-b'} id={r.id}>
          {r.plain}
        </tag>
      ))}
    </div>
  ),

  asyncLeaves: () => (
    <table>
      {rows.map((row) => (
        <AsyncRow row={row} />
      ))}
    </table>
  ),

  asyncNested: () => (
    <table>
      {rows.map((row) => (
        <Wrapper>
          <Wrapper>
            <AsyncRow row={row} />
          </Wrapper>
        </Wrapper>
      ))}
    </table>
  ),

  suspenseStream: () =>
    text(
      renderToStream((rid) => (
        <main>
          {Array.from({ length: 10 }, (_, s) => (
            <Suspense rid={rid} fallback={<p>loading</p>}>
              {rows.slice(s * 50, s * 50 + 50).map((row) => (
                <AsyncRow row={row} />
              ))}
            </Suspense>
          ))}
        </main>
      ))
    )
}
