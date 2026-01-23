import { Suspense } from '@kitajs/html/suspense';
import { setTimeout } from 'node:timers/promises';
import {
  Card,
  ListItem,
  ListSkeleton,
  Progress,
  ProgressSkeleton,
  StatCard,
  StatSkeleton
} from '../components';
import { Layout } from '../Layout';

// Random delay helper (base +/- variance)
const randomDelay = (base: number, variance = 300) =>
  base + Math.floor(Math.random() * variance * 2) - variance;

// Individual stats with randomized timing
async function fetchRevenue() {
  await setTimeout(randomDelay(400, 200));
  return { label: 'Revenue', value: '$12.4k', change: '+14%', positive: true };
}

async function fetchUsers() {
  await setTimeout(randomDelay(500, 250));
  return { label: 'Users', value: '1,429', change: '+7%', positive: true };
}

async function fetchOrders() {
  await setTimeout(randomDelay(600, 300));
  return { label: 'Orders', value: '284', change: '-3%', positive: false };
}

async function fetchConversion() {
  await setTimeout(randomDelay(700, 350));
  return { label: 'Conversion', value: '3.2%', change: '+0.8%', positive: true };
}

// Grouped data fetching with randomized timing
async function fetchRecentActivity() {
  await setTimeout(randomDelay(1400, 400));
  return [
    {
      primary: 'New order #1234',
      secondary: '2 min ago',
      badge: '$299',
      badgeColor: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      primary: 'User signup',
      secondary: '5 min ago',
      badge: 'New',
      badgeColor: 'bg-kita-500/20 text-kita-300'
    },
    {
      primary: 'Payment received',
      secondary: '12 min ago',
      badge: '$149',
      badgeColor: 'bg-emerald-500/20 text-emerald-400'
    }
  ];
}

async function fetchSystemStatus() {
  await setTimeout(randomDelay(1600, 400));
  return [
    { label: 'CPU', value: 45 },
    { label: 'Memory', value: 72 },
    { label: 'Storage', value: 28 }
  ];
}

// Individual stat components
async function RevenueStat() {
  const data = await fetchRevenue();
  return <StatCard {...data} />;
}

async function UsersStat() {
  const data = await fetchUsers();
  return <StatCard {...data} />;
}

async function OrdersStat() {
  const data = await fetchOrders();
  return <StatCard {...data} />;
}

async function ConversionStat() {
  const data = await fetchConversion();
  return <StatCard {...data} />;
}

// Grouped section components
async function ActivitySection() {
  const items = await fetchRecentActivity();
  return (
    <Card title="Recent Activity" icon="⚡">
      {items.map((item) => (
        <ListItem {...item} />
      ))}
    </Card>
  );
}

async function SystemSection() {
  const metrics = await fetchSystemStatus();
  return (
    <Card title="System Status" icon="📊">
      {metrics.map((m) => (
        <Progress label={m.label} value={m.value} />
      ))}
    </Card>
  );
}

// Main Dashboard
export function Dashboard(rid: number | string) {
  return (
    <Layout title="KitaJS Streaming Demo">
      <div class="flex flex-col max-w-5xl mx-auto w-full">
        {/* Header */}
        <header class="flex items-center justify-between mb-6 flex-shrink-0">
          <div class="flex items-center gap-3">
            <img src="https://kitajs.org/logo.svg" alt="KitaJS Logo" class="w-10 h-10" />
            <div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-kita-400 to-kita-300 bg-clip-text text-transparent">
                KitaJS Html
              </h1>
              <p class="text-xs text-stone-500">Suspense Streaming Demo</p>
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
              Refresh to replay
            </div>
          </div>
        </header>

        {/* Stats Row - Individual Suspense for each */}
        <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <RevenueStat />
          </Suspense>
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <UsersStat />
          </Suspense>
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <OrdersStat />
          </Suspense>
          <Suspense rid={rid} fallback={<StatSkeleton />}>
            <ConversionStat />
          </Suspense>
        </section>

        {/* Content Grid - Grouped Suspense */}
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          <Suspense
            rid={rid}
            fallback={
              <Card title="Recent Activity" icon="⚡">
                <ListSkeleton items={3} />
              </Card>
            }
          >
            <ActivitySection />
          </Suspense>

          <Suspense
            rid={rid}
            fallback={
              <Card title="System Status" icon="📊">
                <ProgressSkeleton items={3} />
              </Card>
            }
          >
            <SystemSection />
          </Suspense>
        </section>

        {/* Footer */}
        <footer class="mt-6 text-center flex-shrink-0">
          <p class="text-xs text-stone-600">
            Each component loads independently with randomized timing - refresh to see
            different patterns
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
              href="https://nodejs.org"
              class="text-kita-400 hover:text-kita-300 transition-colors"
            >
              Node.js
            </a>
          </p>
        </footer>
      </div>
    </Layout>
  );
}
