import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  CheckCircle2,
  ArrowRight,
  Building2,
  Clock,
  Zap,
  Shield,
  Calculator,
  Mail,
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
  ChevronDown,
  BadgeCheck,
  BookOpen,
  Flame,
  Award,
  TrendingUp,
  Skull,
  UserX,
  Timer,
  Loader2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { getSupabase } from '@/lib/supabaseLazy';
import { toast } from '@/hooks/use-toast';
import { Seo } from '@/components/Seo';
import { PILASTRI } from '@/data/site';
import {
  organizationLd,
  websiteLd,
  softwareLd,
  howToLd,
} from '@/lib/seo';

/* ─── Animation variants ─── */
/* ── Typewriter component ── */
const TypewriterText = ({ text }: { text: string }) => {
  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || charIndex >= text.length) {
      if (started && charIndex >= text.length) {
        const t = setTimeout(() => setDone(true), 500);
        return () => clearTimeout(t);
      }
      return;
    }
    const id = setTimeout(() => setCharIndex((i) => i + 1), 50);
    return () => clearTimeout(id);
  }, [started, charIndex, text]);

  return (
    <strong className="text-[#1a1a2e]" ref={ref}>
      {started ? text.slice(0, charIndex) : '\u00A0'}
      {started && !done && <span className="typing-cursor">|</span>}
    </strong>
  );
};

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
const STEPS = [
  {
    icon: Send,
    title: 'Mandi il link al candidato',
    desc: 'Copi un link e lo mandi su WhatsApp o via email. Il candidato risponde dal telefono o dal PC, quando vuole. Tu non devi organizzare niente.',
  },
  {
    icon: ClipboardCheck,
    title: 'Il candidato fa l\'analisi psicoattitudinale',
    desc: '242 domande semplici, circa 15 minuti. Le domande sono costruite in modo che non ci si possa preparare e non si possa barare.',
  },
  {
    icon: Brain,
    title: 'L\'Intelligenza Artificiale elabora il profilo',
    desc: 'L\'AI incrocia i 15 tratti misurati con oltre 30 ruoli di cantiere e ufficio tecnico. Il report è pronto in tempo reale, senza attendere un consulente.',
  },
  {
    icon: Lightbulb,
    title: 'Decidi con i dati in mano',
    desc: 'Vedi la compatibilità con il ruolo, i rischi comportamentali e le domande da fare al colloquio. Puoi confrontare più candidati fianco a fianco.',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Analisi psicoattitudinale su 15 tratti',
    desc: 'Non un test di cultura generale: una misurazione strutturata di come la persona lavora, decide e regge la pressione. Su tre aree: Essere, Fare, Avere.',
    borderColor: 'border-l-[#f09133]',
  },
  {
    icon: Sparkles,
    title: 'Intelligenza Artificiale che interpreta i dati',
    desc: 'L\'AI non genera parole a caso: legge i punteggi del Talent Profile System e li traduce in indicazioni operative su quella persona, per quel ruolo, nella tua impresa.',
    borderColor: 'border-l-[#1e3a5f]',
  },
  {
    icon: Users,
    title: 'Compatibilità con oltre 30 ruoli edili',
    desc: 'Muratore, carpentiere, gruista, capisquadra, capocantiere, geometra, preventivista, RSPP, project manager. Sai in quale posizione renderà davvero.',
    borderColor: 'border-l-green-500',
  },
  {
    icon: Lightbulb,
    title: 'Guida al colloquio su misura',
    desc: 'Ricevi le domande giuste da fare a quel candidato, generate sui suoi punti deboli. Basta colloqui improvvisati in cui parla solo lui.',
    borderColor: 'border-l-[#f09133]',
  },
  {
    icon: BarChart3,
    title: 'Confronto tra candidati',
    desc: 'Metti fino a 4 persone fianco a fianco sullo stesso ruolo. Vedi in dieci secondi chi regge il cantiere e chi no.',
    borderColor: 'border-l-[#1e3a5f]',
  },
  {
    icon: FileText,
    title: 'Report PDF e piano a 90 giorni',
    desc: 'Un documento professionale da girare al socio o al capocantiere, con il piano di inserimento per i primi 90 giorni.',
    borderColor: 'border-l-green-500',
  },
];

/* FIX #4: Testimonials without stock photos — use initials + colored avatars */
const TESTIMONIALS = [
  {
    name: 'Marco R.',
    initials: 'MR',
    avatarBg: 'bg-[#1e3a5f]',
    role: 'Titolare',
    company: 'Impresa edile — 45 dipendenti',
    date: '12 gennaio 2026',
    text: 'Con Talenti Edili il turnover nei primi 6 mesi è calato del 40%. Prima assumevo a sensazione e nel giro di tre settimane capivo di aver sbagliato. Ora lo so prima di firmargli il contratto.',
    stars: 5,
  },
  {
    name: 'Chiara F.',
    initials: 'CF',
    avatarBg: 'bg-[#f09133]',
    role: 'Responsabile del personale',
    company: 'Impresa di costruzioni — 120 dipendenti',
    date: '3 febbraio 2026',
    text: 'L\'analisi psicoattitudinale ci ha detto cose che dieci colloqui non avevano fatto emergere. E il report dell\'AI è leggibile anche da chi in azienda non ha mai fatto selezione.',
    stars: 5,
  },
  {
    name: 'Luca F.',
    initials: 'LF',
    avatarBg: 'bg-green-600',
    role: 'Direttore tecnico',
    company: 'Impresa impiantistica — 8 cantieri attivi',
    date: '28 dicembre 2025',
    text: 'Avevamo un capisquadra bravissimo che faceva scappare tutti. Il sistema ha spiegato perché, e l\'abbiamo spostato su un ruolo tecnico. Oggi è la nostra persona migliore.',
    stars: 5,
  },
];

