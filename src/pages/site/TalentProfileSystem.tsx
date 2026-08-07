import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Send,
  ClipboardCheck,
  Lightbulb,
  BarChart3,
  FileText,
  ShieldCheck,
  Compass,
  Hammer,
  Wallet,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import {
  Section,
  SectionHeading,
  PageHero,
  DefinitionBlock,
  FaqSection,
  CtaBand,
  AltriServizi,
  fadeUp,
  stagger,
  cardTransition,
} from '@/components/site/sections';
import { breadcrumbLd, faqLd, howToLd, serviceLd, webPageLd } from '@/lib/seo';

const PATH = '/talent-profile-system';

const AREE = [
  {
    icon: Compass,
    nome: 'Essere',
    desc: 'Chi è la persona a prescindere dal lavoro: stabilità emotiva, principi, tenuta sotto pressione, immagine di sé.',
    esempi: ['Stabilità emotiva', 'Autostima', 'Principi e coerenza', 'Gestione dello stress', 'Apertura'],
  },
  {
    icon: Hammer,
    nome: 'Fare',
    desc: 'Come lavora: metodo, precisione, autonomia, capacità di decidere e di portare a termine.',
    esempi: ['Disciplina', 'Precisione', 'Autonomia', 'Decisione', 'Orientamento al risultato'],
  },
  {
    icon: Wallet,
    nome: 'Avere',
    desc: 'Cosa costruisce intorno a sé: relazioni, leadership, gestione delle risorse, risultati accumulati.',
    esempi: ['Leadership', 'Empatia', 'Collaborazione', 'Gestione risorse', 'Storia professionale'],
  },
];

const STEPS = [
  {
    icon: Send,
    title: 'Mandi il link al candidato',
    desc: 'Dalla dashboard generi un link unico e lo mandi su WhatsApp o via email. Nessuna installazione, nessun appuntamento da fissare.',
  },
  {
    icon: ClipboardCheck,
    title: 'Il candidato fa l’analisi psicoattitudinale',
    desc: '242 domande in italiano semplice, circa 15 minuti, da telefono o PC. Le domande sono costruite in modo che non ci si possa preparare né barare.',
  },
  {
    icon: Brain,
    title: 'L’Intelligenza Artificiale elabora il profilo',
    desc: 'L’AI calcola i 15 tratti, li incrocia con oltre 30 ruoli edili e genera il report in tempo reale: compatibilità, rischi, indicazioni di gestione.',
  },
  {
    icon: Lightbulb,
    title: 'Decidi con i dati in mano',
    desc: 'Guida al colloquio su misura, confronto fino a 4 candidati e piano di inserimento a 90 giorni per la persona che scegli.',
  },
];

const OUTPUT = [
  {
    icon: BarChart3,
    title: 'Profilo su 15 tratti',
    desc: 'Punteggi su tre aree — Essere, Fare, Avere — con la lettura discorsiva di cosa significano per il lavoro quotidiano.',
  },
  {
    icon: Compass,
    title: 'Compatibilità di ruolo',
    desc: 'Punteggio di fit su oltre 30 ruoli di cantiere e ufficio tecnico, con il ruolo in cui quella persona renderebbe di più.',
  },
  {
    icon: ShieldCheck,
    title: 'Aree di rischio',
    desc: 'Le dinamiche che al colloquio non emergono: rigidità, conflittualità, tenuta sotto pressione, sindromi comportamentali.',
  },
  {
    icon: Lightbulb,
    title: 'Guida al colloquio',
    desc: 'Domande generate sui punti deboli specifici di quel candidato, non un elenco standard uguale per tutti.',
  },
  {
    icon: Sparkles,
    title: 'Indicazioni di gestione',
    desc: 'Come motivarlo, come dargli un feedback, cosa lo manda in crisi. Utile tanto in selezione quanto sulle persone già in forza.',
  },
  {
    icon: FileText,
    title: 'Report PDF e piano 90 giorni',
    desc: 'Documento professionale da condividere con il socio o il capocantiere, con il piano di inserimento dei primi tre mesi.',
  },
];

