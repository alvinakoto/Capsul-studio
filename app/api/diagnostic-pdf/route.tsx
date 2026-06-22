import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { DiagnosticDocument } from '@/lib/pdf/diagnostic/DiagnosticDocument';
import { normalizePayload } from '@/lib/pdf/diagnostic/calculations';
import { DiagnosticPayloadRaw } from '@/lib/pdf/diagnostic/types';

/**
 * Remplace le module PDFMonkey dans le scénario Make.
 *
 * Dans Make : remplace le module "PDFMonkey > Generate Document" par un
 * module HTTP "Make a request" :
 *   - Method: POST
 *   - URL: https://studio.capsul-france.com/api/diagnostic-pdf
 *   - Headers: { "x-api-key": "<secret partagé, à mettre dans les variables
 *     d'environnement Make ET Vercel>", "Content-Type": "application/json" }
 *   - Body: le même mapping de champs que tu envoyais à PDFMonkey
 *   - Parse response: NON (on récupère un PDF binaire, pas du JSON)
 *
 * Cette route est volontairement PUBLIQUE (pas de session Supabase, contrairement
 * au reste de Capsul Studio) puisqu'elle est appelée depuis Make. La clé
 * partagée (`DIAGNOSTIC_PDF_API_KEY`) est ce qui la protège — sans elle,
 * n'importe qui pourrait spammer l'endpoint. Mets une vraie valeur secrète
 * dans .env.local et dans les variables d'environnement Vercel + Make.
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.DIAGNOSTIC_PDF_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let raw: DiagnosticPayloadRaw;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!raw.prenom || !raw.dateRapport) {
    return NextResponse.json({ error: 'Missing required fields (prenom, dateRapport)' }, { status: 400 });
  }

  const payload = normalizePayload(raw);

  try {
    const buffer = await renderToBuffer(<DiagnosticDocument payload={payload} />);

    // Option A (par défaut ici) : renvoyer le PDF directement dans la
    // réponse HTTP. Make peut le transmettre tel quel à HubSpot (en pièce
    // jointe sur le contact) ou le passer à un module suivant.
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slugify(raw.prenom)}-diagnostic-personnalise.pdf"`,
      },
    });

    // Option B : stocker dans Supabase Storage et renvoyer une URL — utile
    // si tu veux un lien cliquable dans l'email plutôt qu'une pièce jointe.
    // Décommente et adapte si tu préfères cette approche :
    //
    // const supabase = createServerSupabaseClient(); // service role
    // const filename = `${crypto.randomUUID()}-${slugify(raw.prenom)}.pdf`;
    // const { error } = await supabase.storage
    //   .from('diagnostic-pdfs')
    //   .upload(filename, buffer, { contentType: 'application/pdf' });
    // if (error) throw error;
    // const { data } = supabase.storage.from('diagnostic-pdfs').getPublicUrl(filename);
    // return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error('[diagnostic-pdf] render error', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}

function slugify(input: string): string {
  return (input || 'prospect')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
