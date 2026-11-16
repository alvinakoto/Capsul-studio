'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PlusIcon, XIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ImageVilleSlot, { etatImageInitial, imageAffichee, imageModifiee, type EtatImage } from './ImageVilleSlot'
import {
  LIMITES_VILLE, erreursVilleForm, lignesRenseignees, longueurListe, villeVersForm,
  type ChampVille, type Ville, type VilleForm, type VilleInfosForm,
} from '@/lib/data/villes'
import { creerVille, envoyerImageVille, modifierVille, retirerImageVille } from '@/lib/supabase/villes'
import { ratioBandeauVille } from '@/lib/pdf/common/mesuresVille'

// Fiche d'une ville du catalogue : écran Villes (variante « page ») et ajout
// depuis le wizard (variante « fenetre »). Tout s'enregistre d'un coup, champs et
// images, avec le bouton du bas, toujours visible.

interface Props {
  ville: Ville | null
  variante: 'page' | 'fenetre'
  /** Tout est enregistré (champs et images). */
  onEnregistree: (ville: Ville) => void
  /** La ville vient d'être créée en base, avant l'envoi des images. */
  onCreee?: (ville: Ville) => void
  onAnnuler?: () => void
}

const idChamp = (champ: ChampVille) => `ville-${champ}`

const LIBELLES: Record<ChampVille, string> = {
  nom: 'Nom de la ville',
  surnom: 'Accroche',
  habitants: 'Habitants',
  etudiants: 'Étudiants',
  acces: 'Accès',
  atout: 'Atout',
  prixM2Min: 'Prix au m², bas de fourchette',
  prixM2Max: 'Prix au m², haut de fourchette',
  rendementMoyenPct: 'Rentabilité moyenne',
  aireAttraction: 'Aire d’attraction',
  croissanceDemographiquePct: 'Croissance démographique',
  quartiers: 'Quartiers à cibler',
  projetsAVenir: 'Projets à venir',
}

