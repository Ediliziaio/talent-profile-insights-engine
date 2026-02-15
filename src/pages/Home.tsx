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
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
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
    desc: 'Al colloquio sembrano perfetti. Poi, dopo 3 mesi, scopri che non c\'erano mai stati. Nessun dato, nessun metodo — solo istinto.',
  },
  {
    icon: TrendingDown,
    title: 'Turnover alle stelle',
    desc: 'Chi assumi non resta. E ogni volta che ricominci, bruci tempo, soldi e morale del team. Il costo reale? Fino a 2x lo stipendio annuo.',
  },
  {
    icon: Target,
    title: 'Nessun dato oggettivo',
    desc: 'Valuti le persone con il CV e una chiacchierata. Ma il CV non dice chi è davvero una persona, né come si comporterà sotto pressione.',
  },
  {
    icon: UserX,
    title: 'Team disfunzionali',
    desc: 'Inserisci persone sbagliate nei ruoli sbagliati. Il risultato? Conflitti, calo di produttività e talenti che se ne vanno.',
  },
];

const STEPS = [
  {
    icon: Send,
    title: 'Invita il candidato',
    desc: 'Invii un link personalizzato. Il candidato compila in autonomia, da qualsiasi dispositivo. Zero logistica.',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessment Psicologico',
    desc: '140 domande validate scientificamente. 15 minuti di compilazione, zero stress. Il candidato risponde in modo naturale e spontaneo.',
  },
  {
    icon: BarChart3,
    title: 'Report Istantaneo',
    desc: 'Profilo psicologico completo: 14 scale, scoring V5, mappa interiore, punti di forza e aree critiche. Tutto in tempo reale.',
  },
  {
    icon: Lightbulb,
    title: 'Decisione Informata',
    desc: 'Role matching automatico con 30+ ruoli, guida personalizzata al colloquio e confronto tra candidati. Assumi con i dati, non con il dubbio.',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Profilo Psicologico 360°',
    desc: '14 scale psicologiche, scoring V5, analisi completa della personalità in un unico report esecutivo.',
  },
  {
    icon: Target,
    title: 'Mappa Interiore',
    desc: 'Psicologia profonda: identità, emozioni, stile di attaccamento e meccanismi difensivi del candidato.',
  },
  {
    icon: Users,
    title: 'Role Matching',
    desc: 'Compatibilità automatica con 30+ ruoli aziendali. Scopri subito dove il candidato performa meglio.',
  },
  {
    icon: Lightbulb,
    title: 'Guida al Colloquio',
    desc: 'Domande personalizzate generate direttamente dall\'assessment. Vai al colloquio preparato.',
  },
  {
    icon: BarChart3,
    title: 'Confronto Candidati',
    desc: 'Confronta fino a 4 candidati fianco a fianco su tutte le dimensioni psicologiche.',
  },
  {
    icon: FileText,
    title: 'Report PDF Esecutivo',
    desc: 'Scaricabile, condivisibile, pronto per il management. Professionale e completo.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Marco Rinaldi',
    role: 'HR Director — Gruppo Industriale',
    quote: 'Da quando usiamo TalentProfile, il turnover nei primi 6 mesi è calato del 40%. Finalmente abbiamo dati oggettivi per le nostre decisioni.',
    stars: 5,
  },
  {
    name: 'Chiara Fontana',
    role: 'CEO — Tech Startup',
    quote: 'Assumevamo a sensazione e sbagliavamo 1 volta su 3. Con TalentProfile abbiamo ridotto gli errori di selezione quasi a zero.',
    stars: 5,
  },
  {
    name: 'Luca Ferretti',
    role: 'Responsabile Selezione — Retail',
    quote: 'Il report è incredibilmente dettagliato. La mappa interiore ci ha rivelato dinamiche che nessun colloquio avrebbe fatto emergere.',
    stars: 5,
  },
];

const FAQ_DATA = [
  {
    q: 'Quanto dura il test?',
    a: 'Il candidato completa l\'assessment in circa 15 minuti. Il report è disponibile istantaneamente, senza attese.',
  },
  {
    q: 'È validato scientificamente?',
    a: 'Sì. TalentProfile si basa su modelli psicometrici riconosciuti, con 14 scale validate e un sistema di scoring proprietario (V5) sviluppato con esperti di psicologia del lavoro.',
  },
  {
    q: 'Come invio il test a un candidato?',
    a: 'Crei il candidato dalla dashboard, e il sistema genera automaticamente un link unico. Il candidato lo apre da qualsiasi dispositivo e compila in autonomia.',
  },
  {
    q: 'I dati sono sicuri?',
    a: 'Assolutamente. Tutti i dati sono crittografati, conservati su server europei e trattati nel pieno rispetto del GDPR. Il consenso del candidato viene raccolto prima dell\'assessment.',
  },
  {
    q: 'Posso usarlo per il mio team attuale?',
    a: 'Certo. TalentProfile non serve solo per la selezione: puoi mappare il profilo psicologico dei tuoi collaboratori attuali per ottimizzare ruoli, team building e percorsi di crescita.',
  },
  {
    q: 'Quanto costa?',
    a: 'Offriamo piani flessibili basati sul numero di assessment. Richiedi una demo per ricevere un preventivo personalizzato in base alle tue esigenze.',
  },
  {
    q: 'Che differenza c\'è rispetto a un test della personalità generico?',
    a: 'I test generici danno etichette vaghe. TalentProfile fornisce un profilo psicologico profondo con scoring numerico, role matching, analisi dei rischi operativi e una guida concreta al colloquio.',
  },
];

