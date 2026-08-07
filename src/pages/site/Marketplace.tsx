import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  ShieldCheck,
  Gauge,
  Clock,
  UserCheck,
  ArrowRight,
  Check,
  X,
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
import { breadcrumbLd, faqLd, serviceLd, webPageLd } from '@/lib/seo';
import { RUOLI } from '@/data/ruoli';

const PATH = '/marketplace-talenti-edili';

const COME_FUNZIONA = [
  {
    icon: Search,
    title: 'Dici che ruolo ti serve',
    desc: 'Scegli il ruolo, la zona e il livello di esperienza. Il sistema filtra solo i profili compatibili con quel ruolo, non tutti quelli che hanno la parola giusta nel curriculum.',
  },
  {
    icon: Gauge,
    title: 'Vedi la compatibilità prima di chiamare',
    desc: 'Ogni profilo del marketplace ha già completato l’analisi psicoattitudinale: vedi il punteggio di compatibilità, i tratti misurati e le aree di rischio.',
  },
  {
    icon: UserCheck,
    title: 'Sblocchi solo chi ti interessa',
    desc: 'Apri il report completo dei profili che vuoi davvero valutare e ricevi la guida al colloquio generata su misura per quella persona.',
  },
  {
    icon: Clock,
    title: 'Chiami e chiudi',
    desc: 'Arrivi al colloquio sapendo già cosa chiedere e dove sono i punti deboli. Il tempo che prima usavi per lo screening lo usi per decidere.',
  },
];

const DIFFERENZE = [
  {
    label: 'Cosa vedi prima di chiamare',
    portali: 'Un curriculum scritto dal candidato',
    noi: 'Profilo psicoattitudinale misurato su 15 tratti',
  },
  {
    label: 'Come sono ordinati i risultati',
    portali: 'Per data di candidatura o parole chiave',
    noi: 'Per compatibilità reale con il ruolo che hai aperto',
  },
  {
    label: 'Quanti profili devi contattare',
    portali: 'Decine, per trovarne 2 sensati',
    noi: 'Pochi, già filtrati sul ruolo',
  },
  {
    label: 'Cosa sai dei rischi',
    portali: 'Niente, fino al terzo mese',
    noi: 'Aree di rischio comportamentale in chiaro',
  },
  {
    label: 'Colloquio',
    portali: 'Lo improvvisi',
    noi: 'Domande generate sui punti deboli di quella persona',
  },
];

const FAQ = [
  {
    q: 'Che cos’è il marketplace di Talenti Edili?',
    a: 'È un bacino di profili del settore edile che hanno già completato l’analisi psicoattitudinale Talent Profile. A differenza di un portale di annunci, non cerchi fra curriculum autodichiarati: cerchi fra persone già misurate su 15 tratti, ordinate per compatibilità con il ruolo che devi coprire.',
  },
  {
    q: 'In cosa è diverso da un portale di annunci di lavoro?',
    a: 'Un portale ti mostra chi si è candidato; il marketplace ti mostra chi è compatibile. Ogni profilo ha già il report psicoattitudinale elaborato dall’Intelligenza Artificiale, con punteggio di compatibilità, punti di forza, aree di rischio e domande da fare al colloquio.',
  },
  {
    q: 'Come finiscono i candidati nel marketplace?',
    a: 'I candidati si registrano gratuitamente dalla pagina dedicata, completano l’analisi psicoattitudinale in 15 minuti e autorizzano esplicitamente la visibilità del proprio profilo alle imprese. Nessun profilo è presente senza consenso.',
  },
  {
    q: 'Vedo i dati personali di tutti i candidati?',
    a: 'No. In elenco vedi il profilo professionale e psicoattitudinale in forma anonima. I dati di contatto compaiono solo quando sblocchi quel profilo specifico, nel rispetto del GDPR.',
  },
  {
    q: 'Quanto costa cercare nel marketplace?',
    a: 'La ricerca e la consultazione dei profili in forma anonima sono incluse nei piani. Si paga solo lo sblocco dei profili che decidi di contattare. Trovi il dettaglio nella pagina Prezzi.',
  },
  {
    q: 'E se nel marketplace non c’è il profilo che cerco?',
    a: 'In quel caso passiamo al servizio di ricerca e selezione: andiamo a cercare attivamente la persona sul mercato, la analizziamo e ti consegniamo una rosa di tre candidati.',
  },
];

