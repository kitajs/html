import type { PropsWithChildren } from '@kitajs/html';

// Card component
interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
}

export function Card({
  title,
  subtitle,
  icon,
  iconBg = 'from-indigo-500 to-purple-600',
  children
}: PropsWithChildren<CardProps>) {
  return (
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-0.5">
      {(title || icon) && (
        <div class="flex items-center gap-3 mb-4">
          {icon && (
            <div
              class={`w-10 h-10 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center text-lg shadow-lg`}
            >
              {icon}
            </div>
          )}
          {title && (
            <div>
              <h3 class="font-semibold text-white">{title}</h3>
              {subtitle && <p class="text-sm text-slate-400">{subtitle}</p>}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Loading skeleton for cards
export function CardSkeleton() {
  return (
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-slate-700 rounded-xl" />
        <div class="space-y-2">
          <div class="h-4 w-24 bg-slate-700 rounded" />
          <div class="h-3 w-16 bg-slate-700/50 rounded" />
        </div>
      </div>
      <div class="space-y-3">
        <div class="h-3 bg-slate-700 rounded w-full" />
        <div class="h-3 bg-slate-700 rounded w-4/5" />
        <div class="h-3 bg-slate-700 rounded w-3/5" />
      </div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconBg = 'from-indigo-500 to-purple-600'
}: StatCardProps) {
  const changeColors = {
    positive: 'bg-emerald-500/20 text-emerald-400',
    negative: 'bg-red-500/20 text-red-400',
    neutral: 'bg-slate-500/20 text-slate-400'
  };

  return (
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        {icon && (
          <div
            class={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center text-xl shadow-lg`}
          >
            {icon}
          </div>
        )}
        {change && (
          <span
            class={`px-2.5 py-1 rounded-full text-xs font-medium ${changeColors[changeType]}`}
          >
            {change}
          </span>
        )}
      </div>
      <div class="text-3xl font-bold text-white mb-1">{value}</div>
      <div class="text-sm text-slate-400">{label}</div>
    </div>
  );
}

// Stat skeleton
export function StatSkeleton() {
  return (
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse">
      <div class="flex items-center justify-between mb-4">
        <div class="w-12 h-12 bg-slate-700 rounded-xl" />
        <div class="w-16 h-6 bg-slate-700 rounded-full" />
      </div>
      <div class="h-8 w-20 bg-slate-700 rounded mb-2" />
      <div class="h-4 w-24 bg-slate-700/50 rounded" />
    </div>
  );
}

// Table component
interface TableProps {
  headers: string[];
}

export function Table({ headers, children }: PropsWithChildren<TableProps>) {
  return (
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-700/50">
            {headers.map((header) => (
              <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700/30">{children}</tbody>
      </table>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div class="animate-pulse">
      <div class="border-b border-slate-700/50 py-3 flex gap-4">
        {Array.from({ length: cols }).map(() => (
          <div class="h-3 bg-slate-700 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map(() => (
        <div class="border-b border-slate-700/30 py-4 flex gap-4">
          {Array.from({ length: cols }).map(() => (
            <div class="h-4 bg-slate-700/50 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Badge component
interface BadgeProps {
  variant?: 'success' | 'warning' | 'info' | 'error';
}

export function Badge({ variant = 'info', children }: PropsWithChildren<BadgeProps>) {
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    info: 'bg-blue-500/20 text-blue-400',
    error: 'bg-red-500/20 text-red-400'
  };

  return (
    <span class={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Avatar component
interface AvatarProps {
  name: string;
  color?: string;
}

export function Avatar({ name, color = 'from-indigo-500 to-purple-600' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      class={`w-8 h-8 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-xs font-semibold text-white`}
    >
      {initials}
    </div>
  );
}

// Progress bar
interface ProgressProps {
  value: number;
  color?: string;
}

export function Progress({
  value,
  color = 'from-indigo-500 to-purple-600'
}: ProgressProps) {
  return (
    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        class={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
        style={`width: ${Math.min(100, Math.max(0, value))}%`}
      />
    </div>
  );
}

// Activity item
interface ActivityItemProps {
  avatar: string;
  avatarColor?: string;
  text: string;
  time: string;
}

export function ActivityItem({ avatar, avatarColor, text, time }: ActivityItemProps) {
  return (
    <div class="flex items-start gap-3 py-3 border-b border-slate-700/30 last:border-0">
      <Avatar name={avatar} color={avatarColor} />
      <div class="flex-1 min-w-0">
        <p class="text-sm text-slate-200">{text}</p>
        <p class="text-xs text-slate-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// Activity skeleton
export function ActivitySkeleton({ items = 4 }: { items?: number }) {
  return (
    <div class="animate-pulse space-y-1">
      {Array.from({ length: items }).map(() => (
        <div class="flex items-start gap-3 py-3 border-b border-slate-700/30 last:border-0">
          <div class="w-8 h-8 bg-slate-700 rounded-full" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-700 rounded w-3/4" />
            <div class="h-3 bg-slate-700/50 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Section title
interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div class="mb-6">
      <h2 class="text-xl font-bold text-white">{title}</h2>
      {subtitle && <p class="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
