import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
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
import { GUIDE } from '@/data/guide';

const PATH = '/guide';

export default function Guide() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Guide per imprese edili — selezione e gestione del personale',
        description:
          'Guide pratiche su turnover in cantiere, costo degli errori di selezione e conduzione dei colloqui in edilizia.',
        path: PATH,
      }),
      itemListLd({
        name: 'Guide Talenti Edili',
        path: PATH,
        items: GUIDE.map((g) => ({
          name: g.titolo,
          path: `/guide/${g.slug}`,
          description: g.metaDescription,
        })),
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Guide', path: PATH },
      ]),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Guide per chi assume in edilizia | Talenti Edili"
        description="Guide pratiche per chi assume in edilizia: ridurre il turnover in cantiere, il costo reale di un'assunzione sbagliata, il colloquio che funziona."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Guide"
        title={
          <>
            Quello che abbiamo imparato{' '}
            <span className="text-[#f09133]">parlando con chi assume in cantiere.</span>
          </>
        }
        intro={
          <p>
            Guide pratiche, senza teoria da manuale HR. Perché le persone se ne vanno, quanto costa
            davvero sbagliare un’assunzione e come si conduce un colloquio che produca informazione
            invece che impressioni.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Guide' }]}
        primaryCta={{ label: 'Parla con noi', to: '/contatti' }}
        secondaryCta={{ label: 'Vedi i ruoli', to: '/ruoli' }}
      />

      <DefinitionBlock
        question="A chi servono queste guide?"
        answer={
          <p>
            A chi in un’impresa edile decide sulle persone: titolari che assumono in prima persona,
            responsabili del personale, direttori tecnici e capicantiere che compongono le squadre.
            Ogni guida parte da un problema concreto — il turnover, il costo di un errore, il colloquio
            — e arriva a cosa fare lunedì mattina, non a un modello teorico.
          </p>
        }
      />

      <Section className="py-12 md:py-16 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={stagger}>
            {GUIDE.map((g) => (
              <motion.article key={g.slug} variants={fadeUp} transition={cardTransition}>
                <Link
                  to={`/guide/${g.slug}`}
                  className="landing-card rounded-xl border border-[#e5e0db] p-6 h-full flex flex-col"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-on-light)]">
                    {g.categoria}
                  </span>
                  <h2 className="text-xl font-bold mt-2 mb-3">{g.titolo}</h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-4 flex-1">
                    {g.metaDescription}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] mb-3">
                    <Clock className="h-3 w-3" /> {g.tempoLettura} di lettura
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f]">
                    Leggi la guida <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </Section>

      <CtaBand
        title="Hai un problema che nessuna guida risolve?"
        sub="Raccontacelo. Mezz’ora di confronto sul tuo caso, senza presentazioni commerciali."
        ctaLabel="Parliamone"
        origine="guide"
      />
    </>
  );
}
