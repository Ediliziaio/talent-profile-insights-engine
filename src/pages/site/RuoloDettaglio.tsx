import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, HelpCircle, Target, TriangleAlert } from 'lucide-react';
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
import { breadcrumbLd, faqLd, webPageLd } from '@/lib/seo';
import { RUOLI, getRuolo } from '@/data/ruoli';

export default function RuoloDettaglio() {
  const { slug } = useParams<{ slug: string }>();
  const ruolo = getRuolo(slug);

  const jsonLd = useMemo(() => {
    if (!ruolo) return [];
    const path = `/ruoli/${ruolo.slug}`;
    return [
      webPageLd({ name: ruolo.metaTitle, description: ruolo.metaDescription, path }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Ruoli', path: '/ruoli' },
        { name: ruolo.nome, path },
      ]),
      faqLd(ruolo.faq),
    ];
  }, [ruolo]);

  if (!ruolo) return <Navigate to="/ruoli" replace />;

  const path = `/ruoli/${ruolo.slug}`;
  const correlati = RUOLI.filter((r) => r.slug !== ruolo.slug).slice(0, 3);

  return (
    <>
      <Seo title={ruolo.metaTitle} description={ruolo.metaDescription} path={path} jsonLd={jsonLd} />

      <PageHero
        eyebrow={`Ruolo · ${ruolo.categoria}`}
        title={
          <>
            Come selezionare un{' '}
            <span className="text-[#f09133]">{ruolo.nome.toLowerCase()}</span>
          </>
        }
        intro={<p>{ruolo.sintesi}</p>}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Ruoli', to: '/ruoli' }, { label: ruolo.nome }]}
        primaryCta={{ label: `Analizza un ${ruolo.nome.toLowerCase()}`, to: '/contatti' }}
        secondaryCta={{ label: 'Cerca nella Banca Talenti', to: '/banca-talenti' }}
      />

      <DefinitionBlock
        question={`Che cosa fa un ${ruolo.nome.toLowerCase()} e come si valuta?`}
        answer={<p>{ruolo.definizione}</p>}
      />

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Tratti chiave"
            title={`I tratti che pesano di più su un ${ruolo.nome.toLowerCase()}`}
            sub="Il Talent Profile System misura 15 tratti, ma su questo ruolo il matching li pesa così."
          />
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={stagger}>
            {ruolo.tratti.map((t, i) => (
              <motion.div
                key={t.nome}
                className="landing-card rounded-xl border border-[#e5e0db] p-5 flex gap-4"
                variants={fadeUp}
                transition={cardTransition}
              >
                <div className="w-9 h-9 shrink-0 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{t.nome}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{t.perche}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-8 items-start">
          <div className="rounded-xl border-l-4 border-red-500 bg-red-50/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TriangleAlert className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Segnali di rischio</h2>
            </div>
            <ul className="space-y-3">
              {ruolo.rischi.map((r) => (
                <li key={r} className="text-sm text-[#3d3935] flex gap-2.5 leading-relaxed">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-l-4 border-[#f09133] bg-[#fef9c3]/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-[#f09133]" />
              <h2 className="text-xl font-bold">L’errore tipico</h2>
            </div>
            <p className="text-[#3d3935] leading-relaxed">{ruolo.erroreTipico}</p>
          </div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Colloquio"
            title={`Domande da fare a un ${ruolo.nome.toLowerCase()}`}
            sub="Queste sono domande generali sul ruolo. Nel report il sistema genera quelle su misura per il singolo candidato, a partire dai suoi punti deboli."
          />
          <motion.ol className="space-y-3" variants={stagger}>
            {ruolo.domande.map((d, i) => (
              <motion.li
                key={d}
                className="landing-card rounded-xl border border-[#e5e0db] p-5 flex gap-4"
                variants={fadeUp}
                transition={cardTransition}
              >
                <HelpCircle className="h-5 w-5 text-[#f09133] shrink-0 mt-0.5" />
                <p className="text-[#3d3935] leading-relaxed">
                  <span className="font-semibold text-[#1a1a2e] mr-1">{i + 1}.</span>
                  {d}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </Section>

      <FaqSection faq={ruolo.faq} title={`Domande frequenti · ${ruolo.nome}`} />

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading badge="Altri ruoli" title="Continua con questi" as="h2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {correlati.map((r) => (
              <Link
                key={r.slug}
                to={`/ruoli/${r.slug}`}
                className="landing-card rounded-xl border border-[#e5e0db] p-6 block"
              >
                <Target className="h-6 w-6 text-[#f09133] mb-3" />
                <h3 className="font-bold text-base mb-2">{r.nome}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-3">{r.sintesi}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1e3a5f]">
                  Apri <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand
        title={`Devi assumere un ${ruolo.nome.toLowerCase()}?`}
        sub="Possiamo analizzare i candidati che hai già, cercarne di nuovi nella Banca Talenti o gestire noi tutta la selezione."
        ctaLabel="Parliamone"
        origine={`ruolo-${ruolo.slug}`}
      />
    </>
  );
}