export default function FormulaireVille({ ville, variante, onEnregistree, onCreee, onAnnuler }: Props) {
  const [villeCourante, setVilleCourante] = useState<Ville | null>(ville)
  const [form, setForm] = useState<VilleForm>(() => villeVersForm(ville))
  const [reference, setReference] = useState(() => JSON.stringify(villeVersForm(ville)))
  const [photo, setPhoto] = useState<EtatImage>(() => etatImageInitial(ville?.photo ?? null))
  const [carte, setCarte] = useState<EtatImage>(() => etatImageInitial(ville?.carte ?? null))
  const [tentative, setTentative] = useState(false)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreurServeur, setErreurServeur] = useState<string | null>(null)
  const [enregistreA, setEnregistreA] = useState<Date | null>(null)
  const resumeRef = useRef<HTMLDivElement>(null)

  const erreurs = useMemo(() => erreursVilleForm(form), [form])
  const erreursVisibles = tentative ? erreurs : {}
  const nbErreurs = Object.keys(erreursVisibles).length
  const modifie = JSON.stringify(form) !== reference || imageModifiee(photo) || imageModifiee(carte)

  // Fermeture ou rechargement de l'onglet avec des modifications en cours
  useEffect(() => {
    if (variante !== 'page' || !modifie) return
    const avertir = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [variante, modifie])

  const setInfo = <K extends keyof VilleInfosForm>(champ: K, valeur: VilleInfosForm[K]) =>
    setForm((f) => ({ ...f, infos: { ...f.infos, [champ]: valeur } }))

  const avecCarte = !!imageAffichee(carte)
  const sansProjets = lignesRenseignees(form.projetsAVenir).length === 0

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault()
    setTentative(true)
    if (Object.keys(erreurs).length > 0) {
      requestAnimationFrame(() => resumeRef.current?.focus())
      return
    }
    setEnregistrement(true)
    setErreurServeur(null)

    let v: Ville
    try {
      if (villeCourante) {
        v = await modifierVille(villeCourante.id, form)
      } else {
        v = await creerVille(form)
        onCreee?.(v)
      }
      setVilleCourante(v)
    } catch (err) {
      setErreurServeur(err instanceof Error ? err.message : 'Enregistrement impossible. Réessayez.')
      setEnregistrement(false)
      return
    }

    const echecs: string[] = []
    const images: [('photo' | 'carte'), EtatImage, (etat: EtatImage) => void, string][] = [
      ['photo', photo, setPhoto, 'la photo'],
      ['carte', carte, setCarte, 'la carte'],
    ]
    for (const [type, etat, setEtat, libelle] of images) {
      try {
        if (etat.nouvelle) v = await envoyerImageVille(v, type, etat.nouvelle)
        else if (etat.retiree && etat.existante) v = await retirerImageVille(v, type)
        if (etat.nouvelle) URL.revokeObjectURL(etat.nouvelle.apercu)
        setEtat(etatImageInitial(type === 'photo' ? v.photo : v.carte))
      } catch {
        echecs.push(libelle)
        // Le choix reste en attente pour pouvoir réessayer
        setEtat({ ...etat, existante: type === 'photo' ? v.photo : v.carte })
      }
    }

    setVilleCourante(v)
    const enregistre = villeVersForm(v)
    setForm(enregistre)
    setReference(JSON.stringify(enregistre))
    setTentative(false)
    setEnregistrement(false)

    if (echecs.length > 0) {
      setErreurServeur(
        `${v.nom} est enregistrée, mais l’envoi de ${echecs.join(' et de ')} a échoué. Réessayez avec le bouton Enregistrer.`
      )
      return
    }
    setEnregistreA(new Date())
    onEnregistree(v)
  }

  const annulerModifications = () => {
    if (photo.nouvelle) URL.revokeObjectURL(photo.nouvelle.apercu)
    if (carte.nouvelle) URL.revokeObjectURL(carte.nouvelle.apercu)
    setForm(villeVersForm(villeCourante))
    setPhoto(etatImageInitial(villeCourante?.photo ?? null))
    setCarte(etatImageInitial(villeCourante?.carte ?? null))
    setTentative(false)
    setErreurServeur(null)
  }

  const libelleBouton = enregistrement
    ? 'Enregistrement…'
    : villeCourante ? 'Enregistrer' : 'Ajouter la ville'

  const sections = (
    <>
      <Section variante={variante} titre="Identité" description="Nom et accroche affichés en tête de la page « La ville » de la fiche.">
        <ChampTexte
          champ="nom" valeur={form.nom} max={LIMITES_VILLE.nom} erreur={erreursVisibles.nom}
          placeholder="Dijon" requis autoFocus={variante === 'fenetre' && !villeCourante}
          aide={villeCourante ? undefined : 'Doit être unique dans le catalogue.'}
          onChange={(v) => setForm((f) => ({ ...f, nom: v }))}
        />
        <ChampTexte
          champ="surnom" valeur={form.infos.surnom} max={LIMITES_VILLE.surnom} erreur={erreursVisibles.surnom}
          placeholder="La cité des ducs de Bourgogne"
          onChange={(v) => setInfo('surnom', v)}
        />
        <div className="md:col-span-2 flex items-start justify-between gap-4 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--cs-ivory)' }}>
          <div>
            <label htmlFor="ville-touristique" className="cs-field-label">Ville touristique</label>
            <p className="cs-hint mt-0.5" id="ville-touristique-aide">
              Favorise la location courte durée dans la suggestion de scénario du wizard.
            </p>
          </div>
          <Switch
            id="ville-touristique"
            checked={form.zoneTouristique}
            onCheckedChange={(v) => setForm((f) => ({ ...f, zoneTouristique: v }))}
            aria-describedby="ville-touristique-aide"
            className="mt-1"
          />
        </div>
      </Section>

      <Section variante={variante} titre="Images" description="Photo et carte de la page « La ville ». Formats JPG, PNG, WEBP ou HEIC.">
        <ImageVilleSlot
          id="ville-photo" type="photo" label="Photo de bandeau"
          hint="Recadrée en bandeau sur toute la largeur : gardez le sujet au centre."
          etat={photo} onChange={setPhoto} ratioBandeau={ratioBandeauVille(avecCarte)}
        />
        <ImageVilleSlot
          id="ville-carte" type="carte" label="Carte des quartiers"
          hint="Remplace la liste des quartiers sur la fiche. Affichée en entier, jamais coupée."
          etat={carte} onChange={setCarte} cartePleineLargeur={sansProjets}
        />
      </Section>

      <Section variante={variante} titre="Chiffres clés" description="Tuiles de chiffres et ligne démographique de la page « La ville ».">
        <ChampNombre champ="habitants" valeur={form.infos.habitants} erreur={erreursVisibles.habitants} placeholder="160 000" pas={100} onChange={(v) => setInfo('habitants', v)} />
        <ChampNombre champ="etudiants" valeur={form.infos.etudiants} erreur={erreursVisibles.etudiants} placeholder="35 000" pas={100} onChange={(v) => setInfo('etudiants', v)} />
        <ChampTexte champ="acces" valeur={form.infos.acces} max={LIMITES_VILLE.acces} erreur={erreursVisibles.acces} placeholder="à 1h35 de Paris en TGV" onChange={(v) => setInfo('acces', v)} />
        <ChampTexte champ="atout" valeur={form.infos.atout} max={LIMITES_VILLE.atout} erreur={erreursVisibles.atout} placeholder="Capitale de la Bourgogne" onChange={(v) => setInfo('atout', v)} />
        <ChampNombre
          champ="aireAttraction" valeur={form.aireAttraction} erreur={erreursVisibles.aireAttraction}
          placeholder="390 000" unite="hab." pas={100} aide="Population de l’aire d’attraction (INSEE)."
          onChange={(v) => setForm((f) => ({ ...f, aireAttraction: v }))}
        />
        <ChampNombre
          champ="croissanceDemographiquePct" valeur={form.croissanceDemographiquePct} erreur={erreursVisibles.croissanceDemographiquePct}
          placeholder="0,3" unite="%/an" pas={0.1} negatif aide="Variation annuelle moyenne, négative si la population baisse."
          onChange={(v) => setForm((f) => ({ ...f, croissanceDemographiquePct: v }))}
        />
      </Section>

      <Section variante={variante} titre="Marché immobilier" description="Fourchette de prix et rentabilité moyenne constatées sur la ville.">
        <ChampNombre champ="prixM2Min" valeur={form.infos.prixM2Min} erreur={erreursVisibles.prixM2Min} placeholder="2 400" unite="€/m²" pas={50} onChange={(v) => setInfo('prixM2Min', v)} />
        <ChampNombre champ="prixM2Max" valeur={form.infos.prixM2Max} erreur={erreursVisibles.prixM2Max} placeholder="3 500" unite="€/m²" pas={50} onChange={(v) => setInfo('prixM2Max', v)} />
        <ChampNombre champ="rendementMoyenPct" valeur={form.infos.rendementMoyenPct} erreur={erreursVisibles.rendementMoyenPct} placeholder="6,2" unite="%" pas={0.1} aide="Rendement brut moyen observé." onChange={(v) => setInfo('rendementMoyenPct', v)} />
      </Section>

      <Section variante={variante} titre="Où investir" description="Encarts du bas de la page « La ville ».">
        <ListeLignes
          champ="quartiers" lignes={form.quartiers} max={LIMITES_VILLE.quartiers} maxCaracteres={LIMITES_VILLE.quartier}
          budget={LIMITES_VILLE.quartiersTotal}
          erreur={erreursVisibles.quartiers} libelleAjout="Ajouter un quartier" placeholder="Centre-ville"
          aide={avecCarte ? 'La carte des quartiers est affichée à la place de cette liste sur la fiche.' : 'Nom du quartier seul.'}
          onChange={(l) => setForm((f) => ({ ...f, quartiers: l }))}
        />
        <ListeLignes
          champ="projetsAVenir" lignes={form.projetsAVenir} max={LIMITES_VILLE.projets} maxCaracteres={LIMITES_VILLE.projet}
          budget={LIMITES_VILLE.projetsTotal}
          erreur={erreursVisibles.projetsAVenir} libelleAjout="Ajouter un projet" multiligne
          placeholder="Nouvelle ligne de tram vers le campus, mise en service prévue en 2028"
          aide="Une ligne par projet d’aménagement : quoi, où, quand."
          onChange={(l) => setForm((f) => ({ ...f, projetsAVenir: l }))}
        />
      </Section>
    </>
  )

  const resume = nbErreurs > 0 && (
    <div
      ref={resumeRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="ville-erreurs-titre"
      className="rounded-xl border px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--cs-neg)]"
      style={{ backgroundColor: 'var(--cs-neg-wash)', borderColor: '#EBC3BC' }}
    >
      <p id="ville-erreurs-titre" className="text-[13px] font-bold" style={{ color: 'var(--cs-neg)' }}>
        {nbErreurs > 1 ? `${nbErreurs} champs à corriger` : 'Un champ à corriger'}
      </p>
      <ul className="mt-1 space-y-0.5">
        {(Object.entries(erreursVisibles) as [ChampVille, string][]).map(([champ, message]) => (
          <li key={champ} className="text-[12.5px]">
            <a href={`#${idChamp(champ)}`} className="underline underline-offset-2" style={{ color: 'var(--cs-neg)' }}>
              {LIBELLES[champ]} : {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )

  const alerteServeur = erreurServeur && (
    <p role="alert" className="rounded-xl border px-4 py-3 text-[13px] font-semibold" style={{ backgroundColor: 'var(--cs-neg-wash)', borderColor: '#EBC3BC', color: 'var(--cs-neg)' }}>
      {erreurServeur}
    </p>
  )

  const statut = enregistrement
    ? 'Enregistrement en cours…'
    : modifie
      ? 'Modifications non enregistrées'
      : enregistreA
        ? `Enregistrée à ${enregistreA.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
        : villeCourante ? 'Aucune modification' : 'Seul le nom est obligatoire'

  const boutons = (
    <div className="flex items-center gap-2">
      {variante === 'page' && modifie && villeCourante && !enregistrement && (
        <button type="button" className="cs-btn h-10 px-4" onClick={annulerModifications}>
          Annuler les modifications
        </button>
      )}
      {variante === 'fenetre' && onAnnuler && (
        <button type="button" className="cs-btn h-10 px-4" onClick={onAnnuler} disabled={enregistrement}>
          Annuler
        </button>
      )}
      <button type="submit" className="cs-btn cs-btn-gold h-10 px-5" disabled={enregistrement || (!modifie && !!villeCourante)}>
        {libelleBouton}
      </button>
    </div>
  )

  if (variante === 'fenetre') {
    return (
      <form onSubmit={enregistrer} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {resume}
          {alerteServeur}
          {sections}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cs-line-soft)] px-6 py-3.5" style={{ backgroundColor: '#FBFAF7' }}>
          <p className="cs-hint" aria-live="polite">{statut}</p>
          {boutons}
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={enregistrer} noValidate className="space-y-5 pb-28">
      {resume}
      {alerteServeur}
      {sections}
      {/* Barre fixe (et non sticky) : <main> a un overflow qui neutralise position: sticky.
          Calée sur la navigation : au-dessus de la barre du bas, à droite de la barre latérale. */}
      <div
        className="fixed right-0 z-30 border-t"
        style={{
          left: 'var(--cs-sidebar)',
          bottom: 'calc(var(--cs-nav-bas) + var(--cs-clavier, 0px))',
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderColor: 'var(--cs-line)',
          boxShadow: '0 -8px 24px -18px rgba(14,34,64,.35)',
        }}
      >
        <div className="max-w-[880px] mx-auto px-4 md:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[12.5px] font-medium" style={{ color: modifie ? 'var(--cs-gold-ink)' : 'var(--cs-mist)' }} aria-live="polite">
            {modifie && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--cs-gold)' }} aria-hidden="true" />}
            {statut}
          </p>
          {boutons}
        </div>
      </div>
    </form>
  )
}

// ─── Mise en page ─────────────────────────────────────────────────────────────

function Section({ variante, titre, description, children }: {
  variante: 'page' | 'fenetre'
  titre: string
  description: string
  children: ReactNode
}) {
  const contenu = (
    <>
      <div className="mb-4">
        <h2 className="cs-h3">{titre}</h2>
        <p className="cs-hint mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">{children}</div>
    </>
  )
  // Pas de carte dans la fenêtre : des cartes dans une modale seraient des cartes imbriquées
  if (variante === 'fenetre') return <section className="border-t border-[var(--cs-line-soft)] pt-5 first:border-t-0 first:pt-0">{contenu}</section>
  return <section className="cs-card p-[22px]">{contenu}</section>
}

function Champ({ champ, erreur, aide, compteur, requis, children }: {
  champ: ChampVille
  erreur?: string
  aide?: string
  compteur?: string
  requis?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label htmlFor={idChamp(champ)} className="cs-field-label block">
        {LIBELLES[champ]}
        {requis && <span aria-hidden="true" style={{ color: 'var(--cs-gold-ink)' }}> *</span>}
      </label>
      {children}
      {(erreur || aide || compteur) && (
        <div className="flex items-start justify-between gap-3">
          {erreur ? (
            <p id={`${idChamp(champ)}-erreur`} className="text-[11.5px] font-medium" style={{ color: 'var(--cs-neg)' }}>{erreur}</p>
          ) : aide ? (
            <p id={`${idChamp(champ)}-aide`} className="cs-hint">{aide}</p>
          ) : <span />}
          {compteur && <p className="cs-hint shrink-0 tabular-nums">{compteur}</p>}
        </div>
      )}
    </div>
  )
}

const styleErreur = (erreur?: string) =>
  erreur ? { borderColor: 'var(--cs-neg)', boxShadow: '0 0 0 3px rgba(178,58,46,.10)' } : undefined

const decrit = (champ: ChampVille, erreur?: string, aide?: string) =>
  erreur ? `${idChamp(champ)}-erreur` : aide ? `${idChamp(champ)}-aide` : undefined

function ChampTexte({ champ, valeur, max, erreur, aide, placeholder, requis, autoFocus, onChange }: {
  champ: ChampVille
  valeur: string
  max: number
  erreur?: string
  aide?: string
  placeholder?: string
  requis?: boolean
  autoFocus?: boolean
  onChange: (v: string) => void
}) {
  const longueur = valeur.length
  return (
    <Champ champ={champ} erreur={erreur} aide={aide} requis={requis}
      compteur={longueur > max * 0.7 ? `${longueur}/${max}` : undefined}>
      <input
        id={idChamp(champ)}
        type="text"
        className="cs-input"
        value={valeur}
        maxLength={max}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required={requis}
        aria-invalid={!!erreur}
        aria-describedby={decrit(champ, erreur, aide)}
        style={styleErreur(erreur)}
        onChange={(e) => onChange(e.target.value)}
      />
    </Champ>
  )
}

function ChampNombre({ champ, valeur, erreur, aide, placeholder, unite, pas = 1, negatif = false, onChange }: {
  champ: ChampVille
  valeur: number | ''
  erreur?: string
  aide?: string
  placeholder?: string
  unite?: string
  pas?: number
  negatif?: boolean
  onChange: (v: number | '') => void
}) {
  return (
    <Champ champ={champ} erreur={erreur} aide={aide}>
      <div className="relative">
        <input
          id={idChamp(champ)}
          type="number"
          inputMode="decimal"
          className="cs-input"
          value={valeur}
          min={negatif ? undefined : 0}
          step={pas}
          placeholder={placeholder}
          aria-invalid={!!erreur}
          aria-describedby={decrit(champ, erreur, aide)}
          style={{ ...styleErreur(erreur), paddingRight: unite ? 56 : undefined }}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
        {unite && <span className="cs-input-unit">{unite}</span>}
      </div>
    </Champ>
  )
}

function ListeLignes({
  champ, lignes, max, maxCaracteres, budget, erreur, aide, placeholder, libelleAjout, multiligne = false, onChange,
}: {
  champ: ChampVille
  lignes: string[]
  max: number
  maxCaracteres: number
  budget: number                       // caractères au total pour la liste (place sur la fiche)
  erreur?: string
  aide?: string
  placeholder?: string
  libelleAjout: string
  multiligne?: boolean
  onChange: (lignes: string[]) => void
}) {
  // Une ligne vide est proposée quand la liste est vide, sans être enregistrée
  const affichees = lignes.length === 0 ? [''] : lignes
  const modifier = (i: number, v: string) => onChange(affichees.map((l, j) => (j === i ? v : l)))
  const retirer = (i: number) => onChange(affichees.filter((_, j) => j !== i))
  const singulier = champ === 'quartiers' ? 'ce quartier' : 'ce projet'
  const total = longueurListe(lignes)
  const restant = budget - total
  // Une ligne ne peut pas dépasser sa limite, ni le budget restant de la liste
  const maxLigne = (ligne: string) => Math.max(ligne.length, Math.min(maxCaracteres, ligne.length + restant))

  return (
    <div className="space-y-1.5 min-w-0 md:col-span-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${idChamp(champ)}`} className="cs-field-label">{LIBELLES[champ]}</label>
        <span className="cs-hint tabular-nums" style={restant <= budget * 0.1 ? { color: 'var(--cs-gold-ink)' } : undefined}>
          {lignesRenseignees(lignes).length}/{max} · {total}/{budget} caractères
        </span>
      </div>
      <ul className="space-y-2">
        {affichees.map((ligne, i) => (
          <li key={i} className="flex items-start gap-2">
            {multiligne ? (
              <div className="min-w-0 flex-1">
                <Textarea
                  id={i === 0 ? idChamp(champ) : undefined}
                  aria-label={i === 0 ? undefined : `${LIBELLES[champ]}, ligne ${i + 1}`}
                  minRows={1}
                  value={ligne}
                  maxLength={maxLigne(ligne)}
                  placeholder={i === 0 ? placeholder : undefined}
                  aria-invalid={!!erreur}
                  aria-describedby={decrit(champ, erreur, aide)}
                  onChange={(e) => modifier(i, e.target.value.replace(/\n/g, ' '))}
                />
                {ligne.length > maxCaracteres * 0.7 && (
                  <p className="cs-hint mt-1 text-right tabular-nums">{ligne.length}/{maxCaracteres}</p>
                )}
              </div>
            ) : (
              <input
                id={i === 0 ? idChamp(champ) : undefined}
                aria-label={i === 0 ? undefined : `${LIBELLES[champ]}, ligne ${i + 1}`}
                type="text"
                className="cs-input min-w-0 flex-1"
                value={ligne}
                maxLength={maxLigne(ligne)}
                placeholder={i === 0 ? placeholder : undefined}
                aria-invalid={!!erreur}
                aria-describedby={decrit(champ, erreur, aide)}
                style={styleErreur(erreur)}
                onChange={(e) => modifier(i, e.target.value)}
              />
            )}
            {(affichees.length > 1 || ligne) && (
              <button
                type="button"
                onClick={() => retirer(i)}
                aria-label={`Retirer ${singulier}${ligne ? ` : ${ligne}` : ''}`}
                className="cs-cible mt-[3px] flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--cs-mist)] transition-colors hover:bg-[var(--cs-neg-wash)] hover:text-[var(--cs-neg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-navy)]"
              >
                <XIcon size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-start justify-between gap-3 pt-0.5">
        {erreur ? (
          <p id={`${idChamp(champ)}-erreur`} className="text-[11.5px] font-medium" style={{ color: 'var(--cs-neg)' }}>{erreur}</p>
        ) : aide ? (
          <p id={`${idChamp(champ)}-aide`} className="cs-hint">{aide}</p>
        ) : <span />}
        {affichees.length < max && affichees[affichees.length - 1].trim() !== '' && restant > 0 && (
          <button type="button" className="cs-btn h-8 px-3 text-[12px]" onClick={() => onChange([...affichees, ''])}>
            <PlusIcon size={14} strokeWidth={2.4} aria-hidden="true" />
            {libelleAjout}
          </button>
        )}
      </div>
    </div>
  )
}
