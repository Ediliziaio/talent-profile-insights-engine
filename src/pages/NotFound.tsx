import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, Home, Search, HardHat } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/site/SiteLayout";

const SCORCIATOIE = [
  {
    icon: Home,
    title: "Torna alla home",
    desc: "Cos'è Talenti Edili e i tre modi di usarlo.",
    to: "/",
  },
  {
    icon: Search,
    title: "Cerca nella Banca Talenti",
    desc: "Profili edili già analizzati, ordinati per compatibilità.",
    to: "/banca-talenti",
  },
  {
    icon: Compass,
    title: "Sfoglia i ruoli",
    desc: "Come si seleziona ogni figura di cantiere e ufficio tecnico.",
    to: "/ruoli",
  },
  {
    icon: HardHat,
    title: "Cerchi lavoro in edilizia?",
    desc: "Analisi psicoattitudinale gratuita in 15 minuti.",
    to: "/lavora-in-edilizia",
  },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: rotta inesistente:", location.pathname);
  }, [location.pathname]);

  return (
    <SiteLayout>
      <Seo
        title="Pagina non trovata — Talenti Edili"
        description="La pagina che cerchi non esiste o è stata spostata."
        path={location.pathname}
        noindex
      />

      <section className="px-4 md:px-8 pt-6 md:pt-10">
        <div
          className="landing-hero-box max-w-7xl mx-auto py-16 md:py-24 px-6 md:px-16 relative overflow-hidden border border-white/10"
          style={{ background: "radial-gradient(ellipse at 30% 50%, #2a4f7a 0%, #1e3a5f 70%)" }}
        >
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[10%] w-[300px] h-[300px] rounded-full bg-[#f09133]/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-orange-on-dark)] mb-4">
              Errore 404
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.12] mb-5">
              Questa pagina non c'è.
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              Può darsi che l'indirizzo sia sbagliato o che la pagina sia stata spostata. Qui sotto
              trovi le strade più battute.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SCORCIATOIE.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="landing-card rounded-xl border border-[#e5e0db] p-6 block"
              >
                <s.icon className="h-8 w-8 text-[#f09133] mb-3" />
                <h2 className="font-bold text-lg mb-2">{s.title}</h2>
                <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-[#6b7280] mt-10">
            Cercavi qualcosa di preciso?{" "}
            <Link to="/contatti" className="font-semibold text-[#1e3a5f] hover:text-[#f09133]">
              Scrivici e te lo troviamo →
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default NotFound;
