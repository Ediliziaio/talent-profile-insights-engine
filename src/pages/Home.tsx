import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Brain,
  Target,
  Users,
  FileText,
  Send,
  ClipboardCheck,
  BarChart3,
  Lightbulb,
  TrendingDown,
  Gauge,
  UserX,
  Star,
  Menu,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Building2,
  Clock,
  Zap,
  HelpCircle,
  AlertTriangle,
  Shield,
  TrendingUp,
  Calculator,
  Mail,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

/* ─── Hook: scroll-triggered fade-in ─── */
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-5');
          io.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ─── Hook: animated counter ─── */
function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ─── Section wrapper ─── */
function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useScrollAnimation();
  return (
    <section
      id={id}
      ref={ref}
      className={`opacity-0 translate-y-5 transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── Smooth scroll helper ─── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ─── Mini CTA component ─── */
function MiniCTA({ text, subtext }: { text: string; subtext?: string }) {
  return (
    <div className="text-center mt-12 mb-4">
      {subtext && <p className="text-[#6b7280] text-sm mb-3">{subtext}</p>}
      <Button
        size="lg"
        className="bg-[#f09133] hover:bg-[#e07a1f] text-white text-lg px-8 py-6 rounded-xl shadow-lg"
        onClick={() => scrollTo('cta-finale')}
      >
        {text} <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

/* ─── DATA ─── */
const NAV_LINKS = [
  { label: 'Il Problema', id: 'problema' },
  { label: 'Calcolatore', id: 'calcolatore' },
  { label: 'Funzionalità', id: 'funzionalita' },
  { label: 'Metodo', id: 'metodo' },
  { label: 'Testimonianze', id: 'testimonianze' },
  { label: 'FAQ', id: 'faq' },
];

const PROBLEMS = [
  {
    icon: Gauge,
    title: 'Assumi a sensazione',
    desc: 'Al colloquio ti convince. Parla bene, stringe la mano forte, ti guarda negli occhi. Poi dopo 90 giorni scopri che era tutto un copione. Nessun dato, nessun metodo — solo istinto. E l\'istinto, in HR, è un lusso che non puoi permetterti.',
  },
  {
    icon: TrendingDown,
    title: 'Turnover alle stelle',
    desc: 'Chi assumi non resta. E ogni volta che ricominci da capo bruci tempo, soldi e il morale del team. Il costo reale di un inserimento sbagliato? Fino a 2x lo stipendio annuo. Circa €30.000 tra formazione, produttività persa e riassunzione.',
  },
  {
    icon: Target,
    title: 'Zero dati oggettivi',
    desc: 'Valuti le persone con il CV e una chiacchierata. Ma il CV non ti dice come si comporterà sotto pressione, come gestirà il team, se è un leader o un esecutore. Non ti dice CHI È. Ti dice solo cosa dice di aver fatto.',
  },
  {
    icon: UserX,
    title: 'Team disfunzionali',
    desc: 'Persona sbagliata nel ruolo sbagliato. Il risultato? Conflitti, calo di produttività, i talenti veri che se ne vanno. Un solo inserimento sbagliato può destabilizzare un team intero che funzionava.',
  },
];

const STEPS = [
  {
    icon: Send,
    title: 'Invita il Candidato',
    desc: 'Invii un link personalizzato. Il candidato compila in autonomia, da smartphone, tablet o PC. Zero logistica, zero presenza fisica richiesta.',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessment Psicologico',
    desc: '242 domande a risposta chiusa. 15 minuti di compilazione. Validato scientificamente con coefficiente .75/1. Il candidato risponde in modo naturale e spontaneo — niente da preparare, niente da fingere.',
  },
  {
    icon: BarChart3,
    title: 'Report Istantaneo',
    desc: 'Profilo psicologico completo: 15 tratti, 3 macro-aree (Essere, Fare, Avere), 24 sindromi comportamentali, mappa interiore, punti di forza e aree critiche. Tutto in tempo reale.',
  },
  {
    icon: Lightbulb,
    title: 'Decisione Informata',
    desc: 'Compatibilità automatica con i ruoli della tua azienda. Guida personalizzata al colloquio con domande mirate. Confronto tra candidati. Assumi con i dati — non con il dubbio.',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Profilo Psicologico 360°',
    desc: '15 tratti, 3 macro-aree, 24 sindromi comportamentali. Non le solite 4 dimensioni vaghe. Analisi completa della personalità professionale in un report esecutivo che puoi leggere in 5 minuti.',
  },
  {
    icon: Target,
    title: 'Mappa Interiore',
    desc: 'La funzionalità che ci rende unici. 7 profili psicologici profondi: identità, emozioni, stile di attaccamento, meccanismi difensivi. Cosa guida questa persona? Cosa la blocca? Dove sta il potenziale inespresso?',
  },
  {
    icon: Users,
    title: 'Role Matching Automatico',
    desc: 'Compatibilità istantanea con 30+ ruoli aziendali — dal commerciale al caposquadra, dal responsabile HR al direttore tecnico. Scopri subito dove il candidato performa meglio.',
  },
  {
    icon: Lightbulb,
    title: 'Guida al Colloquio',
    desc: 'Domande personalizzate generate dall\'assessment. Non vai più al colloquio alla cieca. Sai esattamente cosa chiedere, dove approfondire, quali aree indagare per quel candidato specifico.',
  },
  {
    icon: BarChart3,
    title: 'Confronto Candidati',
    desc: 'Confronta fino a 4 candidati fianco a fianco su tutte le dimensioni psicologiche. Devi scegliere tra 3 candidati per un ruolo? In 30 secondi vedi chi è più adatto — con i numeri, non con le opinioni.',
  },
  {
    icon: FileText,
    title: 'Report PDF Esecutivo',
    desc: 'Scaricabile, condivisibile, pronto per il management. Include piano d\'azione post-assunzione: cosa fare nei primi 90 giorni per ottenere il massimo da ogni nuova risorsa.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Marco Rinaldi',
    role: 'HR Director — Gruppo Industriale (200 dip.)',
    before: 'Turnover al 35% nei primi 6 mesi. Selezionavamo con colloqui standard e CV. Una roulette.',
    after: 'Turnover calato del 40%. Ogni assunzione è supportata da dati oggettivi. Il team HR ha smesso di navigare a vista.',
    quote: 'Da quando usiamo TalentProfile, il turnover nei primi 6 mesi è calato del 40%. Finalmente abbiamo dati oggettivi per le nostre decisioni.',
    stars: 5,
  },
  {
    name: 'Chiara Fontana',
    role: 'CEO — Tech Startup (25 dip.)',
    before: 'Sbagliavamo 1 assunzione su 3. Costo medio per errore: €28.000. Assumevamo "a pelle".',
    after: 'Zero errori di hiring in 12 mesi. ROI incalcolabile. Ogni nuova risorsa performa dal primo mese.',
    quote: 'Con TalentProfile abbiamo ridotto gli errori di selezione quasi a zero. Il ROI? Incalcolabile.',
    stars: 5,
  },
  {
    name: 'Luca Ferretti',
    role: 'Resp. Selezione — Retail Chain (50 PV)',
    before: 'Store manager sbagliati in 3 punti vendita. Perdite di €180K in un anno tra turnover e riassunzioni.',
    after: 'Turnover store manager -50%. Selezione standardizzata. Abbiamo scoperto talenti interni nel ruolo sbagliato.',
    quote: 'La mappa interiore ci ha rivelato dinamiche che nessun colloquio avrebbe fatto emergere. Abbiamo capito perché certi talenti non performavano.',
    stars: 5,
  },
];

const FAQ_DATA = [
  {
    q: '⏱️ Quanto dura il test?',
    a: 'Il candidato completa l\'assessment in circa 15 minuti. Il report è disponibile istantaneamente, senza attese.',
  },
  {
    q: '🔬 È validato scientificamente?',
    a: 'Sì. TalentProfile si basa su modelli psicometrici riconosciuti, con scale psicologiche validate e un sistema di scoring proprietario sviluppato con esperti di psicologia del lavoro.',
  },
  {
    q: '📧 Come invio il test a un candidato?',
    a: 'Crei il candidato dalla dashboard, e il sistema genera automaticamente un link unico. Il candidato lo apre da qualsiasi dispositivo e compila in autonomia.',
  },
  {
    q: '🔒 I dati sono sicuri?',
    a: 'Assolutamente. Tutti i dati sono crittografati, conservati su server europei e trattati nel pieno rispetto del GDPR. Il consenso del candidato viene raccolto prima dell\'assessment.',
  },
  {
    q: '👥 Posso usarlo per il mio team attuale?',
    a: 'Certo. TalentProfile non serve solo per la selezione: puoi mappare il profilo psicologico dei tuoi collaboratori attuali per ottimizzare ruoli, team building e percorsi di crescita.',
  },
  {
    q: '💰 Quanto costa?',
    a: 'Offriamo piani flessibili basati sul numero di assessment. Richiedi una demo per ricevere un preventivo personalizzato in base alle tue esigenze.',
  },
  {
    q: '🔍 Che differenza c\'è rispetto a un test generico?',
    a: 'I test generici danno etichette vaghe. TalentProfile fornisce un profilo psicologico profondo con compatibilità ruolo, analisi dei rischi operativi e una guida concreta al colloquio — tutto in un unico report.',
  },
];

const FOR_NOT_FOR = {
  not: [
    'Assumi solo per urgenza e non vuoi cambiare metodo',
    'Pensi che il curriculum basti a capire una persona',
    'Non vuoi investire nella qualità della selezione',
    'Cerchi una soluzione magica che faccia tutto da sola',
    'Non sei disposto a usare i dati per prendere decisioni',
  ],
  yes: [
    'Vuoi smettere di assumere a sensazione e iniziare con i dati',
    'Cerchi uno strumento scientifico per le tue decisioni HR',
    'Vuoi ridurre il turnover e costruire team stabili nel tempo',
    'Sai che le persone giuste fanno crescere l\'azienda — e quelle sbagliate la distruggono',
    'Vuoi anche gestire e sviluppare il team attuale, non solo selezionare',
  ],
};

/* ─── Lettera Aperta ─── */
const LETTERA_PARAGRAPHS = [
  'Se stai leggendo questa pagina è perché conosci la frustrazione di assumere la persona sbagliata. L\'hai vissuta in prima persona — forse più di una volta.',
  'Non è colpa tua. È che fino ad oggi non avevi uno strumento che ti permettesse di vedere cosa c\'è sotto il curriculum. Quello che il candidato non ti dice al colloquio — perché non lo sa nemmeno lui.',
  'TalentProfile non misura la persona. Misura il software mentale che ha sviluppato in anni di esperienze. Come reagisce sotto pressione? Come gestisce le relazioni? Ha la struttura per quel ruolo — o è solo bravo a recitare la parte?',
  '242 domande. 15 tratti misurati. 24 sindromi comportamentali identificate. Report istantaneo.',
];

/* ─── Buona Notizia ─── */
const BUONA_NOTIZIA_ITEMS = [
  { title: 'Mappare il profilo psicologico reale di ogni candidato', desc: 'In 15 minuti, non in settimane.' },
  { title: 'Sapere PRIMA se la persona è adatta al ruolo', desc: 'Con dati, non con l\'istinto.' },
  { title: 'Ridurre il turnover fino al 40%', desc: 'Casi documentati dai nostri clienti.' },
  { title: 'Andare al colloquio preparato', desc: 'Con domande mirate generate dall\'assessment.' },
];

/* ─── Casi Reali ─── */
const CASE_STUDIES = [
  {
    company: 'Tech Startup',
    size: '25 dipendenti',
    sector: 'Settore: Software B2B',
    badge: '-40%',
    badgeLabel: 'Riduzione turnover',
    desc: 'Assumevano a sensazione, 1 errore su 3. Con TalentProfile: zero errori di selezione in 12 mesi.',
    results: ['Zero errori di hiring in 12 mesi', 'Tempo di onboarding dimezzato', 'Team più coeso e produttivo'],
  },
  {
    company: 'Gruppo Industriale',
    size: '200 dipendenti',
    sector: 'Settore: Manifatturiero',
    badge: '-60%',
    badgeLabel: 'Tempo selezione',
    desc: 'Il processo di selezione durava 3 settimane. Ora decidono in 3 giorni con dati oggettivi.',
    results: ['Da 3 settimane a 3 giorni', 'Decisioni basate su dati reali', 'HR team più efficiente del 70%'],
  },
  {
    company: 'Retail Chain',
    size: '50 punti vendita',
    sector: 'Settore: Retail / GDO',
    badge: '€180K',
    badgeLabel: 'Risparmio nel primo anno',
    desc: 'Il costo per assunzione sbagliata era 2x lo stipendio annuo. Ridotto drasticamente nel primo anno.',
    results: ['Costo hiring ridotto del 35%', 'Turnover store manager -50%', 'Selezione standardizzata su tutti i PV'],
  },
];

/* ─── Tabella Comparativa ─── */
const COMPARISON_ROWS = [
  { aspect: 'Strumento', others: 'Colloquio + CV', tp: 'Assessment 242 item validato' },
  { aspect: 'Tempo', others: 'Settimane', tp: '15 minuti, report istantaneo' },
  { aspect: 'Oggettività', others: 'Opinioni soggettive', tp: 'Scale psicologiche validate' },
  { aspect: 'Profondità', others: 'Superficie (competenze)', tp: 'Psicologia profonda (identità, difese)' },
  { aspect: 'Role Matching', others: 'Manuale, approssimativo', tp: 'Automatico su 30+ ruoli' },
  { aspect: 'Colloquio', others: 'Domande generiche', tp: 'Guida personalizzata' },
  { aspect: 'Post-assunzione', others: 'Speri che vada bene', tp: 'Piano inserimento su misura' },
];

/* ─── Urgency Timeline ─── */
const URGENCY_STEPS = [
  {
    period: 'Mese 1–3',
    title: 'L\'assunzione "sembra" ok',
    desc: 'Luna di miele. Il nuovo assunto sorride, annuisce, fa bella figura. I problemi ci sono già — ma non li vedi ancora. Il suo "software mentale" è in esecuzione, ma non l\'hai mai testato.',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
  },
  {
    period: 'Mese 3–6',
    title: 'I segnali arrivano',
    desc: 'Performance sotto le aspettative. Conflitti con i colleghi. Non regge la pressione. Non gestisce il team. I feedback negativi iniziano ad accumularsi — e tu inizi a chiederti: "Ma al colloquio era un\'altra persona?"',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
  },
  {
    period: 'Mese 6–12',
    title: 'Il costo esplode',
    desc: 'Turnover, riassunzione, formazione persa. Costo reale: fino a 2x lo stipendio annuo. Circa €30.000 bruciati. E il tempo? Quello non torna.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
  },
  {
    period: 'Oltre 12 mesi',
    title: 'Il danno è strutturale',
    desc: 'Team destabilizzato. Cultura aziendale compromessa. I talenti veri — quelli che avevi faticato a trovare — se ne vanno. Non per lo stipendio. Per l\'ambiente tossico che quel singolo errore ha creato.',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
  },
];

/* ─────────────────── COMPONENT ─────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ral, setRal] = useState(30000);
  const [mesi, setMesi] = useState(3);

  const costi = useMemo(() => {
    const stipendioBruciato = (ral / 12) * mesi;
    const formazione = ral * 0.15;
    const recruiting = 3000;
    const produttivitaPersa = (ral / 12) * mesi * 0.4;
    const riassunzione = 3000;
    const totale = stipendioBruciato + formazione + recruiting + produttivitaPersa + riassunzione;
    return { stipendioBruciato, formazione, recruiting, produttivitaPersa, riassunzione, totale };
  }, [ral, mesi]);

  const costiBreakdown = useMemo(() => [
    { label: 'Stipendio bruciato', value: costi.stipendioBruciato, color: 'bg-red-500' },
    { label: 'Formazione persa', value: costi.formazione, color: 'bg-orange-500' },
    { label: 'Costo recruiting', value: costi.recruiting, color: 'bg-yellow-500' },
    { label: 'Produttività persa (40%)', value: costi.produttivitaPersa, color: 'bg-amber-500' },
    { label: 'Costo riassunzione', value: costi.riassunzione, color: 'bg-rose-500' },
  ], [costi]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = useCallback(
    (id: string) => {
      setMobileOpen(false);
      setTimeout(() => scrollTo(id), 100);
    },
    []
  );

  /* ─── Counters ─── */
  const c1 = useCountUp(1000);
  const c2 = useCountUp(5000);
  const c3 = useCountUp(30);
  const c4 = useCountUp(15);

  return (
    <div className="min-h-screen bg-[#f7f4f0] text-[#1a1a2e] overflow-x-hidden">
      {/* ═══ 1. NAVBAR ═══ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#e5e0db]'
            : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <img
            src="/talentprofile_logo_v3.png"
            alt="TalentProfile"
            className="h-10 md:h-12"
          />

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-sm font-medium text-[#6b7280] hover:text-[#f09133] transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#e5e0db] text-[#1a1a2e] hover:bg-[#f7f4f0]"
              onClick={() => navigate('/auth')}
            >
              Accedi
            </Button>
            <Button
              size="sm"
              className="bg-[#f09133] hover:bg-[#e07a1f] text-white"
              onClick={() => scrollTo('cta-finale')}
            >
              Richiedi una Demo
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-[#1a1a2e]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white border-[#e5e0db]">
              <div className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleNav(l.id)}
                    className="text-left text-lg font-medium py-2 text-[#1a1a2e] hover:text-[#f09133] transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
                <hr className="border-[#e5e0db]" />
                <Button
                  variant="outline"
                  className="border-[#e5e0db] text-[#1a1a2e]"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/auth');
                  }}
                >
                  Accedi
                </Button>
                <Button
                  className="bg-[#f09133] hover:bg-[#e07a1f] text-white"
                  onClick={() => handleNav('cta-finale')}
                >
                  Richiedi una Demo
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ═══ 2. HERO (rounded box, JetHR-style) ═══ */}
      <section className="px-4 md:px-8 pt-8 md:pt-12">
        <div className="landing-hero-box max-w-7xl mx-auto py-20 md:py-32 px-6 md:px-16 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f09133] font-semibold mb-6">
              Il 70% delle assunzioni sbagliate nasce da una valutazione superficiale.
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.08] mb-8">
              In 15 minuti sai se stai assumendo un talento… o un problema.
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto mb-10">
              In soli 15 minuti ottieni il profilo psicologico completo del candidato: 242 item scientifici, 15 tratti misurati, 24 sindromi comportamentali rilevate. Report immediato, confronto tra candidati e guida strategica al colloquio personalizzata.
            </p>

            {/* ★ URGENCY BANNER ★ */}
            <div className="mb-10 p-4 rounded-xl bg-[#f09133]/10 border border-[#f09133]/20 max-w-2xl mx-auto">
              <p className="text-lg md:text-xl font-bold text-white">
                ⚠️ Ogni assunzione sbagliata ti costa in media <span className="text-[#f09133] text-2xl font-black">€30.000</span>. Quante ne hai fatte quest'anno?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-[#f09133] hover:bg-[#e07a1f] text-white text-lg px-10 py-7 rounded-xl shadow-lg"
                onClick={() => scrollTo('cta-finale')}
              >
                Richiedi una Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-7 rounded-xl"
                onClick={() => scrollTo('metodo')}
              >
                Scopri di Più
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#f09133]" /> 1.000+ Aziende clienti
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#f09133]" /> 15 min per test
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#f09133]" /> Report Istantaneo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. PROBLEMA (dolore) ═══ */}
      <Section className="py-20 md:py-28" id="problema">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Il Problema</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            Stai scommettendo il futuro della tua azienda<br className="hidden md:block" /> su una sensazione.
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-14 max-w-2xl mx-auto">
            Lo sai anche tu. Al colloquio sembrava perfetto. Dopo 3 mesi era un disastro. Il CV diceva tutto — tranne la verità. Quante volte è successo?
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {PROBLEMS.map((p, i) => (
              <div
                key={i}
                className="landing-card p-6 md:p-8 group"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <p.icon className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                    <p className="text-[#6b7280] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 4. URGENCY TIMELINE ═══ */}
      <Section className="py-0 md:py-0" id="urgency">
        <div className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="section-badge">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                Il Costo Dell'Inazione
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-center mb-16">
              Cosa succede se continui<br className="hidden md:block" /> ad assumere senza dati?
            </h2>

            <div className="relative">
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 hidden md:block"
                style={{ background: 'linear-gradient(to bottom, #22c55e, #eab308, #f97316, #ef4444)' }} />
              
              <div className="space-y-10 md:space-y-14">
                {URGENCY_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-6 md:gap-8">
                    <div className="shrink-0 relative z-10">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${step.bgColor} flex items-center justify-center shadow-md`}>
                        <span className="text-white text-sm md:text-base font-black">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                    <div className="pt-1 md:pt-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${step.color}`}>
                        {step.period}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold mt-1 mb-2">{step.title}</h3>
                      <p className="text-[#6b7280] text-base md:text-lg leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Positive closing box */}
            <div className="mt-14 p-6 md:p-8 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Ma C'è Ancora Tempo.</h3>
                  <p className="text-[#6b7280] text-base md:text-lg leading-relaxed">
                    In questo momento puoi cambiare il tuo processo di selezione. <strong className="text-[#1a1a2e]">Basta un assessment.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 5. CALCOLATORE ═══ */}
      <Section className="py-20 md:py-28" id="calcolatore">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
              Il Conto Che Non Fai
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            Quanto ti costa <span className="text-red-500">DAVVERO</span> un'assunzione sbagliata?
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-14 max-w-2xl mx-auto">
            Sposta gli slider e scopri quanto stai bruciando ogni volta che sbagli persona.
          </p>

          {/* Calculator Card */}
          <div className="landing-card p-6 md:p-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold">Calcolatore interattivo</h3>
            </div>

            {/* Slider RAL */}
            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-semibold text-[#6b7280]">Stipendio lordo annuo (RAL)</label>
                <span className="text-2xl font-black">€{ral.toLocaleString('it-IT')}</span>
              </div>
              <Slider
                value={[ral]}
                onValueChange={(v) => setRal(v[0])}
                min={20000}
                max={80000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#6b7280] mt-1">
                <span>€20.000</span>
                <span>€80.000</span>
              </div>
            </div>

            {/* Slider Mesi */}
            <div className="mb-10">
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-semibold text-[#6b7280]">Mesi prima di accorgerti dell'errore</label>
                <span className="text-2xl font-black">{mesi} {mesi === 1 ? 'mese' : 'mesi'}</span>
              </div>
              <Slider
                value={[mesi]}
                onValueChange={(v) => setMesi(v[0])}
                min={1}
                max={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#6b7280] mt-1">
                <span>1 mese</span>
                <span>12 mesi</span>
              </div>
            </div>

            {/* Risultato Totale */}
            <div className="text-center py-6 px-4 rounded-xl bg-red-50 border border-red-200 mb-8">
              <p className="text-sm font-semibold text-[#6b7280] mb-1 uppercase tracking-wide">Danno totale stimato</p>
              <p className="text-5xl md:text-6xl font-black text-red-500">
                €{Math.round(costi.totale).toLocaleString('it-IT')}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              {costiBreakdown.map((item, i) => {
                const pct = costi.totale > 0 ? (item.value / costi.totale) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6b7280] font-medium">{item.label}</span>
                      <span className="font-bold">€{Math.round(item.value).toLocaleString('it-IT')}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-red-500 font-medium mt-8 text-center leading-relaxed">
              ⚠️ E questo senza contare il danno al morale del team, i clienti persi e il tempo che non torna.
            </p>
          </div>

          {/* ★ SCENARI VISCERALI ★ */}
          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Ti è mai capitato?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="landing-card p-6 border-l-4 border-l-red-400">
                <p className="text-3xl mb-3">💼</p>
                <h4 className="text-lg font-bold mb-3">Il commerciale "perfetto"</h4>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
                  Lo avevi formato <strong className="text-[#1a1a2e]">TU</strong> per 3 mesi. Gli avevi dato il portfolio clienti migliore. Ti guardava negli occhi e diceva "questa è la mia azienda". Il lunedì mattina ti chiama e ti dice che se ne va. Portandosi dietro 2 clienti. Tre mesi di stipendio, formazione, affiancamento — tutto in fumo. E adesso devi ricominciare da zero.
                </p>
                <p className="text-red-500 font-black text-2xl">Costo reale: €35.000+</p>
              </div>
              <div className="landing-card p-6 border-l-4 border-l-red-400">
                <p className="text-3xl mb-3">👔</p>
                <h4 className="text-lg font-bold mb-3">Il responsabile che distrugge il team</h4>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
                  RAL €45.000. Al colloquio sembrava un leader nato. Dopo 6 mesi il team era a pezzi. I migliori se ne sono andati — 2 dimissioni a catena. Il clima? Tossico. Tu non te ne sei accorto subito perché "sembrava autoritario, non autoritativo". Costo tra turnover, riassunzioni e produttività bruciata?
                </p>
                <p className="text-red-500 font-black text-2xl">Oltre €80.000</p>
              </div>
              <div className="landing-card p-6 border-l-4 border-l-red-400">
                <p className="text-3xl mb-3">🔧</p>
                <h4 className="text-lg font-bold mb-3">L'operativo assunto "d'urgenza"</h4>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
                  Dovevi riempire quel posto SUBITO. Niente assessment, niente test, "tanto è un ruolo operativo". 4 mesi dopo: errori a catena, reclami dai clienti, il responsabile di linea che ti chiede "ma chi hai assunto?". Formazione buttata. Ricominciare da capo. Per un ruolo da €25.000 di RAL.
                </p>
                <p className="text-red-500 font-black text-2xl">Totale: €22.000</p>
              </div>
            </div>
          </div>

          <MiniCTA text="Vuoi evitare questo costo? Richiedi una demo" subtext="Scopri come TalentProfile ti avrebbe salvato in ognuno di questi scenari." />
        </div>
      </Section>

      {/* ═══ 6. LETTERA APERTA ═══ */}
      <Section className="py-20 md:py-28 bg-white" id="lettera">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="w-20 h-1 bg-[#f09133] mb-8 mx-auto md:mx-0" />
          <h3 className="text-2xl md:text-3xl font-bold mb-8 italic">Caro imprenditore,</h3>
          <div className="space-y-6">
            {LETTERA_PARAGRAPHS.map((paragrafo, i) => (
              <p key={i} className="text-lg md:text-xl leading-relaxed text-[#6b7280] italic">
                {i === LETTERA_PARAGRAPHS.length - 1 ? <strong className="text-[#1a1a2e] not-italic">{paragrafo}</strong> : paragrafo}
              </p>
            ))}
          </div>
          <p className="text-lg text-[#6b7280]/60 mt-4 italic">
            Non è magia. È scienza applicata alle decisioni più importanti della tua azienda: le persone che ci metti dentro.
          </p>
          <div className="mt-10 pt-6 border-t border-[#e5e0db]">
            <p className="text-xl font-bold">Il Team TalentProfile</p>
            <p className="text-sm text-[#6b7280] mt-1">Psicologia del lavoro applicata alla realtà dell'impresa</p>
          </div>
        </div>
      </Section>

      {/* ═══ 7. BUONA NOTIZIA ═══ */}
      <Section className="py-20 md:py-28" id="buona-notizia">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Ma c'è una soluzione</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            Anzi, Un'Ottima Notizia.
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-14 max-w-2xl mx-auto">
            Oggi puoi fare tutto questo:
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
            {BUONA_NOTIZIA_ITEMS.map((item, i) => (
              <div
                key={i}
                className="landing-card p-6 flex items-start gap-4 border-l-4 border-l-green-400"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-[#6b7280] leading-relaxed text-center">
              Il problema? Questi risultati li ottieni <strong className="text-[#1a1a2e]">SOLO</strong> se hai lo strumento giusto. Uno strumento costruito da chi la psicologia del lavoro la conosce davvero.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ 8. IL METODO ═══ */}
      <Section className="py-20 md:py-28 bg-white" id="metodo">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Come Funziona</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            Il Metodo TalentProfile in 4 Step
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-16 max-w-2xl mx-auto">
            Dal link al report completo. 15 minuti. Zero logistica. Dati che nessun colloquio potrebbe darti.
          </p>
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-[#e5e0db] hidden md:block" />
            <div className="space-y-12">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-6 md:gap-8">
                  <div className="shrink-0 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#f09133] text-white flex items-center justify-center text-lg md:text-xl font-black shadow-md">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="pt-1 md:pt-3">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{s.title}</h3>
                    <p className="text-[#6b7280] text-base md:text-lg leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 9. FUNZIONALITÀ ═══ */}
      <Section className="py-20 md:py-28" id="funzionalita">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Funzionalità</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            Tutto quello che ti serve per assumere meglio
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-14 max-w-2xl mx-auto">
            Non un test generico. Un sistema completo di intelligence HR costruito per darti vantaggio competitivo nelle decisioni sulle persone.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="landing-card p-6"
              >
                <div className="w-11 h-11 rounded-lg bg-[#f09133]/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-[#f09133]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 10. TABELLA COMPARATIVA ═══ */}
      <Section className="py-20 md:py-28 bg-white" id="comparativa">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Il Confronto</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-14">
            Perché TalentProfile è diverso
          </h2>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-[#e5e0db] bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e0db]">
                  <th className="text-left p-4 font-bold text-[#6b7280] bg-gray-50 w-1/4">Aspetto</th>
                  <th className="text-left p-4 font-bold text-red-500 bg-red-50/50 w-[37.5%]">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5" /> Metodo tradizionale
                    </div>
                  </th>
                  <th className="text-left p-4 font-bold text-green-600 bg-green-50/50 w-[37.5%]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> TalentProfile 360°
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-[#e5e0db]/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="p-4 font-semibold text-[#1a1a2e]">{row.aspect}</td>
                    <td className="p-4 bg-red-50/30">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-[#6b7280]">{row.others}</span>
                      </div>
                    </td>
                    <td className="p-4 bg-green-50/30">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-[#1a1a2e]">{row.tp}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {COMPARISON_ROWS.map((row, i) => (
              <div key={i} className="landing-card p-4">
                <h4 className="font-bold mb-3">{row.aspect}</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50">
                    <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-[#6b7280]">{row.others}</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-[#1a1a2e]">{row.tp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <MiniCTA text="Pronto a cambiare metodo?" subtext="Smetti di affidarti all'istinto. Inizia a decidere con i dati." />
        </div>
      </Section>

      {/* ═══ 11. TESTIMONIANZE + CASI REALI ═══ */}
      <Section className="py-20 md:py-28" id="testimonianze">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Prova Sociale</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            Chi usa TalentProfile non torna indietro.
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-14 max-w-2xl mx-auto">
            Prima sbagliavano. Adesso no. Ecco le loro storie — con il prima e il dopo.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="landing-card p-6 md:p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-[#f09133] text-[#f09133]" />
                  ))}
                </div>
                {/* PRIMA */}
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1">PRIMA</p>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{t.before}</p>
                </div>
                {/* DOPO */}
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">DOPO</p>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{t.after}</p>
                </div>
                <p className="text-[#6b7280] leading-relaxed mb-6 italic text-sm">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={[
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
                    ][i]}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-[#6b7280]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CASI REALI */}
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Risultati Reali. Aziende Reali.
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {CASE_STUDIES.map((cs, i) => (
              <div key={i} className="landing-card p-6 md:p-8 relative overflow-hidden">
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <div className="text-4xl font-black text-[#f09133]">{cs.badge}</div>
                  <div className="text-xs text-[#6b7280] font-medium text-right">{cs.badgeLabel}</div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-[#f09133]" />
                  <span className="font-bold">{cs.company}</span>
                </div>
                <p className="text-sm text-[#6b7280] mb-1">{cs.size}</p>
                <p className="text-xs text-[#f09133] font-medium mb-4">{cs.sector}</p>
                <p className="text-[#6b7280] leading-relaxed mb-6">{cs.desc}</p>
                <ul className="space-y-2">
                  {cs.results.map((r, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-[#6b7280]">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <MiniCTA text="Vuoi risultati come questi?" subtext="Richiedi una demo e scopri come TalentProfile può trasformare il tuo processo di selezione." />
        </div>
      </Section>

      {/* ═══ 12. NUMERI / CONTATORI (rounded box like hero) ═══ */}
      <Section className="py-0 md:py-0 px-4 md:px-8" id="numeri">
        <div className="landing-counter-box py-20 md:py-28 max-w-7xl mx-auto relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f09133] font-semibold text-center mb-3">
              I Risultati Parlano
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-center mb-16 text-white">
              I Numeri Che Contano
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
              {[
                { ref: c1.ref, val: c1.value.toLocaleString('it-IT'), suffix: '+', label: 'Aziende clienti' },
                { ref: c2.ref, val: c2.value.toLocaleString('it-IT'), suffix: '+', label: 'Assessment completati' },
                { ref: c3.ref, val: c3.value, suffix: '+', label: 'Ruoli mappati' },
                { ref: c4.ref, val: c4.value, suffix: ' min', label: 'Tempo per test' },
              ].map((n, i) => (
                <div key={i} ref={n.ref}>
                  <div className="text-5xl md:text-7xl font-black text-[#f09133] mb-2">
                    {n.val}{n.suffix}
                  </div>
                  <div className="text-white/60 text-sm md:text-base font-medium">{n.label}</div>
                </div>
              ))}
              <div>
                <div className="text-5xl md:text-7xl font-black text-[#f09133] mb-2">.75/1</div>
                <div className="text-white/60 text-sm md:text-base font-medium">Validazione scientifica</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 13. PER CHI È / NON È ═══ */}
      <Section className="py-20 md:py-28" id="perchi">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Qualificazione</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            TalentProfile fa per te?
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-14 max-w-2xl mx-auto">
            Non è per tutti. Ed è giusto così. Ecco come capire se siamo il tuo strumento.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* NON è per te */}
            <div className="landing-card p-6 md:p-8 border-l-4 border-l-red-400 bg-red-50/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500">
                <XCircle className="h-6 w-6" /> NON è per te se...
              </h3>
              <ul className="space-y-4">
                {FOR_NOT_FOR.not.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[#6b7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* È per te */}
            <div className="landing-card p-6 md:p-8 border-l-4 border-l-green-400 bg-green-50/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" /> È PER TE se...
              </h3>
              <ul className="space-y-4">
                {FOR_NOT_FOR.yes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-[#6b7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 14. FAQ ═══ */}
      <Section className="py-20 md:py-28 bg-white" id="faq">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
            Domande Frequenti
          </h2>
          <p className="text-center text-[#6b7280] text-lg mb-14 max-w-2xl mx-auto">
            Le stesse domande che ci fanno tutti. Le risposte sincere che diamo sempre.
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_DATA.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-[#e5e0db] rounded-lg px-4 bg-white hover:border-[#f09133]/40 transition-colors"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#6b7280] text-base leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* ═══ 15. RIQUADRO COSTO INAZIONE ═══ */}
      <Section className="py-16 md:py-20" id="costo-inazione">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="landing-card p-8 md:p-12 border-red-300 bg-red-50/50">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-black mb-6">
                Il costo di NON agire oggi
              </h3>
              <div className="space-y-4 text-lg md:text-xl text-[#6b7280] leading-relaxed">
                <p>Se assumi <strong className="text-[#1a1a2e]">10 persone l'anno</strong> e ne sbagli 3...</p>
                <p className="text-4xl md:text-5xl font-black text-red-500">
                  3 × €30.000 = €90.000/anno bruciati
                </p>
                <p>In 3 anni sono <strong className="text-red-500">€270.000</strong>.</p>
                <div className="pt-4 border-t border-red-200 mt-6">
                  <p className="text-[#6b7280] text-base">
                    Il costo di TalentProfile? <strong className="text-[#1a1a2e]">Una frazione di un singolo errore.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 16. CTA FINALE ═══ */}
      <section
        id="cta-finale"
        className="px-4 md:px-8 py-8"
      >
        <div
          className="relative py-20 md:py-28 text-center overflow-hidden rounded-3xl max-w-7xl mx-auto"
          style={{ background: 'linear-gradient(135deg, #f09133 0%, #e07a1f 50%, #d06a10 100%)' }}
        >
          <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80 font-semibold mb-4">Inizia Ora</p>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Il futuro del tuo team inizia da qui.
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-4 leading-relaxed">
              Ogni giorno che passi senza dati oggettivi sulle persone è un giorno in cui rischi un'altra assunzione sbagliata. Un altro €30.000 bruciato. Un altro talento perso.
            </p>
            <p className="text-base text-white/80 mb-10 leading-relaxed">
              La demo è gratuita, dura 30 minuti e ti mostra esattamente come funziona il sistema sulla tua realtà. Nessun impegno. Nessun venditore aggressivo. Solo dati.
            </p>
            <Button
              size="lg"
              className="bg-white text-[#f09133] hover:bg-white/90 text-lg px-10 py-7 rounded-xl shadow-xl font-bold"
              onClick={() => window.open('mailto:info@talentprofile.it?subject=Richiesta Demo TalentProfile', '_blank')}
            >
              Richiedi una Demo Gratuita <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <span className="flex items-center gap-2 text-sm text-white/80">
                <Clock className="h-4 w-4" /> Risposta in 24h
              </span>
              <span className="flex items-center gap-2 text-sm text-white/80">
                <Shield className="h-4 w-4" /> 100% Riservato
              </span>
              <span className="flex items-center gap-2 text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4" /> Senza Impegno
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#1e3a5f] py-12 mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img
              src="/talentprofile_logo_v3.png"
              alt="TalentProfile"
              className="h-10 brightness-0 invert"
            />
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/50">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="hover:text-[#f09133] transition-colors"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => navigate('/auth')}
                className="hover:text-[#f09133] transition-colors"
              >
                Accedi
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-white/30">
                <span>TalentProfile S.r.l. — P.IVA 12345678901</span>
                <span>|</span>
                <a href="#" className="hover:text-[#f09133] transition-colors">Privacy Policy</a>
                <span>|</span>
                <a href="#" className="hover:text-[#f09133] transition-colors">Cookie Policy</a>
                <span>|</span>
                <a href="#" className="hover:text-[#f09133] transition-colors">Termini e Condizioni</a>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/30">
                <a href="mailto:info@talentprofile.it" className="flex items-center gap-1.5 hover:text-[#f09133] transition-colors">
                  <Mail className="h-3.5 w-3.5" /> info@talentprofile.it
                </a>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> GDPR Compliant
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-white/20 mt-4">
              © {new Date().getFullYear()} TalentProfile. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
