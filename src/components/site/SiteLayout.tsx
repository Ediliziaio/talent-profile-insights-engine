import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { SiteNavbar } from './SiteNavbar';
import { SiteFooter } from './SiteFooter';

/** Riporta in cima a ogni cambio rotta (senza toccare le navigazioni con ancora). */
function useScrollTopOnRouteChange() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
}

export function SiteLayout({ children }: { children: ReactNode }) {
  useScrollTopOnRouteChange();

  return (
    // reducedMotion="user" rispetta prefers-reduced-motion: le animazioni di
    // ingresso diventano dissolvenze invece di traslazioni.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f7f4f0] text-[#1a1a2e] overflow-x-hidden flex flex-col">
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-[#1e3a5f] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Vai al contenuto
        </a>
        <SiteNavbar />
        <main id="contenuto" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}

export default SiteLayout;
