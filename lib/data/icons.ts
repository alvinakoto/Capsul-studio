// ============================================================
// CAPSUL STUDIO — Icônes vectorielles partagées (wizard + PDF)
// ============================================================
// Tracés extraits de lucide v1.17.0 (licence ISC — https://lucide.dev).
// Chaque icône est une liste de primitives SVG sur un viewBox 0 0 24 24,
// dessinées au trait (stroke 2, extrémités et jonctions arrondies).
//
// Rendu :
//   - components/ui/IconNode.tsx        → <svg> DOM (wizard)
//   - lib/pdf/common/LucideIcon.tsx     → <Svg> react-pdf (fiche commerciale)
// → même glyphe à l'écran et dans le PDF, sans dépendre de la structure
//   interne du paquet lucide-react.

export type IconTag = 'path' | 'rect' | 'circle' | 'line' | 'polyline' | 'polygon' | 'ellipse'
export type IconNode = ReadonlyArray<readonly [IconTag, Readonly<Record<string, string>>]>

export const ICONS = {
  // ─── Postes de travaux ────────────────────────────────────────────────────
  layers: [
    ['path', { d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z' }],
    ['path', { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12' }],
    ['path', { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17' }],
  ],
  appWindow: [
    ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
    ['path', { d: 'M10 4v4' }],
    ['path', { d: 'M2 8h20' }],
    ['path', { d: 'M6 4v4' }],
  ],
  zap: [
    ['path', { d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' }],
  ],
  droplets: [
    ['path', { d: 'M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z' }],
    ['path', { d: 'M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97' }],
  ],
  bath: [
    ['path', { d: 'M10 4 8 6' }],
    ['path', { d: 'M17 19v2' }],
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M7 19v2' }],
    ['path', { d: 'M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5' }],
  ],
  cookingPot: [
    ['path', { d: 'M2 12h20' }],
    ['path', { d: 'M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8' }],
    ['path', { d: 'm4 8 16-4' }],
    ['path', { d: 'm8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8' }],
  ],
  grid2x2: [
    ['path', { d: 'M12 3v18' }],
    ['path', { d: 'M3 12h18' }],
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
  ],
  paintRoller: [
    ['rect', { width: '16', height: '6', x: '2', y: '2', rx: '2' }],
    ['path', { d: 'M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' }],
    ['rect', { width: '4', height: '6', x: '8', y: '16', rx: '1' }],
  ],
  heater: [
    ['path', { d: 'M11 8c2-3-2-3 0-6' }],
    ['path', { d: 'M15.5 8c2-3-2-3 0-6' }],
    ['path', { d: 'M6 10h.01' }],
    ['path', { d: 'M6 14h.01' }],
    ['path', { d: 'M10 16v-4' }],
    ['path', { d: 'M14 16v-4' }],
    ['path', { d: 'M18 16v-4' }],
    ['path', { d: 'M20 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3' }],
    ['path', { d: 'M5 20v2' }],
    ['path', { d: 'M19 20v2' }],
  ],
  brickWall: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    ['path', { d: 'M12 9v6' }],
    ['path', { d: 'M16 15v6' }],
    ['path', { d: 'M16 3v6' }],
    ['path', { d: 'M3 15h18' }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 15v6' }],
    ['path', { d: 'M8 3v6' }],
  ],
  bedDouble: [
    ['path', { d: 'M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8' }],
    ['path', { d: 'M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4' }],
    ['path', { d: 'M12 4v6' }],
    ['path', { d: 'M2 18h20' }],
  ],
  sofa: [
    ['path', { d: 'M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3' }],
    ['path', { d: 'M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z' }],
    ['path', { d: 'M4 18v2' }],
    ['path', { d: 'M20 18v2' }],
    ['path', { d: 'M12 4v9' }],
  ],
  house: [
    ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
    ['path', { d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
  ],

  // ─── Chiffres clés ville ──────────────────────────────────────────────────
  users: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['path', { d: 'M16 3.128a4 4 0 0 1 0 7.744' }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
  ],
  graduationCap: [
    ['path', { d: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z' }],
    ['path', { d: 'M22 10v6' }],
    ['path', { d: 'M6 12.5V16a6 3 0 0 0 12 0v-3.5' }],
  ],
  trainFront: [
    ['path', { d: 'M8 3.1V7a4 4 0 0 0 8 0V3.1' }],
    ['path', { d: 'm9 15-1-1' }],
    ['path', { d: 'm15 15 1-1' }],
    ['path', { d: 'M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z' }],
    ['path', { d: 'm8 19-2 3' }],
    ['path', { d: 'm16 19 2 3' }],
  ],
  building2: [
    ['path', { d: 'M10 12h4' }],
    ['path', { d: 'M10 8h4' }],
    ['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
    ['path', { d: 'M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2' }],
    ['path', { d: 'M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16' }],
  ],
} as const satisfies Record<string, IconNode>

export type IconName = keyof typeof ICONS
