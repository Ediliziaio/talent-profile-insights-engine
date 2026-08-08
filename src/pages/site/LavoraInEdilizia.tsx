import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Eye, Lock, Gift, Compass, TrendingUp } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Section,
  SectionHeading,
  PageHero,
  DefinitionBlock,
  FaqSection,
  fadeUp,
  stagger,
  cardTransition,
} from '@/components/site/sections';
import { breadcrumbLd, faqLd, webPageLd } from '@/lib/seo';
import { RUOLI } from '@/data/ruoli';

const PATH = '/lavora-in-edilizia';

const VANTAGGI = [
  {
    icon: Gift,
    title: 'È gratis, per sempre',
    desc: 'Non paghi niente, né ora né quando trovi lavoro. Le imprese pagano per accedere ai profili: tu no.',
  },
  {
    icon: Smartphone,
    title: '15 minuti dal telefono',
    desc: '242 domande in italiano semplice. Nessun test tecnico, nessun computer, nessun appuntamento da prendere.',
  },
  {
    icon: Compass,
    title: 'Scopri per cosa sei fatto',
    desc: 'Ricevi il tuo profilo: in quali ruoli renderesti di più, cosa ti motiva davvero e dove rischi di bruciarti.',
  },
  {
    icon: Eye,
    title: 'Ti vedono le imprese giuste',
    desc: 'Non finisci in una pila di curriculum. Le imprese ti trovano perché sei compatibile con il ruolo che stanno cercando.',
  },
  {
    icon: Lock,
    title: 'Decidi tu chi ti vede',
    desc: 'Il tuo profilo è anonimo finché non autorizzi. I tuoi contatti li vede solo l’impresa che sblocchi tu.',
  },
  {
    icon: TrendingUp,
    title: 'Vale anche se non cerchi lavoro',
    desc: 'Molti lo fanno per capire se sono nel ruolo giusto dove sono già, o cosa serve per fare il salto a capisquadra.',
  },
];

const FAQ = [
  {
    q: 'Registrarsi come candidato costa qualcosa?',
    a: 'No, ed è gratuito anche dopo. Talenti Edili è pagato dalle imprese che cercano personale: il candidato non paga né per l’analisi psicoattitudinale né per essere contattato.',
  },
  {
    q: 'Che cos’è l’analisi psicoattitudinale e perché dovrei farla?',
    a: 'Sono 242 domande su come lavori, come reagisci sotto pressione e cosa ti motiva. Ti restituisce il tuo profilo su 15 tratti e ti dice in quali ruoli edili renderesti di più. Serve a te per capirti e alle imprese per non metterti nel posto sbagliato.',
  },
  {
    q: 'Quanto dura?',
    a: 'Circa 15 minuti, dal telefono. Non serve prepararsi e non ci sono risposte giuste o sbagliate: le domande sono costruite proprio per rendere inutile rispondere "come vorrebbero sentirsi dire".',
  },
  {
    q: 'Il mio datore di lavoro attuale può vedere il mio profilo?',
    a: 'Solo se lo autorizzi tu. Il profilo compare in forma anonima e puoi escludere singole imprese dalla visibilità. I tuoi dati di contatto vengono mostrati solo quando un’impresa sblocca il profilo e tu accetti il contatto.',
  },
  {
    q: 'Riceverò il mio report?',
    a: 'Sì. Al termine dell’analisi ricevi il tuo profilo con i punti di forza, le aree su cui lavorare e i ruoli in cui saresti più compatibile. È tuo, indipendentemente da quello che succede con le imprese.',
  },
  {
    q: 'Che lavori posso trovare?',
    a: 'Ruoli di cantiere (muratore, carpentiere, ferraiolo, gruista, capisquadra, capocantiere), ruoli tecnici (geometra, project manager, responsabile sicurezza) e ruoli di ufficio tecnico e amministrativo delle imprese edili.',
  },
];