const FAQ = [
  {
    q: 'Che cos’è il Talent Profile System?',
    a: 'Il Talent Profile System è il motore di analisi su cui si basa Talenti Edili. È composto da un questionario psicoattitudinale di 242 domande che misura 15 tratti della persona su tre aree — Essere, Fare, Avere — e da un livello di Intelligenza Artificiale che incrocia il profilo con oltre 30 ruoli aziendali e di cantiere, generando il report in tempo reale.',
  },
  {
    q: 'Che differenza c’è fra analisi psicoattitudinale e test della personalità?',
    a: 'Un test della personalità descrive come sei; un’analisi psicoattitudinale misura come quei tratti si traducono in comportamento sul lavoro e li confronta con i requisiti di un ruolo specifico. Il Talent Profile System fa la seconda cosa: il risultato non è un’etichetta, è un punteggio di compatibilità con il ruolo che devi coprire.',
  },
  {
    q: 'Che ruolo ha esattamente l’Intelligenza Artificiale?',
    a: 'L’AI non inventa il profilo: parte dai punteggi calcolati dal modello psicometrico e li traduce in indicazioni operative — quale ruolo, quali rischi, quali domande fare, come gestire quella persona nei primi 90 giorni. È il livello che sostituisce le ore di lavoro di un consulente nell’interpretazione dei dati.',
  },
  {
    q: 'È validato scientificamente?',
    a: 'Sì. Il Talent Profile System si basa su modelli psicometrici riconosciuti, con un coefficiente di validazione di .75 su 1. Le domande sono costruite per rendere inefficaci le risposte di comodo.',
  },
  {
    q: 'Il candidato può barare?',
    a: 'È molto difficile. Le 242 domande contengono item di controllo incrociati: rispondere in modo strategico su una scala genera incoerenze rilevabili su altre. Il sistema segnala i profili con risposte non coerenti.',
  },
  {
    q: 'Serve una struttura HR per usarlo?',
    a: 'No. È pensato per imprese edili senza ufficio del personale: il report è scritto in linguaggio operativo, non in gergo psicologico, e chiunque in azienda può leggerlo e usarlo.',
  },
  {
    q: 'Posso usarlo sulle persone che ho già in azienda?',
    a: 'Sì, ed è uno degli usi più frequenti: mappare squadre e capisquadra già in forza per capire chi è nel ruolo sbagliato, come gestire ciascuno e su chi investire per farlo crescere.',
  },
  {
    q: 'I dati dei candidati sono al sicuro?',
    a: 'Sì. Tutti i dati sono crittografati e conservati su server europei, nel pieno rispetto del GDPR. Il candidato presta consenso esplicito prima di iniziare l’analisi.',
  },
];

