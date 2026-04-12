import type { PropsWithChildren } from '@kitajs/html'

// Card component
interface CardProps {
  title?: string
  icon?: string
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
  )
}

// Card skeleton
export function CardSkeleton({ height = 'h-32' }: { height?: string }) {
  return (
    <div class={`bg-stone-900/50 border border-stone-800 rounded-xl p-4 ${height}`}>
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 skeleton rounded-lg" />
        <div class="h-4 w-20 skeleton rounded" />
      </div>
      <div class="space-y-2">
        <div class="h-3 skeleton rounded w-full" />
        <div class="h-3 skeleton rounded w-3/4" />
      </div>
    </div>
  )
}

// Stat card
interface StatCardProps {
  label: string
  value: string
  change?: string
  positive?: boolean
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
  )
}

// Stat skeleton
export function StatSkeleton() {
  return (
    <div class="bg-stone-900/50 border border-stone-800 rounded-xl p-4">
      <div class="h-3 w-16 skeleton rounded mb-2" />
      <div class="h-7 w-20 skeleton rounded mb-1" />
      <div class="h-3 w-12 skeleton rounded" />
    </div>
  )
}

// List item
interface ListItemProps {
  primary: string
  secondary?: string
  badge?: string
  badgeColor?: string
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
  )
}

// List skeleton
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div class="space-y-1">
      {Array.from({ length: items }).map(() => (
        <div class="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
          <div class="space-y-1">
            <div class="h-4 w-32 skeleton rounded" />
            <div class="h-3 w-20 skeleton rounded" />
          </div>
          <div class="h-5 w-16 skeleton rounded-full" />
        </div>
      ))}
    </div>
  )
}

// Progress bar
interface ProgressProps {
  value: number
  label: string
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
  )
}

// Progress skeleton
export function ProgressSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div class="space-y-3">
      {Array.from({ length: items }).map(() => (
        <div>
          <div class="flex justify-between mb-1">
            <div class="h-3 w-16 skeleton rounded" />
            <div class="h-3 w-8 skeleton rounded" />
          </div>
          <div class="h-1.5 skeleton rounded-full" />
        </div>
      ))}
    </div>
  )
}
