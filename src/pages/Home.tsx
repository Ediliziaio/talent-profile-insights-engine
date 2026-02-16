import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Star,
  Menu,
  CheckCircle2,
  ArrowRight,
  Building2,
  Clock,
  Zap,
  Shield,
  Calculator,
  Mail,
  Linkedin,
  XCircle,
  AlertTriangle,
  Lock,
  Globe,
  Server,
  TrendingDown,
  Check,
  X,
  Sparkles,
  HelpCircle,
  ChevronRight,
  BadgeCheck,
  BookOpen,
  Flame,
  Award,
  TrendingUp,
  Skull,
  UserX,
  Timer,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const sectionTransition = { duration: 0.6, ease: 'easeOut' as const };
const cardTransition = { duration: 0.5, ease: 'easeOut' as const };

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

/* ─── Smooth scroll helper ─── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ─── DATA ─── */
const NAV_LINKS = [
  { label: 'Piattaforma', id: 'funzionalita' },
  { label: 'Come Funziona', id: 'metodo' },
  { label: 'Calcolatore', id: 'calcolatore' },
  { label: 'Testimonianze', id: 'testimonianze' },
  { label: 'FAQ', id: 'faq' },
];

const STEPS = [
  {
    icon: Send,
    title: 'Invita il Candidato',
    desc: 'Invii un link personalizzato. Il candidato compila in autonomia, da qualsiasi dispositivo. Zero logistica.',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessment Scientifico',
    desc: '242 domande validate scientificamente. 15 minuti di compilazione. Niente da preparare, niente da fingere.',
  },
  {
    icon: BarChart3,
    title: 'Report Istantaneo',
    desc: 'Profilo psicologico completo: 15 tratti, 3 macro-aree, 24 sindromi comportamentali. In tempo reale.',
  },
  {
    icon: Lightbulb,
    title: 'Decisione Informata',
    desc: 'Compatibilità ruolo automatica. Guida al colloquio personalizzata. Confronto candidati. Assumi con i dati.',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Profilo Psicologico 360°',
    desc: '15 tratti, 3 macro-aree, 24 sindromi. Report esecutivo leggibile in 5 minuti.',
    borderColor: 'border-l-[#f09133]',
  },
  {
    icon: Target,
    title: 'Mappa Interiore',
    desc: '7 profili profondi: identità, emozioni, stile di attaccamento, meccanismi difensivi.',
    borderColor: 'border-l-[#1e3a5f]',
  },
  {
    icon: Users,
    title: 'Role Matching Automatico',
    desc: 'Compatibilità istantanea con 30+ ruoli aziendali. Scopri dove il candidato performa meglio.',
    borderColor: 'border-l-green-500',
  },
  {
    icon: Lightbulb,
    title: 'Guida al Colloquio',
    desc: 'Domande personalizzate generate dall\'assessment. Sai esattamente cosa chiedere.',
    borderColor: 'border-l-[#f09133]',
  },
  {
    icon: BarChart3,
    title: 'Confronto Candidati',
    desc: 'Confronta fino a 4 candidati fianco a fianco su tutte le dimensioni psicologiche.',
    borderColor: 'border-l-[#1e3a5f]',
  },
  {
    icon: FileText,
    title: 'Report PDF Esecutivo',
    desc: 'Scaricabile, condivisibile, con piano d\'azione per i primi 90 giorni.',
    borderColor: 'border-l-green-500',
  },
];

const TESTIMONIALS = [
  {
    name: 'Marco Rinaldi',
    role: 'HR Director',
    company: 'Gruppo Industriale — 200 dip.',
    date: '12 gennaio 2025',
    text: 'Da quando usiamo TalentProfile, il turnover nei primi 6 mesi è calato del 40%. Finalmente abbiamo dati oggettivi per le nostre decisioni. Non torniamo più indietro.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    stars: 5,
  },
  {
    name: 'Chiara Fontana',
    role: 'CEO',
    company: 'Tech Startup — 25 dip.',
    date: '3 febbraio 2025',
    text: 'Con TalentProfile abbiamo ridotto gli errori di selezione quasi a zero. Il ROI? Incalcolabile. Ogni nuova risorsa performa dal primo mese. Strumento indispensabile.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    stars: 5,
  },
  {
    name: 'Luca Ferretti',
    role: 'Resp. Selezione',
    company: 'Retail Chain — 50 PV',
    date: '28 dicembre 2024',
    text: 'La mappa interiore ci ha rivelato dinamiche che nessun colloquio avrebbe fatto emergere. Abbiamo capito perché certi talenti non performavano e li abbiamo riposizionati.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    stars: 5,
  },
];

const FAQ_DATA = [
  {
    q: 'Quanto dura il test?',
    a: 'Il candidato completa l\'assessment in circa 15 minuti. Il report è disponibile istantaneamente.',
  },
  {
    q: 'È validato scientificamente?',
    a: 'Sì. TalentProfile si basa su modelli psicometrici riconosciuti, con un coefficiente di validazione .75/1.',
  },
  {
    q: 'Come invio il test a un candidato?',
    a: 'Crei il candidato dalla dashboard e il sistema genera un link unico. Il candidato lo apre e compila in autonomia.',
  },
  {
    q: 'I dati sono sicuri?',
    a: 'Tutti i dati sono crittografati, su server europei, nel pieno rispetto del GDPR.',
  },
  {
    q: 'Posso usarlo per il mio team attuale?',
    a: 'Certo. Puoi mappare il profilo dei collaboratori per ottimizzare ruoli, team building e percorsi di crescita.',
  },
  {
    q: 'Quanto costa?',
    a: 'Piani flessibili basati sul numero di assessment. Richiedi una demo per un preventivo personalizzato.',
  },
];

const LOGO_COMPANIES = [
  'TechCorp', 'InnovaGroup', 'AlphaRetail', 'NordEst HR', 'MediPlus', 'BuildItalia', 'FinServ Pro'
];

const PROBLEMS = [
  {
    icon: TrendingDown,
    title: 'Turnover nei primi 6 mesi',
    desc: 'Il 46% dei neoassunti lascia entro 18 mesi. Ma il danno inizia molto prima: demotivazione, errori, team instabile.',
    stat: '46%',
  },
  {
    icon: AlertTriangle,
    title: 'Colloqui basati sull\'istinto',
    desc: 'Senza dati oggettivi, le decisioni si basano su impressioni e bias cognitivi. Risultato: errori sistematici.',
    stat: '73%',
  },
  {
    icon: Calculator,
    title: 'Costi nascosti delle assunzioni sbagliate',
    desc: 'Ogni errore di selezione costa in media €30.000 tra stipendio bruciato, formazione persa e riassunzione.',
    stat: '€30K',
  },
];

