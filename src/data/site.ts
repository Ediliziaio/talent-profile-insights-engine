/**
 * Struttura del sito pubblico Talenti Edili.
 *
 * Il portale ha tre porte d'ingresso, che vanno tenute distinte in tutta la
 * navigazione e nei dati strutturati:
 *  1. La Piattaforma — l'impresa cerca fra candidati già analizzati
 *  2. Ricerca e selezione — la ricerca la facciamo noi, chiavi in mano
 *  3. Talent Profile System — l'impresa usa il sistema in autonomia
 */

export interface NavChild {
  label: string;
  to: string;
  desc?: string;
}

export interface NavItem {
  label: string;
  to?: string;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  {
    label: 'Servizi',
    children: [
      {
        label: 'La Piattaforma',
        to: '/piattaforma',
        desc: 'Cerca fra profili edili già analizzati e pronti a partire',
      },
      {
        label: 'Ricerca e Selezione',
        to: '/ricerca-e-selezione-personale-edile',
        desc: 'La selezione la facciamo noi: ti consegniamo la rosa finale',
      },
      {
        label: 'Chi ti troviamo',
        to: '/troviamo',
        desc: 'Venditori, amministrativi, capicantiere, operai e tecnici',
      },
      {
        label: 'Talent Profile System',
        to: '/talent-profile-system',
        desc: 'Il sistema di analisi psicoattitudinale con AI, in autonomia',
      },
    ],
  },
  { label: 'Ruoli', to: '/ruoli' },
  { label: 'Prezzi', to: '/prezzi' },
  {
    label: 'Risorse',
    children: [
      { label: 'Guide', to: '/guide', desc: 'Turnover, costi di selezione, colloqui in edilizia' },
      { label: 'Domande frequenti', to: '/faq', desc: 'Come funziona, quanto costa, quanto dura' },
      { label: 'Garanzia 30 giorni', to: '/garanzia', desc: 'Se non funziona, ti rimborsiamo' },
      { label: 'Chi siamo', to: '/chi-siamo', desc: 'Perché esistiamo e come lavoriamo' },
      { label: 'Contatti', to: '/contatti', desc: 'Parla con una persona vera' },
    ],
  },
  { label: 'Cerchi lavoro?', to: '/lavora-in-edilizia' },
];

export const FOOTER_COLUMNS: { title: string; links: NavChild[] }[] = [
  {
    title: 'Servizi',
    links: [
      { label: 'La Piattaforma', to: '/piattaforma' },
      { label: 'Ricerca e Selezione', to: '/ricerca-e-selezione-personale-edile' },
      { label: 'Chi ti troviamo', to: '/troviamo' },
      { label: 'Talent Profile System', to: '/talent-profile-system' },
      { label: 'Prezzi', to: '/prezzi' },
    ],
  },
  {
    title: 'Ruoli',
    links: [
      { label: 'Capocantiere', to: '/ruoli/capocantiere' },
      { label: 'Capisquadra', to: '/ruoli/capisquadra' },
      { label: 'Geometra di cantiere', to: '/ruoli/geometra-di-cantiere' },
      { label: 'Tutti i ruoli', to: '/ruoli' },
    ],
  },
  {
    title: 'Azienda',
    links: [
      { label: 'Chi siamo', to: '/chi-siamo' },
      { label: 'Guide', to: '/guide' },
      { label: 'Domande frequenti', to: '/faq' },
      { label: 'Garanzia 30 giorni', to: '/garanzia' },
      { label: 'Contatti', to: '/contatti' },
      { label: 'Cerchi lavoro in edilizia?', to: '/lavora-in-edilizia' },
    ],
  },
];

export const LEGAL_LINKS: NavChild[] = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Cookie Policy', to: '/cookie-policy' },
  { label: 'Termini e Condizioni', to: '/termini-e-condizioni' },
];

export const CONTATTI = {
  email: 'info@talentiedili.it',
  emailPrivacy: 'privacy@talentiedili.it',
  orari: 'Lunedì–venerdì, 9:00–18:00',
  rispostaEntro: '24 ore lavorative',
} as const;

/** I tre pilastri: usati in home, footer e dati strutturati */
export const PILASTRI = [
  {
    slug: '/piattaforma',
    eyebrow: 'La Piattaforma',
    title: 'Trova talenti già analizzati',
    desc:
      'Un bacino di profili edili che hanno già completato l’analisi psicoattitudinale. Filtri per ruolo, zona e compatibilità, e vedi il profilo completo prima ancora di chiamarli.',
    per: 'Per chi ha fretta e vuole scegliere fra persone già misurate.',
  },
  {
    slug: '/ricerca-e-selezione-personale-edile',
    eyebrow: 'Servizio',
    title: 'Facciamo noi la selezione',
    desc:
      'Ricerca, screening e analisi psicoattitudinale li gestiamo noi. Tu ricevi una rosa di 3 candidati con report completo, compatibilità di ruolo e guida al colloquio.',
    per: 'Per chi non ha tempo né una struttura HR interna.',
  },
  {
    slug: '/talent-profile-system',
    eyebrow: 'Sistema',
    title: 'Usa il sistema in autonomia',
    desc:
      'Mandi il link ai tuoi candidati, l’Intelligenza Artificiale elabora il report in 15 minuti. Il metodo Talent Profile dentro la tua azienda, senza intermediari.',
    per: 'Per chi assume spesso e vuole internalizzare il metodo.',
  },
] as const;
