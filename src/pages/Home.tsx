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
  },
  {
    icon: Target,
    title: 'Mappa Interiore',
    desc: '7 profili profondi: identità, emozioni, stile di attaccamento, meccanismi difensivi.',
  },
  {
    icon: Users,
    title: 'Role Matching Automatico',
    desc: 'Compatibilità istantanea con 30+ ruoli aziendali. Scopri dove il candidato performa meglio.',
  },
  {
    icon: Lightbulb,
    title: 'Guida al Colloquio',
    desc: 'Domande personalizzate generate dall\'assessment. Sai esattamente cosa chiedere.',
  },
  {
    icon: BarChart3,
    title: 'Confronto Candidati',
    desc: 'Confronta fino a 4 candidati fianco a fianco su tutte le dimensioni psicologiche.',
  },
  {
    icon: FileText,
    title: 'Report PDF Esecutivo',
    desc: 'Scaricabile, condivisibile, con piano d\'azione per i primi 90 giorni.',
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
  },
  {
    icon: AlertTriangle,
    title: 'Colloqui basati sull\'istinto',
    desc: 'Senza dati oggettivi, le decisioni si basano su impressioni e bias cognitivi. Risultato: errori sistematici.',
  },
  {
    icon: Calculator,
    title: 'Costi nascosti delle assunzioni sbagliate',
    desc: 'Ogni errore di selezione costa in media €30.000 tra stipendio bruciato, formazione persa e riassunzione.',
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

      {/* ═══ 2. HERO — Split Layout (JetHR-style) ═══ */}
      <section className="px-4 md:px-8 pt-6 md:pt-10">
        <div className="landing-hero-box max-w-7xl mx-auto py-16 md:py-24 px-6 md:px-16 relative overflow-hidden">
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
                    className="bg-white text-[#1e3a5f] hover:bg-white/90 rounded-xl px-8 font-semibold"
                    onClick={() => scrollTo('metodo')}
                  >
                    Scopri di più
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-8"
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
            </motion.div>

            {/* Right — Product Mockup */}
            <motion.div
              className="flex-1 lg:max-w-[42%] w-full animate-float"
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-5 md:p-6">
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
                      { label: 'Leadership', val: 82 },
                      { label: 'Resilienza', val: 75 },
                      { label: 'Empatia', val: 88 },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-2">
                        <span className="text-xs text-[#6b7280] w-16">{t.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-[#f09133]" style={{ width: `${t.val}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[#1a1a2e] w-8">{t.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 3. LOGO BAR — Infinite Marquee ═══ */}
      <motion.section
        className="py-12 md:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <p className="text-sm text-[#6b7280] mb-8 font-medium">
            Scelto da più di 1.000 aziende italiane
          </p>
          <div className="logo-marquee-container overflow-hidden">
            <div className="animate-marquee flex items-center gap-14 w-max hover:[animation-play-state:paused]">
              {/* Duplicate logos twice for seamless loop */}
              {[...LOGO_COMPANIES, ...LOGO_COMPANIES, ...LOGO_COMPANIES].map((name, i) => (
                <div key={`${name}-${i}`} className="flex items-center gap-2 opacity-50 grayscale shrink-0">
                  <Building2 className="h-5 w-5 text-[#1a1a2e]" />
                  <span className="text-sm font-semibold text-[#1a1a2e] whitespace-nowrap">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. PROBLEMA (NUOVA) ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="dot-pattern" />
          <div className="text-center mb-3">
            <span className="section-badge">Il Problema</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Perché le aziende continuano a sbagliare assunzioni
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            I metodi tradizionali di selezione hanno limiti strutturali che costano caro.
          </p>
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
                className="landing-card p-6 border-l-4 border-l-red-400"
                variants={fadeUp}
                transition={cardTransition}
                whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <p.icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 5. FUNZIONALITÀ (grid 3x3, badge "PIATTAFORMA") ═══ */}
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
                className="landing-card p-6 group cursor-pointer border-l-4 border-l-[#f09133]"
                variants={fadeUp}
                transition={cardTransition}
                whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-[#f09133]/10 flex items-center justify-center mb-4 group-hover:bg-[#f09133]/20 transition-colors"
                >
                  <f.icon className="h-5 w-5 text-[#f09133] group-hover:scale-110 transition-transform" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
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

      {/* ═══ 6. MANIFESTO ═══ */}
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
            {/* Left — Image placeholder */}
            <motion.div
              className="flex-1 w-full md:max-w-[45%]"
              variants={fadeLeft}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2a4f7a] flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <Brain className="h-16 w-16 mx-auto mb-4 opacity-60" />
                  <p className="text-lg font-semibold opacity-80">La scienza dietro le decisioni</p>
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
                  className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl"
                  onClick={() => scrollTo('cta-finale')}
                >
                  Inizia ora <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 7. CTA INTERMEDIO (NUOVO) ═══ */}
      <motion.section
        className="py-10 md:py-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="rounded-2xl bg-[#f09133]/5 border border-[#f09133]/20 py-10 px-6 md:px-12 text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Vuoi vedere TalentProfile in azione?
            </h3>
            <p className="text-[#6b7280] text-base mb-6 max-w-xl mx-auto">
              Richiedi una demo gratuita e scopri come funziona sulla tua realtà aziendale.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-8"
                onClick={() => scrollTo('cta-finale')}
              >
                Richiedi una demo gratuita <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 8. IL METODO (4 step) ═══ */}
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
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
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-[#e5e0db] hidden md:block" />
            <div className="space-y-12">
              {STEPS.map((s, i) => (
                <motion.div key={i} className="flex items-start gap-6 md:gap-8" variants={fadeUp} transition={cardTransition}>
                  <div className="shrink-0 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#f09133] text-white flex items-center justify-center text-lg md:text-xl font-bold shadow-md">
                      {String(i + 1).padStart(2, '0')}
                    </div>
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

      {/* ═══ 9. CALCOLATORE (semplificato, sobrio) ═══ */}
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Quanto costa un'assunzione sbagliata?
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Sposta gli slider e scopri il costo reale di un errore di selezione.
          </p>

          <div className="landing-card p-6 md:p-10 max-w-3xl mx-auto">
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

            {/* Risultato */}
            <div className="text-center py-6 px-4 rounded-xl bg-red-50 border border-red-200 mb-8">
              <p className="text-sm font-semibold text-[#6b7280] mb-1 uppercase tracking-wide">Danno totale stimato</p>
              <p className="text-4xl md:text-5xl font-bold text-red-500">
                €{Math.round(costi.totale).toLocaleString('it-IT')}
              </p>
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
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
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

      {/* ═══ 10. TABELLA COMPARATIVA (NUOVA) ═══ */}
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Metodo Tradizionale vs TalentProfile
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Ecco perché i dati battono l'istinto.
          </p>
          <div className="landing-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e0db]">
                    <th className="text-left p-4 font-semibold text-[#6b7280]">Criterio</th>
                    <th className="text-center p-4 font-semibold text-red-500 bg-red-50">Metodo Tradizionale</th>
                    <th className="text-center p-4 font-semibold text-green-600 bg-green-50">TalentProfile</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainerFast}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                >
                  {COMPARISON_ROWS.map((row, i) => (
                    <motion.tr key={i} className="border-b border-[#e5e0db] last:border-0" variants={fadeUp} transition={cardTransition}>
                      <td className="p-4 font-medium">{row.label}</td>
                      <td className="p-4 text-center bg-red-50/50">
                        <motion.div
                          className="flex items-center justify-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                        >
                          <X className="h-4 w-4 text-red-400" />
                          <span className="text-[#6b7280]">{row.trad}</span>
                        </motion.div>
                      </td>
                      <td className="p-4 text-center bg-green-50/50">
                        <motion.div
                          className="flex items-center justify-center gap-2"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-[#1a1a2e] font-medium">{row.tp}</span>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 11. TESTIMONIANZE (stile LinkedIn) ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#f7f4f0] to-[#faf8f5]"
        id="testimonianze"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Testimonianze</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
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
              <motion.div key={i} className="landing-card p-6" variants={fadeUp} transition={cardTransition} whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
                {/* LinkedIn-style header */}
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{t.name}</div>
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
                <p className="text-[#6b7280] text-sm leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 12. PER CHI È (NUOVA) ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="dot-pattern" />
          <div className="text-center mb-3">
            <span className="section-badge">Per Chi È</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            TalentProfile è per te?
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Scopri se il nostro sistema è adatto alle tue esigenze.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Verde */}
            <motion.div
              className="landing-card p-6 border-green-200 border-l-4 border-l-green-400"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-green-700">Per chi è TalentProfile</h3>
              </div>
              <ul className="space-y-3">
                {TARGET_YES.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-[#6b7280] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            {/* Card Rossa */}
            <motion.div
              className="landing-card p-6 border-red-200 border-l-4 border-l-red-400"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-red-700">Non fa per te se...</h3>
              </div>
              <ul className="space-y-3">
                {TARGET_NO.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-[#6b7280] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 13. NUMERI / CONTATORI ═══ */}
      <motion.section
        className="py-0 md:py-0 px-4 md:px-8"
        id="numeri"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="landing-counter-box py-16 md:py-24 max-w-7xl mx-auto relative overflow-hidden">
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
                { ref: c1.ref, val: c1.value.toLocaleString('it-IT'), suffix: '+', label: 'Aziende clienti' },
                { ref: c2.ref, val: c2.value.toLocaleString('it-IT'), suffix: '+', label: 'Assessment completati' },
                { ref: c3.ref, val: c3.value, suffix: '+', label: 'Ruoli mappati' },
                { ref: c4.ref, val: c4.value, suffix: ' min', label: 'Tempo per test' },
              ].map((n, i) => (
                <motion.div key={i} ref={n.ref} variants={scaleIn} transition={cardTransition}>
                  <div className="text-4xl md:text-5xl font-bold text-[#f09133] mb-2">
                    {n.val}{n.suffix}
                  </div>
                  <div className="text-white/60 text-sm font-medium">{n.label}</div>
                </motion.div>
              ))}
              <motion.div variants={scaleIn} transition={cardTransition}>
                <div className="text-4xl md:text-5xl font-bold text-[#f09133] mb-2">.75/1</div>
                <div className="text-white/60 text-sm font-medium">Validazione scientifica</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 14. TRUST / SICUREZZA (NUOVA) ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="section-badge mb-3 inline-block">Sicurezza</span>
            <h2 className="text-2xl md:text-3xl font-bold">
              I tuoi dati sono al sicuro
            </h2>
          </div>
          <motion.div
            className="flex flex-wrap justify-center gap-8 md:gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {TRUST_BADGES.map((badge, i) => (
              <motion.div key={i} className="flex flex-col items-center text-center max-w-[120px]" variants={scaleIn} transition={cardTransition}>
                <div className="w-14 h-14 rounded-full bg-[#f7f4f0] border border-[#e5e0db] flex items-center justify-center mb-3">
                  <badge.icon className="h-6 w-6 text-[#1e3a5f]" />
                </div>
                <span className="text-sm font-semibold text-[#1a1a2e]">{badge.label}</span>
                <span className="text-xs text-[#6b7280] mt-1">{badge.desc}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 15. FAQ ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#faf8f5] to-[#f7f4f0]"
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
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
              {FAQ_DATA.map((f, i) => (
                <motion.div key={i} variants={fadeUp} transition={cardTransition}>
                  <AccordionItem
                    value={`faq-${i}`}
                    className="border border-[#e5e0db] rounded-lg px-4 bg-white hover:border-[#f09133]/40 transition-colors"
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

      {/* ═══ 16. CTA FINALE ═══ */}
      <motion.section
        id="cta-finale"
        className="px-4 md:px-8 py-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="landing-hero-box py-16 md:py-24 text-center max-w-7xl mx-auto relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Il futuro del tuo team inizia da qui.
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 leading-relaxed">
              La demo è gratuita, dura 30 minuti e ti mostra esattamente come funziona il sistema sulla tua realtà. Nessun impegno.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="bg-[#f09133] hover:bg-[#e07a1f] text-white text-lg px-10 py-7 rounded-xl shadow-lg"
                onClick={() => window.open('mailto:info@talentprofile.it?subject=Richiesta Demo TalentProfile', '_blank')}
              >
                Richiedi una Demo Gratuita <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#1e3a5f] py-14 mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Col 1 — Logo + desc */}
            <div>
              <img
                src="/talentprofile_logo_v3.png"
                alt="TalentProfile"
                className="h-10 brightness-0 invert mb-4"
              />
              <p className="text-sm text-white/50 leading-relaxed">
                Psicologia del lavoro applicata alla realtà dell'impresa. Assessment scientifici per decisioni HR basate sui dati.
              </p>
            </div>

            {/* Col 2 — Link rapidi */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Link rapidi</h4>
              <div className="space-y-2">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="block text-sm text-white/50 hover:text-[#f09133] transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/auth')}
                  className="block text-sm text-white/50 hover:text-[#f09133] transition-colors"
                >
                  Accedi
                </button>
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
