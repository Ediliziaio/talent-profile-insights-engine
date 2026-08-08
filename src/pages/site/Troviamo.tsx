import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import {
  Section,
  PageHero,
  DefinitionBlock,
  CtaBand,
  fadeUp,
  stagger,
  cardTransition,
} from '@/components/site/sections';
import { breadcrumbLd, itemListLd, webPageLd } from '@/lib/seo';
import { SELEZIONI } from '@/data/selezioni';

const PATH = '/troviamo';

export default function Troviamo() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Chi ti troviamo — ricerca e selezione per categoria',
        description:
          'Venditori, amministrativi, capicantiere, operai specializzati, tecnici e preventivisti: il servizio di ricerca e selezione di Talenti Edili, categoria per categoria.',
        path: PATH,
      }),
      itemListLd({
        name: 'Categorie di ricerca e selezione Talenti Edili',
        path: PATH,
        items: SELEZIONI.map((s) => ({
          name: s.h1,
          path: `/troviamo/${s.slug}`,
          description: s.metaDescription,
        })),
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Ricerca e Selezione', path: '/ricerca-e-selezione-personale-edile' },
        { name: 'Chi ti troviamo', path: PATH },
      ]),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Chi ti troviamo — venditori, amministrativi, capicantiere e altri | Talenti Edili"
        description="Il servizio di ricerca e selezione di Talenti Edili per categoria: venditori, amministrativi, capicantiere e capisquadra, operai specializzati, geometri e tecnici, preventivisti."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Ricerca e selezione"
        title={
          <>
            Dicci chi ti manca.{' '}
            <span className="text-[#f09133]">Al resto pensiamo noi.</span>
          </>
        }
        intro={
          <p>
            Ogni figura di un’impresa edile si cerca in un modo diverso: il capocantiere non risponde
            agli annunci, il venditore supera qualsiasi colloquio, l’amministrativo “preciso” lo
            scopri dopo tre mesi. Per questo il servizio è organizzato per categoria — stesso metodo,
            criteri diversi.
          </p>
        }
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Ricerca e Selezione', to: '/ricerca-e-selezione-personale-edile' },
          { label: 'Chi ti troviamo' },
        ]}
        primaryCta={{ label: 'Raccontaci chi cerchi', to: '/contatti' }}
        secondaryCta={{ label: 'Come lavoriamo', to: '/ricerca-e-selezione-personale-edile' }}
      />

      <DefinitionBlock
        question="Quali figure trova Talenti Edili?"
        answer={
          <p>
            Il servizio di ricerca e selezione copre tutte le figure di un’impresa edile, organizzate
            in sei categorie: <strong>venditori e commerciali</strong>,{' '}
            <strong>amministrativi e contabilità di cantiere</strong>,{' '}
            <strong>capicantiere e capisquadra</strong>, <strong>operai specializzati</strong>,{' '}
            <strong>geometri e tecnici</strong> e <strong>preventivisti</strong>. Per ognuna il
            processo è lo stesso — ricerca attiva, verifica delle esperienze, analisi
            psicoattitudinale Talent Profile, rosa di tre finalisti in 21 giorni — ma i criteri di
            valutazione cambiano: su un venditore misuriamo la tenuta al rifiuto, su un
            amministrativo la precisione sotto scadenza, su un capocantiere la decisione sotto
            pressione.
          </p>
        }
      />

      <Section className="py-12 md:py-16 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={stagger}>
            {SELEZIONI.map((s) => (
              <motion.article key={s.slug} variants={fadeUp} transition={cardTransition}>
                <Link
                  to={`/troviamo/${s.slug}`}
                  className="landing-card rounded-xl border border-[#e5e0db] p-6 h-full flex flex-col"
                >
                  <h2 className="text-xl font-bold mb-2">{s.h1}</h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-4 flex-1">{s.intro}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {s.figureTipiche.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="text-[11px] bg-[#f7f4f0] border border-[#e5e0db] rounded-full px-2.5 py-1 text-[#3d3935]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f]">
                    Come li troviamo <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </Section>

      <CtaBand
        title="La figura che cerchi non rientra in queste categorie?"
        sub="Descrivici il ruolo reale: ti diciamo subito se possiamo coprirlo, con che tempi e a che condizioni."
        ctaLabel="Parliamone"
        origine="troviamo-hub"
      />
    </>
  );
}
