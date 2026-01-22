// TalentProfile App - Optimized with Code Splitting and Skeleton Loading
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import {
  DashboardSkeleton,
  CandidatiSkeleton,
  CandidatoDettaglioSkeleton,
  QuestionarioSkeleton,
  AziendeSkeleton,
  FormSkeleton,
} from "@/components/skeletons";

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

// Redirect candidati to test flow
function CandidatoRedirect() {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return <DashboardSkeleton />;
  }
  
  if (profile?.ruolo === 'candidato') {
    return <Navigate to="/test/privacy" replace />;
  }
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
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
          <Routes>
            <Route path="/" element={<CandidatoRedirect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/aziende" element={
              <Suspense fallback={<AziendeSkeleton />}>
                <Aziende />
              </Suspense>
            } />
            <Route path="/candidati" element={
              <Suspense fallback={<CandidatiSkeleton />}>
                <Candidati />
              </Suspense>
            } />
            <Route path="/candidati/:id" element={
              <Suspense fallback={<CandidatoDettaglioSkeleton />}>
                <CandidatoDettaglio />
              </Suspense>
            } />
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
              <Suspense fallback={<FormSkeleton />}>
                <TestCompletato />
              </Suspense>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
