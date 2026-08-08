import { RUOLI } from '@/data/ruoli';
import { LEGAL_DOCS } from '@/data/legal';
import { GUIDE } from '@/data/guide';
import { SELEZIONI } from '@/data/selezioni';

/**
 * Elenco delle rotte pubbliche da generare staticamente al build.
 * Deve restare allineato alle rotte dentro <PublicSite> in App.tsx e alla sitemap.
 */
export const PUBLIC_PATHS: string[] = [
  '/',
  '/banca-talenti',
  '/ricerca-e-selezione-personale-edile',
  '/troviamo',
  ...SELEZIONI.map((s) => `/troviamo/${s.slug}`),
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
