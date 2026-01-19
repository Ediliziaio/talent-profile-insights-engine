import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Aziende from "./pages/Aziende";
import Candidati from "./pages/Candidati";
import Risultati from "./pages/Risultati";
import RisultatoDettaglio from "./pages/RisultatoDettaglio";
import ConsensoPrivacy from "./pages/ConsensoPrivacy";
import Questionario from "./pages/Questionario";
import TestCompletato from "./pages/TestCompletato";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect candidati to test flow
function CandidatoRedirect() {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (profile?.ruolo === 'candidato') {
    return <Navigate to="/test/privacy" replace />;
  }
  
  return <Dashboard />;
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
            <Route path="/aziende" element={<Aziende />} />
            <Route path="/candidati" element={<Candidati />} />
            <Route path="/risultati" element={<Risultati />} />
            <Route path="/risultati/:id" element={<RisultatoDettaglio />} />
            <Route path="/test/privacy" element={<ConsensoPrivacy />} />
            <Route path="/test/questionario" element={<Questionario />} />
            <Route path="/test/completato" element={<TestCompletato />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
