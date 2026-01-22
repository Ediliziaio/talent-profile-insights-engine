// TalentProfile App - Optimized with Code Splitting
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Lightweight pages loaded immediately
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Heavy pages loaded lazily
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Aziende = lazy(() => import('./pages/Aziende'));
const Candidati = lazy(() => import('./pages/Candidati'));
const CandidatoDettaglio = lazy(() => import('./pages/CandidatoDettaglio'));
const ConsensoPrivacy = lazy(() => import('./pages/ConsensoPrivacy'));
const Questionario = lazy(() => import('./pages/Questionario'));
const TestCompletato = lazy(() => import('./pages/TestCompletato'));
const FormAnagrafico = lazy(() => import('./pages/FormAnagrafico'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

// Fast loading spinner component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Caricamento...</span>
      </div>
    </div>
  );
}

// Redirect candidati to test flow
function CandidatoRedirect() {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (profile?.ruolo === 'candidato') {
    return <Navigate to="/test/privacy" replace />;
  }
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Dashboard />
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<CandidatoRedirect />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/aziende" element={<Aziende />} />
              <Route path="/candidati" element={<Candidati />} />
              <Route path="/candidati/:id" element={<CandidatoDettaglio />} />
              <Route path="/test/anagrafica" element={<FormAnagrafico />} />
              <Route path="/test/privacy" element={<ConsensoPrivacy />} />
              <Route path="/test/questionario" element={<Questionario />} />
              <Route path="/test/completato" element={<TestCompletato />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
