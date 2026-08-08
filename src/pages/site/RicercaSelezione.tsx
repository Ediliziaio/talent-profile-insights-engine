import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Filter, Brain, Users, Handshake, LifeBuoy, Check } from 'lucide-react';
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
import { SELEZIONI } from '@/data/selezioni';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PATH = '/ricerca-e-selezione-personale-edile';

const FASI = [
  {
    icon: Handshake,
    title: 'Prima chiamata: capiamo il ruolo vero',
    desc: 'Non partiamo dall’annuncio: partiamo dal cantiere. Chi comanda, che squadra troverà, che tipo di committente, cosa ha fatto fallire i tentativi precedenti.',
    tempo: 'Giorno 1',
  },
  {
    icon: Megaphone,
    title: 'Ricerca attiva',
    desc: 'Annunci mirati, archivio Talenti Edili e ricerca diretta sul territorio. In edilizia le persone giuste raramente stanno rispondendo agli annunci.',
    tempo: 'Giorni 2–10',
  },
  {
    icon: Filter,
    title: 'Scrematura e verifica',
    desc: 'Colloquio telefonico, verifica di esperienza reale, disponibilità, patenti e abilitazioni. Scartiamo qui, non ti facciamo perdere tempo dopo.',
    tempo: 'Giorni 5–15',
  },
  {
    icon: Brain,
    title: 'Analisi psicoattitudinale',
    desc: 'Ogni candidato arrivato in fondo ha completato il Talent Profile: 242 domande, 15 tratti, report elaborato dall’Intelligenza Artificiale.',
    tempo: 'Giorni 10–18',
  },
  {
    icon: Users,
    title: 'Ti presentiamo i 3 migliori',
    desc: 'Ti consegniamo tre profili con report completo, compatibilità di ruolo, aree di rischio e la guida al colloquio personalizzata per ciascuno.',
    tempo: 'Entro il giorno 21',
  },
  {
    icon: LifeBuoy,
    title: 'Affiancamento all’inserimento',
    desc: 'Ti diamo il piano dei primi 90 giorni per la persona scelta e restiamo disponibili durante il periodo di prova.',
    tempo: 'Primi 90 giorni',
  },
];

const INCLUSO = [
  'Prima chiamata per capire ruolo e cantiere',
  'Stesura e pubblicazione degli annunci',
  'Ricerca attiva sul territorio e nell’archivio Talenti Edili',
  'Prima scrematura al telefono e verifica delle esperienze dichiarate',
  'Analisi psicoattitudinale Talent Profile su tutti i 3 candidati',
  'Report completo elaborato dall’AI per ognuno dei 3',
  'Guida al colloquio personalizzata',
  'Piano di inserimento a 90 giorni',
  'Sostituzione gratuita se la persona lascia entro il periodo concordato',
];

const QUANDO_SERVE = [
  {
    title: 'Non hai una struttura HR interna',
    desc: 'Il titolare o il direttore tecnico fanno selezione fra un cantiere e l’altro. Il risultato dipende da quanto tempo avanza quella settimana.',
  },
  {
    title: 'Hai già provato e non ha funzionato',
    desc: 'Annunci pubblicati, decine di curriculum, due colloqui, una persona che dopo un mese non c’è più. E si ricomincia.',
  },
  {
    title: 'È un ruolo che non puoi sbagliare',
    desc: 'Capocantiere, direttore tecnico, project manager. Ruoli dove l’errore non costa uno stipendio: costa una commessa.',
  },
  {
    title: 'Devi assumere in fretta',
    desc: 'Cantiere già aggiudicato, data di consegna fissata, squadra incompleta. Non c’è tempo per imparare a selezionare.',
  },
];

