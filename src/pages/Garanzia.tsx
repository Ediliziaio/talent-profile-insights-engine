import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Seo } from '@/components/Seo';
import { breadcrumbLd, faqLd, organizationLd } from '@/lib/seo';

const GUARANTEES = [
  'Accesso COMPLETO a tutti gli strumenti — nessuna versione limitata',
  'Report illimitati su tutti i candidati che vuoi',
  'Confronto visivo tra candidati e domande di colloquio generate dall\'Intelligenza Artificiale',
  'Se non vedi risultati, UN\'EMAIL e ti ridiamo tutto',
  'Nessun modulo, nessuna telefonata, nessuna rottura di scatole',
];

const STEPS = [
  { num: '01', title: 'Attiva oggi', desc: 'Ci vogliono 2 minuti. Nessun contratto vincolante.' },
  { num: '02', title: 'Mettimi alla prova per 30 giorni', desc: 'Usa tutto: analisi psicoattitudinali, report elaborati dall\'AI, confronto candidati. Senza limiti.' },
  { num: '03', title: 'Non ti convince? Una mail. Fine.', desc: 'Scrivi a info@talentiedili.it. Ti ridò ogni centesimo. Nessuna domanda.' },
];

const FAQ = [
  {
    q: '"E se volessi fregarti?"',
    a: 'Puoi farlo. Tecnicamente potresti usare lo strumento per 29 giorni e poi chiedere il rimborso. Ma sai cosa? Non succede quasi mai. Perché quando lo usi, funziona. E quando funziona, non lo molli più.',
  },
  {
    q: '"30 giorni bastano per capire se funziona?"',
    a: 'Bastano 3 analisi psicoattitudinali. Dopo il primo report elaborato dall\'AI capirai già il valore. 30 giorni sono più che sufficienti per vedere risultati concreti sulle tue selezioni.',
  },
  {
    q: '"Come faccio a chiedere il rimborso?"',
    a: 'Una mail. Una. Scrivi a info@talentiedili.it, dici "voglio il rimborso" e basta. Entro 5 giorni lavorativi rivedi i tuoi soldi. Zero burocrazia.',
  },
  {
    q: '"Perché dovrei fidarmi?"',
    a: 'Non devi fidarti. Devi solo provare. Il rischio è tutto dalla nostra parte. Se non funziona, perdiamo un cliente E ti ridiamo i soldi. Credi che lo faremmo se il prodotto non funzionasse?',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function Garanzia() {
  const navigate = useNavigate();

  const jsonLd = useMemo(
    () => [
      organizationLd(),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Garanzia', path: '/garanzia' },
      ]),
      faqLd(FAQ.map((f) => ({ q: f.q.replace(/"/g, ''), a: f.a }))),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Garanzia 30 giorni — Talenti Edili"
        description="Se non ti fa risparmiare almeno un'assunzione sbagliata nei primi 30 giorni, ti rimborsiamo tutto. Una mail, nessuna domanda, rimborso in 5 giorni."
        path="/garanzia"
        jsonLd={jsonLd}
      />

      {/* ═══ HERO — Pattern Interrupt ═══ */}
      <section className="bg-[#1e3a5f] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(240,145,51,0.12),transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-8 w-20 h-20 rounded-2xl bg-[#f09133] flex items-center justify-center shadow-lg"
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6"
          >
            Rischio <span className="text-[#f09133]">ZERO</span>.<br />
            Parola nostra.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium"
          >
             Se Talenti Edili non ti fa risparmiare almeno <strong className="text-[#f09133]">una assunzione sbagliata</strong> nei prossimi 30 giorni...
            ti ridiamo ogni centesimo. <span className="underline decoration-[#f09133] decoration-2 underline-offset-4">Senza farti una sola domanda.</span>
          </motion.p>
        </div>
      </section>

      {/* ═══ REASON WHY — Lettera personale ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="landing-card p-8 md:p-12 border-l-4 border-[#f09133]"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mb-6">
              Perché ti facciamo questa garanzia?
            </h2>
            <div className="space-y-5 text-lg md:text-xl text-[#1a1a2e] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              <p>
                Potremmo semplicemente dirti <em>"provalo"</em>. Ma vogliamo fare di più.
              </p>
              <p>
                Vogliamo toglierti <strong>OGNI scusa</strong> per non iniziare.
              </p>
              <p>
                Perché sappiamo una cosa: ogni mese che passi a scegliere chi portare in cantiere "a sensazione", stai <strong>bruciando soldi</strong>. Un'assunzione sbagliata costa tra i 30.000€ e i 150.000€. Lo sai anche tu.
              </p>
              <p>
                Ecco la logica, nuda e cruda:
              </p>
              <p className="text-[#1e3a5f] font-bold text-xl md:text-2xl pl-4 border-l-4 border-[#1e3a5f]">
                Se il sistema funziona, ci guadagniamo un cliente a vita.<br />
                Se non funziona, non meritiamo i tuoi soldi.
              </p>
              <p>
                In entrambi i casi, <strong>il rischio è tutto dalla nostra parte</strong>. Tu non rischi nulla.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ COSA TI GARANTISCO ═══ */}
      <section className="py-16 md:py-20 bg-white/60">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e]">
              Ecco cosa ti garantisco
            </h2>
            <p className="text-lg text-[#3d3935] mt-3">
              Nessun asterisco. Nessuna clausola nascosta. Tutto incluso.
            </p>
          </div>

          <div className="space-y-4">
            {GUARANTEES.map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-start gap-4 landing-card p-6"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-lg md:text-xl font-semibold text-[#1a1a2e]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 PASSI ═══ */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e]">
              Come funziona? Tre passi. Fine.
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
                <span className="text-7xl font-black text-[#f09133]/15 absolute top-4 right-6">{step.num}</span>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">{step.title}</h3>
                  <p className="text-base text-[#3d3935] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 md:py-20 bg-white/60">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e]">
              Domande scomode? Risposte dirette.
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="landing-card px-6 border-none"
              >
                <AccordionTrigger className="text-left text-[#1a1a2e] font-bold text-base md:text-lg hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent forceMount className="text-[#3d3935] text-base leading-relaxed">
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
            className="rounded-2xl p-10 md:p-16 bg-[#1e3a5f] text-white"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              L'unico rischio è <span className="text-[#f09133]">NON</span> provarlo.
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-lg mx-auto leading-relaxed">
              Ogni giorno senza dati è un giorno in cui rischi un'assunzione sbagliata. Provalo. Se non funziona, ti ridiamo tutto.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-[#f09133] hover:bg-[#d97e2a] text-white font-extrabold px-10 py-4 text-lg rounded-lg shadow-lg shadow-[#f09133]/30 h-auto"
            >
              ATTIVA ORA — RISCHIO ZERO <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-white/70 text-sm mt-5">
              30 giorni. Rimborso garantito. Zero domande.
            </p>
          </motion.div>
        </div>
      </section>

    </>
  );
}
