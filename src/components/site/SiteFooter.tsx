import { Link } from 'react-router-dom';
import { Mail, Linkedin, Shield } from 'lucide-react';
import { FOOTER_COLUMNS, LEGAL_LINKS, CONTATTI } from '@/data/site';

export function SiteFooter() {
  return (
    <footer className="bg-[#1e3a5f] py-14 mt-8 relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f09133] to-transparent" />
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <img
              src="/talenti-edili-logo.svg"
              alt="Talenti Edili"
              className="h-11 brightness-0 invert mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
            />
            <p className="text-sm text-white/70 leading-relaxed">
              Intelligenza Artificiale e analisi psicoattitudinale al servizio delle imprese edili. Il
              sistema Talent Profile per decidere sulle persone con i dati.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f09133]/30 transition-colors"
              >
                <Linkedin className="h-4 w-4 text-white/70" />
              </a>
              <a
                href={`mailto:${CONTATTI.email}`}
                aria-label="Scrivici"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f09133]/30 transition-colors"
              >
                <Mail className="h-4 w-4 text-white/70" />
              </a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{col.title}</h2>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-white/70 hover:text-[#f09133] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-white/10">
          <a
            href={`mailto:${CONTATTI.email}`}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-[#f09133] transition-colors"
          >
            <Mail className="h-4 w-4" /> {CONTATTI.email}
          </a>
          <p className="flex items-center gap-2 text-sm text-white/70 md:justify-end">
            <Shield className="h-4 w-4" /> Dati crittografati su server europei — GDPR compliant
          </p>
        </div>

        <div className="pt-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-white/60">
            <span>Talenti Edili — P.IVA 12345678901</span>
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-[#f09133] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-center md:text-left text-xs text-white/60 mt-4">
            © {new Date().getFullYear()} Talenti Edili — sistema Talent Profile. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
