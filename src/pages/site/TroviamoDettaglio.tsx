import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle2, Target, Users } from 'lucide-react';
import { Seo } from '@/components/Seo';
import {
  Section,
  SectionHeading,
  PageHero,
  DefinitionBlock,
  FaqSection,
  CtaBand,
  fadeUp,
  stagger,
  cardTransition,
} from '@/components/site/sections';
import { breadcrumbLd, faqLd, serviceLd, webPageLd } from '@/lib/seo';
import { SELEZIONI, getSelezione } from '@/data/selezioni';
import { getRuolo } from '@/data/ruoli';

const CONSEGNA = [
  'I 3 candidati migliori entro 21 giorni dalla prima chiamata',
  'Report psicoattitudinale completo per ciascuno',
  'Verifica di esperienze e referenze dichiarate',
  'Guida al colloquio generata sul profilo di ognuno',
  'Piano di inserimento per i primi 90 giorni',
  'Garanzia di sostituzione nel periodo concordato',
];

export default function TroviamoDettaglio() {
  const { slug } = useParams<{ slug: string }>();
  const categoria = getSelezione(slug);

  const jsonLd = useMemo(() => {
    if (!categoria) return [];
    const path = `/troviamo/${categoria.slug}`;
    return [
      webPageLd({ name: categoria.metaTitle, description: categoria.metaDescription, path }),
      serviceLd({
        name: categoria.h1,
        serviceType: `Ricerca e selezione ${categoria.nomeBreve} per il settore edile`,
        description: categoria.definizione,
        path,
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Ricerca e Selezione', path: '/ricerca-e-selezione-personale-edile' },
        { name: categoria.h1, path },
      ]),
      faqLd(categoria.faq),
    ];
  }, [categoria]);

  if (!categoria) return <Navigate to="/ricerca-e-selezione-personale-edile" replace />;

  const ruoli = categoria.ruoliCorrelati.map(getRuolo).filter(Boolean);
  const altre = SELEZIONI.filter((s) => s.slug !== categoria.slug);

  return (
    <>
      <Seo
        title={categoria.metaTitle}
        description={categoria.metaDescription}
        path={`/troviamo/${categoria.slug}`}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Ricerca e selezione"
        title={
          <>
            {(() => {
              // "Troviamo i venditori…" → "I venditori… li troviamo noi."
              const resto = categoria.h1.replace(/^Troviamo\s+/, '');
              return resto.charAt(0).toUpperCase() + resto.slice(1);
            })()}
            <span className="text-[#f09133]"> li troviamo noi.</span>
          </>
        }
        intro={<p>{categoria.intro}</p>}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Ricerca e Selezione', to: '/ricerca-e-selezione-personale-edile' },
          { label: categoria.h1 },
        ]}
        primaryCta={{ label: 'Raccontaci chi cerchi', to: '/contatti' }}
        secondaryCta={{ label: 'Come lavoriamo', to: '/ricerca-e-selezione-personale-edile' }}
      >
        <div className="flex flex-wrap gap-2 mt-8">
          {categoria.figureTipiche.slice(0, 5).map((f) => (
            <span
              key={f}
              className="text-xs text-white/70 bg-white/[0.07] border border-white/10 rounded-full px-3 py-1"
            >
              {f}
            </span>
          ))}
        </div>
      </PageHero>

      <DefinitionBlock
        question={`Come funziona la ricerca di ${categoria.nomeBreve} con Talenti Edili?`}
        answer={<p>{categoria.definizione}</p>}
      />

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Il problema"
            title={`Perché trovare ${categoria.nomeBreve} è così difficile`}
          />
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={stagger}>
            {categoria.difficolta.map((d) => (
              <motion.div
                key={d.titolo}
                className="landing-card rounded-xl border border-[#e5e0db] p-6"
                variants={fadeUp}
                transition={cardTransition}
              >
                <AlertTriangle className="h-7 w-7 text-[#f09133] mb-3" />
                <h3 className="font-bold text-lg mb-2">{d.titolo}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{d.testo}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Il metodo"
            title={`Come selezioniamo ${categoria.nomeBreve}`}
            sub="Ricerca attiva, verifica delle esperienze e analisi psicoattitudinale Talent Profile su ognuno dei 3 candidati. Ecco cosa cambia per questa categoria."
          />
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={stagger}>
            {categoria.comeSelezioniamo.map((c, i) => (
              <motion.div
                key={c.titolo}
                className="landing-card rounded-xl border border-[#e5e0db] p-6 flex gap-4"
                variants={fadeUp}
                transition={cardTransition}
              >
                <div className="w-9 h-9 shrink-0 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1.5">{c.titolo}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{c.testo}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <span className="section-badge mb-4 inline-block">Le figure</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-5">Chi ti troviamo</h2>
            <div className="flex flex-wrap gap-2">
              {categoria.figureTipiche.map((f) => (
                <span
                  key={f}
                  className="text-sm bg-white border border-[#e5e0db] rounded-full px-4 py-1.5 text-[#3d3935]"
                >
                  {f}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#6b7280] mt-5 leading-relaxed">
              La figura che cerchi non è in elenco? Il metodo si adatta:{' '}
              <Link to="/contatti" className="font-semibold text-[#1e3a5f] hover:text-[#f09133]">
                descrivici il ruolo
              </Link>{' '}
              e ti diciamo subito se possiamo coprirlo.
            </p>
          </div>

          <div className="landing-card rounded-xl border border-[#e5e0db] p-7">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#f09133]" /> Cosa ricevi
            </h2>
            <ul className="space-y-3">
              {CONSEGNA.map((c) => (
                <li key={c} className="flex gap-3 text-sm text-[#3d3935]">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {ruoli.length > 0 && (
        <Section className="py-14 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-6">Approfondisci i ruoli</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ruoli.map((r) => (
                <Link
                  key={r!.slug}
                  to={`/ruoli/${r!.slug}`}
                  className="landing-card rounded-xl border border-[#e5e0db] p-5 block"
                >
                  <Target className="h-6 w-6 text-[#f09133] mb-2.5" />
                  <h3 className="font-bold text-base mb-2">{r!.nome}</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed mb-3">{r!.sintesi}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a5f]">
                    Come si seleziona <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      <FaqSection
        faq={categoria.faq}
        title={`Domande frequenti — ${categoria.nomeBreve}`}
      />

      <Section className="py-14 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-6">Cerchi un’altra figura?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {altre.map((s) => (
              <Link
                key={s.slug}
                to={`/troviamo/${s.slug}`}
                className="landing-card rounded-xl border border-[#e5e0db] p-5 block"
              >
                <h3 className="font-bold text-base mb-1.5">{s.h1}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a5f]">
                  Scopri come <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand
        title={`Devi assumere ${categoria.nomeBreve}?`}
        sub="Mezz’ora di chiamata sul ruolo reale: ti diciamo tempi, fattibilità e costo prima di partire. Senza impegno."
        ctaLabel="Inizia la ricerca"
        origine={`troviamo-${categoria.slug}`}
      />
    </>
  );
}
