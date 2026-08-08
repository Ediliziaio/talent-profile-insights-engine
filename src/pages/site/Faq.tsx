import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section, PageHero, CtaBand } from '@/components/site/sections';
import { breadcrumbLd, faqLd, webPageLd } from '@/lib/seo';
import { FAQ_GRUPPI, TUTTE_LE_FAQ } from '@/data/faq';

const PATH = '/faq';

export default function Faq() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Domande frequenti — Talenti Edili',
        description:
          'Tutte le risposte su Talenti Edili: come funziona l’analisi psicoattitudinale, che ruolo ha l’Intelligenza Artificiale, quanto costa, come sono trattati i dati.',
        path: PATH,
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Domande frequenti', path: PATH },
      ]),
      faqLd(TUTTE_LE_FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Domande frequenti — Talenti Edili"
        description="Come funziona Talenti Edili, che cos’è il Talent Profile System, quanto dura l’analisi psicoattitudinale, quanto costa e come sono tutelati i dati dei candidati."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Tutte le risposte,{' '}
            <span className="text-[#f09133]">senza girarci intorno.</span>
          </>
        }
        intro={
          <p>
            {TUTTE_LE_FAQ.length} domande raccolte parlando con imprenditori edili, responsabili del
            personale e candidati. Se la tua non c’è, scrivici: rispondiamo entro 24 ore.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Domande frequenti' }]}
        primaryCta={{ label: 'Fai la tua domanda', to: '/contatti' }}
      >
        <nav aria-label="Indice delle domande" className="flex flex-wrap gap-2 mt-8">
          {FAQ_GRUPPI.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="text-xs text-white/70 bg-white/[0.07] border border-white/10 rounded-full px-3 py-1.5 hover:text-[#f09133] hover:border-[#f09133]/40 transition-colors"
            >
              {g.titolo}
            </a>
          ))}
        </nav>
      </PageHero>

      {FAQ_GRUPPI.map((gruppo, gi) => (
        <Section
          key={gruppo.id}
          id={gruppo.id}
          className={gi % 2 === 0 ? 'py-14 md:py-16 bg-white' : 'py-14 md:py-16 bg-[#f7f4f0]'}
        >
          <div className="max-w-3xl mx-auto px-4 md:px-8 scroll-mt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-7">
              <h2 className="text-2xl md:text-3xl font-bold">{gruppo.titolo}</h2>
              {gruppo.approfondimento && (
                <Link
                  to={gruppo.approfondimento.to}
                  className="text-sm font-semibold text-[#1e3a5f] hover:text-[#f09133] transition-colors"
                >
                  {gruppo.approfondimento.label} →
                </Link>
              )}
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {gruppo.domande.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`${gruppo.id}-${i}`}
                  className="border border-[#e5e0db] rounded-lg px-5 py-1 bg-white hover:border-[#f09133]/40 hover:shadow-md transition-all duration-300 data-[state=open]:border-l-4 data-[state=open]:border-l-[#f09133]"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent forceMount className="text-[#6b7280] text-base leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      ))}

      <CtaBand
        title="Non hai trovato la risposta?"
        sub="Scrivici la domanda: risponde una persona che conosce l’edilizia, non un chatbot."
        ctaLabel="Fai la tua domanda"
        origine="faq"
      />
    </>
  );
}