const COMPARISON_ROWS = [
  { label: 'Metodo di valutazione', trad: 'CV + colloquio', tp: 'Assessment scientifico' },
  { label: 'Base decisionale', trad: 'Soggettivo / istinto', tp: '15 tratti misurati oggettivamente' },
  { label: 'Tempo di valutazione', trad: 'Settimane', tp: '15 minuti' },
  { label: 'Profondità analisi', trad: 'Superficiale', tp: '24 sindromi + mappa interiore' },
  { label: 'Compatibilità ruolo', trad: 'Opinione personale', tp: 'Role matching automatico' },
  { label: 'Confronto candidati', trad: 'Fogli Excel manuali', tp: 'Dashboard comparativa' },
  { label: 'Guida al colloquio', trad: 'Domande generiche', tp: 'Domande personalizzate AI' },
];

const TARGET_YES = [
  'HR Manager che vogliono dati oggettivi',
  'CEO di PMI che assumono in prima persona',
  'Recruiter stanchi di errori di selezione',
  'Team leader che costruiscono squadre',
  'Consulenti HR che cercano strumenti avanzati',
];

const TARGET_NO = [
  'Cerchi soluzioni gratuite senza investire',
  'Non credi nel valore dei dati nelle HR',
  'Preferisci affidarti solo all\'istinto',
  'Non hai intenzione di migliorare il processo',
];

const TRUST_BADGES = [
  { icon: Shield, label: 'GDPR Compliant', desc: 'Piena conformità normativa' },
  { icon: Globe, label: 'Server EU', desc: 'Dati in Europa' },
  { icon: Lock, label: 'Dati crittografati', desc: 'Crittografia end-to-end' },
  { icon: Server, label: 'ISO 27001', desc: 'Standard di sicurezza' },
  { icon: Zap, label: 'Nessuna installazione', desc: '100% cloud-based' },
];

const FEAR_SCENARIOS = [
  {
    icon: UserX,
    title: 'Lunedì mattina. Il nuovo assunto non si presenta.',
    desc: 'Nessun messaggio. Nessuna chiamata. Tre mesi di selezione buttati. Il team è a terra.',
  },
  {
    icon: Flame,
    title: 'Il team migliore si sgretola in 3 mesi.',
    desc: 'Una sola assunzione sbagliata ha destabilizzato l\'equilibrio. I talenti migliori se ne vanno.',
  },
  {
    icon: Timer,
    title: 'Hai scelto con l\'istinto. 6 mesi dopo ricominci.',
    desc: 'Formazione bruciata, clienti persi, morale a pezzi. Tutto da rifare.',
  },
  {
    icon: Skull,
    title: 'Perfetto al colloquio. Il peggior elemento in azienda.',
    desc: 'Carismatico, eloquente, convincente. Ma in azienda? Tossico, manipolativo, distruttivo.',
  },
];

const CASE_STUDIES = [
  {
    company: 'PMI Manifatturiera',
    sector: 'Manifatturiero — 120 dipendenti',
    challenge: 'Turnover al 45% nei primi 12 mesi. Team instabili, costi fuori controllo.',
    solution: 'Assessment TalentProfile su tutti i nuovi ingressi + mappatura team esistente.',
    resultBefore: 45,
    resultAfter: 12,
    resultLabel: 'Turnover',
    resultSuffix: '%',
    timeline: '6 mesi',
    highlight: 'Turnover ridotto dal 45% al 12%',
    color: '#f09133',
  },
  {
    company: 'Startup Tech',
    sector: 'Technology — 25 dipendenti',
    challenge: '3 assunzioni sbagliate consecutive in ruoli chiave. Prodotto in ritardo di 8 mesi.',
    solution: 'Role matching automatico + guida al colloquio personalizzata per ogni candidato.',
    resultBefore: 3,
    resultAfter: 0,
    resultLabel: 'Errori di selezione',
    resultSuffix: '',
    timeline: '8 mesi',
    highlight: 'Team stabile da 8 mesi consecutivi',
    color: '#1e3a5f',
  },
  {
    company: 'Catena Retail',
    sector: 'Retail — 50 punti vendita',
    challenge: 'Costo errori di selezione: €180.000/anno. Store manager sbagliati = vendite in calo.',
    solution: 'Assessment pre-assunzione + profilo psicologico per tutti i ruoli manageriali.',
    resultBefore: 180,
    resultAfter: 54,
    resultLabel: 'Costo errori (K€)',
    resultSuffix: 'K€',
    timeline: '12 mesi',
    highlight: 'Risparmio del 70% sui costi di selezione',
    color: '#22c55e',
  },
];

