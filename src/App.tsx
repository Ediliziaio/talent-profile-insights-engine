// Talenti Edili — app con code splitting e skeleton loading
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SiteLayout } from "@/components/site/SiteLayout";
import { QUERY_CONFIG } from "@/lib/constants";
import {
  DashboardSkeleton,
  CandidatiSkeleton,
  CandidatoDettaglioSkeleton,
  QuestionarioSkeleton,
  AziendeSkeleton,
  FormSkeleton,
} from "@/components/skeletons";

// Lightweight pages loaded immediately
import NotFound from "./pages/NotFound";

// Area riservata — caricata on demand
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Aziende = lazy(() => import('./pages/Aziende'));
const Candidati = lazy(() => import('./pages/Candidati'));
const CandidatoDettaglio = lazy(() => import('./pages/CandidatoDettaglio'));
const ConfrontoCandidati = lazy(() => import('./pages/ConfrontoCandidati'));
const StoricoCandidato = lazy(() => import('./pages/StoricoCandidato'));
const ConsensoPrivacy = lazy(() => import('./pages/ConsensoPrivacy'));
const Questionario = lazy(() => import('./pages/Questionario'));
const TestCompletato = lazy(() => import('./pages/TestCompletato'));
const FormAnagrafico = lazy(() => import('./pages/FormAnagrafico'));
const Pagamenti = lazy(() => import('./pages/Pagamenti'));

// Sito pubblico
const Home = lazy(() => import('./pages/Home'));
const Garanzia = lazy(() => import('./pages/Garanzia'));
const Marketplace = lazy(() => import('./pages/site/Marketplace'));
const RicercaSelezione = lazy(() => import('./pages/site/RicercaSelezione'));
const TalentProfileSystem = lazy(() => import('./pages/site/TalentProfileSystem'));
const Ruoli = lazy(() => import('./pages/site/Ruoli'));
const RuoloDettaglio = lazy(() => import('./pages/site/RuoloDettaglio'));
const LavoraInEdilizia = lazy(() => import('./pages/site/LavoraInEdilizia'));
const Prezzi = lazy(() => import('./pages/site/Prezzi'));
const ChiSiamo = lazy(() => import('./pages/site/ChiSiamo'));
const Contatti = lazy(() => import('./pages/site/Contatti'));
const Faq = lazy(() => import('./pages/site/Faq'));
const Guide = lazy(() => import('./pages/site/Guide'));
const GuidaDettaglio = lazy(() => import('./pages/site/GuidaDettaglio'));
const Legal = lazy(() => import('./pages/site/Legal'));
const RegistrazioneCandidato = lazy(() => import('./pages/site/RegistrazioneCandidato'));
const Troviamo = lazy(() => import('./pages/site/Troviamo'));
const TroviamoDettaglio = lazy(() => import('./pages/site/TroviamoDettaglio'));
const AreaCandidato = lazy(() => import('./pages/AreaCandidato'));
const MarketplaceInterno = lazy(() => import('./pages/MarketplaceInterno'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.STALE_TIME,
      gcTime: QUERY_CONFIG.GC_TIME,
      refetchOnWindowFocus: false,
      retry: QUERY_CONFIG.RETRY_COUNT,
      retryDelay: attemptIndex => Math.min(
        QUERY_CONFIG.RETRY_DELAY_BASE * 2 ** attemptIndex,
        QUERY_CONFIG.RETRY_DELAY_MAX
      ),
    },
  },
});

/** Placeholder mentre si carica il chunk di una pagina pubblica. */
function SiteSkeleton() {
  return <div className="min-h-[70vh] bg-[#f7f4f0]" aria-busy="true" />;
}

/** Navbar + footer condivisi da tutte le pagine del sito pubblico. */
function PublicSite() {
  return (
    <SiteLayout>
      <Suspense fallback={<SiteSkeleton />}>
        <Outlet />
      </Suspense>
    </SiteLayout>
  );
}

