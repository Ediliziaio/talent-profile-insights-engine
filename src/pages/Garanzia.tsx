import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Mail, ArrowRight, Clock, FileText, Users, Linkedin, ShieldCheck, MessageSquare, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const STEPS = [
  {
    icon: Clock,
    title: 'Provi TalentProfile per 30 giorni',
    desc: 'Usa tutti gli strumenti: assessment, report, confronto candidati. Senza limiti.',
  },
  {
    icon: MessageSquare,
    title: 'Se non ti convince, scrivi una mail',
    desc: 'Nessun modulo complicato. Basta una mail a info@talentprofile.it.',
  },
  {
    icon: RotateCcw,
    title: 'Rimborso completo, senza domande',
    desc: 'Ricevi indietro tutto. Nessuna penale, nessuna trattenuta, nessuna scusa.',
  },
];

const COVERAGE = [
  { icon: FileText, label: 'Assessment completi per tutti i candidati' },
  { icon: Users, label: 'Confronto visivo tra candidati' },
  { icon: ShieldCheck, label: 'Report dettagliati con 15 tratti misurati' },
  { icon: Mail, label: 'Domande colloquio su misura generate dall\'AI' },
];

const FAQ = [
  {
    q: 'Entro quanto tempo posso chiedere il rimborso?',
    a: 'Hai 30 giorni dalla data di attivazione dell\'abbonamento. Basta inviare una mail a info@talentprofile.it entro quel termine.',
  },
  {
    q: 'Devo motivare la richiesta di rimborso?',
    a: 'No. La nostra garanzia è "senza domande". Se non sei soddisfatto, ti rimborsiamo e basta.',
  },
  {
    q: 'In quanto tempo ricevo il rimborso?',
    a: 'Entro 5 giorni lavorativi dalla richiesta. Il rimborso avviene sullo stesso metodo di pagamento utilizzato.',
  },
  {
    q: 'Posso continuare a usare il servizio dopo il rimborso?',
    a: 'No. Una volta rimborsato, l\'accesso viene disattivato. Potrai però riattivare l\'abbonamento in qualsiasi momento.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function Garanzia() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4f0]">
      {/* ═══ NAVBAR ═══ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e5e0db]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2">
            <img src="/talentprofile_logo_v3.png" alt="TalentProfile" className="h-9" />
          </button>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-[#f09133] hover:bg-[#d97e2a] text-white font-semibold rounded-lg"
          >
            Accedi
          </Button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="dot-pattern" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-[#1e3a5f] flex items-center justify-center shadow-lg"
          >
            <Shield className="h-10 w-10 text-[#f09133]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-[#1a1a2e] leading-tight mb-4"
          >
            Garanzia{' '}
            <span className="text-[#f09133]">Soddisfatti o Rimborsati</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg md:text-xl text-[#3d3935]/70 max-w-2xl mx-auto"
          >
            Se non sei soddisfatto, ti rimborsiamo. Senza domande.
          </motion.p>
        </div>
      </section>

      {/* ═══ COME FUNZIONA ═══ */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Come Funziona</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mt-4">
              Tre passi. Zero rischi.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                className="landing-card p-8 text-center relative"
              >
                <span className="number-decoration">{i + 1}</span>
                <div className="w-14 h-14 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="h-7 w-7 text-[#1e3a5f]" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{step.title}</h3>
                <p className="text-sm text-[#3d3935]/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COSA COPRE ═══ */}
      <section className="py-16 md:py-20 bg-white/60">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Cosa è incluso</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mt-4">
              La garanzia copre tutto il servizio
            </h2>
            <p className="text-[#3d3935]/60 mt-3 max-w-xl mx-auto">
              Non c'è nessun asterisco. Se entro 30 giorni non sei soddisfatto di qualsiasi aspetto, ti rimborsiamo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {COVERAGE.map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-start gap-4 landing-card p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-[#f09133]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-[#f09133]" />
                </div>
                <div>
                  <p className="text-[#1a1a2e] font-semibold text-sm">{item.label}</p>
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <span className="section-badge">Domande Frequenti</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mt-4">
              Hai dubbi sulla garanzia?
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="landing-card px-6 border-none"
              >
                <AccordionTrigger className="text-left text-[#1a1a2e] font-semibold text-sm hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#3d3935]/70 text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══ CTA FINALE ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="landing-card p-10 md:p-14 bg-[#1e3a5f] border-none text-white"
          >
            <Shield className="h-12 w-12 text-[#f09133] mx-auto mb-5" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Provalo senza rischi
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              30 giorni per decidere. Se non ti convince, ti rimborsiamo tutto. Nessuna scusa, nessuna domanda.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-[#f09133] hover:bg-[#d97e2a] text-white font-semibold px-8 py-3 text-base rounded-lg"
            >
              Inizia ora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#1e3a5f] py-14 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f09133] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <button onClick={() => navigate('/home')} className="flex items-center gap-2">
              <img
                src="/talentprofile_logo_v3.png"
                alt="TalentProfile"
                className="h-10 brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
              />
            </button>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-white/30">
              <span>© {new Date().getFullYear()} TalentProfile</span>
              <span>|</span>
              <button onClick={() => navigate('/home')} className="hover:text-[#f09133] transition-colors">Home</button>
              <span>|</span>
              <a href="mailto:info@talentprofile.it" className="hover:text-[#f09133] transition-colors flex items-center gap-1">
                <Mail className="h-3 w-3" /> Contatti
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
