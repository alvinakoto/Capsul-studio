'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function euros(n: number) {
  return n?.toLocaleString('fr-FR') + ' €'
}

export default function ProjectionChart({
  conservateur,
  realiste,
  isComptant = false,
}: {
  conservateur: any[]
  realiste: any[]
  isComptant?: boolean
}) {
  const data = conservateur.map((c, i) => ({
    annee: `A${c.annee}`,
    Conservateur: Math.round(c.patrimoineNet),
    Réaliste: Math.round(realiste[i]?.patrimoineNet ?? 0),
  }))

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="font-semibold mb-1">Projection patrimoniale — 20 ans</h2>
      <p className="text-xs text-muted-foreground mb-6">
        {isComptant
          ? 'Achat comptant — patrimoine net = valeur du bien + trésorerie cumulée'
          : 'Patrimoine net après remboursement du crédit'}
      </p>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="annee"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k€`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: any) => [euros(Number(value)), '']}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="Conservateur"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Réaliste"
              stroke="#1e3a5f"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}