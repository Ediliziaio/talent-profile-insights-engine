import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';

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
          el.classList.remove('opacity-0', 'translate-y-8');
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
      className={`opacity-0 translate-y-8 transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── Smooth scroll helper ─── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ─── DATA ─── */
const NAV_LINKS = [
  { label: 'Funzionalità', id: 'funzionalita' },
  { label: 'Metodo', id: 'metodo' },
  { label: 'Numeri', id: 'numeri' },
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
    quote: 'Da quando usiamo TalentProfile, il turnover nei primi 6 mesi è calato del 40%. Finalmente abbiamo dati oggettivi per le nostre decisioni — e il team HR ha smesso di navigare a vista.',
    stars: 5,
  },
  {
    name: 'Chiara Fontana',
    role: 'CEO — Tech Startup (25 dip.)',
    quote: 'Assumevamo a sensazione e sbagliavamo 1 volta su 3. Con TalentProfile abbiamo ridotto gli errori di selezione quasi a zero. In 12 mesi, zero errori di hiring. Il ROI? Incalcolabile.',
    stars: 5,
  },
  {
    name: 'Luca Ferretti',
    role: 'Resp. Selezione — Retail Chain (50 PV)',
    quote: 'La mappa interiore ci ha rivelato dinamiche che nessun colloquio avrebbe fatto emergere. Abbiamo capito perché certi talenti non performavano: erano nel ruolo sbagliato. Spostati, sono diventati i migliori.',
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

/* ─── NEW DATA: Lettera Aperta ─── */
const LETTERA_PARAGRAPHS = [
  'Se stai leggendo questa pagina è perché conosci la frustrazione di assumere la persona sbagliata. L\'hai vissuta in prima persona — forse più di una volta.',
  'Non è colpa tua. È che fino ad oggi non avevi uno strumento che ti permettesse di vedere cosa c\'è sotto il curriculum. Quello che il candidato non ti dice al colloquio — perché non lo sa nemmeno lui.',
  'TalentProfile non misura la persona. Misura il software mentale che ha sviluppato in anni di esperienze. Come reagisce sotto pressione? Come gestisce le relazioni? Ha la struttura per quel ruolo — o è solo bravo a recitare la parte?',
  '242 domande. 15 tratti misurati. 24 sindromi comportamentali identificate. Report istantaneo.',
];

/* ─── NEW DATA: Buona Notizia ─── */
const BUONA_NOTIZIA_ITEMS = [
  { title: 'Mappare il profilo psicologico reale di ogni candidato', desc: 'In 15 minuti, non in settimane.' },
  { title: 'Sapere PRIMA se la persona è adatta al ruolo', desc: 'Con dati, non con l\'istinto.' },
  { title: 'Ridurre il turnover fino al 40%', desc: 'Casi documentati dai nostri clienti.' },
  { title: 'Andare al colloquio preparato', desc: 'Con domande mirate generate dall\'assessment.' },
];

/* ─── NEW DATA: Casi Reali ─── */
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

/* ─── NEW DATA: Tabella Comparativa ─── */
const COMPARISON_ROWS = [
  { aspect: 'Strumento', others: 'Colloquio + CV', tp: 'Assessment 242 item validato' },
  { aspect: 'Tempo', others: 'Settimane', tp: '15 minuti, report istantaneo' },
  { aspect: 'Oggettività', others: 'Opinioni soggettive', tp: 'Scale psicologiche validate' },
  { aspect: 'Profondità', others: 'Superficie (competenze)', tp: 'Psicologia profonda (identità, difese)' },
  { aspect: 'Role Matching', others: 'Manuale, approssimativo', tp: 'Automatico su 30+ ruoli' },
  { aspect: 'Colloquio', others: 'Domande generiche', tp: 'Guida personalizzata' },
  { aspect: 'Post-assunzione', others: 'Speri che vada bene', tp: 'Piano inserimento su misura' },
];

/* ─── NEW DATA: Urgency Timeline ─── */
const URGENCY_STEPS = [
  {
    period: 'Mese 1–3',
    title: 'L\'assunzione "sembra" ok',
    desc: 'Luna di miele. Il nuovo assunto sorride, annuisce, fa bella figura. I problemi ci sono già — ma non li vedi ancora. Il suo "software mentale" è in esecuzione, ma non l\'hai mai testato.',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
  },
  {
    period: 'Mese 3–6',
    title: 'I segnali arrivano',
    desc: 'Performance sotto le aspettative. Conflitti con i colleghi. Non regge la pressione. Non gestisce il team. I feedback negativi iniziano ad accumularsi — e tu inizi a chiederti: "Ma al colloquio era un\'altra persona?"',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
  },
  {
    period: 'Mese 6–12',
    title: 'Il costo esplode',
    desc: 'Turnover, riassunzione, formazione persa. Costo reale: fino a 2x lo stipendio annuo. Circa €30.000 bruciati. E il tempo? Quello non torna.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
  },
  {
    period: 'Oltre 12 mesi',
    title: 'Il danno è strutturale',
    desc: 'Team destabilizzato. Cultura aziendale compromessa. I talenti veri — quelli che avevi faticato a trovare — se ne vanno. Non per lo stipendio. Per l\'ambiente tossico che quel singolo errore ha creato.',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
  },
];

/* ─────────────────── COMPONENT ─────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══ 1. NAVBAR ═══ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-transparent'
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
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Accedi
            </Button>
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => scrollTo('cta-finale')}
            >
              Richiedi una Demo
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleNav(l.id)}
                    className="text-left text-lg font-medium py-2 hover:text-accent transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
                <hr className="border-border" />
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/auth');
                  }}
                >
                  Accedi
                </Button>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => handleNav('cta-finale')}
                >
                  Richiedi una Demo
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ═══ 2. HERO ═══ */}
      <section className="relative py-20 md:py-32 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #2d5a8e 60%, #3b7ddd 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text */}
          <div className="lg:w-3/5 text-center lg:text-left">
            <p className="text-sm uppercase tracking-widest text-orange-300 font-semibold mb-4">
              Il sistema di assessment HR più completo d'Italia
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              In 15 minuti sai chi hai davvero di fronte.
              <br className="hidden sm:block" />
              <span className="block mt-2">Prima ancora del colloquio.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mb-10">
              Il profilo psicologico completo del candidato — non le solite 4 domande generiche. 242 item, 15 tratti misurati, 24 sindromi comportamentali identificate. Report istantaneo, confronto candidati, guida al colloquio personalizzata.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-xl shadow-lg"
                onClick={() => scrollTo('cta-finale')}
              >
                Richiedi una Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
                onClick={() => scrollTo('metodo')}
              >
                Scopri di Più
              </Button>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" /> 1.000+ Aziende clienti
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" /> 15 min per test
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" /> Report Istantaneo
              </span>
            </div>
          </div>
          {/* Right: Team image */}
          <div className="hidden lg:block lg:w-2/5">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Team professionale al lavoro"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/40 to-transparent" />
            </div>
          </div>
        </div>
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* ═══ 3. LETTERA APERTA ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="lettera">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8 italic">Caro imprenditore,</h3>
          <div className="space-y-6">
            {LETTERA_PARAGRAPHS.map((paragrafo, i) => (
              <p key={i} className="text-lg md:text-xl leading-relaxed text-foreground/90">
                {i === LETTERA_PARAGRAPHS.length - 1 ? <strong>{paragrafo}</strong> : paragrafo}
              </p>
            ))}
          </div>
          <p className="text-lg text-muted-foreground mt-4 italic">
            Non è magia. È scienza applicata alle decisioni più importanti della tua azienda: le persone che ci metti dentro.
          </p>
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-xl font-bold text-foreground">Il Team TalentProfile</p>
            <p className="text-sm text-muted-foreground mt-1">Psicologia del lavoro applicata alla realtà dell'impresa</p>
          </div>
        </div>
      </Section>

      {/* ═══ 4. PROBLEMA ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="problema">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-destructive font-semibold text-center mb-3">
            Il Problema
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Stai scommettendo il futuro della tua azienda<br className="hidden md:block" /> su una sensazione.
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Lo sai anche tu. Al colloquio sembrava perfetto. Dopo 3 mesi era un disastro. Il CV diceva tutto — tranne la verità. Quante volte è successo?
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {PROBLEMS.map((p, i) => (
              <Card
                key={i}
                className="p-6 md:p-8 border border-border hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                    <p.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{p.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 5. BUONA NOTIZIA (NUOVA) ═══ */}
      <Section className="py-20 md:py-28 bg-blue-50" id="buona-notizia">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Ma c'è una soluzione
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Anzi, Un'Ottima Notizia.
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Oggi puoi fare tutto questo:
          </p>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="lg:w-3/5">
              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                {BUONA_NOTIZIA_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border border-border"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-lg md:text-xl text-foreground leading-relaxed">
                  Il problema? Questi risultati li ottieni <strong>SOLO</strong> se hai lo strumento giusto. Uno strumento costruito da chi la psicologia del lavoro la conosce davvero.
                </p>
              </div>
            </div>
            <div className="hidden lg:block lg:w-2/5">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80"
                alt="Team che collabora in ufficio"
                className="w-full h-full object-cover rounded-xl shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 6. IL METODO ═══ */}
      <Section className="py-20 md:py-28 bg-secondary/50" id="metodo">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Come Funziona
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Il Metodo TalentProfile in 4 Step
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
            Dal link al report completo. 15 minuti. Zero logistica. Dati che nessun colloquio potrebbe darti.
          </p>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="lg:w-3/5 relative">
              {/* vertical line */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              <div className="space-y-12">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex items-start gap-6 md:gap-8">
                    <div className="shrink-0 relative z-10">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg md:text-xl font-black shadow-lg">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="pt-1 md:pt-3">
                      <h3 className="text-xl md:text-2xl font-bold mb-2 text-foreground">{s.title}</h3>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block lg:w-2/5">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80"
                alt="Dashboard di analisi HR"
                className="w-full h-full object-cover rounded-xl shadow-lg sticky top-32"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 7. FUNZIONALITÀ ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="funzionalita">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Funzionalità
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Tutto quello che ti serve per assumere meglio
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Non un test generico. Un sistema completo di intelligence HR costruito per darti vantaggio competitivo nelle decisioni sulle persone.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card
                key={i}
                className="p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 8. NUMERI ═══ */}
      <Section className="py-20 md:py-28" id="numeri" >
        <div className="py-20 md:py-28" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #2d5a8e 100%)' }}>
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <p className="text-sm uppercase tracking-widest text-orange-300 font-semibold text-center mb-3">
              I Risultati Parlano
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
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
                  <div className="text-4xl md:text-6xl font-black text-accent mb-2">
                    {n.val}{n.suffix}
                  </div>
                  <div className="text-blue-200 text-sm md:text-base font-medium">{n.label}</div>
                </div>
              ))}
              <div>
                <div className="text-4xl md:text-6xl font-black text-accent mb-2">.75/1</div>
                <div className="text-blue-200 text-sm md:text-base font-medium">Validazione scientifica</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 9. TESTIMONIANZE ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="testimonianze">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Testimonianze
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Le aziende che scelgono TalentProfile
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">assumono meglio</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="p-6 md:p-8 border border-border">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
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
                    <div className="font-semibold text-sm text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 10. CASI REALI (NUOVA) ═══ */}
      <Section className="py-20 md:py-28 bg-secondary/50" id="casi-reali">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Storie di Successo
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Risultati Reali. Aziende Reali.
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Ecco cosa è successo quando hanno smesso di assumere a sensazione.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {CASE_STUDIES.map((cs, i) => (
              <Card key={i} className="p-6 md:p-8 border border-border relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Badge percentuale */}
                <div className="absolute top-4 right-4">
                  <div className="text-4xl font-black text-accent">{cs.badge}</div>
                  <div className="text-xs text-muted-foreground font-medium text-right">{cs.badgeLabel}</div>
                </div>
                {/* Company info */}
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">{cs.company}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{cs.size}</p>
                <p className="text-xs text-accent font-medium mb-4">{cs.sector}</p>
                <p className="text-foreground leading-relaxed mb-6">{cs.desc}</p>
                {/* Results */}
                <ul className="space-y-2">
                  {cs.results.map((r, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 11. TABELLA COMPARATIVA (NUOVA) ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="comparativa">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Il Confronto
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-14 text-foreground">
            Perché TalentProfile è diverso
          </h2>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-bold text-foreground bg-muted/50 w-1/4">Aspetto</th>
                  <th className="text-left p-4 font-bold text-destructive bg-destructive/5 w-[37.5%]">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5" /> Metodo tradizionale
                    </div>
                  </th>
                  <th className="text-left p-4 font-bold text-success bg-success/5 w-[37.5%]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> TalentProfile 360°
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                    <td className="p-4 font-semibold text-foreground">{row.aspect}</td>
                    <td className="p-4 bg-destructive/5">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <span className="text-foreground/70">{row.others}</span>
                      </div>
                    </td>
                    <td className="p-4 bg-success/5">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span className="text-foreground">{row.tp}</span>
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
              <Card key={i} className="p-4 border border-border">
                <h4 className="font-bold text-foreground mb-3">{row.aspect}</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/5">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/70">{row.others}</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-success/5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{row.tp}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 12. PER CHI È / NON È ═══ */}
      <Section className="py-20 md:py-28 bg-secondary/50" id="perchi">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Qualificazione
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            TalentProfile fa per te?
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Non è per tutti. Ed è giusto così. Ecco come capire se siamo il tuo strumento.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* NON è per te */}
            <Card className="p-6 md:p-8 border-2 border-destructive/30 bg-destructive/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-destructive">
                <XCircle className="h-6 w-6" /> NON è per te se...
              </h3>
              <ul className="space-y-4">
                {FOR_NOT_FOR.not.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            {/* È per te */}
            <Card className="p-6 md:p-8 border-2 border-success/30 bg-success/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-success">
                <CheckCircle2 className="h-6 w-6" /> È PER TE se...
              </h3>
              <ul className="space-y-4">
                {FOR_NOT_FOR.yes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      {/* ═══ 13. URGENCY TIMELINE (NUOVA) ═══ */}
      <Section className="py-20 md:py-28" id="urgency">
        <div className="py-20 md:py-28" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <p className="text-sm uppercase tracking-widest text-orange-300 font-semibold">
                Il Costo Dell'Inazione
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
              Cosa succede se continui<br className="hidden md:block" /> ad assumere senza dati?
            </h2>

            <div className="relative">
              {/* Vertical line with gradient */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 hidden md:block"
                style={{ background: 'linear-gradient(to bottom, #22c55e, #eab308, #f97316, #ef4444)' }} />
              
              <div className="space-y-10 md:space-y-14">
                {URGENCY_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-6 md:gap-8">
                    <div className="shrink-0 relative z-10">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${step.bgColor} flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-sm md:text-base font-black">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                    <div className="pt-1 md:pt-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${step.color}`}>
                        {step.period}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-white mt-1 mb-2">{step.title}</h3>
                      <p className="text-blue-200/80 text-base md:text-lg leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Positive closing box */}
            <div className="mt-14 p-6 md:p-8 rounded-xl border border-success/30 bg-success/10">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ma C'è Ancora Tempo.</h3>
                  <p className="text-blue-200/90 text-base md:text-lg leading-relaxed">
                    In questo momento puoi cambiare il tuo processo di selezione. <strong className="text-white">Basta un assessment.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 14. FAQ ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="faq">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Domande Frequenti
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Le stesse domande che ci fanno tutti. Le risposte sincere che diamo sempre.
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_DATA.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-4 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* ═══ 15. CTA FINALE + TRUST BADGES ═══ */}
      <section
        id="cta-finale"
        className="relative py-20 md:py-28 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f09133 0%, #e07a1f 100%)' }}
      >
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=60"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
          loading="lazy"
        />
        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
          <p className="text-sm uppercase tracking-widest text-white/70 font-semibold mb-4">Inizia Ora</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
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
            className="bg-white text-accent hover:bg-white/90 text-lg px-10 py-6 rounded-xl shadow-xl font-bold"
            onClick={() => window.open('mailto:info@talentprofile.it?subject=Richiesta Demo TalentProfile', '_blank')}
          >
            Richiedi una Demo Gratuita <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          {/* Trust Badges */}
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
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img
              src="/talentprofile_logo_v3.png"
              alt="TalentProfile"
              className="h-10 brightness-0 invert"
            />
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="hover:text-white transition-colors"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => navigate('/auth')}
                className="hover:text-white transition-colors"
              >
                Accedi
              </button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/40">
            © {new Date().getFullYear()} TalentProfile. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}
