import { createClient } from '@supabase/supabase-js';
import { EcartClass, MarketData } from './types';
import { trouverDiagnostic } from '@/lib/data/villesDiagnostic';
import { fmtInt } from './format';

/**
 * Données de marché par ville pour le PDF diagnostic.
 *
 * Deux sources, chacune unique pour ce qu'elle porte :
 *   - les textes (emoji, tension, stratégie, rendement net) : lib/data/villesDiagnostic.ts ;
 *   - les chiffres (prix au m², rendement brut) : le catalogue `villes` en base,
 *     le même que la fiche commerciale.
 * Une ville n'est « connue » ici que si elle a des textes de diagnostic ; sinon on
 * retombe sur les moyennes nationales, comme avant. Le matching reste par
 * sous-chaîne, insensible à la casse (Liquid `contains`).
 */
const FALLBACK = { marcheRdtBrut: 5.8, marcheRdtNet: 4.3 };

/** Chiffres de marché d'une ville du catalogue (colonnes lisibles sans session). */
export interface MarcheVille {
  nom: string;
  prixM2Min: number | null;
  prixM2Max: number | null;
  rendementMoyenPct: number | null;
}

function formatPrixRange(min: number | null, max: number | null): string {
  if (min === null || max === null) return '—';
  return `${fmtInt(min)} – ${fmtInt(max)} €/m2`;
}

/** Assemble les données de marché à partir des textes du diagnostic et des chiffres du catalogue. */
export function getMarketData(villeProjet: string, marche: MarcheVille | null): MarketData {
  const entree = trouverDiagnostic(villeProjet);
  if (!entree || !marche) return { villeConnue: false, ...FALLBACK };

  const { diagnostic } = entree;
  return {
    villeConnue: true,
    villeNom: marche.nom,
    villeEmoji: diagnostic.emoji,
    villeDesc: diagnostic.desc,
    villeTension: diagnostic.tension,
    villeTensionDesc: diagnostic.tensionDesc,
    villePrixRange: formatPrixRange(marche.prixM2Min, marche.prixM2Max),
    villeStrategie: diagnostic.strategie,
    villeStrategieDesc: diagnostic.strategieDesc,
    marcheRdtBrut: marche.rendementMoyenPct ?? FALLBACK.marcheRdtBrut,
    marcheRdtNet: diagnostic.rendementNetPct,
  };
}

/**
 * Lit les chiffres de marché de la ville dans le catalogue. La route du diagnostic
 * est publique (appelée par Make, sans session) : lecture avec la clé anonyme, qui
 * n'a accès qu'à ces 5 colonnes (cf. migration create_villes_catalog). En cas
 * d'échec, le PDF retombe sur les moyennes nationales plutôt que d'échouer.
 */
export async function chargerMarketData(villeProjet: string): Promise<MarketData> {
  const entree = trouverDiagnostic(villeProjet);
  if (!entree) return getMarketData(villeProjet, null);

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from('villes')
      .select('nom, prix_m2_min, prix_m2_max, rendement_moyen_pct')
      .eq('slug', entree.slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return getMarketData(villeProjet, null);

    const n = (v: number | string | null) => (v === null ? null : Number(v));
    return getMarketData(villeProjet, {
      nom: data.nom,
      prixM2Min: n(data.prix_m2_min),
      prixM2Max: n(data.prix_m2_max),
      rendementMoyenPct: n(data.rendement_moyen_pct),
    });
  } catch (err) {
    console.error('[diagnostic-pdf] lecture du catalogue villes impossible', err);
    return getMarketData(villeProjet, null);
  }
}

/** Classification d'écart, identique au Liquid : seuil de 0.3 point. */
export function classifyEcart(valeur: number, marche: number): {
  classe: EcartClass;
  label: string;
} {
  const ecart = valeur - marche;
  if (ecart > 0.3) return { classe: 'superieur', label: 'Au-dessus' };
  if (ecart < -0.3) return { classe: 'inferieur', label: 'En dessous' };
  return { classe: 'egal', label: 'Dans la moyenne' };
}

export function classifyTaux(tauxInteret: number): {
  classe: EcartClass;
  label: string;
} {
  if (tauxInteret <= 3.8) return { classe: 'superieur', label: 'Bon taux' };
  if (tauxInteret <= 4.5) return { classe: 'egal', label: 'Taux correct' };
  return { classe: 'inferieur', label: 'Taux élevé' };
}
