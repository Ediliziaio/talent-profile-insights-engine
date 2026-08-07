import { useContext, useEffect } from 'react';
import { canonical, BRAND, type SeoMeta } from '@/lib/seo';
import { SeoCollectorContext } from '@/lib/seoCollector';

/** Attributo che marca i tag gestiti da questo componente, per poterli ripulire al cambio rotta. */
const MANAGED = 'data-seo-managed';

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(MANAGED, 'true');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    el.setAttribute(MANAGED, 'true');
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Gestisce title, meta, canonical, Open Graph e dati strutturati per ogni rotta.
 *
 * Il sito è una SPA: index.html contiene già i dati della home per i crawler che
 * non eseguono JavaScript. Questo componente allinea l'head sulle rotte interne
 * e sostituisce i blocchi JSON-LD quando la pagina cambia.
 */
export function Seo({ title, description, path, noindex, image, jsonLd }: SeoMeta) {
  const collector = useContext(SeoCollectorContext);
  // Solo durante il prerender: deposita i metadati invece di toccare il DOM.
  // Effetto in fase di render voluto — il collector esiste unicamente lato build,
  // dove il render è un passaggio singolo e sincrono.
  if (collector) {
    collector.set({ title, description, path, noindex, image, jsonLd });
  }

  useEffect(() => {
    const url = canonical(path);
    const img = image || BRAND.ogImage;

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    });
    upsertLink('canonical', url);

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: img });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: BRAND.name });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'it_IT' });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: img });
  }, [title, description, path, noindex, image]);

  useEffect(() => {
    if (!jsonLd?.length) return;
    // Rimuove i blocchi statici di index.html: su questa rotta li rigeneriamo noi.
    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((n) => n.remove());

    const nodes = jsonLd.map((block) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute(MANAGED, 'true');
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
      return s;
    });
    return () => nodes.forEach((n) => n.remove());
  }, [jsonLd]);

  return null;
}

export default Seo;
