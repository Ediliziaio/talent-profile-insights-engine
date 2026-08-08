import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Loader2 } from 'lucide-react';
import { 
  loginEmailSchema, 
  loginCandidateSchema, 
} from '@/lib/validationSchemas';
import { Seo } from '@/components/Seo';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Candidate login state
  const [candidateUsername, setCandidateUsername] = useState('');
  const [candidatePassword, setCandidatePassword] = useState('');
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateErrors, setCandidateErrors] = useState<Record<string, string>>({});
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    // Validate with Zod
    const validation = loginEmailSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);
    
    // If input doesn't contain @, treat as username and construct internal email
    let loginEmail = validation.data.email;
    if (!loginEmail.includes('@')) {
      loginEmail = `${loginEmail}@candidati.talentprofile.local`;
    }
    
    const { error } = await signIn(loginEmail, validation.data.password);
    setLoading(false);
    
    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
  };


  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCandidateErrors({});
    
    // Validate with Zod
    const validation = loginCandidateSchema.safeParse({ 
      username: candidateUsername, 
      password: candidatePassword 
    });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setCandidateErrors(errors);
      return;
    }
    
    setCandidateLoading(true);

    // Auto-registrati dalla piattaforma: accesso standard con email
    if (validation.data.username.includes('@')) {
      const { error } = await signIn(validation.data.username, validation.data.password);
      setCandidateLoading(false);
      if (error) {
        toast({ title: 'Errore', description: 'Email o password non validi', variant: 'destructive' });
      } else {
        navigate('/area-candidato');
      }
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/candidate-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: validation.data.username,
            password: validation.data.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Credenziali non valide');
      }

      // Store session info for the anagraphic form
      sessionStorage.setItem('candidate_session', JSON.stringify({
        sessionToken: result.sessionToken,
        azienda: result.azienda,
        expiresAt: result.expiresAt,
      }));

      toast({
        title: 'Accesso effettuato',
        description: 'Compila i tuoi dati per procedere',
      });

      navigate('/test/anagrafica');

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Credenziali non valide';
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setCandidateLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 safe-area-bottom">
      <Seo
        title="Accedi — Talenti Edili"
        description="Area riservata di Talenti Edili."
        path="/auth"
        noindex
      />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src="/talenti-edili-logo.svg" 
              alt="Talenti Edili" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Talenti Edili</CardTitle>
          <CardDescription className="text-sm">Sistema Talent Profile — AI e analisi psicoattitudinale</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="candidate" className="space-y-4" onValueChange={() => { setFieldErrors({}); setCandidateErrors({}); }}>
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="candidate" className="flex items-center justify-center gap-1.5 h-full text-xs sm:text-sm">
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">Candidato</span>
              </TabsTrigger>
              <TabsTrigger value="azienda" className="flex items-center justify-center gap-1.5 h-full text-xs sm:text-sm">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">Azienda</span>
              </TabsTrigger>
            </TabsList>

            {/* Candidate Login Tab */}
            <TabsContent value="candidate">
              <form onSubmit={handleCandidateLogin} className="space-y-4 mt-4">
                <div className="text-center text-xs sm:text-sm text-muted-foreground mb-4">
                  Con l'email se ti sei registrato dal sito, con lo username se te l'ha dato la tua azienda
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-username" className="text-sm">Email o username</Label>
                  <Input 
                    id="candidate-username" 
                    type="text" 
                    value={candidateUsername} 
                    onChange={e => setCandidateUsername(e.target.value)} 
                    placeholder="mario@rossi.it oppure teknofinestre-a1b2"
                    className={`h-11 text-base ${candidateErrors.username ? 'border-destructive' : ''}`}
                  />
                  {candidateErrors.username && (
                    <p className="text-xs text-destructive">{candidateErrors.username}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-password" className="text-sm">Password</Label>
                  <Input 
                    id="candidate-password" 
                    type="password"
                    autoComplete="current-password"
                    value={candidatePassword} 
                    onChange={e => setCandidatePassword(e.target.value)} 
                    className={`h-11 text-base ${candidateErrors.password ? 'border-destructive' : ''}`}
                  />
                  {candidateErrors.password && (
                    <p className="text-xs text-destructive">{candidateErrors.password}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Non hai un account?{' '}
                  <a href="/registrazione-candidato" className="font-semibold text-primary underline">
                    Registrati gratis
                  </a>
                </p>
                <Button type="submit" className="w-full h-12 text-base bg-accent hover:bg-accent/90" disabled={candidateLoading}>
                  {candidateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accesso...
                    </>
                  ) : (
                    'Accedi al Test'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Company/Admin Login Tab */}
            <TabsContent value="azienda">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="text-center text-xs sm:text-sm text-muted-foreground mb-4">
                  Accesso per aziende e amministratori
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="email@azienda.it"
                    className={`h-11 text-base ${fieldErrors.email ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    autoComplete="current-password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className={`h-11 text-base ${fieldErrors.password ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accesso...
                    </>
                  ) : (
                    'Accedi'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