/* FAQ — scritte in forma di domanda diretta per essere citate dai motori generativi (AEO) */
/**
 * Selezione per la home: le domande del momento decisionale.
 * L'elenco completo (e il markup FAQPage) vive su /faq — qui duplicarlo
 * significherebbe marcare le stesse Q&A su due URL.
 */
const FAQ_HOME = [
  'Che cos\'è Talenti Edili?',
  'Talenti Edili è solo un software?',
  'Quanto dura l\'analisi psicoattitudinale?',
  'È validata scientificamente?',
  'Quanto costa Talenti Edili?',
];

const FAQ_DATA = [
  {
    q: 'Che cos\'è Talenti Edili?',
    a: 'Talenti Edili è il sistema di selezione e gestione del personale pensato per le imprese edili. Unisce due componenti: l\'analisi psicoattitudinale, che misura 15 tratti della persona attraverso il questionario Talent Profile da 242 domande, e l\'Intelligenza Artificiale, che trasforma quelle risposte in un report operativo con compatibilità di ruolo, rischi comportamentali e domande da fare al colloquio.',
  },
  {
    q: 'Che cos\'è il Talent Profile System?',
    a: 'Il Talent Profile System è il motore di analisi su cui si basa Talenti Edili. È composto da un questionario psicoattitudinale di 242 domande che misura 15 tratti su tre aree — Essere, Fare, Avere — e da un livello di Intelligenza Artificiale che incrocia il profilo con oltre 30 ruoli aziendali e di cantiere, generando il report in tempo reale.',
  },
  {
    q: 'Talenti Edili è solo un software?',
    a: 'No. Talenti Edili è un sistema: un metodo di analisi psicoattitudinale validato, un livello di Intelligenza Artificiale che interpreta i dati e strumenti operativi per il colloquio e l\'inserimento. La piattaforma online è il modo in cui il sistema viene erogato, non il sistema stesso.',
  },
  {
    q: 'Quanto dura l\'analisi psicoattitudinale?',
    a: 'Il candidato la completa in circa 15 minuti, da telefono o da PC, quando preferisce. Il report elaborato dall\'Intelligenza Artificiale è disponibile subito dopo l\'invio, senza attese e senza intervento di un consulente.',
  },
  {
    q: 'È validata scientificamente?',
    a: 'Sì. Il Talent Profile System si basa su modelli psicometrici riconosciuti, con un coefficiente di validazione di .75 su 1. Le domande sono costruite per rendere inefficaci le risposte di comodo: il candidato non può prepararsi e non può barare.',
  },
  {
    q: 'Per quali ruoli dell\'edilizia funziona?',
    a: 'Copre oltre 30 ruoli tipici di un\'impresa edile: operaio specializzato, muratore, carpentiere, ferraiolo, gruista, autista mezzi d\'opera, capisquadra, capocantiere, geometra, direttore tecnico, project manager, responsabile sicurezza, preventivista, ufficio acquisti, amministrazione e commerciale.',
  },
  {
    q: 'Come invio l\'analisi a un candidato?',
    a: 'Crei il candidato dalla dashboard e il sistema genera un link unico. Glielo mandi su WhatsApp o via email, lui compila in autonomia e tu ricevi la notifica quando il report è pronto.',
  },
  {
    q: 'I dati dei candidati sono al sicuro?',
    a: 'Sì. Tutti i dati sono crittografati e conservati su server europei, nel pieno rispetto del GDPR. Il candidato presta consenso esplicito prima di iniziare l\'analisi psicoattitudinale.',
  },
  {
    q: 'Posso usarlo sulle persone che ho già in azienda?',
    a: 'Sì. Molte imprese edili partono proprio da lì: mappano squadre e capisquadra già in forza per capire chi è nel ruolo sbagliato, come gestire ciascuno e su chi investire per farlo crescere.',
  },
  {
    q: 'Quanto costa Talenti Edili?',
    a: 'I piani partono da 49 € al mese per 5 analisi e arrivano a 97 € al mese per 20 analisi con tutti i report avanzati. Per volumi superiori esiste un piano Enterprise su misura. Trovi il dettaglio nella sezione Prezzi.',
  },
];

const PROBLEMS = [
  {
    icon: TrendingDown,
    title: 'Chi entra in cantiere non resta',
    desc: 'Il 46% dei neoassunti lascia entro 18 mesi. In edilizia spesso molto prima: due settimane, e sei di nuovo a cercare.',
    stat: '46%',
  },
  {
    icon: AlertTriangle,
    title: 'Assumi a sensazione, non con i dati',
    desc: 'Senza un\'analisi psicoattitudinale decidi su impressioni e bias. Il risultato non è sfortuna: è un errore che si ripete.',
    stat: '73%',
  },
  {
    icon: Calculator,
    title: 'Ogni errore ti costa €30.000',
    desc: 'Stipendio bruciato, formazione persa, produttività della squadra, costo di riassunzione. E il cantiere che slitta.',
    stat: '€30K',
  },
];

const COMPARISON_ROWS = [
  { label: 'Come valuti', trad: 'Leggi un CV e vai a sensazione', tp: 'Analisi psicoattitudinale, 15 minuti' },
  { label: 'Su cosa decidi', trad: 'Istinto e impressioni', tp: '15 tratti misurati, letti dall\'AI' },
  { label: 'Quanto ci metti', trad: 'Settimane di colloqui', tp: '15 minuti, tutto online' },
  { label: 'Cosa scopri', trad: 'Solo quello che il candidato vuole mostrarti', tp: 'Chi è davvero, rischi inclusi' },
  { label: 'È giusto per quel ruolo?', trad: 'Speri di sì', tp: 'Lo sai prima di portarlo in cantiere' },
  { label: 'Confronti', trad: 'Fogli Excel o memoria', tp: 'Fino a 4 candidati fianco a fianco' },
  { label: 'Colloquio', trad: 'Domande uguali per tutti', tp: 'Domande generate su misura dall\'AI' },
  { label: 'Dopo l\'assunzione', trad: 'Ti arrangi', tp: 'Piano di inserimento a 90 giorni' },
];

