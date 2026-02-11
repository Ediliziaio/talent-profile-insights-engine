import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Brain, User, Building2, Briefcase, Mail, Phone, Loader2 } from 'lucide-react';
import { RUOLI_CANDIDATO, FUNZIONI } from '@/types/database';
import { formAnagraficoSchema } from '@/lib/validationSchemas';

interface CandidateSession {
  azienda: {
    id: string;
    nome: string;
  };
  sessionToken: string;
}

type FieldErrors = Partial<Record<string, string>>;

export default function FormAnagrafico() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [candidateSession, setCandidateSession] = useState<CandidateSession | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState({
    cognome: '',
    nome: '',
    eta: '',
    sesso: '' as '' | 'M' | 'F',
    ruolo_attuale: '',
    funzione: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    const sessionData = sessionStorage.getItem('candidate_session');
    if (!sessionData) {
      toast({
        title: 'Sessione scaduta',
        description: 'Effettua nuovamente l\'accesso',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      const parsed = JSON.parse(sessionData);
      setCandidateSession(parsed);
    } catch {
      navigate('/auth');
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    if (!candidateSession) {
      toast({ title: 'Errore', description: 'Sessione non valida', variant: 'destructive' });
      return;
    }

    // Validazione Zod
    const result = formAnagraficoSchema.safeParse(formData);
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-candidate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            azienda_id: candidateSession.azienda.id,
            ...formData,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Errore nella registrazione');
      }

      if (responseData.session) {
        await supabase.auth.setSession({
          access_token: responseData.session.access_token,
          refresh_token: responseData.session.refresh_token,
        });
      }

      sessionStorage.removeItem('candidate_session');

      toast({
        title: 'Registrazione completata',
        description: 'Puoi ora procedere con il test',
      });

      navigate('/test/privacy');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore nella registrazione';
      toast({ title: 'Errore', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!candidateSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const FieldError = ({ field }: { field: string }) => {
    if (!fieldErrors[field]) return null;
    return <p className="text-sm text-destructive mt-1">{fieldErrors[field]}</p>;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 safe-area-bottom">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto p-2.5 sm:p-3 bg-primary/10 rounded-full w-fit mb-3 sm:mb-4">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Dati Anagrafici</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Benvenuto/a! Prima di iniziare il test, compila i tuoi dati anagrafici.
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{candidateSession.azienda.nome}</span>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Nome e Cognome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="cognome" className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Cognome *
                </Label>
                <Input
                  id="cognome"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  placeholder="Rossi"
                  className="h-11 text-base"
                />
                <FieldError field="cognome" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="nome" className="text-sm">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Mario"
                  className="h-11 text-base"
                />
                <FieldError field="nome" />
              </div>
            </div>

            {/* Età e Sesso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="eta" className="text-sm">Età *</Label>
                <Input
                  id="eta"
                  type="number"
                  min="16"
                  max="99"
                  value={formData.eta}
                  onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                  placeholder="35"
                  className="h-11 text-base"
                />
                <FieldError field="eta" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Sesso *</Label>
                <RadioGroup
                  value={formData.sesso}
                  onValueChange={(value) => setFormData({ ...formData, sesso: value as 'M' | 'F' })}
                  className="flex gap-3 sm:gap-4 pt-1.5 sm:pt-2"
                >
                  <div className="flex items-center space-x-2 min-h-[44px]">
                    <RadioGroupItem value="M" id="sesso-m" className="h-5 w-5" />
                    <Label htmlFor="sesso-m" className="cursor-pointer text-sm sm:text-base">Maschile</Label>
                  </div>
                  <div className="flex items-center space-x-2 min-h-[44px]">
                    <RadioGroupItem value="F" id="sesso-f" className="h-5 w-5" />
                    <Label htmlFor="sesso-f" className="cursor-pointer text-sm sm:text-base">Femminile</Label>
                  </div>
                </RadioGroup>
                <FieldError field="sesso" />
              </div>
            </div>

            {/* Ruolo e Funzione */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Ruolo *
                </Label>
                <Select
                  value={formData.ruolo_attuale}
                  onValueChange={(value) => setFormData({ ...formData, ruolo_attuale: value })}
                >
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {RUOLI_CANDIDATO.map((ruolo) => (
                      <SelectItem key={ruolo} value={ruolo} className="py-3">{ruolo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="ruolo_attuale" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Funzione *</Label>
                <Select
                  value={formData.funzione}
                  onValueChange={(value) => setFormData({ ...formData, funzione: value })}
                >
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Seleziona funzione" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {FUNZIONI.map((funzione) => (
                      <SelectItem key={funzione} value={funzione} className="py-3">{funzione}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="funzione" />
              </div>
            </div>

            {/* Email e Telefono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="mario.rossi@email.com"
                  className="h-11 text-base"
                />
                <FieldError field="email" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Telefono *
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+39 333 1234567"
                  className="h-11 text-base"
                />
                <FieldError field="telefono" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrazione in corso...
                </>
              ) : (
                'Prosegui al Test'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
