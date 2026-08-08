import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { breadcrumbLd, faqLd, softwareLd, webPageLd } from '@/lib/seo';

const PATH = '/prezzi';

const PIANI = [
  {
    name: 'Starter',
    price: '€49',
    period: '/mese',
    desc: 'Per l’impresa che assume qualche persona all’anno',
    features: [
      '5 analisi psicoattitudinali/mese',
      'Report completo elaborato dall’AI',
      'Compatibilità di ruolo base',
      'Consultazione anonima della piattaforma',
      'Supporto email',
    ],
    cta: 'Inizia con Starter',
    popular: false,
  },
  {
    name: 'Professional',
    price: '€97',
    period: '/mese',
    desc: 'Per l’impresa che cresce e apre cantieri nuovi',
    features: [
      '20 analisi psicoattitudinali/mese',
      'Tutti i report avanzati',
      'Mappa interiore + sindromi comportamentali',
      'Confronto fino a 4 candidati',
      'Guida al colloquio generata dall’AI',
      'Sblocco dei profili incluso',
      'Supporto prioritario',
    ],
    cta: 'Scegli Professional',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Su misura',
    period: '',
    desc: 'Per gruppi, consorzi e general contractor',
    features: [
      'Analisi illimitate',
      'API dedicata',
      'Taratura dell’abbinamento persona-ruolo sui tuoi ruoli',
      'Onboarding personalizzato',
      'Account manager dedicato',
      'SLA garantito',
      'Formazione del team interno',
    ],
    cta: 'Parliamone',
    popular: false,
  },
];

const SERVIZIO = [
  {
    fascia: 'Ruoli operativi',
    esempi: 'Operai specializzati, mestieri di cantiere, capisquadra',
    nota: 'Quota di avvio + saldo all’assunzione, calcolati sulla RAL della posizione.',
  },
  {
    fascia: 'Ruoli tecnici',
    esempi: 'Capocantiere, geometra, project manager, RSPP',
    nota: 'Ricerca attiva sul territorio inclusa. Garanzia di sostituzione concordata in fase di incarico.',
  },
  {
    fascia: 'Ruoli direzionali',
    esempi: 'Direttore tecnico, responsabile di commessa, direzione operativa',
    nota: 'Incarico dedicato con ricerca diretta. Preventivo su prima chiamata.',
  },
];

const FAQ = [
  {
    q: 'Quanto costa Talenti Edili?',
    a: 'L’abbonamento al sistema parte da 49 € al mese per 5 analisi psicoattitudinali e arriva a 97 € al mese per 20 analisi con tutti i report avanzati. Per volumi superiori c’è il piano Enterprise su misura. Il servizio di ricerca e selezione, in cui la selezione la facciamo noi, è quotato a incarico in base al ruolo.',
  },
  {
    q: 'C’è un vincolo di durata?',
    a: 'No. I piani sono mensili e si disdicono quando vuoi. Nei primi 30 giorni vale la garanzia: se non ti fa risparmiare almeno un’assunzione sbagliata, ti rimborsiamo.',
  },
  {
    q: 'Le analisi non usate si accumulano?',
    a: 'Le analisi si azzerano ogni mese. Se hai picchi stagionali — molto comune in edilizia — conviene salire di piano nei mesi di assunzione e scendere dopo: il cambio è immediato e senza penali.',
  },
  {
    q: 'Il costo della piattaforma è a parte?',
    a: 'La ricerca e la consultazione dei profili in forma anonima sono incluse in tutti i piani. Con Starter lo sblocco dei profili è a consumo; con Professional ed Enterprise è incluso nei limiti del piano.',
  },
  {
    q: 'Quanto costa il servizio di ricerca e selezione?',
    a: 'Dipende dal ruolo e dalla difficoltà della ricerca. Funziona con una quota di avvio e un saldo all’assunzione, calcolati sulla retribuzione della posizione. Le fasce indicative sono in questa pagina; per un numero preciso serve mezz’ora di chiamata.',
  },
  {
    q: 'Il candidato paga qualcosa?',
    a: 'Mai. Per chi cerca lavoro l’analisi psicoattitudinale e la presenza sulla piattaforma sono gratuite e restano gratuite.',
  },
];

