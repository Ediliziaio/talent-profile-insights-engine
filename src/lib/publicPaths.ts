import { RUOLI } from '@/data/ruoli';
import { LEGAL_DOCS } from '@/data/legal';
import { GUIDE } from '@/data/guide';

/**
 * Elenco delle rotte pubbliche da generare staticamente al build.
 * Deve restare allineato alle rotte dentro <PublicSite> in App.tsx e alla sitemap.
 */
export const PUBLIC_PATHS: string[] = [
  '/',
  '/marketplace-talenti-edili',
  '/ricerca-e-selezione-personale-edile',
  '/talent-profile-system',
  '/ruoli',
  ...RUOLI.map((r) => `/ruoli/${r.slug}`),
  '/lavora-in-edilizia',
  '/registrazione-candidato',
  '/prezzi',
  '/faq',
  '/guide',
  ...GUIDE.map((g) => `/guide/${g.slug}`),
  '/chi-siamo',
  '/contatti',
  '/garanzia',
  ...LEGAL_DOCS.map((d) => `/${d.slug}`),
];