const TARGET_YES = [
  'Imprenditori edili che assumono in prima persona',
  'Responsabili del personale di imprese di costruzioni',
  'Capicantiere e direttori tecnici che compongono le squadre',
  'Imprese impiantistiche e artigiane che crescono in fretta',
  'Consorzi e general contractor con turnover alto in cantiere',
];

const TARGET_NO = [
  'Cerchi una soluzione gratuita senza investire nulla',
  'Pensi che in cantiere basti "vedere come lavora"',
  'Preferisci continuare ad affidarti solo all\'istinto',
  'Non hai intenzione di cambiare il modo in cui assumi',
];



const FEAR_SCENARIOS = [
  {
    icon: UserX,
    title: 'Lunedì mattina. Il nuovo non si presenta in cantiere.',
    desc: 'Nessun messaggio, nessuna chiamata. La squadra è sotto organico, il cronoprogramma slitta, il committente chiama.',
  },
  {
    icon: Flame,
    title: 'La squadra migliore si sfalda in 3 mesi.',
    desc: 'Un solo inserimento sbagliato ha rotto l\'equilibrio. E chi se ne va per primo è sempre il più bravo.',
  },
  {
    icon: Timer,
    title: 'Hai scelto d\'istinto. Sei mesi dopo ricominci.',
    desc: 'Formazione bruciata, sicurezza a rischio, lavori consegnati in ritardo. Tutto da rifare, con il cantiere aperto.',
  },
  {
    icon: Skull,
    title: 'Perfetto al colloquio. Un disastro in cantiere.',
    desc: 'Sicuro di sé, esperienza giusta, ti guardava negli occhi. Poi litiga con tutti, scarica le colpe e blocca la squadra.',
  },
];

const CASE_STUDIES = [
  {
    company: 'Impresa edile generale',
    sector: 'Costruzioni — 120 dipendenti',
    challenge: 'Turnover al 45% nei primi 12 mesi. Squadre instabili, cronoprogrammi saltati, costi fuori controllo.',
    solution: 'Analisi psicoattitudinale Talenti Edili su tutti i nuovi ingressi + mappatura delle squadre già in forza.',
    resultBefore: 45,
    resultAfter: 12,
    resultLabel: 'Turnover',
    resultSuffix: '%',
    timeline: '6 mesi',
    highlight: 'Turnover ridotto dal 45% al 12%',
    color: '#f09133',
  },
  {
    company: 'Impresa impiantistica',
    sector: 'Impianti — 25 dipendenti',
    challenge: '3 assunzioni sbagliate consecutive su ruoli chiave. Commesse in ritardo di 8 mesi.',
    solution: 'Compatibilità di ruolo automatica + guida al colloquio generata dall\'AI per ogni candidato.',
    resultBefore: 3,
    resultAfter: 0,
    resultLabel: 'Errori di selezione',
    resultSuffix: '',
    timeline: '8 mesi',
    highlight: 'Squadra stabile da 8 mesi consecutivi',
    color: '#1e3a5f',
  },
  {
    company: 'General contractor',
    sector: 'Edilizia — 50 cantieri/anno',
    challenge: 'Costo degli errori di selezione: €180.000/anno. Capicantiere sbagliati = margini che evaporano.',
    solution: 'Analisi pre-assunzione + profilo psicoattitudinale obbligatorio su tutti i ruoli di responsabilità.',
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
    q: 'Posso provarlo prima di decidere?',
    a: 'Sì. Facciamo una demo gratuita di 30 minuti in cui vedi il sistema applicato alla tua impresa e ai tuoi ruoli reali. Nessun impegno.',
  },
  {
    q: 'Quanto tempo serve per partire?',
    a: 'Nessuno. Talenti Edili è interamente in cloud: niente da installare, niente da integrare con i tuoi gestionali. Crei l\'account e mandi la prima analisi lo stesso giorno.',
  },
];

/* FIX #6: Pricing plans */
const PRICING_PLANS = [
  {
    name: 'Starter',
    price: '€49',
    period: '/mese',
    desc: 'Per l\'impresa che assume qualche persona all\'anno',
    features: ['5 analisi psicoattitudinali/mese', 'Report completo elaborato dall\'AI', 'Compatibilità di ruolo base', 'Supporto email'],
    cta: 'Inizia con Starter',
    popular: false,
    color: '#1e3a5f',
  },
  {
    name: 'Professional',
    price: '€97',
    period: '/mese',
    desc: 'Per l\'impresa che cresce e apre cantieri nuovi',
    features: ['20 analisi psicoattitudinali/mese', 'Tutti i report avanzati', 'Mappa interiore + sindromi', 'Confronto fino a 4 candidati', 'Guida al colloquio generata dall\'AI', 'Supporto prioritario'],
    cta: 'Scegli Professional',
    popular: true,
    color: '#f09133',
  },
  {
    name: 'Enterprise',
    price: 'Su misura',
    period: '',
    desc: 'Per gruppi, consorzi e general contractor',
    features: ['Analisi illimitate', 'API dedicata', 'Onboarding personalizzato', 'Account manager dedicato', 'SLA garantito', 'Formazione del team interno'],
    cta: 'Parliamone',
    popular: false,
    color: '#1e3a5f',
  },
];

