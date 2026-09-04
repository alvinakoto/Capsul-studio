import React from 'react'
import { ICONS, type IconName } from '@/lib/data/icons'

interface Props {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

/**
 * Icône lucide rendue en <svg> DOM à partir des tracés partagés (lib/data/icons.ts).
 * Couleur via `currentColor` → pilotée par le `color` CSS du parent.
 */
export function IconNode({ name, size = 16, strokeWidth = 2, className }: Props) {
  const node = ICONS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  )
}