const FOR_NOT_FOR = {
  not: [
    'Assumi solo per urgenza senza voler cambiare metodo',
    'Pensi che il curriculum basti a capire una persona',
    'Non vuoi investire nella qualità della selezione',
  ],
  yes: [
    'Vuoi smettere di assumere a sensazione',
    'Cerchi uno strumento scientifico per le tue decisioni HR',
    'Vuoi ridurre il turnover e costruire team stabili',
  ],
};

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
  const c1 = useCountUp(100);
  const c2 = useCountUp(5000);
  const c3 = useCountUp(14);
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
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10">
          <p className="text-sm uppercase tracking-widest text-orange-300 font-semibold mb-4">
            Il sistema di assessment HR più completo d'Italia
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            <span className="text-accent">BASTA</span> Assunzioni Sbagliate.
            <br className="hidden sm:block" />
            <span className="block mt-2">Scopri Chi Hai Davvero Davanti.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto mb-10">
            TalentProfile mappa il profilo psicologico profondo dei candidati in 15 minuti.
            Riduci il turnover, assumi le persone giuste, fai crescere il tuo team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" /> 100+ Aziende
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" /> 15 min per test
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" /> Report Istantaneo
            </span>
          </div>
        </div>
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* ═══ 3. PROBLEMA ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="problema">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Se il tuo processo di selezione non funziona,<br className="hidden md:block" /> è quasi sempre per questi 4 motivi
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Li riconosci? Allora sai già quanto ti costano.
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

      {/* ═══ 4. IL METODO ═══ */}
      <Section className="py-20 md:py-28 bg-secondary/50" id="metodo">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Come Funziona
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
            Il Metodo TalentProfile in 4 Step
          </h2>
          <div className="relative">
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
        </div>
      </Section>

      {/* ═══ 5. FUNZIONALITÀ ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="funzionalita">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Funzionalità
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-14 text-foreground">
            Tutto quello che ti serve per assumere meglio
          </h2>
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

      {/* ═══ 6. NUMERI ═══ */}
      <Section className="py-20 md:py-28" id="numeri" >
        <div className="py-20 md:py-28" style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #2d5a8e 100%)' }}>
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <p className="text-sm uppercase tracking-widest text-orange-300 font-semibold text-center mb-3">
              I Risultati Parlano
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
              I Numeri Che Contano
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { ref: c1.ref, val: c1.value, suffix: '+', label: 'Aziende' },
                { ref: c2.ref, val: c2.value.toLocaleString('it-IT'), suffix: '+', label: 'Assessment completati' },
                { ref: c3.ref, val: c3.value, suffix: '', label: 'Scale Psicologiche' },
                { ref: c4.ref, val: c4.value, suffix: ' min', label: 'Tempo Medio Test' },
              ].map((n, i) => (
                <div key={i} ref={n.ref}>
                  <div className="text-4xl md:text-6xl font-black text-accent mb-2">
                    {n.val}{n.suffix}
                  </div>
                  <div className="text-blue-200 text-sm md:text-base font-medium">{n.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 7. TESTIMONIANZE ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="testimonianze">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            Social Proof
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-14 text-foreground">
            Le aziende che scelgono TalentProfile assumono meglio
          </h2>
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
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
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

      {/* ═══ 8. PER CHI È / NON È ═══ */}
      <Section className="py-20 md:py-28 bg-secondary/50" id="perchi">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-14 text-foreground">
            TalentProfile fa per te?
          </h2>
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

      {/* ═══ 9. FAQ ═══ */}
      <Section className="py-20 md:py-28 bg-background" id="faq">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <p className="text-sm uppercase tracking-widest text-accent font-semibold text-center mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-14 text-foreground">
            Domande Frequenti
          </h2>
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

      {/* ═══ 10. CTA FINALE + FOOTER ═══ */}
      <section
        id="cta-finale"
        className="py-20 md:py-28 text-center"
        style={{ background: 'linear-gradient(135deg, #f09133 0%, #e07a1f 100%)' }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Il futuro del tuo team inizia da qui.
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
            Smetti di assumere alla cieca. Richiedi una demo gratuita e scopri come TalentProfile può trasformare il tuo processo di selezione.
          </p>
          <Button
            size="lg"
            className="bg-white text-accent hover:bg-white/90 text-lg px-10 py-6 rounded-xl shadow-xl font-bold"
            onClick={() => window.open('mailto:info@talentprofile.it?subject=Richiesta Demo TalentProfile', '_blank')}
          >
            Richiedi una Demo Gratuita <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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
