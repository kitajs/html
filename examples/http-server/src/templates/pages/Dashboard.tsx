import { Suspense } from '@kitajs/html/suspense';
import { setTimeout } from 'node:timers/promises';
import {
  ActivityItem,
  ActivitySkeleton,
  Badge,
  Card,
  Progress,
  SectionTitle,
  StatCard,
  StatSkeleton,
  Table,
  TableSkeleton
} from '../components';
import { Layout } from '../Layout';

// Individual stat fetching functions with staggered delays
async function fetchRevenueStat() {
  await setTimeout(400);
  return {
    label: 'Total Revenue',
    value: '$45,231',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: '💰',
    iconBg: 'from-emerald-500 to-teal-600'
  };
}

async function fetchUsersStat() {
  await setTimeout(1600);
  return {
    label: 'Active Users',
    value: '2,345',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: '👥',
    iconBg: 'from-blue-500 to-cyan-600'
  };
}

async function fetchConversionStat() {
  await setTimeout(1200);
  return {
    label: 'Conversion Rate',
    value: '3.24%',
    change: '-0.4%',
    changeType: 'negative' as const,
    icon: '📈',
    iconBg: 'from-purple-500 to-pink-600'
  };
}

async function fetchOrderValueStat() {
  await setTimeout(800);
  return {
    label: 'Avg. Order Value',
    value: '$89.50',
    change: '+5.1%',
    changeType: 'positive' as const,
    icon: '🛒',
    iconBg: 'from-orange-500 to-amber-600'
  };
}

async function fetchRecentOrders() {
  await setTimeout(1500);
  return [
    {
      id: '#ORD-7892',
      customer: 'Sarah Wilson',
      product: 'Pro Subscription',
      amount: '$299.00',
      status: 'completed'
    },
    {
      id: '#ORD-7891',
      customer: 'Mike Johnson',
      product: 'Team Plan',
      amount: '$599.00',
      status: 'processing'
    },
    {
      id: '#ORD-7890',
      customer: 'Emily Davis',
      product: 'Enterprise License',
      amount: '$1,299.00',
      status: 'completed'
    },
    {
      id: '#ORD-7889',
      customer: 'Alex Chen',
      product: 'Starter Pack',
      amount: '$49.00',
      status: 'pending'
    },
    {
      id: '#ORD-7888',
      customer: 'Lisa Anderson',
      product: 'Pro Subscription',
      amount: '$299.00',
      status: 'completed'
    }
  ];
}

async function fetchActivity() {
  await setTimeout(2000);
  return [
    {
      avatar: 'John Doe',
      avatarColor: 'from-blue-500 to-cyan-600',
      text: 'Completed purchase of Enterprise License',
      time: '2 minutes ago'
    },
    {
      avatar: 'Sarah Miller',
      avatarColor: 'from-purple-500 to-pink-600',
      text: 'Upgraded to Pro subscription',
      time: '15 minutes ago'
    },
    {
      avatar: 'Tom Wilson',
      avatarColor: 'from-emerald-500 to-teal-600',
      text: 'Left a 5-star review',
      time: '1 hour ago'
    },
    {
      avatar: 'Emma Brown',
      avatarColor: 'from-orange-500 to-amber-600',
      text: 'Requested support ticket #1234',
      time: '2 hours ago'
    },
    {
      avatar: 'Chris Lee',
      avatarColor: 'from-rose-500 to-red-600',
      text: 'Signed up for newsletter',
      time: '3 hours ago'
    }
  ];
}

async function fetchTopProducts() {
  await setTimeout(2500);
  return [
    { name: 'Pro Subscription', sales: 1234, revenue: '$368,766', progress: 85 },
    { name: 'Team Plan', sales: 856, revenue: '$512,844', progress: 72 },
    { name: 'Enterprise License', sales: 423, revenue: '$549,477', progress: 58 },
    { name: 'Starter Pack', sales: 2341, revenue: '$114,709', progress: 45 }
  ];
}

async function fetchServerMetrics() {
  await setTimeout(3000);
  return {
    cpu: 67,
    memory: 82,
    disk: 45,
    network: 23
  };
}

// Individual async stat components - each loads independently
async function RevenueStat() {
  const stat = await fetchRevenueStat();
  return <StatCard {...stat} />;
}

async function UsersStat() {
  const stat = await fetchUsersStat();
  return <StatCard {...stat} />;
}

async function ConversionStat() {
  const stat = await fetchConversionStat();
  return <StatCard {...stat} />;
}

async function OrderValueStat() {
  const stat = await fetchOrderValueStat();
  return <StatCard {...stat} />;
}

