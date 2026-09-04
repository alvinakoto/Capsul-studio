import React from 'react'
import { Svg, Path, Rect, Circle, Line, Polyline, Polygon, Ellipse } from '@react-pdf/renderer'
import { ICONS, type IconName, type IconNode } from '../../data/icons'

interface Props {
  name: IconName
  size?: number
  color: string
  strokeWidth?: number
}

/**
 * Rend une icône lucide (tracés dans lib/data/icons.ts) en primitives react-pdf.
 * Icône au trait, sans remplissage — même glyphe que components/ui/IconNode.tsx.
 */
export function LucideIcon({ name, size = 16, color, strokeWidth = 2 }: Props) {
  const node: IconNode = ICONS[name]
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {node.map(([tag, attrs], i) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const a = attrs as any
        switch (tag) {
          case 'path':     return <Path     key={i} d={a.d} {...stroke} />
          case 'rect':     return <Rect     key={i} x={a.x} y={a.y} width={a.width} height={a.height} rx={a.rx} ry={a.ry ?? a.rx} {...stroke} />
          case 'circle':   return <Circle   key={i} cx={a.cx} cy={a.cy} r={a.r} {...stroke} />
          case 'line':     return <Line     key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} {...stroke} />
          case 'polyline': return <Polyline key={i} points={a.points} {...stroke} />
          case 'polygon':  return <Polygon  key={i} points={a.points} {...stroke} />
          case 'ellipse':  return <Ellipse  key={i} cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} {...stroke} />
          default:         return null
        }
      })}
    </Svg>
  )
}
