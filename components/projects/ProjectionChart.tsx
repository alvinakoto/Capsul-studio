'use client'

import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList,
} from 'recharts'
import { euros } from '@/lib/utils/format'

const GOLD = '#C9943A'
const NAVY = '#0E2240'
const MIST = '#6E6E73'

export default function ProjectionChart({
  conservateur,
  realiste,
  isComptant = false,
}: {
  conservateur: any[]
  realiste: any[]
  isComptant?: boolean
}) {
  const data = conservateur.map((c, i) => {
    const prudent = Math.round(c.patrimoineNet)
    const reel = Math.round(realiste[i]?.patrimoineNet ?? 0)
    return { annee: c.annee, Prudent: prudent, Réaliste: reel, fourchette: [prudent, reel] }
  })

  // Graduations rondes (pas de 50 k€ ou 100 k€) plutôt que celles calculées par recharts
  const max = Math.max(0, ...data.map((d) => Math.max(d.Prudent, d.Réaliste)))
  const pas = max > 400000 ? 100000 : 50000
  const ticks = Array.from({ length: Math.ceil(max / pas) + 1 }, (_, i) => i * pas)

  const a10 = data.find((d) => d.annee === 10)
  const dernier = data[data.length - 1]
  const derniereAnnee = dernier?.annee ?? 20

  return (
    <div className="cs-card p-[22px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="cs-h3">Projection patrimoniale sur {derniereAnnee} ans</h3>
          <p className="cs-sub mt-0.5">
            {isComptant
              ? 'Achat comptant : patrimoine net = valeur du bien + trésorerie cumulée.'
              : 'Patrimoine net après remboursement du crédit, scénario principal.'}
          </p>
        </div>
        <div className="flex gap-7 flex-wrap tabular-nums">
          {a10 && <ProjKpi label="À 10 ans" value={euros(a10.Réaliste)} />}
          {dernier && <ProjKpi label={`À ${derniereAnnee} ans, réaliste`} value={euros(dernier.Réaliste)} gold />}
          {dernier && <ProjKpi label={`À ${derniereAnnee} ans, prudent`} value={euros(dernier.Prudent)} />}
        </div>
      </div>

      <div className="mt-5" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <ComposedChart data={data} margin={{ top: 12, right: 96, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#EFEBE4" />
            <XAxis
              dataKey="annee"
              ticks={[1, 5, 10, 15, 20].filter((a) => a <= derniereAnnee)}
              tickFormatter={(a: number) => `An ${a}`}
              tick={{ fontSize: 11, fill: MIST }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, ticks[ticks.length - 1]]}
              ticks={ticks}
              tickFormatter={(v: number) => `${Math.round(v / 1000).toLocaleString('fr-FR')} k€`}
              tick={{ fontSize: 11, fill: MIST }}
              width={64}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: any, name: any) => [euros(Number(value)), name]}
              labelFormatter={(a: any) => `Année ${a}`}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E4DFD5', boxShadow: '0 8px 24px rgba(14,34,64,.12)' }}
            />
            <Area dataKey="fourchette" tooltipType="none" stroke="none" fill={GOLD} fillOpacity={0.12} isAnimationActive={false} activeDot={false} />
            <Line
              type="monotone" dataKey="Prudent" stroke={NAVY} strokeWidth={2} strokeDasharray="6 5"
              dot={false} activeDot={{ r: 4 }} isAnimationActive={false}
            >
              <LabelList dataKey="Prudent" content={(p: any) => <EndLabel {...p} total={data.length} color={NAVY} />} />
            </Line>
            <Line
              type="monotone" dataKey="Réaliste" stroke={GOLD} strokeWidth={2.75}
              dot={false} activeDot={{ r: 4.5 }} isAnimationActive={false}
            >
              <LabelList dataKey="Réaliste" content={(p: any) => <EndLabel {...p} total={data.length} color="#946A22" />} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-5 flex-wrap mt-2 text-[12px]" style={{ color: MIST }}>
        <span className="inline-flex items-center gap-2">
          <svg width="22" height="8" aria-hidden="true"><line x1="0" y1="4" x2="22" y2="4" stroke={GOLD} strokeWidth="2.5" /></svg>
          Réaliste (revalorisation 2 % / an)
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="22" height="8" aria-hidden="true"><line x1="0" y1="4" x2="22" y2="4" stroke={NAVY} strokeWidth="2" strokeDasharray="5 4" /></svg>
          Prudent (sans revalorisation)
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="14" height="10" aria-hidden="true"><rect width="14" height="10" rx="2" fill={GOLD} fillOpacity=".14" /></svg>
          Fourchette
        </span>
      </div>
    </div>
  )
}

function ProjKpi({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <p className="cs-label">{label}</p>
      <p className="mt-0.5 text-[20px] font-bold" style={{ color: gold ? 'var(--cs-gold-ink)' : 'var(--cs-navy)' }}>{value}</p>
    </div>
  )
}

/** Étiquette de valeur posée au bout de la courbe (dernier point uniquement). */
function EndLabel({ x, y, index, value, total, color }: any) {
  if (index !== total - 1) return null
  return (
    <g>
      <circle cx={x} cy={y} r={4.5} fill={color} stroke="#fff" strokeWidth={2} />
      <text x={x + 12} y={y + 4} fontSize={12} fontWeight={700} fill={color}>{euros(value)}</text>
    </g>
  )
}
