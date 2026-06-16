import React from 'react'
import { Document } from '@react-pdf/renderer'
import { registerFonts } from '../common/fonts'
import PageSynthese from './PageSynthese'
import PageAmortissement from './PageAmortissement'
import PageProjection from './PageProjection'
import type { RapportData } from '../types'

registerFonts()

export default function RapportAnalytique({ data }: { data: RapportData }) {
  return (
    <Document
      title={`Rapport analytique — ${data.project.name}`}
      author="Capsul France"
    >
      <PageSynthese data={data} />
      <PageAmortissement data={data} />
      <PageProjection data={data} />
    </Document>
  )
}
