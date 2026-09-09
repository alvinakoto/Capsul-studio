import React from 'react'
import { Document } from '@react-pdf/renderer'
import { FicheData } from './types'
import PageCouverture from './components/PageCouverture'
import PageVille from './components/PageVille'
import PageBien from './components/PageBien'
import PageScenario from './components/PageScenario'
import PageTravaux from './components/PageTravaux'
import PageConclusion from './components/PageConclusion'

interface Props {
  data: FicheData
}

type PageRenderer = (props: { data: FicheData; pageNumber: number }) => React.ReactElement

/**
 * Ordre du dossier : Couverture → Ville → Bien → Scénario → Travaux → Conclusion.
 * Les pages Ville et Travaux ne sont générées que si elles ont du contenu ;
 * Conclusion est toujours présente et clôt le dossier. La numérotation
 * affichée dans les en-têtes suit l'ordre réel.
 */
export default function FicheCommerciale({ data }: Props) {
  const pages: PageRenderer[] = [
    ({ data }) => <PageCouverture data={data} />,
    ...(data.villeInfos
      ? [(({ data, pageNumber }) => <PageVille data={data} pageNumber={pageNumber} />) as PageRenderer]
      : []),
    ({ data, pageNumber }) => <PageBien data={data} pageNumber={pageNumber} />,
    ({ data, pageNumber }) => <PageScenario data={data} pageNumber={pageNumber} />,
    ...(data.travauxPostes.length > 0
      ? [(({ data, pageNumber }) => <PageTravaux data={data} pageNumber={pageNumber} />) as PageRenderer]
      : []),
    ({ data, pageNumber }) => <PageConclusion data={data} pageNumber={pageNumber} />,
  ]

  return (
    <Document
      title={data.project.name}
      author="Capsul France"
      subject="Analyse d'investissement locatif"
      creator="Capsul Studio"
      producer="Capsul Studio"
    >
      {pages.map((render, i) =>
        React.cloneElement(render({ data, pageNumber: i + 1 }), { key: i })
      )}
    </Document>
  )
}
