import type { PropsWithChildren } from '@kitajs/html';
import { setTimeout } from 'node:timers/promises';

// Helper for random delay
const randomDelay = (): Promise<number> => setTimeout(300 + Math.random() * 700);

// Card component
interface CardProps {
  title?: string;
  icon?: string;
}

export function Card({ title, icon, children }: PropsWithChildren<CardProps>) {
  return (
    <div class="bg-stone-900/50 border border-stone-800 rounded-xl p-4 h-full">
      {(title || icon) && (
        <div class="flex items-center gap-2 mb-3">
          {icon && (
            <div
              class="w-8 h-8 bg-gradient-to-br from-kita-500 to-kita-400 rounded-lg flex items-center justify-center text-sm"
              safe
            >
              {icon}
            </div>
          )}
          {title && (
            <h3 class="font-semibold text-stone-100 text-sm" safe>
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Stat card
interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export function StatCard({ label, value, change, positive }: StatCardProps) {
  return (
    <div class="bg-stone-900/50 border border-stone-800 rounded-xl p-4">
      <div class="text-xs text-stone-400 mb-1" safe>
        {label}
      </div>
      <div class="text-2xl font-bold text-stone-100" safe>
        {value}
      </div>
      {change && (
        <div
          class={`text-xs mt-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}
          safe
        >
          {change}
        </div>
      )}
    </div>
  );
}

// Stat skeleton
export function StatSkeleton() {
  return (
    <div class="bg-stone-900/50 border border-stone-800 rounded-xl p-4">
      <div class="h-3 w-16 skeleton rounded mb-2" />
      <div class="h-7 w-20 skeleton rounded mb-1" />
      <div class="h-3 w-12 skeleton rounded" />
    </div>
  );
}

// Async Stat Components - These demonstrate Suspense
export async function VisitorsStat() {
  await randomDelay();
  return <StatCard label="Visitors" value="2,847" change="+12%" positive />;
}

export async function RequestsStat() {
  await randomDelay();
  return <StatCard label="Requests" value="14.2k" change="+28%" positive />;
}

export async function UptimeStat() {
  await randomDelay();
  return <StatCard label="Uptime" value="99.9%" change="Stable" positive />;
}

export async function MemoryStat() {
  await randomDelay();
  const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  return <StatCard label="Memory" value={`${used} MB`} />;
}

// List item
interface ListItemProps {
  primary: string;
  secondary?: string;
  badge?: string;
  badgeColor?: string;
}

export function ListItem({
  primary,
  secondary,
  badge,
  badgeColor = 'bg-kita-500/20 text-kita-300'
}: ListItemProps) {
  return (
    <div class="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
      <div>
        <div class="text-sm text-stone-200" safe>
          {primary}
        </div>
        {secondary && (
          <div class="text-xs text-stone-500" safe>
            {secondary}
          </div>
        )}
      </div>
      {badge && (
        <span class={`px-2 py-0.5 rounded-full text-xs ${badgeColor}`} safe>
          {badge}
        </span>
      )}
    </div>
  );
}

// Button
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children
}: PropsWithChildren<ButtonProps>) {
  const baseClass =
    'rounded-lg font-medium transition-colors inline-flex items-center gap-2';
  const variantClass =
    variant === 'primary'
      ? 'bg-kita-500 hover:bg-kita-600 text-white'
      : 'bg-stone-800 hover:bg-stone-700 text-stone-200';
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  return <button class={`${baseClass} ${variantClass} ${sizeClass}`}>{children}</button>;
}

// Loading spinner
export function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <svg
      class={`animate-spin ${sizeClass} text-kita-400`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Progress bar
interface ProgressProps {
  value: number;
  label: string;
}

export function Progress({ value, label }: ProgressProps) {
  return (
    <div class="mb-2 last:mb-0">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-stone-400" safe>
          {label}
        </span>
        <span class="text-stone-300">{value}%</span>
      </div>
      <div class="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-kita-500 to-kita-400 rounded-full transition-all duration-700 ease-out"
          style={`width: ${value}%`}
        />
      </div>
    </div>
  );
}

// Toast notification
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, type = 'info' }: ToastProps) {
  const colorClass = {
    success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    error: 'bg-red-500/20 border-red-500/50 text-red-300',
    info: 'bg-kita-500/20 border-kita-500/50 text-kita-300'
  }[type];

  return (
    <div class={`px-4 py-2 rounded-lg border text-sm ${colorClass}`} safe>
      {message}
    </div>
  );
}
