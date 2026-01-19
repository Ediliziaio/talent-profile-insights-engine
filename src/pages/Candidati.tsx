import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Copy, Check, ExternalLink, Eye } from 'lucide-react';
import { Candidato, Azienda, RUOLI_AZIENDALI, FUNZIONI } from '@/types/database';
import { Link } from 'react-router-dom';

// Credentials are now generated server-side by the edge function

export default function Candidati() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterAzienda, setFilterAzienda] = useState<string>('all');
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
    nome: string;
    cognome: string;
  } | null>(null);

  const isSuperadmin = profile?.ruolo === 'superadmin';

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    eta: '',
    telefono: '',
    ruolo_attuale: '',
    funzione: '',
    azienda_id: profile?.azienda_id || '',
  });

  const { data: aziende } = useQuery({
    queryKey: ['aziende'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .eq('attiva', true)
        .order('nome');
      if (error) throw error;
      return data as Azienda[];
    },
    enabled: isSuperadmin,
  });

  const { data: candidati, isLoading } = useQuery({
    queryKey: ['candidati', filterAzienda],
    queryFn: async () => {
      let query = supabase
        .from('candidati')
        .select('*, aziende(nome)')
        .order('created_at', { ascending: false });

      if (filterAzienda && filterAzienda !== 'all') {
        query = query.eq('azienda_id', filterAzienda);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Candidato & { aziende: { nome: string } })[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const aziendaId = isSuperadmin ? data.azienda_id : profile?.azienda_id;

      if (!aziendaId) throw new Error('Azienda non specificata');

      // Get current session token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Non autenticato');

      // Call edge function to create candidate
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-candidate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            nome: data.nome,
            cognome: data.cognome,
            email: data.email || null,
            eta: data.eta || null,
            telefono: data.telefono || null,
            ruolo_attuale: data.ruolo_attuale || null,
            funzione: data.funzione || null,
            azienda_id: aziendaId,
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Errore nella creazione del candidato');
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['candidati'] });
      setIsDialogOpen(false);
      resetForm();
      setGeneratedCredentials({
        username: result.username,
        password: result.password,
        nome: result.candidato.nome,
        cognome: result.candidato.cognome,
      });
      toast({
        title: 'Candidato creato',
        description: 'Candidato e credenziali creati con successo',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      cognome: '',
      email: '',
      eta: '',
      telefono: '',
      ruolo_attuale: '',
      funzione: '',
      azienda_id: profile?.azienda_id || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copiato!', description: 'Testo copiato negli appunti' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTestLink = (token: string) => {
    return `${window.location.origin}/auth`;
  };

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Gestione Candidati</h1>
              <p className="text-muted-foreground">Crea candidati e genera link per il test</p>
            </div>
            <div className="flex gap-2">
              {isSuperadmin && aziende && (
                <Select value={filterAzienda} onValueChange={setFilterAzienda}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtra per azienda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le aziende</SelectItem>
                    {aziende.map((az) => (
                      <SelectItem key={az.id} value={az.id}>{az.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Candidato
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Nuovo Candidato</DialogTitle>
                      <DialogDescription>
                        Inserisci i dati del candidato. Verranno generate automaticamente le credenziali di accesso.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                      {isSuperadmin && (
                        <div className="space-y-2">
                          <Label>Azienda *</Label>
                          <Select
                            value={formData.azienda_id}
                            onValueChange={(value) => setFormData({ ...formData, azienda_id: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona azienda" />
                            </SelectTrigger>
                            <SelectContent>
                              {aziende?.map((az) => (
                                <SelectItem key={az.id} value={az.id}>{az.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cognome">Cognome *</Label>
                          <Input
                            id="cognome"
                            value={formData.cognome}
                            onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (opzionale)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@esempio.it"
                        />
                        <p className="text-xs text-muted-foreground">
                          Se lasciata vuota, verrà generato un username
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eta">Età</Label>
                          <Input
                            id="eta"
                            type="number"
                            min="18"
                            max="99"
                            value={formData.eta}
                            onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Telefono</Label>
                          <Input
                            id="telefono"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Ruolo Attuale</Label>
                        <Select
                          value={formData.ruolo_attuale}
                          onValueChange={(value) => setFormData({ ...formData, ruolo_attuale: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona ruolo" />
                          </SelectTrigger>
                          <SelectContent>
                            {RUOLI_AZIENDALI.map((ruolo) => (
                              <SelectItem key={ruolo} value={ruolo}>{ruolo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Funzione</Label>
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
                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creazione...' : 'Crea Candidato'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : candidati && candidati.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      {isSuperadmin && <TableHead>Azienda</TableHead>}
                      <TableHead>Email</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Stato Test</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidati.map((candidato) => (
                      <TableRow key={candidato.id}>
                        <TableCell className="font-medium">
                          {candidato.cognome} {candidato.nome}
                        </TableCell>
                        {isSuperadmin && (
                          <TableCell>{candidato.aziende?.nome || '-'}</TableCell>
                        )}
                        <TableCell>{candidato.email || '-'}</TableCell>
                        <TableCell>{candidato.ruolo_attuale || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={candidato.test_completato ? 'default' : 'secondary'}>
                            {candidato.test_completato ? 'Completato' : 'Da fare'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!candidato.test_completato && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  `Email: ${candidato.email}\nAccedi su: ${getTestLink(candidato.test_link_token || '')}`,
                                  candidato.id
                                )}
                              >
                                {copiedId === candidato.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                <span className="ml-2 hidden sm:inline">Copia Link</span>
                              </Button>
                            )}
                            {candidato.test_completato && (
                              <Link to={`/risultati/${candidato.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                  <span className="ml-2 hidden sm:inline">Risultati</span>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun candidato presente</p>
                  <p className="text-sm">Crea il primo candidato per iniziare</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credentials Dialog */}
        <Dialog open={!!generatedCredentials} onOpenChange={() => setGeneratedCredentials(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Credenziali Candidato Create</DialogTitle>
              <DialogDescription>
                Copia e invia queste credenziali al candidato "{generatedCredentials?.nome} {generatedCredentials?.cognome}".
                La password non potrà essere visualizzata nuovamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials?.username || ''} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedCredentials?.username || '', 'cred-username')}
                  >
                    {copiedId === 'cred-username' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials?.password || ''} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedCredentials?.password || '', 'cred-password')}
                  >
                    {copiedId === 'cred-password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link di Accesso</Label>
                <div className="flex gap-2">
                  <Input value={`${window.location.origin}/auth`} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`${window.location.origin}/auth`, 'cred-link')}
                  >
                    {copiedId === 'cred-link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => {
                  const text = `Credenziali per il test Talent Profile:\n\nUsername: ${generatedCredentials?.username}\nPassword: ${generatedCredentials?.password}\nLink: ${window.location.origin}/auth`;
                  copyToClipboard(text, 'cred-all');
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copia Tutto
              </Button>
              <Button onClick={() => setGeneratedCredentials(null)}>Chiudi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </ProtectedRoute>
  );
}