async function RecentOrdersSection() {
  const orders = await fetchRecentOrders();
  const statusBadge = {
    completed: 'success' as const,
    processing: 'info' as const,
    pending: 'warning' as const
  };

  return (
    <Card
      title="Recent Orders"
      subtitle="Latest transactions"
      icon="📦"
      iconBg="from-blue-500 to-cyan-600"
    >
      <Table headers={['Order ID', 'Customer', 'Product', 'Amount', 'Status']}>
        {orders.map((order) => (
          <tr class="hover:bg-slate-700/30 transition-colors">
            <td class="px-4 py-3 text-sm font-mono text-slate-300">{order.id}</td>
            <td class="px-4 py-3 text-sm text-white">{order.customer}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{order.product}</td>
            <td class="px-4 py-3 text-sm font-semibold text-white">{order.amount}</td>
            <td class="px-4 py-3">
              <Badge variant={statusBadge[order.status as keyof typeof statusBadge]}>
                {order.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

async function ActivitySection() {
  const activities = await fetchActivity();

  return (
    <Card
      title="Recent Activity"
      subtitle="User actions"
      icon="⚡"
      iconBg="from-amber-500 to-orange-600"
    >
      <div class="space-y-1">
        {activities.map((activity) => (
          <ActivityItem {...activity} />
        ))}
      </div>
    </Card>
  );
}

async function TopProductsSection() {
  const products = await fetchTopProducts();

  return (
    <Card
      title="Top Products"
      subtitle="Best sellers"
      icon="🏆"
      iconBg="from-purple-500 to-pink-600"
    >
      <div class="space-y-4">
        {products.map((product) => (
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-white">{product.name}</span>
              <span class="text-sm text-slate-400">{product.sales} sales</span>
            </div>
            <Progress value={product.progress} color="from-purple-500 to-pink-500" />
            <div class="text-xs text-slate-500 mt-1">{product.revenue} revenue</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function ServerMetricsSection() {
  const metrics = await fetchServerMetrics();

  const metricItems = [
    { label: 'CPU Usage', value: metrics.cpu, color: 'from-blue-500 to-cyan-500' },
    { label: 'Memory', value: metrics.memory, color: 'from-purple-500 to-pink-500' },
    { label: 'Disk Space', value: metrics.disk, color: 'from-emerald-500 to-teal-500' },
    { label: 'Network', value: metrics.network, color: 'from-orange-500 to-amber-500' }
  ];

  return (
    <Card
      title="Server Metrics"
      subtitle="Real-time status"
      icon="🖥️"
      iconBg="from-emerald-500 to-teal-600"
    >
      <div class="space-y-4">
        {metricItems.map((metric) => (
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-white">{metric.label}</span>
              <span class="text-sm font-semibold text-white">{metric.value}%</span>
            </div>
            <Progress value={metric.value} color={metric.color} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// Main Dashboard component
export function Dashboard(rid: number | string) {
  return (
    <Layout title="Dashboard - KitaJS Streaming Demo">
      <div class="space-y-8">
        {/* Stats Section - each card loads independently */}
        <section>
          <SectionTitle
            title="Overview"
            subtitle="Key metrics loading with streaming - watch them appear one by one!"
          />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Suspense rid={rid} fallback={<StatSkeleton />}>
              <RevenueStat />
            </Suspense>
            <Suspense rid={rid} fallback={<StatSkeleton />}>
              <UsersStat />
            </Suspense>
            <Suspense rid={rid} fallback={<StatSkeleton />}>
              <ConversionStat />
            </Suspense>
            <Suspense rid={rid} fallback={<StatSkeleton />}>
              <OrderValueStat />
            </Suspense>
          </div>
        </section>

        {/* Two column layout for orders and activity */}
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders - loads second (1500ms) */}
          <div class="lg:col-span-2">
            <Suspense
              rid={rid}
              fallback={
                <Card
                  title="Recent Orders"
                  subtitle="Loading..."
                  icon="📦"
                  iconBg="from-blue-500 to-cyan-600"
                >
                  <TableSkeleton rows={5} cols={5} />
                </Card>
              }
            >
              <RecentOrdersSection />
            </Suspense>
          </div>

          {/* Activity Feed - loads third (2000ms) */}
          <div>
            <Suspense
              rid={rid}
              fallback={
                <Card
                  title="Recent Activity"
                  subtitle="Loading..."
                  icon="⚡"
                  iconBg="from-amber-500 to-orange-600"
                >
                  <ActivitySkeleton items={5} />
                </Card>
              }
            >
              <ActivitySection />
            </Suspense>
          </div>
        </section>

        {/* Bottom row - Products and Metrics */}
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products - loads fourth (2500ms) */}
          <Suspense
            rid={rid}
            fallback={
              <Card
                title="Top Products"
                subtitle="Loading..."
                icon="🏆"
                iconBg="from-purple-500 to-pink-600"
              >
                <div class="animate-pulse space-y-4">
                  {Array.from({ length: 4 }).map(() => (
                    <div>
                      <div class="flex justify-between mb-2">
                        <div class="h-4 bg-slate-700 rounded w-1/3" />
                        <div class="h-4 bg-slate-700 rounded w-16" />
                      </div>
                      <div class="h-2 bg-slate-700 rounded-full" />
                      <div class="h-3 bg-slate-700/50 rounded w-20 mt-1" />
                    </div>
                  ))}
                </div>
              </Card>
            }
          >
            <TopProductsSection />
          </Suspense>

          {/* Server Metrics - loads last (3000ms) */}
          <Suspense
            rid={rid}
            fallback={
              <Card
                title="Server Metrics"
                subtitle="Loading..."
                icon="🖥️"
                iconBg="from-emerald-500 to-teal-600"
              >
                <div class="animate-pulse space-y-4">
                  {Array.from({ length: 4 }).map(() => (
                    <div>
                      <div class="flex justify-between mb-2">
                        <div class="h-4 bg-slate-700 rounded w-1/4" />
                        <div class="h-4 bg-slate-700 rounded w-12" />
                      </div>
                      <div class="h-2 bg-slate-700 rounded-full" />
                    </div>
                  ))}
                </div>
              </Card>
            }
          >
            <ServerMetricsSection />
          </Suspense>
        </section>

        {/* Info banner */}
        <section class="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
              💡
            </div>
            <div>
              <h3 class="font-semibold text-white mb-1">How Streaming Works</h3>
              <p class="text-sm text-slate-400 leading-relaxed">
                This demo shows two streaming patterns using{' '}
                <code class="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                  {'<Suspense>'}
                </code>
                : The <strong class="text-white">Overview stats</strong> load individually
                (one Suspense per card) so you can see them appear one by one. The other
                sections use <strong class="text-white">grouped loading</strong> (one
                Suspense per section) for a cleaner UX. Refresh the page to see the
                streaming effect again!
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