const FAQ = [
  {
    q: 'Che cos’è il servizio di ricerca e selezione di Talenti Edili?',
    a: 'È un servizio chiavi in mano in cui la selezione la facciamo noi: definiamo il ruolo con te, cerchiamo attivamente i candidati sul mercato, li sottoponiamo all’analisi psicoattitudinale Talent Profile e ti consegniamo i 3 candidati migliori con report completo, compatibilità di ruolo e guida al colloquio.',
  },
  {
    q: 'Quanto tempo serve per ricevere i 3 candidati?',
    a: 'Di norma consegniamo i 3 candidati entro 21 giorni dalla prima chiamata. Sui ruoli molto specialistici o in zone con poca offerta i tempi possono allungarsi: te lo diciamo prima di partire, non dopo.',
  },
  {
    q: 'In cosa siete diversi da un’agenzia interinale?',
    a: 'Un’agenzia ti manda persone; noi ti diciamo perché quella persona funzionerà in quel ruolo e cosa rischi con lei. Ognuno dei 3 candidati arriva con un’analisi psicoattitudinale su 15 tratti e un report elaborato dall’Intelligenza Artificiale. E la persona la assumi tu, direttamente: non c’è somministrazione.',
  },
  {
    q: 'Cosa succede se la persona che assumo se ne va dopo due mesi?',
    a: 'Riapriamo la ricerca senza costi aggiuntivi entro il periodo di garanzia concordato in fase di incarico. È il senso di misurare prima: se il nostro sistema ha sbagliato, il costo è nostro.',
  },
  {
    q: 'Selezionate anche operai o solo ruoli di responsabilità?',
    a: 'Entrambi. Su operai e squadre il valore sta nel ridurre il turnover dei primi mesi; su ruoli di responsabilità sta nell’evitare l’errore singolo che costa una commessa. Il metodo è lo stesso, cambia il peso dei tratti nel abbinamento.',
  },
  {
    q: 'Quanto costa il servizio?',
    a: 'Il costo dipende dal ruolo e dalla difficoltà della ricerca, e viene definito in fase di incarico con una quota di avvio e un saldo all’assunzione. Nella pagina Prezzi trovi le fasce indicative; per un preventivo puntuale serve mezz’ora di chiamata.',
  },
];