/**
 * Rotta radice — la home pubblica vive su "/" senza slug, tutte le altre pagine
 * hanno il proprio slug. Chi è già autenticato viene mandato all'area riservata.
 */
function RootRoute() {
  const { user, profile, loading } = useAuth();

  // Durante il controllo della sessione mostriamo comunque la home: è la pagina
  // che il prerender ha già scritto nell'HTML, così non si vede sfarfallare
  // uno skeleton al primo caricamento. Chi è loggato viene poi reindirizzato.
  if (!loading && user) {
    return <Navigate to={profile?.ruolo === 'candidato' ? '/area-candidato' : '/dashboard'} replace />;
  }

  return <Home />;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ─── Sito pubblico ─── */}
              <Route element={<PublicSite />}>
                <Route path="/" element={<RootRoute />} />
                <Route path="/piattaforma" element={<Marketplace />} />
                <Route path="/ricerca-e-selezione-personale-edile" element={<RicercaSelezione />} />
                <Route path="/troviamo" element={<Troviamo />} />
                <Route path="/troviamo/:slug" element={<TroviamoDettaglio />} />
                <Route path="/talent-profile-system" element={<TalentProfileSystem />} />
                <Route path="/ruoli" element={<Ruoli />} />
                <Route path="/ruoli/:slug" element={<RuoloDettaglio />} />
                <Route path="/lavora-in-edilizia" element={<LavoraInEdilizia />} />
                <Route path="/registrazione-candidato" element={<RegistrazioneCandidato />} />
                <Route path="/prezzi" element={<Prezzi />} />
                <Route path="/chi-siamo" element={<ChiSiamo />} />
                <Route path="/contatti" element={<Contatti />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/guide/:slug" element={<GuidaDettaglio />} />
                <Route path="/garanzia" element={<Garanzia />} />
                <Route path="/privacy-policy" element={<Legal />} />
                <Route path="/cookie-policy" element={<Legal />} />
                <Route path="/termini-e-condizioni" element={<Legal />} />
              </Route>

              {/* Slug legacy */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/marketplace-talenti-edili" element={<Navigate to="/piattaforma" replace />} />
              <Route path="/banca-talenti" element={<Navigate to="/piattaforma" replace />} />

              {/* ─── Area riservata ─── */}
              <Route path="/auth" element={
                <Suspense fallback={<FormSkeleton />}>
                  <Auth />
                </Suspense>
              } />
              <Route path="/area-candidato" element={
                <Suspense fallback={<FormSkeleton />}>
                  <AreaCandidato />
                </Suspense>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <MarketplaceInterno />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <Dashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/aziende" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Suspense fallback={<AziendeSkeleton />}>
                    <Aziende />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/candidati" element={
                <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
                  <Suspense fallback={<CandidatiSkeleton />}>
                    <Candidati />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/candidati/:id" element={
                <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
                  <Suspense fallback={<CandidatoDettaglioSkeleton />}>
                    <CandidatoDettaglio />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/candidati/:id/storico" element={
                <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
                  <Suspense fallback={<CandidatoDettaglioSkeleton />}>
                    <StoricoCandidato />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/pagamenti" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <Pagamenti />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/confronto" element={
                <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
                  <Suspense fallback={<CandidatiSkeleton />}>
                    <ConfrontoCandidati />
                  </Suspense>
                </ProtectedRoute>
              } />

              {/* ─── Flusso test candidato ─── */}
              <Route path="/test/anagrafica" element={
                <Suspense fallback={<FormSkeleton />}>
                  <FormAnagrafico />
                </Suspense>
              } />
              <Route path="/test/privacy" element={
                <Suspense fallback={<FormSkeleton />}>
                  <ConsensoPrivacy />
                </Suspense>
              } />
              <Route path="/test/questionario" element={
                <Suspense fallback={<QuestionarioSkeleton />}>
                  <Questionario />
                </Suspense>
              } />
              <Route path="/test/completato" element={
                <ProtectedRoute allowedRoles={['candidato']}>
                  <Suspense fallback={<FormSkeleton />}>
                    <TestCompletato />
                  </Suspense>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