export default function Marketplace() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Marketplace Talenti Edili — profili edili già analizzati',
        description:
          'Cerca fra profili del settore edile che hanno già completato l’analisi psicoattitudinale. Compatibilità di ruolo, rischi e guida al colloquio prima ancora di chiamare.',
        path: PATH,
      }),
      serviceLd({
        name: 'Marketplace Talenti Edili',
        serviceType: 'Marketplace di profili professionali per l’edilizia',
        description:
          'Bacino di candidati del settore edile già sottoposti ad analisi psicoattitudinale Talent Profile, ricercabili per ruolo, zona e compatibilità.',
        path: PATH,
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Marketplace Talenti', path: PATH },
      ]),
      faqLd(FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Marketplace Talenti Edili — trova profili edili già analizzati"
        description="Cerca fra candidati del settore edile che hanno già fatto l’analisi psicoattitudinale. Vedi compatibilità di ruolo, tratti e rischi prima di chiamare. Non annunci: profili misurati."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Marketplace"
        title={
          <>
            Trova persone già analizzate.{' '}
            <span className="text-[#f09133]">Non curriculum da leggere.</span>
          </>
        }
        intro={
          <p>
            Nel marketplace di Talenti Edili ogni profilo ha già completato l’analisi psicoattitudinale{' '}
            <strong className="text-white">Talent Profile</strong>. Filtri per ruolo e zona, e vedi la
            compatibilità reale con la posizione che devi coprire prima ancora di alzare il telefono.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Marketplace Talenti' }]}
        primaryCta={{ label: 'Accedi al marketplace', to: '/contatti' }}
        secondaryCta={{ label: 'Vedi i ruoli coperti', to: '/ruoli' }}
      >
        <div className="flex flex-wrap gap-3 mt-8">
          {[
            { icon: ShieldCheck, text: 'Profili con consenso esplicito' },
            { icon: MapPin, text: 'Filtro per zona e cantiere' },
            { icon: Gauge, text: 'Ordinati per compatibilità' },
          ].map((b) => (
            <span
              key={b.text}
              className="inline-flex items-center gap-1.5 text-xs text-white/70 bg-white/[0.07] border border-white/10 rounded-full px-3 py-1"
            >
              <b.icon className="h-3 w-3" /> {b.text}
            </span>
          ))}
        </div>
      </PageHero>

      <DefinitionBlock
        question="Che cos’è il marketplace di Talenti Edili?"
        answer={
          <p>
            Il marketplace di Talenti Edili è un bacino di profili del settore edile che hanno già
            completato l’analisi psicoattitudinale <strong>Talent Profile</strong>. A differenza di un
            portale di annunci, non cerchi fra curriculum scritti dal candidato: cerchi fra persone
            misurate su 15 tratti, con il punteggio di compatibilità calcolato dall’Intelligenza
            Artificiale sul ruolo che devi coprire, le aree di rischio comportamentale in chiaro e la
            guida al colloquio già pronta.
          </p>
        }
      />

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Come funziona"
            title="Dal ruolo aperto alla persona giusta, in quattro passaggi"
          />
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={stagger}>
            {COME_FUNZIONA.map((s, i) => (
              <motion.div
                key={s.title}
                className="landing-card rounded-xl border border-[#e5e0db] p-6 relative"
                variants={fadeUp}
                transition={cardTransition}
              >
                <span className="number-decoration">{String(i + 1).padStart(2, '0')}</span>
                <s.icon className="h-8 w-8 text-[#f09133] mb-3" />
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Confronto"
            title="Portale di annunci o marketplace di profili analizzati?"
          />
          <div className="hidden md:block landing-card overflow-hidden rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#e5e0db]">
                  <th className="text-left p-5 font-bold text-base">Criterio</th>
                  <th className="text-center p-5 font-bold text-red-700 text-base bg-red-100/80">
                    Portale di annunci
                  </th>
                  <th className="text-center p-5 font-bold text-green-800 text-base bg-green-100/80">
                    Marketplace Talenti Edili
                  </th>
                </tr>
              </thead>
              <tbody>
                {DIFFERENZE.map((r, i) => (
                  <tr key={r.label} className={`border-b border-[#e5e0db] last:border-0 ${i % 2 ? 'bg-[#faf8f5]/50' : 'bg-white'}`}>
                    <td className="p-4 font-medium">{r.label}</td>
                    <td className="p-4 text-center bg-red-50/30 text-[#6b7280]">
                      <span className="inline-flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 shrink-0" /> {r.portali}
                      </span>
                    </td>
                    <td className="p-4 text-center bg-green-50/40 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0" /> {r.noi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {DIFFERENZE.map((r) => (
              <div key={r.label} className="landing-card rounded-xl p-5">
                <p className="font-semibold mb-3">{r.label}</p>
                <p className="text-sm text-[#6b7280] flex gap-2 mb-2">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> {r.portali}
                </p>
                <p className="text-sm font-medium flex gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> {r.noi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Ruoli"
            title="I ruoli che trovi nel marketplace"
            sub="Ogni ruolo ha un peso diverso sui 15 tratti misurati: per questo la stessa persona può essere compatibile con una posizione e non con un’altra."
          />
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger}>
            {RUOLI.map((r) => (
              <motion.div key={r.slug} variants={fadeUp} transition={cardTransition}>
                <Link
                  to={`/ruoli/${r.slug}`}
                  className="landing-card rounded-xl border border-[#e5e0db] p-5 block h-full"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-orange-on-light)]">
                    {r.categoria}
                  </span>
                  <h3 className="font-bold text-base mt-1 mb-2">{r.nome}</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">{r.sintesi}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a5f] mt-3">
                    Scopri il profilo <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-8">
            <Link to="/ruoli" className="text-sm font-semibold text-[#1e3a5f] hover:text-[#f09133] transition-colors">
              Vedi tutti i 30+ ruoli coperti →
            </Link>
          </div>
        </div>
      </Section>

      <FaqSection
        faq={FAQ}
        title="Domande frequenti sul marketplace"
        sub="Come funziona la ricerca, cosa vedi e come sono tutelati i dati dei candidati."
      />

      <AltriServizi escludi="/marketplace-talenti-edili" />

      <CtaBand
        title="Apri il marketplace sulla tua prossima posizione"
        sub="Dicci che ruolo devi coprire: ti mostriamo quanti profili compatibili ci sono già oggi nella tua zona."
        ctaLabel="Voglio vedere i profili disponibili"
        origine="marketplace"
      />
    </>
  );
}
