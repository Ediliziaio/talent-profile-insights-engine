import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Clock, Briefcase, Search, Brain, HardHat } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Section, SectionHeading, LeadForm } from '@/components/site/sections';
import { breadcrumbLd, organizationLd, webPageLd } from '@/lib/seo';
import { CONTATTI } from '@/data/site';

const PATH = '/contatti';

const PERCORSI = [
  {
    icon: Search,
    title: 'Cerco personale adesso',
    desc: 'Ti mostriamo quanti profili compatibili ci sono già sulla piattaforma per il ruolo che devi coprire.',
    to: '/piattaforma',
    label: 'Vedi la piattaforma',
  },
  {
    icon: Briefcase,
    title: 'Voglio che la selezione la facciate voi',
    desc: 'Briefing di mezz’ora sul ruolo e ti diciamo tempi, fattibilità e costo prima di partire.',
    to: '/ricerca-e-selezione-personale-edile',
    label: 'Ricerca e selezione',
  },
  {
    icon: Brain,
    title: 'Voglio usare il sistema da solo',
    desc: 'Demo di 30 minuti su un report vero, applicato a un ruolo che devi coprire davvero.',
    to: '/talent-profile-system',
    label: 'Talent Profile System',
  },
  {
    icon: HardHat,
    title: 'Cerco lavoro in edilizia',
    desc: 'Per i candidati è tutto gratuito: registrazione, analisi psicoattitudinale e report.',
    to: '/lavora-in-edilizia',
    label: 'Area candidati',
  },
];

export default function Contatti() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Contatti — Talenti Edili',
        description:
          'Richiedi una demo o parla con un selezionatore. Rispondiamo entro 24 ore lavorative.',
        path: PATH,
      }),
      organizationLd(),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Contatti', path: PATH },
      ]),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Contatti — richiedi una demo | Talenti Edili"
        description="Parla con noi di selezione del personale edile: demo del Talent Profile System, piattaforma o servizio di ricerca e selezione. Rispondiamo entro 24 ore lavorative."
        path={PATH}
        jsonLd={jsonLd}
      />

      <section className="px-4 md:px-8 pt-6 md:pt-10">
        <div
          className="landing-hero-box max-w-7xl mx-auto py-14 md:py-20 px-6 md:px-16 relative overflow-hidden border border-white/10"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, #2a4f7a 0%, #1e3a5f 70%)' }}
        >
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full bg-[#f09133]/10 blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-orange-on-dark)] mb-4">
                Contatti
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.12] mb-5">
                Parliamo del ruolo che <span className="text-[#f09133]">non riesci a coprire.</span>
              </h1>
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8">
                Mezz’ora, senza presentazioni commerciali. Ci racconti come assumi oggi, ti diciamo dove
                si rompe e se possiamo esserti utili. Se la risposta è no, te lo diciamo.
              </p>

              <div className="space-y-3">
                <a
                  href={`mailto:${CONTATTI.email}`}
                  className="flex items-center gap-3 text-white/70 hover:text-[#f09133] transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>{CONTATTI.email}</span>
                </a>
                <p className="flex items-center gap-3 text-white/70">
                  <Clock className="h-5 w-5" />
                  <span>
                    {CONTATTI.orari} — risposta entro {CONTATTI.rispostaEntro}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-6 md:p-8 backdrop-blur-sm">
              <h2 className="text-white font-bold text-xl mb-1">Lascia i tuoi dati</h2>
              <p className="text-white/70 text-sm mb-6">Ti ricontattiamo entro 24 ore lavorative.</p>
              <LeadForm ctaLabel="Invia la richiesta" origine="contatti" />
            </div>
          </div>
        </div>
      </section>

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Prima di scriverci"
            title="Da dove vuoi partire?"
            sub="Tre modi di lavorare con noi, più l’area per chi cerca lavoro. Se non sai quale ti serve, scrivi lo stesso: lo capiamo insieme."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PERCORSI.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="landing-card rounded-xl border border-[#e5e0db] p-6 block"
              >
                <p.icon className="h-8 w-8 text-[#f09133] mb-3" />
                <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-3">{p.desc}</p>
                <span className="text-sm font-semibold text-[#1e3a5f]">{p.label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