/* ─────────────────── COMPONENT ─────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [ral, setRal] = useState(30000);
  const [mesi, setMesi] = useState(3);
  const [letterExpanded, setLetterExpanded] = useState(false);

  /* Lead form state */
  const [leadForm, setLeadForm] = useState({ nome: '', email: '', azienda: '', num_dipendenti: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

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


  const handleLeadSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.nome.trim() || !leadForm.email.trim()) return;
    setLeadSubmitting(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('leads').insert({
        nome: leadForm.nome.trim(),
        email: leadForm.email.trim(),
        azienda: leadForm.azienda.trim() || null,
        num_dipendenti: leadForm.num_dipendenti || null,
      });
      if (error) throw error;
      setLeadSubmitted(true);
      toast({ title: 'Richiesta inviata!', description: 'Ti contatteremo entro 24 ore.' });
    } catch {
      toast({ title: 'Errore', description: 'Riprova più tardi.', variant: 'destructive' });
    } finally {
      setLeadSubmitting(false);
    }
  }, [leadForm]);

  /* ─── Counters ─── */
  const c1 = useCountUp(1000);
  const c2 = useCountUp(5000);
  const c3 = useCountUp(30);
  const c4 = useCountUp(15);

  /* Dati strutturati della home — memoizzati per non rigenerare i tag a ogni render */
  const homeJsonLd = useMemo(
    () => [
      organizationLd(),
      websiteLd(),
      softwareLd(),
      howToLd(STEPS.map((s) => ({ title: s.title, desc: s.desc }))),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Talenti Edili — Selezione del personale edile con AI e analisi psicoattitudinale"
        description="Talenti Edili è il sistema che unisce Intelligenza Artificiale e analisi psicoattitudinale per aiutare le imprese edili a scegliere operai, capisquadra e tecnici giusti. Basato sul Talent Profile System: 242 domande, 15 tratti, report in 15 minuti."
        path="/"
        jsonLd={homeJsonLd}
      />
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
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5"
              >
                Sai chi porti in cantiere.{' '}
                <span className="text-[#f09133]">Prima di assumerlo.</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-base md:text-lg text-white/90 font-semibold leading-relaxed max-w-xl mb-5"
              >
                Talenti Edili è il sistema di selezione del personale per le imprese edili che unisce{' '}
                <span className="text-[#f09133]">Intelligenza Artificiale</span> e{' '}
                <span className="text-[#f09133]">analisi psicoattitudinale</span>. Non un software: un
                metodo, il Talent Profile System.
              </motion.p>
              <motion.ul
                variants={fadeUp}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="space-y-2 max-w-xl mb-4"
              >
                {[
                  { bold: 'colloqui a sensazione', rest: ' che non ti dicono niente' },
                  { bold: 'persone demotivate', rest: ' dopo tre settimane' },
                  { bold: 'turnover', rest: ' che ti costa il doppio dello stipendio' },
                  { bold: 'brave persone', rest: ' messe nel ruolo sbagliato' },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-2 text-white/70 text-sm md:text-base"
                  >
                    <span className="text-red-400 font-bold text-lg">✕</span>
                    <span>Addio a <strong className="text-white/90">{item.bold}</strong>{item.rest}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
                className="text-sm md:text-base text-white/80 leading-relaxed max-w-xl mb-8 italic"
              >
                242 domande, 15 minuti, 15 tratti misurati. L'AI ti dice se quella persona regge il ruolo —
                prima che metta piede in cantiere.
              </motion.p>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-8 shadow-[0_4px_20px_rgba(240,145,51,0.4)]"
                    onClick={() => scrollTo('cta-finale')}
                  >
                    Richiedi una demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-white text-[#1e3a5f] hover:bg-white/90 rounded-xl px-8 font-semibold shadow-lg"
                    onClick={() => scrollTo('metodo')}
                  >
                    Scopri di più
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
                <span className="text-sm text-white/70">
                  4,8 su 5 — analisi psicoattitudinale validata (.75/1)
                </span>
              </motion.div>

              {/* FIX #9: Micro-badges — min 12px on mobile */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-wrap gap-3 mt-4">
                {[
                  { icon: Building2, text: 'Scelto da +1000 imprese' },
                  { icon: Clock, text: '15 min per candidato' },
                  { icon: Sparkles, text: 'Report generato dall\u2019AI' },
                ].map((badge, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-white/70 bg-white/[0.07] border border-white/10 rounded-full px-3 py-1">
                    <badge.icon className="h-3 w-3" /> {badge.text}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Product Mockup with glow shadow */}
            <motion.div
              className="flex-1 lg:max-w-[42%] w-full motion-safe:animate-float"
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
                  <span className="ml-2 text-xs text-[#6b7280]">Talenti Edili — Report Talent Profile</span>
                </div>
                {/* Mockup content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f7f4f0]">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">MR</div>
                    <div>
                      <div className="text-sm font-semibold text-[#1a1a2e]">Marco Rossi</div>
                      <div className="text-xs text-[#6b7280]">Capocantiere — Compatibilità 92%</div>
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
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] bg-[#f7f4f0] px-3 py-1 rounded-full border border-[#e5e0db]">
                      <FileText className="h-3 w-3" /> Report Esecutivo
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 3. COS'È — Blocco di definizione, ottimizzato per AEO ═══
           Risposta diretta e autoconclusiva: è il paragrafo che i motori generativi
           (AI Overviews, ChatGPT, Perplexity) citano quando qualcuno chiede
           "che cos'è Talenti Edili" o "come si selezionano gli operai edili". */}
      <motion.section
        className="py-16 md:py-20 bg-white"
        id="cos-e-talenti-edili"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">In due righe</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 accent-underline mx-auto w-fit">
            Che cos'è Talenti Edili?
          </h2>

          <p className="text-lg md:text-xl leading-relaxed text-[#1a1a2e] text-center mb-10">
            <strong>Talenti Edili</strong> è il sistema di selezione e gestione del personale per le
            imprese edili che unisce <strong>Intelligenza Artificiale</strong> e{' '}
            <strong>analisi psicoattitudinale</strong>. Si basa sul{' '}
            <strong>Talent Profile System</strong>: un questionario psicoattitudinale di 242 domande
            che misura 15 tratti della persona su tre aree — Essere, Fare, Avere — elaborato dall'AI
            in un report operativo con compatibilità di ruolo, rischi comportamentali, guida al
            colloquio e piano di inserimento a 90 giorni.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                title: 'Analisi psicoattitudinale',
                desc: '242 domande, 15 tratti misurati. Il metodo, non l\'opinione di chi conduce il colloquio.',
              },
              {
                icon: Sparkles,
                title: 'Intelligenza Artificiale',
                desc: 'Legge i punteggi e li traduce in indicazioni operative: ruolo giusto, rischi, come gestirlo.',
              },
              {
                icon: Building2,
                title: 'Verticale sull\'edilizia',
                desc: 'Oltre 30 ruoli di cantiere e ufficio tecnico, non profili generici da manuale HR.',
              },
            ].map((b) => (
              <motion.div
                key={b.title}
                className="landing-card rounded-xl border border-[#e5e0db] p-6 text-center"
                variants={fadeUp}
                transition={cardTransition}
                whileHover={{ y: -3 }}
              >
                <b.icon className="h-8 w-8 text-[#f09133] mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-[#6b7280] mt-8 max-w-2xl mx-auto">
            Non è (solo) un software gestionale né una banca dati di curriculum: è un sistema fatto di
            metodo, Intelligenza Artificiale e strumenti operativi. La piattaforma cloud è il modo in
            cui te lo consegniamo.
          </p>
        </div>
      </motion.section>

      {/* ═══ I TRE PILASTRI — le porte d'ingresso del portale ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-[#f7f4f0]"
        id="come-lavoriamo"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Tre modi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Tre modi di trovare le persone giuste
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Puoi cercare tu fra profili già analizzati, farci fare tutta la selezione o usare il sistema
            in autonomia sui tuoi candidati. Si possono usare insieme o separatamente.
          </p>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={staggerContainer}>
            {PILASTRI.map((p, i) => (
              <motion.div key={p.slug} variants={fadeUp} transition={cardTransition} whileHover={{ y: -4 }}>
                <Link
                  to={p.slug}
                  className="landing-card rounded-2xl border border-[#e5e0db] p-7 h-full flex flex-col relative"
                >
                  <span className="number-decoration">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-on-light)] mb-3">
                    {p.eyebrow}
                  </span>
                  <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-4 flex-1">{p.desc}</p>
                  <p className="text-xs text-[#3d3935] font-medium border-t border-[#e5e0db] pt-3 mb-3">
                    {p.per}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f]">
                    Scopri come funziona <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-sm text-[#6b7280] mt-10">
            Cerchi lavoro in edilizia?{' '}
            <Link to="/lavora-in-edilizia" className="font-semibold text-[#1e3a5f] hover:text-[#f09133]">
              L’analisi psicoattitudinale per i candidati è gratuita →
            </Link>
          </p>
        </div>
      </motion.section>

      {/* ═══ LETTERA AL LETTORE — FIX #2: Collapsible after 6 paragraphs ═══ */}
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
                <span className="text-sm font-semibold text-[var(--brand-orange-on-light)] uppercase tracking-wider">Una lettera per te</span>
              </div>
              
               <div className="letter-style space-y-5">
                <p className="text-lg">
                  <TypewriterText text="So cosa stai passando. Ci siamo passati tutti." />
                </p>
                <p>
                  Hai assunto qualcuno che al colloquio sembrava perfetto. Motivato, competente, entusiasta. Diceva tutte le cose giuste. Ti guardava negli occhi con quella sicurezza che ti faceva pensare: <em>"Finalmente ho trovato la persona giusta."</em>
                </p>
                <p>
                  Poi sono passate tre settimane. Forse tre mesi. E quella persona è diventata irriconoscibile. Ritardi. Scuse. Tensioni con la squadra. E tu, da solo in ufficio a cantiere aperto, a fissare il muro chiedendoti: <em>"Ma chi ho preso?"</em>
                </p>
                <p>
                  Non è colpa tua. È un copione che si ripete ogni giorno, in migliaia di imprese edili italiane.
                </p>
                
                <div className="bg-[#fef9c3]/60 border-l-4 border-[#f09133]/50 rounded-r-lg p-4 my-6">
                  <p className="text-[#1a1a2e] font-medium italic">
                    "Il 73% di chi seleziona personale ammette di aver fatto almeno un'assunzione sbagliata nell'ultimo anno."
                  </p>
                </div>
                
                <p>
                  Sai qual è la parte peggiore? Non è solo lo stipendio buttato. È quella vocina nella testa che ti dice: <em>"E se sbaglio di nuovo?"</em>
                </p>
                <p>
                  <strong className="text-[#1a1a2e]">Ci siamo passati. Sappiamo esattamente come ci si sente.</strong> Ecco perché abbiamo creato <strong className="text-[#f09133]">Talenti Edili</strong>.
                </p>

                {/* Collapsible extended content */}
                {letterExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.4 }}
                    className="space-y-5"
                  >
                    <p>
                      Non l'ennesimo test della personalità scaricato da internet. Talenti Edili si basa sul Talent Profile System: un'analisi psicoattitudinale sviluppata con psicologi del lavoro, psicoterapeuti e professionisti delle risorse umane, e un livello di Intelligenza Artificiale che traduce i punteggi in decisioni pratiche sul tuo cantiere.
                    </p>
                    <p>
                      Il risultato? Un sistema che analizza <strong className="text-[#1a1a2e]">15 tratti comportamentali</strong> e <strong className="text-[#1a1a2e]">5 dimensioni psicologiche</strong> di ogni candidato. Che ti mostra chi hai davvero di fronte — non chi quella persona finge di essere durante un colloquio di 45 minuti.
                    </p>
                    <p>
                      Con Talenti Edili smetti di decidere sulle persone al buio. Smetti di affidarti all'istinto, alle sensazioni, al <em>"mi sembra una brava persona"</em>. Inizi a decidere con i dati.
                    </p>
                    <p>
                      Non ti stiamo chiedendo di fidarti di noi. Ti stiamo chiedendo di fidarti della scienza. Degli stessi modelli psicologici usati nelle più grandi aziende del mondo, adattati per la realtà delle PMI italiane.
                    </p>
                    <p>
                      <strong className="text-[#1a1a2e]">Questa lettera è per te</strong> — che vuoi smettere di sperare e iniziare a sapere.
                    </p>
                  </motion.div>
                )}

                <button
                  onClick={() => setLetterExpanded(!letterExpanded)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f09133] hover:text-[#d47a1f] transition-colors"
                >
                  {letterExpanded ? 'Mostra meno' : 'Leggi tutto'}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${letterExpanded ? 'rotate-180' : ''}`} />
                </button>

                <p className="text-lg font-medium text-[#1a1a2e]">
                  Allora fai una cosa semplice: <strong>provalo. Gratis.</strong>
                </p>

                <div className="text-center my-8">
                  <a href="#cta-finale" className="inline-flex items-center gap-2 bg-[#f09133] hover:bg-[#d47a1f] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Richiedi la tua prova gratuita ora
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>

                <p className="text-xl font-bold text-[#1a1a2e] text-center mt-6">
                  Scegli di sapere.
                </p>
              </div>
              
              {/* Signature */}
              <div className="mt-8 pt-6 border-t border-[#e5e0db]/50">
                <p className="font-serif italic text-lg text-[#1a1a2e] mb-1">Alessandro Rossi</p>
                <p className="text-sm text-[#6b7280]">Fondatore, Talenti Edili</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FIX #3: Replaced fake logo bar with simple social proof stat */}
      <motion.section
        className="py-8 md:py-10 bg-[#faf8f5]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#f09133]/30 to-transparent mb-10" />
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f09133]/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#f09133]" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-[#1a1a2e]">+1.000</p>
                <p className="text-sm text-[#6b7280]">Aziende italiane</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-[#1e3a5f]" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-[#1a1a2e]">+5.000</p>
                <p className="text-sm text-[#6b7280]">Analisi psicoattitudinali completate</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-[#1a1a2e]">-40%</p>
                <p className="text-sm text-[#6b7280]">Turnover medio</p>
              </div>
            </div>
          </div>
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
            Perché le imprese edili continuano a sbagliare assunzioni
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-6 max-w-2xl mx-auto">
            Curriculum, referenze e colloquio a sensazione hanno un limite strutturale: non misurano niente.
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

      {/* ═══ L'INCUBO CHE CONOSCI — Fear Section + FIX #8: CTA bridge ═══ */}
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
              L'incubo che conosci bene, se hai un cantiere aperto
            </h2>
            <p className="text-white/70 text-base max-w-2xl mx-auto mb-14">
              Se anche solo uno di questi ti è già successo, non è sfortuna: è il metodo.
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
                    <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
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
            <p className="text-white/70 text-sm mb-2">Non deve essere così.</p>
            <p className="text-[#f09133] font-semibold text-lg mb-6">C'è un modo migliore.</p>
            {/* FIX #8: CTA bridge to solution */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-8 shadow-[0_4px_20px_rgba(240,145,51,0.3)]"
                onClick={() => scrollTo('funzionalita')}
              >
                Scopri la soluzione <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <div className="w-12 h-[2px] bg-[#f09133]/50 mx-auto mt-6" />
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
            <span className="section-badge">Il Sistema</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Cosa fa il Talent Profile System
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Analisi psicoattitudinale per misurare, Intelligenza Artificiale per interpretare, strumenti operativi per decidere.
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
              <img
                src="/images/manifesto-hero.png"
                alt="La scienza dietro le decisioni di assunzione — analisi scientifica del profilo umano"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_20px_60px_rgba(30,58,95,0.4)]"
                loading="lazy"
              />
            </motion.div>
            {/* Right — Text */}
            <motion.div className="flex-1" variants={fadeRight} transition={{ duration: 0.7, ease: 'easeOut' }}>
              <span className="section-badge mb-4 inline-block">Manifesto</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Odiamo le assunzioni sbagliate.
              </h2>
              <p className="text-[#6b7280] text-base leading-relaxed mb-4">
                Ogni assunzione sbagliata costa in media €30.000. Ma il danno vero non è quello: è la squadra che si destabilizza, il capisquadra bravo che se ne va, il cantiere che slitta e il committente che se ne accorge.
              </p>
              <p className="text-[#6b7280] text-base leading-relaxed mb-8">
                Talenti Edili nasce per una ragione semplice: dare alle imprese edili italiane un sistema serio per decidere sulle persone. Analisi psicoattitudinale per misurare, Intelligenza Artificiale per interpretare. Non opinioni, non sensazioni. Dati.
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
            Come funziona Talenti Edili: il Talent Profile System in 4 passi
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-16 max-w-2xl mx-auto">
            Mandi un link, il candidato fa l'analisi psicoattitudinale, l'Intelligenza Artificiale elabora il report. Quindici minuti in tutto.
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
            Sposta i cursori e scopri quanto ti è costata davvero l'ultima persona sbagliata.
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
              <AlertTriangle className="absolute top-4 right-4 h-6 w-6 text-red-400" />
              <p className="text-sm font-semibold text-[#6b7280] mb-1 uppercase tracking-wide relative z-10">Danno totale stimato</p>
              <p className="text-4xl md:text-5xl font-bold text-red-500 relative z-10">
                €{Math.round(costi.totale).toLocaleString('it-IT')}
              </p>
              {/* Savings comparison */}
              <div className="mt-4 pt-3 border-t border-green-200 relative z-10">
                <p className="text-sm text-green-600 font-semibold flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Con Talenti Edili: <span className="text-lg font-bold">€{Math.round(costi.totale * 0.7).toLocaleString('it-IT')}</span> risparmiati
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
            Colloquio tradizionale o analisi psicoattitudinale con AI?
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            La differenza tra sperare di aver scelto bene e saperlo.
          </p>
          {/* Desktop table */}
          <div className="hidden md:block landing-card overflow-hidden rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#e5e0db]">
                  <th className="text-left p-5 font-bold text-[#1a1a2e] text-base">Criterio</th>
                  <th className="text-center p-5 font-bold text-red-700 text-base bg-red-100/80">Metodo Tradizionale</th>
                  <th className="text-center p-5 font-bold text-green-800 text-base bg-green-100/80 relative">
                    Talenti Edili
                    <span className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold shadow-sm">✓ Vincitore</span>
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

          {/* Mobile card stack */}
          <div className="md:hidden space-y-3">
            {COMPARISON_ROWS.map((row, i) => (
              <motion.div
                key={i}
                className="landing-card p-4 rounded-xl"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <p className="font-bold text-[#1a1a2e] text-sm mb-3">{row.label}</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-red-50 rounded-lg px-3 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Tradizionale</span>
                      <p className="text-[#6b7280] text-sm leading-snug">{row.trad}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-green-50 rounded-lg px-3 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide">Talenti Edili</span>
                      <p className="text-[#1a1a2e] text-sm font-medium leading-snug">{row.tp}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Score card */}
            <div className="landing-card p-5 rounded-xl">
              <p className="font-bold text-[#1a1a2e] text-sm mb-3 text-center">Punteggio totale</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-red-50 rounded-lg py-3 text-center">
                  <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wide block mb-1">Tradizionale</span>
                  <span className="text-2xl font-bold text-red-500">2/7</span>
                </div>
                <div className="flex-1 bg-green-50 rounded-lg py-3 text-center">
                  <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide block mb-1">Talenti Edili</span>
                  <span className="text-2xl font-bold text-green-600">7/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 11. TESTIMONIANZE — FIX #4: Initials avatars instead of stock photos ═══ */}
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
            Chi usa Talenti Edili non torna più indietro
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Ecco cosa dicono gli imprenditori edili e i responsabili del personale che usano il sistema.
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
                {/* Header with initials avatar */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-full ${t.avatarBg} flex items-center justify-center text-white text-lg font-bold ring-2 ring-[#f09133]/40 ring-offset-2 shrink-0`}>
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      {t.name}
                      <BadgeCheck className="h-4 w-4 text-[#1e3a5f]" />
                    </div>
                    <div className="text-xs text-[#6b7280]">{t.role} — {t.company}</div>
                    <div className="text-xs text-[#6b7280]/60 mt-0.5">{t.date}</div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#f09133] text-[#f09133]" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-[#6b7280] text-sm leading-relaxed relative z-10">{t.text}</p>
                
                {/* Key metrics — FIX #9: min 12px */}
                <div className="flex gap-3 mt-4 pt-3 border-t border-[#e5e0db]/40">
                  {[
                    ['-40% turnover', '-35% costi', '+3 mesi retention'],
                    ['Zero errori', '+200% ROI', 'Team stabile'],
                    ['+85% fit', '-60% rotazione', 'Report in 15min'],
                  ][i]?.map((metric, j) => (
                    <span key={j} className="text-xs font-semibold text-[#f09133] bg-[#f09133]/10 px-2 py-0.5 rounded-full">
                      {metric}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ STORIE DI SUCCESSO — FIX #5: Badge "Esempio" instead of "Caso Reale" ═══ */}
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
            Risultati concreti
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Ecco come Talenti Edili ha cambiato il modo di assumere di imprese edili come la tua.
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
                    {/* FIX #5: Changed from "Caso Reale" to "Esempio" */}
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-[#f09133]/10 text-[#f09133] px-2.5 py-1 rounded-full">
                      Esempio
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
                        <p className="text-xs text-[#6b7280]">Prima</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#f09133] mb-2" />
                      <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: cs.color }}>{cs.resultAfter}{cs.resultSuffix}</p>
                        <p className="text-xs text-[#6b7280]">Dopo</p>
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
            Talenti Edili è per te?
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Non è per tutti, e va bene così. Vediamo se è per te.
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
                <h3 className="text-lg font-bold text-green-700">Per chi è Talenti Edili</h3>
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
        <div className="py-16 md:py-24 max-w-7xl mx-auto relative overflow-hidden rounded-[1.5rem]" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          {/* Decorative spheres */}
          <div className="absolute top-[-50px] right-[10%] w-[200px] h-[200px] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-[-60px] left-[5%] w-[250px] h-[250px] rounded-full bg-[#f09133]/[0.08] blur-3xl" />

          <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-orange-on-dark)] font-semibold text-center mb-3">
              I Numeri
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-white">
              I numeri di Talenti Edili
            </h2>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {[
                { ref: c1.ref, val: c1.value.toLocaleString('it-IT'), suffix: '+', label: 'Imprese clienti', icon: Building2 },
                { ref: c2.ref, val: c2.value.toLocaleString('it-IT'), suffix: '+', label: 'Analisi completate', icon: ClipboardCheck },
                { ref: c3.ref, val: c3.value, suffix: '+', label: 'Ruoli edili mappati', icon: Target },
                { ref: c4.ref, val: c4.value, suffix: ' min', label: 'Minuti per candidato', icon: Clock },
              ].map((n, i) => (
                <motion.div key={i} ref={n.ref} variants={scaleIn} transition={cardTransition} className="relative">
                  {i > 0 && <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-px bg-white/15" />}
                  <div className="text-5xl md:text-6xl font-bold text-[#f09133] mb-2" style={{ textShadow: '0 0 30px rgba(240,145,51,0.3)' }}>
                    {n.val}{n.suffix}
                  </div>
                  <n.icon className="h-5 w-5 text-white/70 mx-auto mb-1" />
                  <div className="text-white/70 text-sm font-medium">{n.label}</div>
                  <div className="text-white/70 text-xs mt-0.5">e in crescita</div>
                </motion.div>
              ))}
              <motion.div variants={scaleIn} transition={cardTransition} className="relative">
                <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-px bg-white/10" />
                <div className="text-5xl md:text-6xl font-bold text-[#f09133] mb-2" style={{ textShadow: '0 0 30px rgba(240,145,51,0.3)' }}>.75/1</div>
                <Star className="h-5 w-5 text-white/70 mx-auto mb-1" />
                <div className="text-white/70 text-sm font-medium">Validazione psicometrica</div>
                <div className="text-white/70 text-xs mt-0.5">certificata</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>



      {/* ═══ FIX #6: PRICING SECTION ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-[#faf8f5] to-white"
        id="prezzi"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-3">
            <span className="section-badge">Prezzi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 accent-underline mx-auto w-fit">
            Quanto costa Talenti Edili
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Scegli in base a quante persone valuti ogni mese. Tutti i piani includono il report completo elaborato dall'AI e il supporto.
          </p>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {PRICING_PLANS.map((plan, i) => (
              <motion.div
                key={i}
                className={`landing-card p-8 relative overflow-hidden ${plan.popular ? 'border-2 border-[#f09133] shadow-[0_8px_40px_rgba(240,145,51,0.15)]' : 'border border-[#e5e0db]'}`}
                variants={fadeUp}
                transition={cardTransition}
                whileHover={{ y: -6 }}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-0 bg-[#f09133] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    Più Scelto
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2" style={{ color: plan.color }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-[#1a1a2e]">{plan.price}</span>
                  {plan.period && <span className="text-[#6b7280] text-sm">{plan.period}</span>}
                </div>
                <p className="text-sm text-[#6b7280] mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-[#6b7280]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-xl ${plan.popular ? 'bg-[#f09133] hover:bg-[#e07a1f] text-white shadow-[0_4px_20px_rgba(240,145,51,0.3)]' : 'bg-[#1e3a5f] hover:bg-[#162d4a] text-white'}`}
                  onClick={() => scrollTo('cta-finale')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 15. FAQ ═══ */}
      <motion.section
        className="py-16 md:py-20 bg-gradient-to-b from-white to-[#f7f4f0] relative"
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
            Domande frequenti su Talenti Edili
          </h2>
          <p className="text-center text-[#6b7280] text-base mb-14 max-w-2xl mx-auto">
            Le cinque che ci fanno più spesso gli imprenditori edili.
          </p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {[...FAQ_DATA, ...FAQ_DATA_EXTRA]
                .filter((f) => FAQ_HOME.includes(f.q))
                .map((f, i) => (
                <motion.div key={i} variants={fadeUp} transition={cardTransition}>
                  <AccordionItem
                    value={`faq-${i}`}
                    className="border border-[#e5e0db] rounded-lg px-5 py-1 bg-white hover:border-[#f09133]/40 hover:shadow-md hover:bg-[#faf8f5]/50 transition-all duration-300 data-[state=open]:border-l-4 data-[state=open]:border-l-[#f09133] data-[state=open]:shadow-md"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent forceMount className="text-[#6b7280] text-base leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
          <p className="text-center text-sm text-[#6b7280] mt-8">
            <Link to="/faq" className="font-semibold text-[#1e3a5f] hover:text-[#f09133]">
              Tutte le domande frequenti →
            </Link>
          </p>
        </div>
      </motion.section>

      {/* ═══ 16. CTA FINALE — FIX #1: Lead capture form instead of mailto ═══ */}
      <motion.section
        id="cta-finale"
        className="px-4 md:px-8 py-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        transition={sectionTransition}
      >
        <div className="py-16 md:py-24 max-w-7xl mx-auto relative overflow-hidden rounded-[1.5rem]" style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a4f7a 0%, #1e3a5f 60%, #162d4a 100%)' }}>
          {/* Decorative spheres */}
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full bg-[#f09133]/[0.08] blur-3xl" />

          <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                La prossima persona che assumi{' '}
                <span className="text-[#f09133]">la scegli con i dati.</span>
              </h2>
              <p className="text-base md:text-lg text-white/70 leading-relaxed">
                Compila il form e ti contatteremo entro 24 ore per una demo gratuita di 30 minuti. Nessun impegno.
              </p>
            </div>

            {leadSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 text-center"
              >
                <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Richiesta ricevuta!</h3>
                <p className="text-white/70">Ti contatteremo entro 24 ore per organizzare la tua demo personalizzata.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-10">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Nome *</label>
                    <Input
                      required
                      maxLength={100}
                      placeholder="Il tuo nome"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-[#f09133]"
                      value={leadForm.nome}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, nome: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Email *</label>
                    <Input
                      required
                      type="email"
                      maxLength={255}
                      placeholder="nome@azienda.it"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-[#f09133]"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Azienda</label>
                    <Input
                      maxLength={200}
                      placeholder="Nome azienda"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-[#f09133]"
                      value={leadForm.azienda}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, azienda: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">N. Dipendenti</label>
                    <select
                      className="flex h-10 w-full rounded-md border bg-white/10 border-white/20 text-white px-3 py-2 text-sm focus:border-[#f09133] focus:outline-none"
                      value={leadForm.num_dipendenti}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, num_dipendenti: e.target.value }))}
                    >
                      <option value="" className="text-[#1a1a2e]">Seleziona</option>
                      <option value="1-10" className="text-[#1a1a2e]">1-10</option>
                      <option value="11-50" className="text-[#1a1a2e]">11-50</option>
                      <option value="51-200" className="text-[#1a1a2e]">51-200</option>
                      <option value="201-500" className="text-[#1a1a2e]">201-500</option>
                      <option value="500+" className="text-[#1a1a2e]">500+</option>
                    </select>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={leadSubmitting}
                  className="w-full bg-[#f09133] hover:bg-[#e07a1f] text-white text-lg rounded-xl shadow-[0_4px_20px_rgba(240,145,51,0.4)]"
                >
                  {leadSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Invio in corso...
                    </>
                  ) : (
                    <>
                      Richiedi una Demo Gratuita <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <div className="flex flex-wrap justify-center gap-6 mt-6">
                  <span className="flex items-center gap-2 text-sm text-white/70">
                    <Clock className="h-4 w-4" /> Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2 text-sm text-white/70">
                    <Shield className="h-4 w-4" /> 100% Riservato
                  </span>
                  <span className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4" /> Senza Impegno
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.section>
    </>
  );
}
