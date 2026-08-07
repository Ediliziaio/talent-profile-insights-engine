import { createContext } from 'react';
import type { SeoMeta } from './seo';

/**
 * Raccoglitore dei metadati SEO usato SOLO durante il prerender statico.
 *
 * In fase di build il componente <Seo> non può scrivere nel DOM (non esiste),
 * quindi deposita qui i propri metadati mentre renderizza; lo script di
 * prerender li legge e li scrive nell'`<head>` dell'HTML generato.
 *
 * Nel browser il context vale `null` e <Seo> continua a lavorare sul DOM.
 */
export interface SeoCollector {
  set: (meta: SeoMeta) => void;
}

export const SeoCollectorContext = createContext<SeoCollector | null>(null);

export function createSeoCollector() {
  let collected: SeoMeta | null = null;
  return {
    collector: { set: (meta: SeoMeta) => { collected = meta; } } as SeoCollector,
    get: () => collected,
  };
}
