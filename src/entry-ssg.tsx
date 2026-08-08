/**
 * Entry point del prerender statico.
 *
 * Renderizza l'albero del sito pubblico (senza AuthProvider, senza router del
 * browser) e restituisce HTML + metadati SEO raccolti, che `scripts/prerender.mjs`
 * inserisce nei file statici di dist/.
 *
 * Non viene mai caricato dal browser: è compilato a parte con `vite build --ssr`.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SiteLayout } from '@/components/site/SiteLayout';
import { SeoCollectorContext, createSeoCollector } from '@/lib/seoCollector';
import type { SeoMeta } from '@/lib/seo';

import Home from '@/pages/Home';
import Garanzia from '@/pages/Garanzia';
import Marketplace from '@/pages/site/Marketplace';
import RicercaSelezione from '@/pages/site/RicercaSelezione';
import Troviamo from '@/pages/site/Troviamo';
import TroviamoDettaglio from '@/pages/site/TroviamoDettaglio';
import TalentProfileSystem from '@/pages/site/TalentProfileSystem';
import Ruoli from '@/pages/site/Ruoli';
import RuoloDettaglio from '@/pages/site/RuoloDettaglio';
import LavoraInEdilizia from '@/pages/site/LavoraInEdilizia';
import RegistrazioneCandidato from '@/pages/site/RegistrazioneCandidato';
import Prezzi from '@/pages/site/Prezzi';
import ChiSiamo from '@/pages/site/ChiSiamo';
import Contatti from '@/pages/site/Contatti';
import Faq from '@/pages/site/Faq';
import Guide from '@/pages/site/Guide';
import GuidaDettaglio from '@/pages/site/GuidaDettaglio';
import Legal from '@/pages/site/Legal';

export { PUBLIC_PATHS } from '@/lib/publicPaths';

export interface RenderResult {
  html: string;
  seo: SeoMeta | null;
}

export function render(url: string): RenderResult {
  const { collector, get } = createSeoCollector();

  const html = renderToString(
    <SeoCollectorContext.Provider value={collector}>
      <TooltipProvider>
        <StaticRouter location={url}>
          <SiteLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace-talenti-edili" element={<Marketplace />} />
              <Route path="/ricerca-e-selezione-personale-edile" element={<RicercaSelezione />} />
              <Route path="/troviamo" element={<Troviamo />} />
              <Route path="/troviamo/:slug" element={<TroviamoDettaglio />} />
              <Route path="/talent-profile-system" element={<TalentProfileSystem />} />
              <Route path="/ruoli" element={<Ruoli />} />
              <Route path="/ruoli/:slug" element={<RuoloDettaglio />} />
              <Route path="/lavora-in-edilizia" element={<LavoraInEdilizia />} />
              <Route path="/registrazione-candidato" element={<RegistrazioneCandidato />} />
              <Route path="/prezzi" element={<Prezzi />} />
              <Route path="/chi-siamo" element={<ChiSiamo />} />
              <Route path="/contatti" element={<Contatti />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/guide/:slug" element={<GuidaDettaglio />} />
              <Route path="/garanzia" element={<Garanzia />} />
              <Route path="/privacy-policy" element={<Legal />} />
              <Route path="/cookie-policy" element={<Legal />} />
              <Route path="/termini-e-condizioni" element={<Legal />} />
            </Routes>
          </SiteLayout>
        </StaticRouter>
      </TooltipProvider>
    </SeoCollectorContext.Provider>
  );

  return { html, seo: get() };
}