export default function LavoraInEdilizia() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Lavora in edilizia — registrati gratis su Talenti Edili',
        description:
          'Fai l’analisi psicoattitudinale gratuita in 15 minuti, scopri per quali ruoli edili sei più adatto e fatti trovare dalle imprese giuste.',
        path: PATH,
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Lavora in edilizia', path: PATH },
      ]),
      faqLd(FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Lavoro in edilizia: registrati gratis | Talenti Edili"
        description="Fai l’analisi psicoattitudinale gratuita in 15 minuti dal telefono, scopri in quali ruoli rendi di più e fatti trovare dalle imprese giuste."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Per chi cerca lavoro"
        title={
          <>
            Non mandare l’ennesimo curriculum.{' '}
            <span className="text-[#f09133]">Fatti trovare per quello che sai fare.</span>
          </>
        }
        intro={
          <p>
            Quindici minuti dal telefono, gratis. Scopri in quali ruoli edili rendi di più e finisci
            nell’archivio che le imprese consultano quando cercano una persona come te — non in una pila
            di curriculum.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Lavora in edilizia' }]}
        primaryCta={{ label: 'Registrati gratis', to: '/registrazione-candidato' }}
        secondaryCta={{ label: 'Vedi i ruoli', to: '/ruoli' }}
      />

      <DefinitionBlock
        question="Come funziona per chi cerca lavoro?"
        answer={
          <p>
            Ti registri gratuitamente e completi l’<strong>analisi psicoattitudinale Talent Profile</strong>:
            242 domande in italiano semplice, circa 15 minuti, dal telefono. Ricevi il tuo profilo su 15
            tratti con i ruoli edili in cui saresti più compatibile. Da quel momento il tuo profilo è
            consultabile in forma anonima dalle imprese iscritte: quando una cerca un ruolo compatibile
            con il tuo, ti trova. I tuoi dati di contatto restano nascosti finché non sei tu ad
            autorizzare il contatto. Per il candidato il servizio è e resta gratuito.
          </p>
        }
      />

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading badge="Perché farlo" title="Cosa ci guadagni tu" />
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={stagger}>
            {VANTAGGI.map((v) => (
              <motion.div
                key={v.title}
                className="landing-card rounded-xl border border-[#e5e0db] p-6"
                variants={fadeUp}
                transition={cardTransition}
              >
                <v.icon className="h-8 w-8 text-[#f09133] mb-3" />
                <h3 className="font-bold text-base mb-2">{v.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Ruoli"
            title="Per quali ruoli ti possiamo profilare"
            sub="Dai mestieri di cantiere ai ruoli tecnici e di ufficio: oltre 30 posizioni tipiche di un’impresa edile."
          />
          <div className="flex flex-wrap justify-center gap-2">
            {RUOLI.map((r) => (
              <span
                key={r.slug}
                className="text-sm bg-[#f7f4f0] border border-[#e5e0db] rounded-full px-4 py-1.5 text-[#3d3935]"
              >
                {r.nome}
              </span>
            ))}
            <span className="text-sm bg-[#1e3a5f] text-white rounded-full px-4 py-1.5">e altri 20+</span>
          </div>
        </div>
      </Section>

      <FaqSection
        faq={FAQ}
        title="Domande frequenti dei candidati"
        sub="Costi, privacy, tempi e cosa ricevi in cambio."
      />

      {/* CTA finale: qui il pubblico è il candidato, non l'impresa — niente
          form lead aziendale, si va dritti alla registrazione gratuita. */}
      <Section className="px-4 md:px-8 py-8">
        <div
          className="py-16 md:py-20 max-w-7xl mx-auto relative overflow-hidden rounded-[1.5rem] text-center"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a4f7a 0%, #1e3a5f 60%, #162d4a 100%)' }}
        >
          <div className="max-w-2xl mx-auto px-4 md:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Quindici minuti, e sai per cosa sei fatto
            </h2>
            <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
              Ti registri gratis, fai l’analisi dal telefono e decidi tu se essere visibile alle
              imprese. Nessun costo, ora né mai.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-10 h-12 font-semibold shadow-[0_4px_20px_rgba(240,145,51,0.4)]"
            >
              <Link to="/registrazione-candidato">Registrati gratis</Link>
            </Button>
            <p className="text-xs text-white/70 mt-4">
              Hai già un account?{' '}
              <Link to="/auth" className="underline hover:text-[#f09133]">
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
