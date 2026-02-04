import { Suspense } from '@kitajs/html/suspense';
import { TodoItem } from '../../api/todos';
import { store } from '../../store';
import {
  Card,
  MemoryStat,
  Progress,
  RequestsStat,
  Spinner,
  StatSkeleton,
  UptimeStat,
  VisitorsStat
} from '../components';
import { Layout } from '../Layout';

export function Dashboard({ rid }: { rid: number | string }) {
  return (
    <Layout title="KitaJS + HTMX Demo">
      <div class="flex flex-col max-w-5xl mx-auto w-full">
        {/* Header */}
        <header class="flex items-center justify-between mb-6 flex-shrink-0">
          <div class="flex items-center gap-3">
            <img src="https://kitajs.org/logo.svg" alt="KitaJS Logo" class="w-10 h-10" />
            <div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-kita-400 to-kita-300 bg-clip-text text-transparent">
                KitaJS Html + HTMX
              </h1>
              <p class="text-xs text-stone-500">Interactive Server-Side Rendering</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <a
              href="https://github.com/kitajs/html"
              class="text-xs text-stone-400 hover:text-kita-400 transition-colors"
            >
              GitHub
            </a>
            <div class="text-xs text-stone-500 bg-stone-900/50 px-3 py-1.5 rounded-full border border-stone-800">
              No page reloads
            </div>
          </div>
        </header>

        {/* Stats Row - Using Suspense with async JSX components */}
        <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <VisitorsStat />
          </Suspense>
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <RequestsStat />
          </Suspense>
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <UptimeStat />
          </Suspense>
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <MemoryStat />
          </Suspense>
        </section>

        {/* Main Content */}
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Click Counter */}
          <Card title="Click Counter" icon="🖱️">
            <div class="text-center py-4">
              <div id="click-count" class="text-4xl font-bold text-kita-400 mb-4">
                {store.clickCount}
              </div>
              <button
                hx-post="/api/click"
                hx-target="#click-count"
                hx-swap="innerHTML"
                class="bg-kita-500 hover:bg-kita-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Click Me!
              </button>
            </div>
          </Card>

          {/* Todo List */}
          <Card title="Todo List" icon="📝">
            <form
              hx-post="/api/todos"
              hx-target="#todo-list"
              hx-swap="beforeend"
              {...{ 'hx-on::after-request': 'this.reset()' }}
              class="flex gap-2 mb-3"
            >
              <input
                type="text"
                name="text"
                placeholder="Add a task..."
                required
                class="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-kita-500"
              />
              <button
                type="submit"
                class="bg-kita-500 hover:bg-kita-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </form>
            <div id="todo-list" class="space-y-1 max-h-32 overflow-y-auto">
              {store.todos.map((todo) => (
                <TodoItem {...todo} />
              ))}
            </div>
          </Card>

          {/* Server Time */}
          <Card title="Server Time" icon="⏰">
            <div class="text-center py-4">
              <div
                hx-get="/api/time"
                hx-trigger="load, every 1s"
                hx-swap="innerHTML"
                class="text-2xl font-mono text-kita-300"
              >
                Loading...
              </div>
              <p class="text-xs text-stone-500 mt-2">
                Updates every second via HTMX polling
              </p>
            </div>
          </Card>
        </section>

        {/* Bottom Section */}
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* System Metrics */}
          <Card title="System Metrics" icon="📊">
            <div
              hx-get="/api/metrics"
              hx-trigger="load, every 3s"
              hx-swap="morph:innerHTML"
              hx-indicator="#metrics-indicator"
            >
              <div class="space-y-3">
                <Progress label="Loading..." value={0} />
              </div>
            </div>
            <div
              id="metrics-indicator"
              class="htmx-indicator text-xs text-stone-500 mt-2"
            >
              <Spinner size="sm" /> Refreshing...
            </div>
          </Card>

          {/* Notifications */}
          <Card title="Notifications" icon="🔔">
            <div class="space-y-2 mb-3 max-h-20 overflow-y-auto" id="notifications">
              <p class="text-xs text-stone-500">Click to trigger notifications</p>
            </div>
            <div class="flex gap-2">
              <button
                hx-post="/api/notify?type=success"
                hx-target="#notifications"
                hx-swap="afterbegin"
                class="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Success
              </button>
              <button
                hx-post="/api/notify?type=error"
                hx-target="#notifications"
                hx-swap="afterbegin"
                class="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Error
              </button>
              <button
                hx-post="/api/notify?type=info"
                hx-target="#notifications"
                hx-swap="afterbegin"
                class="flex-1 bg-kita-500/20 hover:bg-kita-500/30 text-kita-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Info
              </button>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer class="text-center flex-shrink-0">
          <p class="text-xs text-stone-600">
            Stats use Suspense with async JSX components. Other components use HTMX for
            seamless server interactions.
          </p>
          <p class="text-xs text-stone-500 mt-1">
            Built with{' '}
            <a
              href="https://kitajs.org"
              class="text-kita-400 hover:text-kita-300 transition-colors"
            >
              KitaJS
            </a>{' '}
            +{' '}
            <a
              href="https://htmx.org"
              class="text-kita-400 hover:text-kita-300 transition-colors"
            >
              HTMX
            </a>{' '}
            +{' '}
            <a
              href="https://fastify.dev"
              class="text-kita-400 hover:text-kita-300 transition-colors"
            >
              Fastify
            </a>
          </p>
        </footer>
      </div>
    </Layout>
  );
}
