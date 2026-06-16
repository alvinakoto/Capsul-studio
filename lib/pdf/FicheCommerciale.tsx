import React from 'react'
import { Document } from '@react-pdf/renderer'
import { FicheData } from './types'
import PageCouverture from './components/PageCouverture'
import PageBien from './components/PageBien'
import PageScenario from './components/PageScenario'
import PageProjection from './components/PageProjection'

interface Props {
  data: FicheData
}

export default function FicheCommerciale({ data }: Props) {
  return (
    <Document
      title={data.project.name}
      author="Capsul France"
      subject="Analyse d'investissement locatif"
      creator="Capsul Studio"
      producer="Capsul Studio"
    >
      <PageCouverture data={data} />
      <PageBien data={data} />
      <PageScenario data={data} />
      <PageProjection data={data} />
    </Document>
  )
}