export default function RicercaSelezione() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Ricerca e selezione del personale edile',
        description:
          'Servizio chiavi in mano di ricerca e selezione per imprese edili, con analisi psicoattitudinale e Intelligenza Artificiale su ognuno dei 3 candidati.',
        path: PATH,
      }),
      serviceLd({
        name: 'Ricerca e selezione del personale edile',
        serviceType: 'Ricerca e selezione del personale',
        description:
          'Ricerca attiva, scrematura, analisi psicoattitudinale Talent Profile e consegna di i 3 candidati migliori con report completo e guida al colloquio.',
        path: PATH,
        offers: [
          { name: 'Selezione ruoli operativi', description: 'Operai specializzati, capisquadra, mestieri di cantiere' },
          { name: 'Selezione ruoli tecnici', description: 'Capocantiere, geometra, project manager, RSPP' },
          { name: 'Selezione ruoli direzionali', description: 'Direttore tecnico, responsabile di commessa' },
        ],
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Ricerca e Selezione', path: PATH },
      ]),
      faqLd(FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Ricerca e selezione personale edile | Talenti Edili"
        description="Cerchiamo, verifichiamo e analizziamo i candidati con il Talent Profile System: 3 candidati scelti con report e guida al colloquio in 21 giorni."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Servizio chiavi in mano"
        title={
          <>
            La selezione la facciamo noi.{' '}
            <span className="text-[#f09133]">Ti troviamo il candidato giusto.</span>
          </>
        }
        intro={
          <p>
            Ricerca attiva, scrematura, verifica e analisi psicoattitudinale: gestiamo tutto. Entro 21
            giorni ricevi <strong className="text-white">tre candidati scelti</strong>, ognuno con report
            Talent Profile, compatibilità di ruolo, aree di rischio e le domande da fargli al
            colloquio.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Ricerca e Selezione' }]}
        primaryCta={{ label: 'Parliamo del ruolo che devi coprire', to: '/contatti' }}
        secondaryCta={{ label: 'Vedi i prezzi', to: '/prezzi' }}
      />

      <DefinitionBlock
        question="Che cos’è il servizio di ricerca e selezione di Talenti Edili?"
        answer={
          <p>
            È un servizio di <strong>ricerca e selezione chiavi in mano per imprese edili</strong>:
            definiamo con te il ruolo reale, cerchiamo attivamente i candidati sul territorio e nell’archivio
            Talenti Edili, li verifichiamo e li sottoponiamo all’analisi psicoattitudinale{' '}
            <strong>Talent Profile</strong>. Ti consegniamo i 3 candidati migliori — ciascuno con
            report elaborato dall’Intelligenza Artificiale, punteggio di compatibilità con il ruolo,
            aree di rischio comportamentale e guida al colloquio — più il piano di inserimento per i
            primi 90 giorni.
          </p>
        }
      />

      <Section className="py-16 md:py-20 bg-[#f7f4f0]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading badge="Il percorso" title="Come lavoriamo, giorno per giorno" />
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={stagger}>
            {FASI.map((f) => (
              <motion.div
                key={f.title}
                className="landing-card rounded-xl border border-[#e5e0db] p-6"
                variants={fadeUp}
                transition={cardTransition}
              >
                <div className="flex items-center justify-between mb-3">
                  <f.icon className="h-8 w-8 text-[#f09133]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] bg-[#f7f4f0] border border-[#e5e0db] rounded-full px-2.5 py-1">
                    {f.tempo}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <span className="section-badge mb-4 inline-block">Quando serve</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Quando conviene delegare la selezione</h2>
            <div className="space-y-4">
              {QUANDO_SERVE.map((q) => (
                <div key={q.title} className="border-l-4 border-[#f09133] pl-4">
                  <h3 className="font-bold text-base mb-1">{q.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{q.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-card rounded-xl border border-[#e5e0db] p-7">
            <h2 className="text-xl font-bold mb-5">Cosa è incluso nell’incarico</h2>
            <ul className="space-y-3">
              {INCLUSO.map((i) => (
                <li key={i} className="flex gap-3 text-sm text-[#3d3935]">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ─── Obiezioni anticipate — le quattro che sentiamo sempre ─── */}
      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Parliamoci chiaro"
            title="Le quattro obiezioni che sentiamo sempre"
            sub="E le risposte oneste, prima che tu debba farle al telefono."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                q: '“Seleziono da vent’anni, so riconoscere le persone.”',
                a: 'Probabilmente è vero — sulle persone che assomigliano a quelle che hai già visto. Il problema è l’eccezione: il candidato perfetto al colloquio e disastroso in squadra. L’esperienza non lo becca, perché è allenato proprio a superare l’esperienza. I dati sì.',
              },
              {
                q: '“I test non funzionano sui muratori.”',
                a: 'I test scritti per impiegati, no. Il Talent Profile è in italiano semplice, si fa dal telefono in 15 minuti e non chiede di scrivere una riga. Lo completano ogni settimana operai che non usano il computer — e i loro capisquadra si stupiscono di quanto il report ci prenda.',
              },
              {
                q: '“Costa troppo.”',
                a: 'Un incarico di selezione costa una frazione dei 30.000 € che brucia una sola assunzione sbagliata — e in edilizia una su tre lo è. La domanda giusta non è quanto costa selezionare bene: è quanto ti sta costando selezionare a sensazione.',
              },
              {
                q: '“Non ho tempo per queste cose.”',
                a: 'È esattamente il motivo per cui esiste il servizio: il tempo lo mettiamo noi. Tu fai la prima chiamata (mezz’ora) e i colloqui finali con i tre candidati che ti presentiamo. Tutto il resto — ricerca, scrematura, verifica, analisi — non passa dalla tua scrivania.',
              },
            ].map((o) => (
              <div key={o.q} className="landing-card rounded-xl border border-[#e5e0db] p-6">
                <h3 className="font-bold text-lg mb-2 text-[#1e3a5f]">{o.q}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{o.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Per categoria"
            title="Chi ti troviamo"
            sub="Ogni figura si cerca in un modo diverso: le pagine dedicate spiegano metodo e criteri, categoria per categoria."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SELEZIONI.map((cat) => (
              <Link
                key={cat.slug}
                to={`/troviamo/${cat.slug}`}
                className="landing-card rounded-xl border border-[#e5e0db] p-5 block"
              >
                <h3 className="font-bold text-base mb-2">{cat.h1}</h3>
                <p className="text-[#6b7280] text-xs leading-relaxed mb-3 line-clamp-2">{cat.intro}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a5f]">
                  Come li troviamo <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <FaqSection
        faq={FAQ}
        title="Domande frequenti sulla ricerca e selezione"
        sub="Tempi, garanzie, differenze rispetto a un’agenzia interinale."
      />

      <AltriServizi escludi="/ricerca-e-selezione-personale-edile" />

      <CtaBand
        title="Raccontaci il ruolo che non riesci a coprire"
        sub="Mezz’ora di chiamata e ti diciamo se è un problema di ricerca, di selezione o di ruolo mal definito. Senza impegno."
        ctaLabel="Voglio parlare con un selezionatore"
        origine="ricerca-selezione"
      />
    </>
  );
}
