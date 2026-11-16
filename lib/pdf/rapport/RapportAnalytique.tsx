import React from 'react'
import { Document } from '@react-pdf/renderer'
import { registerFonts } from '../common/fonts'
import PageSynthese from './PageSynthese'
import PageAmortissement from './PageAmortissement'
import PageProjection from './PageProjection'
import PageLots from '../components/PageLots'
import type { RapportData } from '../types'

registerFonts()

export default function RapportAnalytique({ data }: { data: RapportData }) {
  return (
    <Document
      title={`Rapport analytique · ${data.project.name}`}
      author="Capsul France"
    >
      <PageSynthese data={data} />
      {data.immeuble && (
        <PageLots project={data.project} chargeNom={data.chargeNom} immeuble={data.immeuble} pageNumber={2} contexte="rapport" />
      )}
      <PageAmortissement data={data} pageNumber={data.immeuble ? 3 : 2} />
      <PageProjection data={data} pageNumber={data.immeuble ? 4 : 3} />
    </Document>
  )
}