const FAQ_DATA_EXTRA = [
  {
    q: 'Posso provarlo gratis?',
    a: 'Sì, offriamo una demo gratuita di 30 minuti dove puoi vedere il sistema in azione sulla tua realtà aziendale. Nessun impegno.',
  },
  {
    q: 'Quanto tempo ci vuole per integrarlo?',
    a: 'Zero. TalentProfile è 100% cloud-based. Nessuna installazione, nessuna integrazione. Crei un account e inizi subito.',
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
      {/* ═══ 1. NAVBAR — Glassmorphism + animated underline ═══ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-[#e5e0db]'
            : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <img
            src="/talentprofile_logo_v3.png"
            alt="TalentProfile"
            className="h-10 md:h-12 hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="relative text-sm font-medium text-[#6b7280] hover:text-[#f09133] transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#f09133] after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#e5e0db] text-[#1a1a2e] hover:bg-[#f7f4f0] rounded-full"
              onClick={() => navigate('/auth')}
            >
              Accedi
            </Button>
            <Button
              size="sm"
              className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-full"
              onClick={() => scrollTo('cta-finale')}
            >
              Richiedi una demo
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
                  className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
                  onClick={() => handleNav('cta-finale')}
                >
                  Richiedi una demo
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ═══ 2. HERO — Radial gradient + decorative spheres ═══ */}
      <section className="px-4 md:px-8 pt-6 md:pt-10">
        <div className="landing-hero-box max-w-7xl mx-auto py-16 md:py-24 px-6 md:px-16 relative overflow-hidden border border-white/10" style={{ background: 'radial-gradient(ellipse at 30% 50%, #2a4f7a 0%, #1e3a5f 70%)' }}>
          {/* Decorative blurred spheres */}
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full bg-[#f09133]/10 blur-3xl" />
          <div className="absolute top-[40%] right-[20%] w-[150px] h-[150px] rounded-full bg-white/[0.03] blur-2xl" />

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
            {/* Left — Text */}
            <motion.div
              className="flex-1 lg:max-w-[58%]"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
              >
                Assumi le persone giuste.{' '}
                <span className="text-[#f09133]">Con i dati.</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-base md:text-lg text-white/70 leading-relaxed max-w-xl mb-8"
              >
                In 15 minuti ottieni il profilo psicologico completo del candidato: 15 tratti misurati, 24 sindromi comportamentali, compatibilità ruolo e guida al colloquio personalizzata.
              </motion.p>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-white text-[#1e3a5f] hover:bg-white/90 rounded-xl px-8 font-semibold shadow-lg"
                    onClick={() => scrollTo('metodo')}
                  >
                    Scopri di più
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-8 shadow-[0_4px_20px_rgba(240,145,51,0.4)]"
                    onClick={() => scrollTo('cta-finale')}
                  >
                    Inizia ora <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Social proof widget */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#f09133] text-[#f09133]" />
                  ))}
                </div>
                <span className="text-sm text-white/60">
                  4.8 su 5 — Assessment validato scientificamente
                </span>
              </motion.div>

              {/* Micro-badges */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-wrap gap-3 mt-4">
                {[
                  { icon: Users, text: 'Usato da +1000 HR Manager' },
                  { icon: Clock, text: '15 min per assessment' },
                  { icon: Zap, text: 'Report istantaneo' },
                ].map((badge, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-white/50 bg-white/[0.07] border border-white/10 rounded-full px-3 py-1">
                    <badge.icon className="h-3 w-3" /> {badge.text}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Product Mockup with glow shadow */}
            <motion.div
              className="flex-1 lg:max-w-[42%] w-full animate-float"
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3),0_0_40px_rgba(240,145,51,0.1)] p-5 md:p-6">
                {/* Mockup header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-[#6b7280]">TalentProfile — Report</span>
                </div>
                {/* Mockup content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f7f4f0]">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">MR</div>
                    <div>
                      <div className="text-sm font-semibold text-[#1a1a2e]">Marco Rossi</div>
                      <div className="text-xs text-[#6b7280]">Sales Manager — Fit: 92%</div>
                    </div>
                    <div className="ml-auto">
                      <div className="w-12 h-12 rounded-full border-4 border-green-400 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">92</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Essere', 'Fare', 'Avere'].map((label, i) => (
                      <div key={label} className="text-center p-2 rounded-lg bg-[#f7f4f0]">
                        <div className="text-lg font-bold text-[#1e3a5f]">{[78, 85, 71][i]}%</div>
                        <div className="text-xs text-[#6b7280]">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Leadership', val: 82, color: 'from-[#f09133] to-[#e07a1f]' },
                      { label: 'Resilienza', val: 75, color: 'from-[#1e3a5f] to-[#2a4f7a]' },
                      { label: 'Empatia', val: 88, color: 'from-green-500 to-green-400' },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-2">
                        <span className="text-xs text-[#6b7280] w-16">{t.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${t.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${t.val}%` }}
                            transition={{ duration: 1.2, delay: 0.8 + t.val * 0.005, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#1a1a2e] w-8">{t.val}%</span>
                      </div>
                    ))}
                  </div>
                  {/* Report badge */}
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#6b7280] bg-[#f7f4f0] px-3 py-1 rounded-full border border-[#e5e0db]">
                      <FileText className="h-3 w-3" /> Report Esecutivo
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ LETTERA AL LETTORE — Emotional connection ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div
            className="border-l-8 border-[#f09133] bg-white rounded-r-xl p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.06)] relative overflow-hidden"
            variants={fadeLeft}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Decorative envelope */}
            <div className="absolute top-4 right-4 opacity-[0.06]">
              <Mail className="h-24 w-24 text-[#1a1a2e]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-[#f09133]" />
                <span className="text-sm font-semibold text-[#f09133] uppercase tracking-wider">Una lettera per te</span>
              </div>
              
              <div className="letter-style space-y-5">
                <p className="text-lg">
                  <strong className="text-[#1a1a2e]">So cosa stai passando. Ci siamo passati tutti.</strong>
                </p>
                <p>
                  Hai assunto qualcuno che al colloquio sembrava perfetto. Motivato, competente, entusiasta. Diceva tutte le cose giuste. Ti guardava negli occhi con quella sicurezza che ti faceva pensare: <em>"Finalmente ho trovato la persona giusta."</em>
                </p>
                <p>
                  Poi sono passate tre settimane. Forse tre mesi. E quella persona è diventata irriconoscibile. Ritardi. Scuse. Tensioni con il team. E tu, da solo nel tuo ufficio, a fissare il muro chiedendoti: <em>"Ma chi ho preso?"</em>
                </p>
                <p>
                  Non è colpa tua. È un copione che si ripete migliaia di volte al giorno, in migliaia di aziende. Imprenditori come te, responsabili HR come te, che fanno del loro meglio con gli strumenti che hanno — e che continuano a sbattere contro lo stesso muro.
                </p>
                
                <div className="bg-[#fef9c3]/60 border-l-4 border-[#f09133]/50 rounded-r-lg p-4 my-6">
                  <p className="text-[#1a1a2e] font-medium italic">
                    "Il 73% degli HR manager ammette di aver fatto almeno un'assunzione sbagliata nell'ultimo anno."
                  </p>
                </div>
                
                <p>
                  Sai qual è la parte peggiore? Non è solo lo stipendio buttato. Non sono solo i mesi persi. È quella vocina nella testa che ti dice: <em>"E se sbaglio di nuovo?"</em>
                </p>
                <p>
                  Quella paura ti frena. Ti fa tenere persone mediocri perché almeno "le conosci già". Ti fa rimandare assunzioni strategiche. Ti fa accontentare. E intanto il tuo team perde fiducia, i tuoi clienti lo percepiscono, e il tuo fatturato ne risente.
                </p>
                <p>
                  <strong className="text-[#1a1a2e]">Ci siamo passati. Sappiamo esattamente come ci si sente.</strong>
                </p>
                <p>
                  Ecco perché abbiamo creato <strong className="text-[#f09133]">TalentProfile</strong>.
                </p>
                <p>
                  Non l'ennesimo test della personalità scaricato da internet. Non un questionario generico che ti dà risposte vaghe e inutilizzabili.
                </p>
                <p>
                  TalentProfile è un sistema di profilazione psicologica sviluppato in collaborazione con psicologi del lavoro, psicoterapeuti e professionisti delle risorse umane — persone che studiano il comportamento umano da decenni, non marketer che si improvvisano esperti di selezione.
                </p>
                <p>
                  È nato dall'incontro tra scienza e campo. Da una parte, le basi solide della psicologia comportamentale e organizzativa. Dall'altra, anni di esperienza diretta nelle assunzioni — compresi tutti gli errori che abbiamo pagato caro e le notti passate a chiederci <em>"come facciamo a non ripetere lo stesso sbaglio?"</em>
                </p>
                <p>
                  Il risultato? Un sistema che analizza <strong className="text-[#1a1a2e]">15 tratti comportamentali</strong> e <strong className="text-[#1a1a2e]">5 dimensioni psicologiche</strong> di ogni candidato. Che ti mostra chi hai davvero di fronte — non chi quella persona finge di essere durante un colloquio di 45 minuti.
                </p>
                <p>
                  Perché il problema non sei tu. Il problema è che un colloquio tradizionale è progettato per farti vedere solo quello che il candidato vuole mostrarti. È un palcoscenico. E i migliori attori non sono sempre i migliori lavoratori.
                </p>
                <p>
                  Con TalentProfile smetti di decidere sulle persone al buio. Smetti di affidarti all'istinto, alle sensazioni, al <em>"mi sembra una brava persona"</em>. Inizi a decidere con i dati. Con la chiarezza. Con la sicurezza di chi sa — perché ha gli strumenti giusti per sapere.
                </p>
                <p>
                  Non ti stiamo chiedendo di fidarti di noi. Ti stiamo chiedendo di fidarti della scienza. Degli stessi modelli psicologici usati nelle più grandi aziende del mondo, adattati e perfezionati per la realtà delle PMI italiane — per imprenditori che non hanno un reparto HR da 50 persone, ma che hanno bisogno delle stesse risposte.
                </p>
                <p>
                  <strong className="text-[#1a1a2e]">Questa lettera è per te</strong> — che vuoi smettere di sperare e iniziare a sapere.
                </p>
                <p>
                  Se sei arrivato fin qui, è perché qualcosa di quello che hai letto ti ha colpito. Forse ti ci sei rivisto. Forse hai pensato a quell'ultima assunzione che ti ha fatto perdere il sonno. Forse stai per assumere qualcuno proprio in queste settimane e vuoi essere sicuro di non ripetere gli stessi errori.
                </p>
                <p className="text-lg font-medium text-[#1a1a2e]">
                  Allora fai una cosa semplice: <strong>provalo. Gratis.</strong>
                </p>
                <p>
                  Nessun impegno, nessun vincolo, nessuna carta di credito. Solo la possibilità di vedere con i tuoi occhi cosa significa finalmente avere chiarezza sulle persone che entrano nella tua azienda.
                </p>

                <div className="text-center my-8">
                  <a href="#cta-finale" className="inline-flex items-center gap-2 bg-[#f09133] hover:bg-[#d47a1f] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Richiedi la tua prova gratuita ora
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>

                <p>
                  Perché la prossima assunzione che farai potrebbe essere quella giusta. O potrebbe essere l'ennesimo errore che ti costa mesi di frustrazione e migliaia di euro buttati.
                </p>
                <p>
                  La differenza sta negli strumenti che usi per decidere.
                </p>
                <p className="text-xl font-bold text-[#1a1a2e] text-center mt-6">
                  Scegli di sapere.
                </p>
              </div>
              
              {/* Signature */}
              <div className="mt-8 pt-6 border-t border-[#e5e0db]/50">
                <p className="font-serif italic text-lg text-[#1a1a2e] mb-1">Alessandro Rossi</p>
                <p className="text-sm text-[#6b7280]">Fondatore, TalentProfile</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 3. LOGO BAR — Separator + hover grayscale remove ═══ */}
      <motion.section
        className="py-8 md:py-10 bg-[#faf8f5]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          {/* Top separator */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#f09133]/30 to-transparent mb-10" />
          <p className="text-sm text-[#6b7280] mb-8 font-medium">
            Scelto da più di 1.000 aziende italiane
          </p>
          <div className="logo-marquee-container overflow-hidden">
            <div className="animate-marquee flex items-center gap-14 w-max hover:[animation-play-state:paused]" style={{ animationDuration: '20s' }}>
              {[...LOGO_COMPANIES, ...LOGO_COMPANIES, ...LOGO_COMPANIES].map((name, i) => (
                <div key={`${name}-${i}`} className="flex items-center gap-2 opacity-40 grayscale shrink-0 hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                  <Building2 className="h-5 w-5 text-[#1a1a2e]" />
                  <span className="text-sm font-semibold text-[#1a1a2e] whitespace-nowrap">{name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom separator */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#f09133]/30 to-transparent mt-10" />
        </div>
      </motion.section>

      {/* ═══ 4. PROBLEMA — Stat decorations + thicker border ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-white to-[#fefcfb] relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-3">
            <span className="section-badge">Il Problema</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Perché le aziende continuano a sbagliare assunzioni
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-6 max-w-2xl mx-auto">
            I metodi tradizionali di selezione hanno limiti strutturali che costano caro.
          </p>
          {/* Shock value */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-5xl md:text-7xl font-black text-red-500">€30.000</span>
            <p className="text-[#6b7280] text-sm mt-2">È il costo medio di <strong className="text-[#1a1a2e]">ogni singolo errore</strong> di selezione</p>
          </motion.div>
          <div className="gradient-separator mb-10" />
          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={i}
                className="landing-card p-6 border-l-[6px] border-l-red-400 relative overflow-hidden bg-gradient-to-br from-white to-rose-50/30"
                variants={fadeUp}
                transition={cardTransition}
                whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              >
                {/* Decorative stat number */}
                <span className="absolute top-2 right-3 text-6xl font-black text-red-100/50 select-none pointer-events-none leading-none">{p.stat}</span>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <p.icon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ L'INCUBO CHE CONOSCI — Fear Section ═══ */}
      <section className="py-16 md:py-24 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)' }}>
        {/* Decorative red glow */}
        <div className="absolute top-0 left-[20%] w-[300px] h-[300px] rounded-full bg-red-500/[0.04] blur-3xl" />
        <div className="absolute bottom-0 right-[15%] w-[250px] h-[250px] rounded-full bg-red-500/[0.06] blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            className="text-center mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            transition={sectionTransition}
          >
            <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <AlertTriangle className="h-3.5 w-3.5" /> La realtà che nessuno racconta
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              L'incubo che conosci bene
            </h2>
            <p className="text-white/50 text-base max-w-2xl mx-auto mb-14">
              Questi scenari ti suonano familiari? Non sei l'unico.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {FEAR_SCENARIOS.map((s, i) => (
              <motion.div
                key={i}
                className="fear-card animate-pulse-border p-6 md:p-8"
                variants={fadeUp}
                transition={{ ...cardTransition, delay: i * 0.15 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <s.icon className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            transition={{ ...sectionTransition, delay: 0.6 }}
          >
            <p className="text-white/40 text-sm mb-2">Non deve essere così.</p>
            <p className="text-[#f09133] font-semibold text-lg">C'è un modo migliore.</p>
            <div className="w-12 h-[2px] bg-[#f09133]/50 mx-auto mt-4" />
          </motion.div>
        </div>
      </section>

      {/* ═══ 5. FUNZIONALITÀ — Alternating borders + chevron ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#f7f4f0] to-[#faf8f5] relative"
        id="funzionalita"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Piattaforma</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Tutto quello che ti serve per assumere meglio
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Un sistema completo di intelligence HR per decisioni basate sui dati.
          </p>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className={`landing-card p-6 group cursor-pointer border-l-[5px] ${f.borderColor} relative overflow-hidden`}
                variants={fadeUp}
                transition={cardTransition}
                whileHover={{ y: -6, boxShadow: '0 16px 50px rgba(0,0,0,0.1)' }}
              >
                {/* Decorative number */}
                <span className="number-decoration">{String(i + 1).padStart(2, '0')}</span>
                <motion.div
                  className="w-14 h-14 rounded-full bg-[#f09133]/10 flex items-center justify-center mb-4 group-hover:bg-[#f09133]/25 transition-colors duration-300"
                >
                  <f.icon className="h-6 w-6 text-[#f09133] group-hover:scale-110 transition-transform duration-300" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
                <ChevronRight className="absolute bottom-4 right-4 h-4 w-4 text-[#e5e0db] group-hover:text-[#f09133] group-hover:translate-x-1 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-10">
            <button
              onClick={() => scrollTo('metodo')}
              className="text-[#f09133] font-semibold text-sm hover:underline inline-flex items-center gap-1"
            >
              Scopri come funziona <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. MANIFESTO — Pattern + pulse brain + quote ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white"
        id="manifesto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            {/* Left — Image with pattern */}
            <motion.div
              className="flex-1 w-full md:max-w-[45%]"
              variants={fadeLeft}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2a4f7a] flex items-center justify-center p-8 relative overflow-hidden shadow-[0_20px_60px_rgba(30,58,95,0.4)] border border-white/10">
                {/* Geometric pattern */}
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] rounded-full bg-white/5 blur-xl" />
                <div className="absolute bottom-[-20px] left-[-20px] w-[100px] h-[100px] rounded-full bg-[#f09133]/10 blur-xl" />
                <div className="text-center text-white relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Brain className="h-20 w-20 mx-auto mb-4 opacity-70" />
                  </motion.div>
                  <p className="text-lg font-semibold opacity-80">La scienza dietro le decisioni</p>
                  <p className="text-base italic text-white/50 mt-3 font-medium">"La persona giusta al posto giusto cambia tutto."</p>
                </div>
              </div>
            </motion.div>
            {/* Right — Text */}
            <motion.div className="flex-1" variants={fadeRight} transition={{ duration: 0.7, ease: 'easeOut' }}>
              <span className="section-badge mb-4 inline-block">Manifesto</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Odiamo le assunzioni sbagliate.
              </h2>
              <p className="text-[#6b7280] text-base leading-relaxed mb-4">
                Ogni assunzione sbagliata costa in media €30.000. Ma il vero danno non è economico: è il team che si destabilizza, i talenti che se ne vanno, la cultura aziendale che si deteriora.
              </p>
              <p className="text-[#6b7280] text-base leading-relaxed mb-8">
                TalentProfile nasce per una ragione semplice: dare alle aziende italiane gli strumenti scientifici per decidere sulle persone. Non opinioni, non sensazioni. Dati.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl shadow-[0_4px_20px_rgba(240,145,51,0.3)]"
                  onClick={() => scrollTo('cta-finale')}
                >
                  Inizia ora <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 7. CTA INTERMEDIO — Sparkles icon + stronger bg ═══ */}
      <motion.section
        className="py-10 md:py-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#f09133]/8 to-[#f09133]/15 border border-[#f09133]/40 py-10 px-6 md:px-12 text-center relative overflow-hidden">
            <div className="dot-pattern" />
            <div className="absolute top-[-20px] right-[-20px] w-[100px] h-[100px] rounded-full bg-[#f09133]/8 blur-2xl" />
            <Sparkles className="h-8 w-8 text-[#f09133]/60 mx-auto mb-4 relative z-10" />
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Vuoi vedere TalentProfile in azione?
            </h3>
            <p className="text-[#6b7280] text-base mb-3 max-w-xl mx-auto">
              Richiedi una demo gratuita e scopri come funziona sulla tua realtà aziendale.
            </p>
            <p className="text-sm text-[#f09133] font-semibold mb-6">Già 1.247 aziende l'hanno fatto</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-8 shadow-[0_4px_20px_rgba(240,145,51,0.3)]"
                onClick={() => scrollTo('cta-finale')}
              >
                Richiedi una demo gratuita <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 8. IL METODO — Gradient timeline + glow circles + cards ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white"
        id="metodo"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Come Funziona</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Il Metodo TalentProfile in 4 Step
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-16 max-w-2xl mx-auto">
            Dal link al report completo. 15 minuti. Zero logistica.
          </p>
          <motion.div
            className="max-w-3xl mx-auto relative"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Gradient vertical line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 hidden md:block" style={{ background: 'linear-gradient(to bottom, #f09133, #1e3a5f)' }} />
            <div className="space-y-10">
              {STEPS.map((s, i) => (
                <motion.div key={i} className="flex items-start gap-6 md:gap-8 rounded-xl p-5 md:p-6 landing-card border border-[#e5e0db]/60" variants={fadeUp} transition={cardTransition} whileHover={{ y: -3 }}>
                  <div className="shrink-0 relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#f09133] text-white flex flex-col items-center justify-center text-lg md:text-xl font-bold shadow-[0_0_25px_rgba(240,145,51,0.4)]">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <s.icon className="h-4 w-4 text-[#f09133] mt-2 opacity-60" />
                    {/* Horizontal connector line */}
                    <div className="hidden md:block absolute top-7 left-full w-4 h-0.5 bg-[#f09133]/20" />
                  </div>
                  <div className="pt-1 md:pt-3">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{s.title}</h3>
                    <p className="text-[#6b7280] text-base leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 9. CALCOLATORE — Orange border + dramatic result ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#f7f4f0] to-[#faf8f5]"
        id="calcolatore"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Calcolatore</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Quanto costa un'assunzione sbagliata?
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Sposta gli slider e scopri il costo reale di un errore di selezione.
          </p>

          <div className="landing-card p-6 md:p-10 max-w-3xl mx-auto border-[#f09133]/20 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-full bg-[#f09133]/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-[#f09133]" />
              </div>
              <h3 className="text-lg font-bold">Calcolatore interattivo</h3>
            </div>

            {/* Slider RAL */}
            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-semibold text-[#6b7280]">Stipendio lordo annuo (RAL)</label>
                <span className="text-2xl font-bold">€{ral.toLocaleString('it-IT')}</span>
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
                <label className="text-sm font-semibold text-[#6b7280]">Mesi prima dell'errore</label>
                <span className="text-2xl font-bold">{mesi} {mesi === 1 ? 'mese' : 'mesi'}</span>
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

            {/* Risultato — gradient + alert icon */}
            <div className="text-center py-8 px-6 rounded-xl bg-gradient-to-br from-red-50 via-red-100/60 to-orange-50/40 border border-red-200 mb-8 relative overflow-hidden">
              {/* Decorative Euro icon */}
              <span className="absolute top-4 left-6 text-7xl font-black text-red-100/40 select-none pointer-events-none leading-none">€</span>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 right-4"
              >
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </motion.div>
              <p className="text-sm font-semibold text-[#6b7280] mb-1 uppercase tracking-wide relative z-10">Danno totale stimato</p>
              <p className="text-4xl md:text-5xl font-bold text-red-500 relative z-10">
                €{Math.round(costi.totale).toLocaleString('it-IT')}
              </p>
              {/* Savings comparison */}
              <div className="mt-4 pt-3 border-t border-green-200 relative z-10">
                <p className="text-sm text-green-600 font-semibold flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Con TalentProfile: <span className="text-lg font-bold">€{Math.round(costi.totale * 0.7).toLocaleString('it-IT')}</span> risparmiati
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              {costiBreakdown.map((item, i) => {
                const pct = costi.totale > 0 ? (item.value / costi.totale) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6b7280]">{item.label}</span>
                      <span className="font-semibold">€{Math.round(item.value).toLocaleString('it-IT')}</span>
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
          </div>
        </div>
      </motion.section>

      {/* ═══ 10. TABELLA COMPARATIVA — Zebra + badge + rounded ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Confronto</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Metodo Tradizionale vs TalentProfile
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Ecco perché i dati battono l'istinto.
          </p>
          <div className="landing-card overflow-hidden rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#e5e0db]">
                    <th className="text-left p-5 font-bold text-[#1a1a2e] text-base">Criterio</th>
                    <th className="text-center p-5 font-bold text-red-700 text-base bg-red-100/80">Metodo Tradizionale</th>
                    <th className="text-center p-5 font-bold text-green-800 text-base bg-green-100/80 relative">
                      TalentProfile
                      <span className="absolute top-2 right-2 text-[10px] bg-green-500 text-white px-2 py-1 rounded-full font-bold shadow-sm">✓ Vincitore</span>
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainerFast}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                >
                  {COMPARISON_ROWS.map((row, i) => (
                    <motion.tr key={i} className={`border-b border-[#e5e0db] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]/50'}`} variants={fadeUp} transition={cardTransition}>
                      <td className="p-4 font-medium">{row.label}</td>
                      <td className="p-4 text-center bg-red-50/30">
                        <motion.div
                          className="flex items-center justify-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                        >
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <X className="h-4 w-4 text-red-500" />
                          </div>
                          <span className="text-[#6b7280]">{row.trad}</span>
                        </motion.div>
                      </td>
                      <td className="p-4 text-center bg-green-50/30">
                        <motion.div
                          className="flex items-center justify-center gap-2"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                        >
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-[#1a1a2e] font-medium">{row.tp}</span>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                  {/* Score row */}
                  <tr className="border-t-2 border-[#e5e0db] bg-[#faf8f5]">
                    <td className="p-4 font-bold text-[#1a1a2e]">Punteggio totale</td>
                    <td className="p-4 text-center bg-red-50/50">
                      <span className="text-2xl font-bold text-red-500">2/7</span>
                    </td>
                    <td className="p-4 text-center bg-green-50/50">
                      <span className="text-2xl font-bold text-green-600">7/7</span>
                    </td>
                  </tr>
                </motion.tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 11. TESTIMONIANZE — Quotes + orange avatar border + verified ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#f7f4f0] to-[#faf8f5] relative"
        id="testimonianze"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="dot-pattern" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-3">
            <span className="section-badge">Testimonianze</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Chi usa TalentProfile non torna indietro
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Ecco cosa dicono i professionisti HR che hanno scelto il nostro sistema.
          </p>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} className="bg-gradient-to-br from-white to-[#faf8f5]/50 rounded-xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.07)] border border-[#e5e0db]/50 relative overflow-hidden" variants={fadeUp} transition={cardTransition} whileHover={{ y: -5, boxShadow: '0 16px 50px rgba(0,0,0,0.1)' }}>
                {/* Decorative quote */}
                <span className="absolute top-1 right-4 text-7xl font-serif text-[#f09133]/15 select-none pointer-events-none leading-none">"</span>
                {/* LinkedIn-style header */}
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#f09133]/40 ring-offset-2"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      {t.name}
                      <BadgeCheck className="h-4 w-4 text-[#1e3a5f]" />
                    </div>
                    <div className="text-xs text-[#6b7280]">{t.role} — {t.company}</div>
                    <div className="text-xs text-[#6b7280]/60 mt-0.5">{t.date}</div>
                  </div>
                  <Linkedin className="h-5 w-5 text-[#0077b5] shrink-0" />
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#f09133] text-[#f09133]" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-[#6b7280] text-sm leading-relaxed relative z-10">{t.text}</p>
                
                {/* Key metrics */}
                <div className="flex gap-3 mt-4 pt-3 border-t border-[#e5e0db]/40">
                  {[
                    ['-40% turnover', '-35% costi', '+3 mesi retention'],
                    ['Zero errori', '+200% ROI', 'Team stabile'],
                    ['+85% fit', '-60% rotazione', 'Report in 15min'],
                  ][i]?.map((metric, j) => (
                    <span key={j} className="text-[10px] font-semibold text-[#f09133] bg-[#f09133]/10 px-2 py-0.5 rounded-full">
                      {metric}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ STORIE DI SUCCESSO — Case Studies ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#faf8f5] to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">
              <Award className="h-3.5 w-3.5 mr-1.5 inline" /> Storie di Successo
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Risultati reali, aziende reali
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Ecco come TalentProfile ha trasformato il processo di selezione di aziende come la tua.
          </p>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {CASE_STUDIES.map((cs, i) => (
              <motion.div
                key={i}
                className="case-study-card"
                variants={fadeUp}
                transition={cardTransition}
                whileHover={{ y: -6 }}
              >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-[#e5e0db]/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${cs.color}15` }}>
                        <Building2 className="h-5 w-5" style={{ color: cs.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1a1a2e]">{cs.company}</h3>
                        <p className="text-xs text-[#6b7280]">{cs.sector}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                      <BadgeCheck className="h-3 w-3" /> Caso Reale
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">La Sfida</p>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{cs.challenge}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider mb-1">La Soluzione</p>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{cs.solution}</p>
                  </div>
                  
                  {/* Result Bar */}
                  <div className="bg-[#f7f4f0] rounded-lg p-4">
                    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Risultato in {cs.timeline}</p>
                    <div className="flex items-end gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400 line-through opacity-70">{cs.resultBefore}{cs.resultSuffix}</p>
                        <p className="text-[10px] text-[#6b7280]">Prima</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#f09133] mb-2" />
                      <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: cs.color }}>{cs.resultAfter}{cs.resultSuffix}</p>
                        <p className="text-[10px] text-[#6b7280]">Dopo</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: cs.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - (cs.resultAfter / cs.resultBefore) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  
                  {/* Highlight */}
                  <div className="flex items-center gap-2 pt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                    <p className="text-sm font-semibold text-[#1a1a2e]">{cs.highlight}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 12. PER CHI È — Gradient cards + VS divider ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-3">
            <span className="section-badge">Per Chi È</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            TalentProfile è per te?
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Scopri se il nostro sistema è adatto alle tue esigenze.
          </p>
          <div className="grid md:grid-cols-2 gap-6 relative">
            {/* VS divider */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#1a1a2e] text-white items-center justify-center font-bold text-base shadow-[0_0_20px_rgba(26,26,46,0.4)]">VS</div>
            {/* Card Verde */}
            <motion.div
              className="landing-card p-8 border-l-[6px] border-l-green-400 bg-gradient-to-br from-green-50/60 to-white"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-green-700">Per chi è TalentProfile</h3>
              </div>
              <ul className="space-y-3">
                {TARGET_YES.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-[#6b7280] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            {/* Card Rossa */}
            <motion.div
              className="landing-card p-8 border-l-[6px] border-l-red-400 bg-gradient-to-br from-red-50/60 to-white"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-red-700">Non fa per te se...</h3>
              </div>
              <ul className="space-y-3">
                {TARGET_NO.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="h-3 w-3 text-red-500" />
                    </div>
                    <span className="text-[#6b7280] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 13. NUMERI / CONTATORI — Gradient + spheres + glow + separators + icons ═══ */}
      <motion.section
        className="py-0 md:py-0 px-4 md:px-8"
        id="numeri"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="py-16 md:py-24 max-w-7xl mx-auto relative overflow-hidden rounded-[1.5rem]" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          {/* Decorative spheres */}
          <div className="absolute top-[-50px] right-[10%] w-[200px] h-[200px] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-[-60px] left-[5%] w-[250px] h-[250px] rounded-full bg-[#f09133]/[0.08] blur-3xl" />

          <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#f09133] font-semibold text-center mb-3">
              I Numeri
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-white">
              I risultati parlano
            </h2>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {[
                { ref: c1.ref, val: c1.value.toLocaleString('it-IT'), suffix: '+', label: 'Aziende clienti', icon: Building2 },
                { ref: c2.ref, val: c2.value.toLocaleString('it-IT'), suffix: '+', label: 'Assessment completati', icon: ClipboardCheck },
                { ref: c3.ref, val: c3.value, suffix: '+', label: 'Ruoli mappati', icon: Target },
                { ref: c4.ref, val: c4.value, suffix: ' min', label: 'Tempo per test', icon: Clock },
              ].map((n, i) => (
                <motion.div key={i} ref={n.ref} variants={scaleIn} transition={cardTransition} className="relative">
                  {i > 0 && <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-px bg-white/15" />}
                  <div className="text-5xl md:text-6xl font-bold text-[#f09133] mb-2" style={{ textShadow: '0 0 30px rgba(240,145,51,0.3)' }}>
                    {n.val}{n.suffix}
                  </div>
                  <n.icon className="h-5 w-5 text-white/40 mx-auto mb-1" />
                  <div className="text-white/60 text-sm font-medium">{n.label}</div>
                  <div className="text-white/30 text-xs mt-0.5">e in crescita</div>
                </motion.div>
              ))}
              <motion.div variants={scaleIn} transition={cardTransition} className="relative">
                <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-px bg-white/10" />
                <div className="text-5xl md:text-6xl font-bold text-[#f09133] mb-2" style={{ textShadow: '0 0 30px rgba(240,145,51,0.3)' }}>.75/1</div>
                <Star className="h-5 w-5 text-white/40 mx-auto mb-1" />
                <div className="text-white/60 text-sm font-medium">Validazione scientifica</div>
                <div className="text-white/30 text-xs mt-0.5">certificata</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 14. TRUST / SICUREZZA — Shield cards + orange ring + separators ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-white to-[#faf8f5]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="section-badge mb-3 inline-block">Sicurezza</span>
            <h2 className="text-2xl md:text-3xl font-bold accent-underline mx-auto w-fit">
              I tuoi dati sono al sicuro
            </h2>
          </div>
          <motion.div
            className="flex flex-wrap justify-center gap-6 md:gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {TRUST_BADGES.map((badge, i) => (
              <motion.div key={i} className="flex flex-col items-center text-center w-[160px] bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#e5e0db]/50 hover:scale-105 transition-transform duration-300" variants={scaleIn} transition={cardTransition}>
                <div className="w-16 h-16 rounded-full bg-[#f7f4f0] border-2 border-[#f09133]/30 flex items-center justify-center mb-3">
                  <badge.icon className="h-7 w-7 text-[#1e3a5f]" />
                </div>
                <span className="text-sm font-semibold text-[#1a1a2e]">{badge.label}</span>
                <span className="text-xs text-[#6b7280] mt-1">{badge.desc}</span>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-xs text-[#6b7280] mt-6">Conformi a tutte le normative europee sulla protezione dei dati personali</p>
        </div>
      </motion.section>

      {/* ═══ 15. FAQ — Orange active border + ? icon ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#faf8f5] to-[#f7f4f0] relative"
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="dot-pattern" />
        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-3">
            <span className="section-badge">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            <HelpCircle className="inline-block h-9 w-9 text-[#f09133] mr-2 -mt-1" />
            Domande Frequenti
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Le risposte alle domande più comuni.
          </p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {[...FAQ_DATA, ...FAQ_DATA_EXTRA].map((f, i) => (
                <motion.div key={i} variants={fadeUp} transition={cardTransition}>
                  <AccordionItem
                    value={`faq-${i}`}
                    className="border border-[#e5e0db] rounded-lg px-5 py-1 bg-white hover:border-[#f09133]/40 hover:shadow-md hover:bg-[#faf8f5]/50 transition-all duration-300 data-[state=open]:border-l-4 data-[state=open]:border-l-[#f09133] data-[state=open]:shadow-md"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#6b7280] text-base leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 16. CTA FINALE — Sparkles + glow button + urgency badge ═══ */}
      <motion.section
        id="cta-finale"
        className="px-4 md:px-8 py-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="py-16 md:py-24 text-center max-w-7xl mx-auto relative overflow-hidden rounded-[1.5rem]" style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a4f7a 0%, #1e3a5f 60%, #162d4a 100%)' }}>
          {/* Animated sparkles */}
          <motion.div
            className="absolute top-8 left-[15%]"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-6 w-6 text-[#f09133]/40" />
          </motion.div>
          <motion.div
            className="absolute bottom-12 right-[20%]"
            animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.3, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <Sparkles className="h-5 w-5 text-white/20" />
          </motion.div>
          <motion.div
            className="absolute top-[40%] right-[8%]"
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <Star className="h-4 w-4 text-[#f09133]/30" />
          </motion.div>

          {/* Decorative spheres */}
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full bg-[#f09133]/[0.08] blur-3xl" />

          <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
            {/* Urgency badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6"
            >
              <Zap className="h-3.5 w-3.5 text-[#f09133]" />
              <span className="text-xs font-semibold text-[#f09133]">Solo 5 demo disponibili questa settimana</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Il futuro del tuo team inizia{' '}
              <span className="text-[#f09133]">da qui.</span>
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 leading-relaxed">
              La demo è gratuita, dura 30 minuti e ti mostra esattamente come funziona il sistema sulla tua realtà. Nessun impegno.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="bg-[#f09133] hover:bg-[#e07a1f] text-white text-xl px-12 py-8 rounded-xl shadow-[0_0_30px_rgba(240,145,51,0.4)] animate-[pulse_3s_ease-in-out_infinite]"
                onClick={() => window.open('mailto:info@talentprofile.it?subject=Richiesta Demo TalentProfile', '_blank')}
              >
                Richiedi una Demo Gratuita <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-4">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white/80 hover:bg-white/10 hover:text-white rounded-xl px-8"
                onClick={() => window.open('https://linkedin.com', '_blank')}
              >
                <Linkedin className="mr-2 h-4 w-4" /> Oppure scrivici su LinkedIn
              </Button>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <span className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="h-4 w-4" /> Risposta in 24h
              </span>
              <span className="flex items-center gap-2 text-sm text-white/60">
                <Shield className="h-4 w-4" /> 100% Riservato
              </span>
              <span className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4" /> Senza Impegno
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ FOOTER — Gradient separator + social icons + glow logo ═══ */}
      <footer className="bg-[#1e3a5f] py-14 mt-8 relative">
        {/* Orange gradient separator */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f09133] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Col 1 — Logo + desc */}
            <div>
              <img
                src="/talentprofile_logo_v3.png"
                alt="TalentProfile"
                className="h-10 brightness-0 invert mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
              />
              <p className="text-sm text-white/50 leading-relaxed">
                Psicologia del lavoro applicata alla realtà dell'impresa. Assessment scientifici per decisioni HR basate sui dati.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3 mt-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f09133]/30 transition-colors">
                  <Linkedin className="h-4 w-4 text-white/60" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f09133]/30 transition-colors">
                  <Mail className="h-4 w-4 text-white/60" />
                </a>
              </div>
            </div>

            {/* Col 2 — Link rapidi */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Link rapidi</h4>
              <div className="space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="block text-sm text-white/50 hover:text-[#f09133] transition-colors relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#f09133] after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {l.label}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/auth')}
                  className="block text-sm text-white/50 hover:text-[#f09133] transition-colors relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#f09133] after:transition-all after:duration-300 hover:after:w-full"
                >
                  Accedi
                </button>
              </div>
            </div>

            {/* Col 3 — Risorse */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Risorse</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-white/50 hover:text-[#f09133] transition-colors relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#f09133] after:transition-all after:duration-300 hover:after:w-full">Blog HR</a>
                <a href="#" className="block text-sm text-white/50 hover:text-[#f09133] transition-colors relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#f09133] after:transition-all after:duration-300 hover:after:w-full">Guida all'Assessment</a>
                <a href="#" className="block text-sm text-white/50 hover:text-[#f09133] transition-colors relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#f09133] after:transition-all after:duration-300 hover:after:w-full">Case Studies</a>
                <a href="#" className="block text-sm text-white/50 hover:text-[#f09133] transition-colors relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#f09133] after:transition-all after:duration-300 hover:after:w-full">Webinar</a>
              </div>
            </div>

            {/* Col 3 — Contatti */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contatti</h4>
              <div className="space-y-2">
                <a
                  href="mailto:info@talentprofile.it"
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-[#f09133] transition-colors"
                >
                  <Mail className="h-4 w-4" /> info@talentprofile.it
                </a>
                <p className="flex items-center gap-2 text-sm text-white/50">
                  <Shield className="h-4 w-4" /> GDPR Compliant
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/10">
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
