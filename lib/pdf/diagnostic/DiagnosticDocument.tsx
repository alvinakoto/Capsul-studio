import React from 'react';
import { Document } from '@react-pdf/renderer';
import { DiagnosticPayload } from './types';
import { PageCouverture } from './pages/PageCouverture';
import { PageSynthese } from './pages/PageSynthese';
import { PageFinancement } from './pages/PageFinancement';
import { PageCashflow } from './pages/PageCashflow';
import { PageProjection } from './pages/PageProjection';
import { PageLeviers } from './pages/PageLeviers';
import { PageMarche } from './pages/PageMarche';
import { PageApropos } from './pages/PageApropos';
import { registerFonts } from '@/lib/pdf/common/fonts';

registerFonts();

export function DiagnosticDocument({ payload }: { payload: DiagnosticPayload }) {
  return (
    <Document title={`Diagnostic Capsul — ${payload.prenom}`}>
      <PageCouverture p={payload} />
      <PageSynthese p={payload} />
      <PageFinancement p={payload} />
      <PageCashflow p={payload} />
      <PageProjection p={payload} />
      <PageLeviers p={payload} />
      <PageMarche p={payload} />
      <PageApropos p={payload} />
    </Document>
  );
}
