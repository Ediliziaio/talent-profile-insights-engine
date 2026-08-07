import { ReactNode, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getSupabase } from '@/lib/supabaseLazy';
import { toast } from '@/hooks/use-toast';
import { PILASTRI } from '@/data/site';

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const sectionTransition = { duration: 0.55, ease: 'easeOut' as const };
export const cardTransition = { duration: 0.45, ease: 'easeOut' as const };

/** Wrapper animato per una sezione di pagina */
export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeUp}
      transition={sectionTransition}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeading({
  badge,
  title,
  sub,
  as: As = 'h2',
}: {
  badge?: string;
  title: ReactNode;
  sub?: ReactNode;
  as?: 'h2' | 'h3';
}) {
  return (
    <div className="text-center mb-12">
      {badge && (
        <div className="mb-3">
          <span className="section-badge">{badge}</span>
        </div>
      )}
      <As className="text-3xl md:text-4xl font-bold accent-underline mx-auto w-fit mb-4">{title}</As>
      {sub && <p className="text-[#6b7280] text-base max-w-2xl mx-auto mt-6">{sub}</p>}
    </div>
  );
}

/** Hero standard delle pagine interne, con breadcrumb visibile */
export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  primaryCta,
  secondaryCta,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  breadcrumb: { label: string; to?: string }[];
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  children?: ReactNode;
}) {
  return (
    <section className="px-4 md:px-8 pt-6 md:pt-10">
      <div
        className="landing-hero-box max-w-7xl mx-auto py-14 md:py-20 px-6 md:px-16 relative overflow-hidden border border-white/10"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #2a4f7a 0%, #1e3a5f 70%)' }}
      >
        <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full bg-[#f09133]/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <nav aria-label="Percorso" className="flex flex-wrap items-center gap-1 text-xs text-white/70 mb-5">
            {breadcrumb.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.to ? (
                  <Link to={b.to} className="hover:text-[#f09133] transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-white/70">{b.label}</span>
                )}
              </span>
            ))}
          </nav>

          <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-orange-on-dark)] mb-4">
            {eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.12] mb-5">{title}</h1>
          <div className="text-base md:text-lg text-white/80 leading-relaxed">{intro}</div>

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl px-8 shadow-[0_4px_20px_rgba(240,145,51,0.4)]"
                >
                  <Link to={primaryCta.to}>
                    {primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {secondaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[#1e3a5f] hover:bg-white/90 rounded-xl px-8 font-semibold shadow-lg"
                >
                  <Link to={secondaryCta.to}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}

/** Blocco definizione — la risposta autoconclusiva che i motori generativi citano */
export function DefinitionBlock({ question, answer }: { question: string; answer: ReactNode }) {
  return (
    <Section className="py-14 md:py-18 bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-5">{question}</h2>
        <div className="text-lg leading-relaxed text-[#1a1a2e]">{answer}</div>
      </div>
    </Section>
  );
}

export function FaqSection({
  faq,
  title = 'Domande frequenti',
  sub,
  id = 'faq',
}: {
  faq: { q: string; a: string }[];
  title?: string;
  sub?: string;
  id?: string;
}) {
  return (
    <Section id={id} className="py-16 md:py-20 bg-[#f7f4f0] relative">
      <div className="dot-pattern" />
      <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
        <SectionHeading badge="FAQ" title={title} sub={sub} />
        <Accordion type="single" collapsible className="space-y-2">
          {faq.map((f, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-[#e5e0db] rounded-lg px-5 py-1 bg-white hover:border-[#f09133]/40 hover:shadow-md transition-all duration-300 data-[state=open]:border-l-4 data-[state=open]:border-l-[#f09133]"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent forceMount className="text-[#6b7280] text-base leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/**
 * Rimanda agli altri due modi di lavorare con noi.
 * Chiude le pagine servizio, che altrimenti sono vicoli ciechi: chi arriva da
 * ricerca organica su una sola porta d'ingresso deve poter vedere le altre.
 */
export function AltriServizi({ escludi }: { escludi: string }) {
  const altri = PILASTRI.filter((p) => p.slug !== escludi);

  return (
    <Section className="py-16 md:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <SectionHeading
          badge="Alternative"
          title="Gli altri due modi di lavorare con noi"
          sub="Si possono usare insieme o separatamente: cambia solo quanta parte del lavoro fai tu."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {altri.map((p) => (
            <Link
              key={p.slug}
              to={p.slug}
              className="landing-card rounded-xl border border-[#e5e0db] p-6 block"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-on-light)]">
                {p.eyebrow}
              </span>
              <h3 className="text-xl font-bold mt-2 mb-3">{p.title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-3">{p.desc}</p>
              <p className="text-xs text-[#3d3935] font-medium border-t border-[#e5e0db] pt-3 mb-3">
                {p.per}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f]">
                Scopri come funziona <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** Form lead condiviso — scrive nella tabella `leads` di Supabase */
export function LeadForm({
  compact = false,
  ctaLabel = 'Richiedi una demo gratuita',
  origine,
}: {
  compact?: boolean;
  ctaLabel?: string;
  origine?: string;
}) {
  const [form, setForm] = useState({ nome: '', email: '', azienda: '', num_dipendenti: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.nome.trim() || !form.email.trim()) return;
      setSubmitting(true);
      try {
        const supabase = await getSupabase();
        const { error } = await supabase.from('leads').insert({
          nome: form.nome.trim(),
          email: form.email.trim(),
          azienda: form.azienda.trim() || null,
          num_dipendenti: form.num_dipendenti || null,
        });
        if (error) throw error;
        setSubmitted(true);
        toast({ title: 'Richiesta inviata!', description: 'Ti contattiamo entro 24 ore lavorative.' });
      } catch {
        toast({ title: 'Errore', description: 'Riprova più tardi.', variant: 'destructive' });
      } finally {
        setSubmitting(false);
      }
    },
    [form]
  );

  if (submitted) {
    return (
      <div className="rounded-xl bg-white/10 border border-white/20 p-8 text-center">
        <Check className="h-10 w-10 text-[#f09133] mx-auto mb-3" />
        <p className="text-white font-semibold text-lg">Richiesta ricevuta.</p>
        <p className="text-white/70 text-sm mt-1">Ti scriviamo entro 24 ore lavorative.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-origine={origine}>
      <div className={compact ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
        <div>
          <label htmlFor="lead-nome" className="sr-only">
            Nome e cognome
          </label>
          <Input
            id="lead-nome"
            required
            placeholder="Nome e cognome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="bg-white/95 border-0 h-12 rounded-xl"
          />
        </div>
        <div>
          <label htmlFor="lead-email" className="sr-only">
            Email di lavoro
          </label>
          <Input
            id="lead-email"
            required
            type="email"
            placeholder="Email di lavoro"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white/95 border-0 h-12 rounded-xl"
          />
        </div>
        <div>
          <label htmlFor="lead-azienda" className="sr-only">
            Nome dell'impresa
          </label>
          <Input
            id="lead-azienda"
            placeholder="Nome dell'impresa"
            value={form.azienda}
            onChange={(e) => setForm({ ...form, azienda: e.target.value })}
            className="bg-white/95 border-0 h-12 rounded-xl"
          />
        </div>
        <div>
          <label htmlFor="lead-dip" className="sr-only">
            Numero di dipendenti
          </label>
          <Input
            id="lead-dip"
            placeholder="Quanti dipendenti?"
            value={form.num_dipendenti}
            onChange={(e) => setForm({ ...form, num_dipendenti: e.target.value })}
            className="bg-white/95 border-0 h-12 rounded-xl"
          />
        </div>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl h-12 font-semibold shadow-[0_4px_20px_rgba(240,145,51,0.4)]"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : ctaLabel}
      </Button>
      <p className="text-xs text-white/70 text-center">
        Nessun impegno. Ti richiamiamo entro 24 ore lavorative.
      </p>
    </form>
  );
}

/** Banda CTA finale con form, chiude tutte le pagine del portale */
export function CtaBand({
  title,
  sub,
  ctaLabel,
  origine,
}: {
  title: ReactNode;
  sub?: ReactNode;
  ctaLabel?: string;
  origine?: string;
}) {
  return (
    <Section id="contatto" className="px-4 md:px-8 py-8">
      <div
        className="py-16 md:py-20 max-w-7xl mx-auto relative overflow-hidden rounded-[1.5rem]"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a4f7a 0%, #1e3a5f 60%, #162d4a 100%)' }}
      >
        <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full bg-[#f09133]/[0.08] blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
            {sub && <p className="text-base md:text-lg text-white/70 leading-relaxed">{sub}</p>}
          </div>
          <LeadForm ctaLabel={ctaLabel} origine={origine} />
        </div>
      </div>
    </Section>
  );
}
