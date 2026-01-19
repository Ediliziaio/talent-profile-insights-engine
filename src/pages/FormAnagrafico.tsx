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

interface CandidateSession {
  azienda: {
    id: string;
    nome: string;
  };
  sessionToken: string;
}

export default function FormAnagrafico() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [candidateSession, setCandidateSession] = useState<CandidateSession | null>(null);

  const [formData, setFormData] = useState({
    cognome: '',
    nome: '',
    eta: '',
    sesso: '',
    ruolo_attuale: '',
    funzione: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    // Check for candidate session in sessionStorage
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
    
    if (!candidateSession) {
      toast({
        title: 'Errore',
        description: 'Sessione non valida',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!formData.cognome || !formData.nome || !formData.eta || !formData.sesso || 
        !formData.ruolo_attuale || !formData.funzione || !formData.email || !formData.telefono) {
      toast({
        title: 'Errore',
        description: 'Compila tutti i campi obbligatori',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Call the register-candidate edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-candidate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            azienda_id: candidateSession.azienda.id,
            ...formData,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore nella registrazione');
      }

      // If we got a session, set it
      if (result.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }

      // Clear candidate session
      sessionStorage.removeItem('candidate_session');

      toast({
        title: 'Registrazione completata',
        description: 'Puoi ora procedere con il test',
      });

      // Navigate to privacy/consent page
      navigate('/test/privacy');

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore nella registrazione';
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive',
      });
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dati Anagrafici</CardTitle>
          <CardDescription>
            Benvenuto/a! Prima di iniziare il test, compila i tuoi dati anagrafici.
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{candidateSession.azienda.nome}</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome e Cognome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cognome" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cognome *
                </Label>
                <Input
                  id="cognome"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  required
                  placeholder="Rossi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Mario"
                />
              </div>
            </div>

            {/* Età e Sesso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eta">Età *</Label>
                <Input
                  id="eta"
                  type="number"
                  min="18"
                  max="99"
                  value={formData.eta}
                  onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                  required
                  placeholder="35"
                />
              </div>
              <div className="space-y-2">
                <Label>Sesso *</Label>
                <RadioGroup
                  value={formData.sesso}
                  onValueChange={(value) => setFormData({ ...formData, sesso: value })}
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="sesso-m" />
                    <Label htmlFor="sesso-m" className="cursor-pointer">Maschile</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" id="sesso-f" />
                    <Label htmlFor="sesso-f" className="cursor-pointer">Femminile</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Ruolo e Funzione */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Ruolo *
                </Label>
                <Select
                  value={formData.ruolo_attuale}
                  onValueChange={(value) => setFormData({ ...formData, ruolo_attuale: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {RUOLI_CANDIDATO.map((ruolo) => (
                      <SelectItem key={ruolo} value={ruolo}>{ruolo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Funzione *</Label>
                <Select
                  value={formData.funzione}
                  onValueChange={(value) => setFormData({ ...formData, funzione: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona funzione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNZIONI.map((funzione) => (
                      <SelectItem key={funzione} value={funzione}>{funzione}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email e Telefono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="mario.rossi@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefono *
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  placeholder="+39 333 1234567"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
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