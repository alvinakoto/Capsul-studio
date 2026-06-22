import React from 'react';
import { Svg, Defs, LinearGradient, Stop, Rect } from '@react-pdf/renderer';

export const COLORS = {
  bleuFonce: '#16314E',
  bleuVif: '#2563EB',
  accent: '#e6b64c',
  vert: '#4ADE80',
  rouge: '#F87171',
  blanc: '#FFFFFF',
  blanc60: 'rgba(255,255,255,0.6)',
  blanc15: 'rgba(255,255,255,0.15)',
  blanc10: 'rgba(255,255,255,0.10)',
  blanc65: 'rgba(255,255,255,0.65)',
  blanc55: 'rgba(255,255,255,0.55)',
  blanc85: 'rgba(255,255,255,0.85)',
  // Équivalents solides pour les BORDERS uniquement : react-pdf/poppler
  // rendent mal les couleurs de bordure avec alpha (testé : ça sort en
  // vert vif au lieu du blanc translucide attendu). Les BACKGROUNDS en
  // rgba restent OK, seul borderColor doit utiliser ces valeurs solides.
  blanc15Border: '#395068', // blanc15 mélangé sur bleuFonce
  accentBorder: '#645737', // accent à 35% mélangé sur bleuFonce
};

/** Couleurs par niveau de verdict — reprend les classes CSS .positif / .neutre / etc. */
export const VERDICT_COLORS: Record<
  string,
  { bg: string; text: string; border: string; value: string }
> = {
  positif: { bg: '#F0FDF4', text: '#166534', border: '#22C55E', value: '#16A34A' },
  neutre: { bg: '#FFFBEB', text: '#92400E', border: '#EAB308', value: '#D97706' },
  negatif_modere: { bg: '#FFF7ED', text: '#9A3412', border: '#F97316', value: '#EA580C' },
  negatif_fort: { bg: '#FEF2F2', text: '#991B1B', border: '#EF4444', value: '#DC2626' },
};

export const VERDICT_ICON: Record<string, string> = {
  // Volontairement vide : les anciens glyphes (✓ ~ ! !!) sont des dingbats
  // qui ne s'affichent pas de façon fiable avec les polices PDF standard.
  // La bordure colorée + le texte suffisent à distinguer le niveau.
};

export const ECART_COLORS: Record<string, { bg: string; text: string }> = {
  superieur: { bg: '#DCFCE7', text: '#15803D' },
  egal: { bg: '#f6f4f1', text: '#7a7872' },
  inferieur: { bg: '#FEE2E2', text: '#B91C1C' },
};

/**
 * Remplace les `background: linear-gradient(...)` du CSS d'origine.
 * À placer en 1er enfant d'un container `position: relative`, avec le
 * reste du contenu après (rendu par-dessus, comme en CSS/HTML).
 */
export function GradientRect({
  from,
  to,
  angle = 90,
  width,
  height,
  borderRadius = 0,
}: {
  from: string;
  to: string;
  angle?: number;
  width: number;
  height: number;
  borderRadius?: number;
}) {
  const id = `grad-${from.replace('#', '')}-${to.replace('#', '')}`;
  // Approximation simple : dégradé horizontal (x1,y1)->(x2,y2) selon l'angle.
  const rad = (angle * Math.PI) / 180;
  const x2 = 50 + 50 * Math.cos(rad);
  const y2 = 50 - 50 * Math.sin(rad);
  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Defs>
        <LinearGradient id={id} x1="0%" y1="100%" x2={`${x2}%`} y2={`${y2}%`}>
          <Stop offset="0%" stopColor={from} />
          <Stop offset="100%" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} rx={borderRadius} />
    </Svg>
  );
}