export default function TalentProfileSystem() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Talent Profile System — analisi psicoattitudinale con Intelligenza Artificiale',
        description:
          'Il sistema di analisi psicoattitudinale di Talenti Edili: 242 domande, 15 tratti, report elaborato dall’AI e compatibilità con oltre 30 ruoli edili.',
        path: PATH,
      }),
      serviceLd({
        name: 'Talent Profile System',
        serviceType: 'Analisi psicoattitudinale e assessment del personale',
        description:
          'Questionario psicoattitudinale di 242 domande su 15 tratti, elaborato dall’Intelligenza Artificiale in un report con compatibilità di ruolo, rischi e guida al colloquio.',
        path: PATH,
      }),
      howToLd(STEPS.map((s) => ({ title: s.title, desc: s.desc }))),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Talent Profile System', path: PATH },
      ]),
      faqLd(FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Talent Profile System — analisi psicoattitudinale con AI | Talenti Edili"
        description="Il sistema alla base di Talenti Edili: 242 domande, 15 tratti misurati su tre aree, report elaborato dall’Intelligenza Artificiale con compatibilità su 30+ ruoli edili in 15 minuti."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Il sistema"
        title={
          <>
            Analisi psicoattitudinale e Intelligenza Artificiale.{' '}
            <span className="text-[#f09133]">In quindici minuti.</span>
          </>
        }
        intro={
          <p>
            Il <strong className="text-white">Talent Profile System</strong> misura 15 tratti della
            persona con 242 domande e li fa leggere all’Intelligenza Artificiale, che li traduce in
            decisioni pratiche: quale ruolo, quali rischi, cosa chiedergli al colloquio, come gestirlo
            nei primi 90 giorni.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Talent Profile System' }]}
        primaryCta={{ label: 'Provalo sulla tua impresa', to: '/contatti' }}
        secondaryCta={{ label: 'Vedi i prezzi', to: '/prezzi' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
          {[
            { n: '242', l: 'domande' },
            { n: '15', l: 'tratti misurati' },
            { n: '30+', l: 'ruoli edili' },
            { n: '.75/1', l: 'validazione' },
          ].map((s) => (
            <div key={s.l} className="text-center sm:text-left">
              <div className="text-3xl font-bold text-[#f09133]">{s.n}</div>
              <div className="text-xs text-white/70 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </PageHero>

      <DefinitionBlock
        question="Che cos’è il Talent Profile System?"
        answer={
          <p>
            Il <strong>Talent Profile System</strong> è il motore di analisi su cui si basa Talenti
            Edili. È composto da un <strong>questionario psicoattitudinale di 242 domande</strong> che
            misura 15 tratti della persona su tre aree — Essere, Fare, Avere — e da un livello di{' '}
            <strong>Intelligenza Artificiale</strong> che incrocia il profilo con oltre 30 ruoli
            aziendali e di cantiere, generando in tempo reale un report con compatibilità di ruolo,
            aree di rischio comportamentale, guida al colloquio e piano di inserimento a 90 giorni.
          </p>
        }
      />

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Il modello"
            title="Essere, Fare, Avere: le tre aree misurate"
            sub="Quindici tratti distribuiti su tre aree. Ogni ruolo pesa le aree in modo diverso — per questo la stessa persona può essere compatibile con una posizione e non con un’altra."
          />
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={stagger}>
            {AREE.map((a) => (
              <motion.div
                key={a.nome}
                className="landing-card rounded-xl border border-[#e5e0db] p-6"
                variants={fadeUp}
                transition={cardTransition}
              >
                <a.icon className="h-9 w-9 text-[#f09133] mb-3" />
                <h3 className="font-bold text-xl mb-2">{a.nome}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-4">{a.desc}</p>
                <ul className="space-y-1.5">
                  {a.esempi.map((e) => (
                    <li key={e} className="text-xs text-[#3d3935] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f09133] shrink-0" />
                      {e}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <SectionHeading badge="Come funziona" title="Dal link al report, in quattro passi" />
          <div className="relative">
            <div
              className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 hidden md:block"
              style={{ background: 'linear-gradient(to bottom, #f09133, #1e3a5f)' }}
            />
            <motion.ol className="space-y-8" variants={stagger}>
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.title}
                  className="flex items-start gap-6 md:gap-8 rounded-xl p-5 md:p-6 landing-card border border-[#e5e0db]/60"
                  variants={fadeUp}
                  transition={cardTransition}
                >
                  <div className="shrink-0 relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[#f09133] text-white flex items-center justify-center text-lg font-bold shadow-[0_0_25px_rgba(240,145,51,0.4)]">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <s.icon className="h-4 w-4 text-[#f09133] mt-2 opacity-60" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                    <p className="text-[#6b7280] text-base leading-relaxed">{s.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading badge="Il report" title="Cosa trovi dentro il report" />
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={stagger}>
            {OUTPUT.map((o) => (
              <motion.div
                key={o.title}
                className="landing-card rounded-xl border border-[#e5e0db] p-6"
                variants={fadeUp}
                transition={cardTransition}
              >
                <o.icon className="h-8 w-8 text-[#f09133] mb-3" />
                <h3 className="font-bold text-base mb-2">{o.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{o.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <FaqSection
        faq={FAQ}
        title="Domande frequenti sul Talent Profile System"
        sub="Come funziona il modello, che ruolo ha l’AI, quanto è affidabile."
      />

      <AltriServizi escludi="/talent-profile-system" />

      <CtaBand
        title="Vedi il sistema su un candidato vero"
        sub="In 30 minuti ti mostriamo un report reale e lo applichiamo a un ruolo che devi coprire davvero."
        ctaLabel="Voglio vedere una demo"
        origine="talent-profile-system"
      />
    </>
  );
}