export default function Prezzi() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Prezzi Talenti Edili',
        description:
          'Piani di abbonamento al Talent Profile System da 49 €/mese e quotazione del servizio di ricerca e selezione per imprese edili.',
        path: PATH,
      }),
      softwareLd(),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Prezzi', path: PATH },
      ]),
      faqLd(FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Prezzi — quanto costa Talenti Edili | Piani da 49 €/mese"
        description="Piani da 49 €/mese per 5 analisi psicoattitudinali, 97 €/mese per 20. piattaforma incluso, selezione quotata a incarico. Garanzia 30 giorni."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Prezzi"
        title={
          <>
            Costa meno di quanto ti costa{' '}
            <span className="text-[#f09133]">una persona sbagliata.</span>
          </>
        }
        intro={
          <p>
            Un errore di selezione in edilizia costa in media 30.000 €. Un abbonamento a Talenti Edili
            parte da <strong className="text-white">49 € al mese</strong>. Nessun vincolo di durata, e
            i primi 30 giorni sono coperti da garanzia.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Prezzi' }]}
        primaryCta={{ label: 'Richiedi una demo', to: '/contatti' }}
        secondaryCta={{ label: 'Leggi la garanzia', to: '/garanzia' }}
      />

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Sistema"
            title="Usa il sistema in autonomia"
            sub="Mandi tu i link ai candidati e l’Intelligenza Artificiale ti restituisce i report. Tutti i piani includono la consultazione della piattaforma."
          />
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start" variants={stagger}>
            {PIANI.map((p) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                transition={cardTransition}
                className={`landing-card rounded-2xl p-7 relative ${
                  p.popular ? 'border-2 border-[#f09133] shadow-[0_20px_50px_-15px_rgba(240,145,51,0.35)]' : 'border border-[#e5e0db]'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f09133] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Il più scelto
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                <p className="text-[#6b7280] text-sm mb-5 min-h-[40px]">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-[#1e3a5f]">{p.price}</span>
                  <span className="text-[#6b7280] text-sm">{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-[#3d3935]">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full rounded-xl ${
                    p.popular
                      ? 'bg-[#f09133] hover:bg-[#e07a1f] text-white'
                      : 'bg-[#1e3a5f] hover:bg-[#162d4a] text-white'
                  }`}
                >
                  <Link to="/contatti">{p.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Servizio"
            title="Se la selezione la facciamo noi"
            sub="Il servizio di ricerca e selezione è quotato a incarico: quota di avvio più saldo all’assunzione, calcolati sulla retribuzione della posizione."
          />
          <div className="space-y-4">
            {SERVIZIO.map((s) => (
              <div key={s.fascia} className="landing-card rounded-xl border border-[#e5e0db] p-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <h3 className="font-bold text-lg">{s.fascia}</h3>
                  <span className="text-sm text-[#6b7280]">{s.esempi}</span>
                </div>
                <p className="text-[#6b7280] text-sm leading-relaxed">{s.nota}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/ricerca-e-selezione-personale-edile"
              className="text-sm font-semibold text-[#1e3a5f] hover:text-[#f09133] transition-colors"
            >
              Come funziona il servizio di ricerca e selezione →
            </Link>
          </div>
        </div>
      </Section>

      <DefinitionBlock
        question="Quanto costa Talenti Edili?"
        answer={
          <p>
            L’abbonamento al Talent Profile System parte da <strong>49 € al mese</strong> per 5 analisi
            psicoattitudinali e arriva a <strong>97 € al mese</strong> per 20 analisi con tutti i report
            avanzati; per volumi superiori c’è un piano Enterprise su misura. Il servizio di{' '}
            <strong>ricerca e selezione</strong> è quotato a incarico in base al ruolo, con quota di
            avvio e saldo all’assunzione. Per chi cerca lavoro il servizio è sempre gratuito.
          </p>
        }
      />

      <Section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="rounded-xl border-l-4 border-[#f09133] bg-[#fef9c3]/40 p-7 flex gap-5 items-start">
            <ShieldCheck className="h-8 w-8 text-[#f09133] shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-2">Garanzia 30 giorni</h2>
              <p className="text-[#3d3935] leading-relaxed mb-3">
                Se nei primi 30 giorni Talenti Edili non ti fa risparmiare almeno un’assunzione
                sbagliata, ti rimborsiamo l’intero importo. Una mail, nessuna domanda.
              </p>
              <Link to="/garanzia" className="text-sm font-semibold text-[#1e3a5f] hover:text-[#f09133]">
                Leggi le condizioni della garanzia →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <FaqSection faq={FAQ} title="Domande frequenti sui prezzi" />

      <CtaBand
        title="Non sai quale piano ti serve?"
        sub="Dicci quante persone assumi in un anno: ti diciamo noi qual è la scelta sensata, anche se è la più economica."
        ctaLabel="Aiutatemi a scegliere"
        origine="prezzi"
      />
    </>
  );
}
