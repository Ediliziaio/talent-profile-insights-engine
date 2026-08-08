/**
 * SEO / AEO — configurazione centralizzata del brand e dei dati strutturati.
 *
 * Brand: Talenti Edili (prodotto commerciale)
 * Metodo/motore: Talent Profile System (analisi psicoattitudinale + Intelligenza Artificiale)
 *
 * NOTA: il dominio canonico è configurabile via VITE_SITE_URL.
 */

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://talentiedili.it'
).replace(/\/$/, '');

export const BRAND = {
  /** Nome commerciale del prodotto */
  name: 'Talenti Edili',
  /** Nome del sistema/metodo proprietario su cui si basa il prodotto */
  system: 'Talent Profile System',
  systemShort: 'Talent Profile',
  legalName: 'Talenti Edili',
  email: 'info@talentiedili.it',
  logo: `${SITE_URL}/talentprofile_logo_v3.png`,
  ogImage: `${SITE_URL}/talentprofile_logo_v3.png`,
  /** Definizione canonica — usata per AEO e ripetuta identica su tutto il sito */
  definition:
    'Talenti Edili è il sistema di selezione e gestione del personale per le imprese edili che unisce Intelligenza Artificiale e analisi psicoattitudinale. Si basa sul Talent Profile System: un questionario psicoattitudinale di 242 domande che misura 15 tratti della persona, elaborato dall’AI in un report operativo con compatibilità di ruolo, rischi comportamentali e guida al colloquio.',
} as const;

export interface SeoMeta {
  title: string;
  description: string;
  /** Percorso canonico, es. "/" oppure "/garanzia" */
  path: string;
  /** Se true la pagina non va indicizzata (area riservata, flusso test) */
  noindex?: boolean;
  image?: string;
  /** Blocchi JSON-LD aggiuntivi specifici della pagina */
  jsonLd?: Record<string, unknown>[];
}

export const canonical = (path: string) =>
  `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`;

/* ─────────────── JSON-LD riutilizzabili ─────────────── */

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND.name,
  legalName: BRAND.legalName,
  url: `${SITE_URL}/`,
  logo: BRAND.logo,
  email: BRAND.email,
  description: BRAND.definition,
  areaServed: { '@type': 'Country', name: 'Italia' },
  knowsAbout: [
    'selezione del personale in edilizia',
    'analisi psicoattitudinale',
    'test attitudinali per operai e capisquadra',
    'Intelligenza Artificiale applicata alle risorse umane',
    'riduzione del turnover in cantiere',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: BRAND.email,
      availableLanguage: ['it'],
      areaServed: 'IT',
    },
  ],
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: BRAND.name,
  inLanguage: 'it-IT',
  publisher: { '@id': `${SITE_URL}/#organization` },
});

export const softwareLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/#software`,
  name: `${BRAND.name} — ${BRAND.system}`,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Human Resources',
  operatingSystem: 'Web (cloud)',
  url: `${SITE_URL}/`,
  inLanguage: 'it-IT',
  description: BRAND.definition,
  featureList: [
    'Analisi psicoattitudinale su 15 tratti della persona',
    'Report generato dall’Intelligenza Artificiale in tempo reale',
    'Compatibilità automatica con oltre 30 ruoli di cantiere e ufficio tecnico',
    'Guida al colloquio personalizzata per ogni candidato',
    'Confronto affiancato fino a 4 candidati',
    'Piano di inserimento per i primi 90 giorni',
  ],
  provider: { '@id': `${SITE_URL}/#organization` },
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '49',
      priceCurrency: 'EUR',
      category: 'subscription',
      url: `${SITE_URL}/#prezzi`,
    },
    {
      '@type': 'Offer',
      name: 'Professional',
      price: '97',
      priceCurrency: 'EUR',
      category: 'subscription',
      url: `${SITE_URL}/#prezzi`,
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      priceCurrency: 'EUR',
      category: 'subscription',
      url: `${SITE_URL}/#prezzi`,
    },
  ],
});

export const faqLd = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const howToLd = (steps: { title: string; desc: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': `${SITE_URL}/#come-funziona`,
  name: `Come funziona ${BRAND.name} in ${steps.length} passi`,
  description: `Il percorso ${BRAND.system}: dall’invio del test psicoattitudinale alla decisione di assunzione basata sui dati.`,
  totalTime: 'PT15M',
  inLanguage: 'it-IT',
  step: steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.desc,
  })),
});

/** Servizio erogato dall'azienda (Banca Talenti, ricerca e selezione, sistema) */
export const serviceLd = (s: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  offers?: { name: string; price?: string; description?: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${canonical(s.path)}#service`,
  name: s.name,
  serviceType: s.serviceType,
  description: s.description,
  url: canonical(s.path),
  inLanguage: 'it-IT',
  provider: { '@id': `${SITE_URL}/#organization` },
  areaServed: { '@type': 'Country', name: 'Italia' },
  audience: {
    '@type': 'BusinessAudience',
    name: 'Imprese edili, di costruzioni e impiantistiche',
  },
  ...(s.offers?.length
    ? {
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: s.name,
          itemListElement: s.offers.map((o) => ({
            '@type': 'Offer',
            name: o.name,
            ...(o.price ? { price: o.price, priceCurrency: 'EUR' } : {}),
            ...(o.description ? { description: o.description } : {}),
          })),
        },
      }
    : {}),
});

/** Pagina generica — utile quando non c'è un tipo più specifico */
export const webPageLd = (p: { name: string; description: string; path: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${canonical(p.path)}#webpage`,
  url: canonical(p.path),
  name: p.name,
  description: p.description,
  inLanguage: 'it-IT',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
});

/** Elenco di elementi (hub ruoli, catalogo servizi) */
export const itemListLd = (opts: {
  name: string;
  path: string;
  items: { name: string; path: string; description?: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${canonical(opts.path)}#itemlist`,
  name: opts.name,
  numberOfItems: opts.items.length,
  itemListElement: opts.items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: canonical(it.path),
    ...(it.description ? { description: it.description } : {}),
  })),
});

/** Guida editoriale — usata dalle pagine sotto /guide */
export const articleLd = (a: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  section?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${canonical(a.path)}#article`,
  headline: a.headline,
  description: a.description,
  url: canonical(a.path),
  inLanguage: 'it-IT',
  datePublished: a.datePublished,
  dateModified: a.datePublished,
  ...(a.section ? { articleSection: a.section } : {}),
  author: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  isPartOf: { '@id': `${SITE_URL}/#website` },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonical(a.path)}#webpage` },
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: canonical(it.path),
  })),
});
