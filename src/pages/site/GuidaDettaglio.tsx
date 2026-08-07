import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Clock, Lightbulb } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section, PageHero, FaqSection, CtaBand } from '@/components/site/sections';
import { articleLd, breadcrumbLd, faqLd, webPageLd } from '@/lib/seo';
import { GUIDE, getGuida } from '@/data/guide';
import { getRuolo } from '@/data/ruoli';

export default function GuidaDettaglio() {
  const { slug } = useParams<{ slug: string }>();
  const guida = getGuida(slug);

  const jsonLd = useMemo(() => {
    if (!guida) return [];
    const path = `/guide/${guida.slug}`;
    return [
      webPageLd({ name: guida.metaTitle, description: guida.metaDescription, path }),
      articleLd({
        headline: guida.h1,
        description: guida.metaDescription,
        path,
        datePublished: guida.pubblicata,
        section: guida.categoria,
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Guide', path: '/guide' },
        { name: guida.titolo, path },
      ]),
      faqLd(guida.faq),
    ];
  }, [guida]);

  if (!guida) return <Navigate to="/guide" replace />;

  const correlate = GUIDE.filter((g) => g.slug !== guida.slug);
  const ruoli = guida.ruoliCorrelati.map(getRuolo).filter(Boolean);

  return (
    <>
      <Seo
        title={guida.metaTitle}
        description={guida.metaDescription}
        path={`/guide/${guida.slug}`}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow={guida.categoria}
        title={guida.h1}
        intro={
          <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
            <Clock className="h-4 w-4" /> {guida.tempoLettura} di lettura
          </span>
        }
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Guide', to: '/guide' },
          { label: guida.titolo },
        ]}
      />

      {/* Risposta breve: il blocco che i motori generativi citano prima dello sviluppo lungo */}
      <Section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="rounded-xl border-l-4 border-[#f09133] bg-[#fef9c3]/40 p-6 md:p-7">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-[#f09133]" />
              <h2 className="text-lg font-bold">In breve</h2>
            </div>
            <p className="text-[#3d3935] leading-relaxed text-lg">{guida.sommario}</p>
          </div>
        </div>
      </Section>

      <Section className="pb-8 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <nav aria-label="Indice della guida" className="rounded-xl border border-[#e5e0db] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] mb-3">
              In questa guida
            </h2>
            <ol className="space-y-1.5">
              {guida.sezioni.map((s, i) => (
                <li key={s.titolo}>
                  <a
                    href={`#sezione-${i + 1}`}
                    className="text-sm text-[#1e3a5f] hover:text-[#f09133] transition-colors"
                  >
                    {i + 1}. {s.titolo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </Section>

      <Section className="py-8 md:py-12 bg-white">
        <article className="max-w-3xl mx-auto px-4 md:px-8">
          {guida.sezioni.map((s, i) => (
            <section key={s.titolo} id={`sezione-${i + 1}`} className="mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-5">{s.titolo}</h2>
              <div className="space-y-4">
                {s.paragrafi.map((p) => (
                  <p key={p} className="text-[#3d3935] leading-relaxed text-lg">
                    {p}
                  </p>
                ))}
              </div>
              {s.elenco && (
                <ul className="mt-5 space-y-3">
                  {s.elenco.map((e) => (
                    <li key={e} className="flex gap-3 text-[#3d3935] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f09133] shrink-0 mt-2.5" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </Section>

      {ruoli.length > 0 && (
        <Section className="py-12 md:py-16 bg-[#f7f4f0]">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-6">Ruoli di cui parla questa guida</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ruoli.map((r) => (
                <Link
                  key={r!.slug}
                  to={`/ruoli/${r!.slug}`}
                  className="landing-card rounded-xl border border-[#e5e0db] p-5 block"
                >
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

      <FaqSection faq={guida.faq} title="Domande frequenti" />

      <Section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-6">Altre guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {correlate.map((g) => (
              <Link
                key={g.slug}
                to={`/guide/${g.slug}`}
                className="landing-card rounded-xl border border-[#e5e0db] p-5 block"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-orange-on-light)]">
                  {g.categoria}
                </span>
                <h3 className="font-bold text-base mt-1 mb-2">{g.titolo}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a5f]">
                  Leggi <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand
        title="Vuoi applicarlo alla tua impresa?"
        sub="Mezz’ora di confronto sul tuo caso reale: ti diciamo dove si rompe il tuo processo di selezione."
        ctaLabel="Prenota una chiamata"
        origine={`guida-${guida.slug}`}
      />
    </>
  );
}
