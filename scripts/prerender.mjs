/**
 * Prerender statico del sito pubblico.
 *
 * Esegue dopo `vite build` (client) e `vite build --ssr`: per ogni rotta pubblica
 * genera dist/<path>/index.html con l'HTML già renderizzato e l'head SEO corretto.
 *
 * Serve perché il sito è una SPA e i crawler generativi (ChatGPT, Perplexity,
 * ClaudeBot, AI Overviews) in larga parte non eseguono JavaScript: senza questo
 * passaggio vedrebbero solo un <div id="root"> vuoto.
 */
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SSG_BUNDLE = join(ROOT, 'dist-ssg', 'entry-ssg.js');

/* Il client Supabase referenzia `localStorage` al momento dell'import: in Node
   non esiste, quindi forniamo uno stub inerte prima di caricare il bundle. */
function installBrowserStubs() {
  const store = new Map();
  const storage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  globalThis.localStorage ??= storage;
  globalThis.sessionStorage ??= storage;
}

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://talentiedili.it').replace(/\/$/, '');
const canonical = (path) => `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`;

function buildHead(seo, path) {
  const url = canonical(seo?.path ?? path);
  const title = seo?.title ?? 'Talenti Edili';
  const description = seo?.description ?? '';
  const image = seo?.image ?? `${SITE_URL}/talentprofile_logo_v3.png`;
  const robots = seo?.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Talenti Edili" />`,
    `<meta property="og:locale" content="it_IT" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ];

  for (const block of seo?.jsonLd ?? []) {
    // `</script>` dentro il JSON chiuderebbe il tag: unica sequenza da neutralizzare.
    const json = JSON.stringify(block).replace(/<\//g, '<\\/');
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }

  return tags.join('\n    ');
}

/** Rimuove dal template i tag che il prerender riscrive per pagina. */
function stripTemplateHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?>\s*/i, '')
    .replace(/<meta\s+name="robots"[\s\S]*?>\s*/i, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?>\s*/i, '')
    .replace(/<meta\s+property="og:[\s\S]*?>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[\s\S]*?>\s*/gi, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<noscript>[\s\S]*?<\/noscript>\s*/i, '');
}

/** Priorità e frequenza di aggiornamento per la sitemap, dedotte dal percorso. */
function sitemapRank(path) {
  if (path === '/') return { priority: '1.0', changefreq: 'weekly' };
  if (/^\/(marketplace|ricerca-e-selezione|talent-profile-system)/.test(path))
    return { priority: '0.9', changefreq: 'weekly' };
  if (/^\/(ruoli|prezzi|lavora-in-edilizia)$/.test(path))
    return { priority: '0.8', changefreq: 'monthly' };
  if (/^\/ruoli\//.test(path) || path === '/faq') return { priority: '0.7', changefreq: 'monthly' };
  if (/^\/(privacy-policy|cookie-policy|termini-e-condizioni)$/.test(path))
    return { priority: '0.3', changefreq: 'yearly' };
  return { priority: '0.6', changefreq: 'yearly' };
}

/** La sitemap nasce dalle stesse rotte che prerenderizziamo: non può divergere. */
async function writeSitemap(paths) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = paths
    .map((p) => {
      const { priority, changefreq } = sitemapRank(p);
      return [
        '  <url>',
        `    <loc>${canonical(p)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    'utf8'
  );
}

async function main() {
  installBrowserStubs();

  const { render, PUBLIC_PATHS } = await import(pathToFileURL(SSG_BUNDLE).href);

  // Un buco nell'array (virgola di troppo in un file di dati) arriverebbe fin
  // qui come un TypeError incomprensibile: meglio fermarsi subito e dire dove.
  const invalidi = PUBLIC_PATHS.map((p, i) => [i, p]).filter(
    ([, p]) => typeof p !== 'string' || !p.startsWith('/')
  );
  if (invalidi.length) {
    throw new Error(
      'PUBLIC_PATHS contiene voci non valide:\n' +
        invalidi.map(([i, p]) => `  indice ${i}: ${JSON.stringify(p)}`).join('\n')
    );
  }
  const template = await readFile(join(DIST, 'index.html'), 'utf8');
  const shell = stripTemplateHead(template);

  let ok = 0;
  const failed = [];

  for (const path of PUBLIC_PATHS) {
    try {
      const { html, seo } = render(path);
      if (!seo) failed.push(`${path} (nessun metadato SEO raccolto)`);

      const page = shell
        .replace('</head>', `  ${buildHead(seo, path)}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

      const outDir = path === '/' ? DIST : join(DIST, path);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, 'index.html'), page, 'utf8');
      ok++;
    } catch (err) {
      failed.push(`${path} → ${err.message}`);
    }
  }

  await writeSitemap(PUBLIC_PATHS);

  // Il bundle SSR non va pubblicato.
  await rm(join(ROOT, 'dist-ssg'), { recursive: true, force: true });

  console.log(`\nPrerender: ${ok}/${PUBLIC_PATHS.length} pagine generate`);
  console.log(`Sitemap:   ${PUBLIC_PATHS.length} URL`);
  if (failed.length) {
    console.error('Pagine non generate:\n  - ' + failed.join('\n  - '));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Prerender fallito:', err);
  process.exit(1);
});
