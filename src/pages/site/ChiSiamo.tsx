import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Scale, Eye, HandHeart } from 'lucide-react';
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
import { breadcrumbLd, faqLd, organizationLd, webPageLd } from '@/lib/seo';

const PATH = '/chi-siamo';

const PRINCIPI = [
  {
    icon: Scale,
    title: 'Misurare, non intuire',
    desc: 'Il colloquio resta necessario, ma non può essere l’unico strumento. Se una decisione vale 30.000 €, merita un dato prima di un’impressione.',
  },
  {
    icon: Eye,
    title: 'Dire anche quello che non conviene',
    desc: 'Se il problema non è il candidato ma il ruolo mal definito, lo diciamo. Anche quando significa non venderti niente.',
  },
  {
    icon: Target,
    title: 'Parlare la lingua del cantiere',
    desc: 'I report sono scritti perché li legga un imprenditore edile, non uno psicologo. Se serve un glossario, abbiamo sbagliato a scriverli.',
  },
  {
    icon: HandHeart,
    title: 'Il candidato non è merce',
    desc: 'Chi si profila riceve il proprio report ed è padrone della propria visibilità. Il servizio per il candidato è gratuito e resta gratuito.',
  },
];

const FAQ = [
  {
    q: 'Chi c’è dietro Talenti Edili?',
    a: 'Talenti Edili nasce dall’incontro fra chi lavora da anni con le imprese edili italiane e i professionisti — psicologi del lavoro, psicoterapeuti, esperti di risorse umane — che hanno costruito il modello psicometrico alla base del Talent Profile System.',
  },
  {
    q: 'Siete una società di software o di consulenza?',
    a: 'Nessuna delle due, per come vengono di solito intese. Siamo un sistema: il metodo di analisi psicoattitudinale è la sostanza, l’Intelligenza Artificiale è ciò che lo rende immediato, la piattaforma è solo il modo in cui te lo consegniamo. Quando serve, mettiamo anche le persone: è il servizio di ricerca e selezione.',
  },
  {
    q: 'Perché solo edilizia?',
    a: 'Perché il matching funziona quando è tarato su ruoli reali, non su categorie generiche. Un capisquadra non è un “team leader”: ha vincoli, pressioni e dinamiche specifiche. Restare verticali sull’edilizia è quello che rende utile il punteggio di compatibilità.',
  },
];

export default function ChiSiamo() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Chi siamo — Talenti Edili',
        description:
          'Perché esiste Talenti Edili, come lavoriamo e quali principi guidano l’uso dell’analisi psicoattitudinale e dell’Intelligenza Artificiale nelle imprese edili.',
        path: PATH,
      }),
      organizationLd(),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Chi siamo', path: PATH },
      ]),
      faqLd(FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Chi siamo — perché esiste Talenti Edili"
        description="Diamo alle imprese edili un modo serio di decidere sulle persone: analisi psicoattitudinale per misurare, Intelligenza Artificiale per interpretare."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Chi siamo"
        title={
          <>
            Odiamo le assunzioni sbagliate.{' '}
            <span className="text-[#f09133]">Per questo abbiamo smesso di tirare a indovinare.</span>
          </>
        }
        intro={
          <p>
            Talenti Edili nasce da una constatazione semplice: nelle imprese edili italiane le decisioni
            più costose — quelle sulle persone — sono le uniche prese senza un solo dato in mano.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Chi siamo' }]}
        primaryCta={{ label: 'Parla con noi', to: '/contatti' }}
        secondaryCta={{ label: 'Come funziona il sistema', to: '/talent-profile-system' }}
      />

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <span className="section-badge mb-5 inline-block">La storia</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Da dove veniamo</h2>
          <div className="letter-style space-y-5 text-lg">
            <p>
              Ogni impresa edile che abbiamo incontrato aveva la stessa cicatrice: una persona presa
              d’istinto che ha destabilizzato una squadra, fatto slittare un cantiere o portato via il
              capisquadra migliore andandosene.
            </p>
            <p>
              E ogni volta la spiegazione era la stessa: <em>«sembrava in gamba»</em>. Il problema non
              era la sfortuna: era che nessuno aveva strumenti per sapere qualcosa di quella persona
              oltre a quello che la persona stessa aveva scelto di raccontare.
            </p>
            <p>
              Il metodo esisteva già: l’analisi psicoattitudinale è una disciplina seria, usata da
              decenni nelle grandi organizzazioni. Ma era lenta, cara e scritta in una lingua che in
              cantiere non serviva a niente.
            </p>
            <p>
              Abbiamo fatto due cose. Abbiamo tarato il modello sui ruoli veri dell’edilizia — non su
              categorie generiche da manuale HR. E abbiamo messo l’Intelligenza Artificiale a fare il
              lavoro che prima richiedeva ore di un consulente: leggere i punteggi e tradurli in
              decisioni pratiche, in tempo reale.
            </p>
            <p>
              Il risultato è il <strong>Talent Profile System</strong>: quindici minuti, un report che
              legge chiunque, e finalmente un dato prima della firma.
            </p>
          </div>
        </div>
      </Section>

      <DefinitionBlock
        question="Che cosa fa esattamente Talenti Edili?"
        answer={
          <p>
            Talenti Edili aiuta le imprese edili italiane a scegliere e gestire le persone con i dati.
            Lo fa in tre modi: un <strong>Banca Talenti</strong> di profili già analizzati, un servizio di{' '}
            <strong>ricerca e selezione</strong> chiavi in mano, e il{' '}
            <strong>Talent Profile System</strong> — analisi psicoattitudinale con Intelligenza
            Artificiale — utilizzabile in autonomia. Il denominatore comune è sempre lo stesso: nessuna
            decisione su una persona senza prima averla misurata.
          </p>
        }
      />

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading badge="Principi" title="Come lavoriamo" />
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={stagger}>
            {PRINCIPI.map((p) => (
              <motion.div
                key={p.title}
                className="landing-card rounded-xl border border-[#e5e0db] p-6"
                variants={fadeUp}
                transition={cardTransition}
              >
                <p.icon className="h-8 w-8 text-[#f09133] mb-3" />
                <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <FaqSection faq={FAQ} title="Domande frequenti su di noi" />

      <CtaBand
        title="Parliamo della tua impresa"
        sub="Mezz’ora, senza presentazioni commerciali. Ci racconti come assumi oggi e ti diciamo dove si rompe."
        ctaLabel="Prenota una chiamata"
        origine="chi-siamo"
      />
    </>
  );
}
