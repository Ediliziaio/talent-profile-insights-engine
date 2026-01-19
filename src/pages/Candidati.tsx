import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NotionLayout } from '@/components/NotionLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CandidatoDrawer } from '@/components/CandidatoDrawer';
import { FitIndicator } from '@/components/FitIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Copy, Check, Eye, Key, RefreshCw, Download, ArrowUpDown, TestTube2, Trash2, Calendar, User } from 'lucide-react';
import { Candidato, Azienda, AccessoAzienda, ProfiloCandidato, RUOLI_AZIENDALI, FUNZIONI } from '@/types/database';
import { getProfiloTipoLabel } from '@/lib/scoring';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type SortField = 'cognome' | 'eta' | 'ruolo_attuale' | 'funzione' | 'created_at' | 'data_test';
type SortOrder = 'asc' | 'desc';

type CandidatoWithRelations = Candidato & { 
  aziende: { nome: string } | null;
  profili_candidato: ProfiloCandidato | null;
};

export default function Candidati() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterAzienda, setFilterAzienda] = useState<string>('all');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [filterRuolo, setFilterRuolo] = useState<string>('all');
  const [filterFunzione, setFilterFunzione] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
    nome: string;
    cognome: string;
  } | null>(null);

  // State per drawer dettaglio candidato
  const [selectedCandidato, setSelectedCandidato] = useState<CandidatoWithRelations | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const currentAziendaId = isSuperadmin ? filterAzienda : profile?.azienda_id;

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

  // Query credenziali azienda
  const { data: accessoAzienda, isLoading: isLoadingAccesso } = useQuery({
    queryKey: ['accesso-azienda', currentAziendaId],
    queryFn: async () => {
      if (!currentAziendaId || currentAziendaId === 'all') return null;
      const { data, error } = await supabase
        .from('accessi_azienda')
        .select('*')
        .eq('azienda_id', currentAziendaId)
        .eq('attivo', true)
        .maybeSingle();
      if (error) throw error;
      return data as AccessoAzienda | null;
    },
    enabled: !!currentAziendaId && currentAziendaId !== 'all',
  });

  const { data: candidati, isLoading } = useQuery({
    queryKey: ['candidati', filterAzienda, filterStato, filterRuolo, filterFunzione],
    queryFn: async () => {
      let query = supabase
        .from('candidati')
        .select('*, aziende(nome), profili_candidato(*)')
        .order('created_at', { ascending: false });

      if (filterAzienda && filterAzienda !== 'all') {
        query = query.eq('azienda_id', filterAzienda);
      }
      if (filterStato === 'completato') {
        query = query.eq('test_completato', true);
      } else if (filterStato === 'da_fare') {
        query = query.eq('test_completato', false);
      }
      if (filterRuolo && filterRuolo !== 'all') {
        query = query.eq('ruolo_attuale', filterRuolo);
      }
      if (filterFunzione && filterFunzione !== 'all') {
        query = query.eq('funzione', filterFunzione);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Candidato & { 
        aziende: { nome: string } | null;
        profili_candidato: ProfiloCandidato | null;
      })[];
    },
  });

  // Mutation per generare/rigenerare credenziali azienda
  const credentialsMutation = useMutation({
    mutationFn: async ({ aziendaId, regenerate }: { aziendaId: string; regenerate: boolean }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Non autenticato');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-company-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ 
            azienda_id: aziendaId,
            action: regenerate ? 'regenerate' : 'generate'
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore nella generazione credenziali');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accesso-azienda'] });
      toast({
        title: 'Credenziali generate',
        description: 'Le nuove credenziali sono state create con successo',
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

  // Mutation per seed candidati demo
  const seedMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Non autenticato');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-demo-candidates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore nella generazione candidati demo');
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['candidati'] });
      toast({
        title: 'Candidati demo creati',
        description: result.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation per eliminare candidati
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await supabase.from('profili_candidato').delete().eq('candidato_id', id);
        await supabase.from('risultati').delete().eq('candidato_id', id);
        await supabase.from('risposte').delete().eq('candidato_id', id);
        const { error } = await supabase.from('candidati').delete().eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidati'] });
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setIsDeleteDialogOpen(false);
      toast({ title: 'Candidati eliminati', description: `${count} candidati rimossi` });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const aziendaId = isSuperadmin ? data.azienda_id : profile?.azienda_id;

      if (!aziendaId) throw new Error('Azienda non specificata');

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Non autenticato');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedCandidati?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedCandidati?.map(c => c.id) || []));
    }
  };

  const sortedCandidati = candidati ? [...candidati].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  const exportCSV = () => {
    if (!sortedCandidati || sortedCandidati.length === 0) return;

    const headers = ['Cognome', 'Nome', 'Sesso', 'Età', 'Ruolo', 'Funzione', 'Email', 'Telefono', 'Stato Test', 'Data Creazione', 'Azienda', 'Profilo', 'Leadership%', 'Maturità%', 'Potenziale%'];
    const rows = sortedCandidati.map(c => [
      c.cognome,
      c.nome,
      c.sesso || '',
      c.eta?.toString() || '',
      c.ruolo_attuale || '',
      c.funzione || '',
      c.email || '',
      c.telefono || '',
      c.test_completato ? 'Completato' : 'Da fare',
      new Date(c.created_at).toLocaleDateString('it-IT'),
      c.aziende?.nome || '',
      c.profili_candidato?.profilo_tipo || '',
      c.profili_candidato?.leadership_pct?.toFixed(0) || '',
      c.profili_candidato?.maturita_pct?.toFixed(0) || '',
      c.profili_candidato?.potenziale_pct?.toFixed(0) || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidati_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({ title: 'Esportazione completata', description: `${sortedCandidati.length} candidati esportati` });
  };

  const getBadgeVariant = (tipo: string | null) => {
    switch (tipo) {
      case 'LEADER': return 'default';
      case 'STRATEGIST': return 'secondary';
      case 'EXECUTOR': return 'outline';
      case 'IN_TRANSIZIONE': return 'destructive';
      default: return 'secondary';
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <NotionLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Gestione Candidati</h1>
              <p className="text-muted-foreground">Gestisci candidati, visualizza profili e risultati dei test</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.size > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina ({selectedIds.size})
                </Button>
              )}
              
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

          {/* Card Credenziali Azienda */}
          {currentAziendaId && currentAziendaId !== 'all' && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-accent" />
                    <CardTitle className="text-lg">Credenziali Accesso Candidati</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => credentialsMutation.mutate({ aziendaId: currentAziendaId, regenerate: !!accessoAzienda })}
                    disabled={credentialsMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${credentialsMutation.isPending ? 'animate-spin' : ''}`} />
                    {accessoAzienda ? 'Rigenera' : 'Genera'}
                  </Button>
                </div>
                <CardDescription>
                  Queste credenziali condivise permettono ai candidati di accedere al form anagrafico e al test
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAccesso ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    Caricamento...
                  </div>
                ) : accessoAzienda ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Username</Label>
                      <div className="flex gap-2">
                        <Input value={accessoAzienda.username} readOnly className="font-mono" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(accessoAzienda.username, 'az-username')}
                        >
                          {copiedId === 'az-username' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Password</Label>
                      <div className="flex gap-2">
                        <Input value={accessoAzienda.password_plain} readOnly className="font-mono" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(accessoAzienda.password_plain, 'az-password')}
                        >
                          {copiedId === 'az-password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          const text = `Credenziali accesso test Talent Profile:\n\nUsername: ${accessoAzienda.username}\nPassword: ${accessoAzienda.password_plain}\nLink: ${window.location.origin}/auth`;
                          copyToClipboard(text, 'az-all');
                        }}
                      >
                        {copiedId === 'az-all' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copia tutte le credenziali
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nessuna credenziale generata. Clicca "Genera" per creare le credenziali di accesso per i candidati.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Filtri Avanzati */}
          <div className="flex flex-wrap gap-3">
            <Select value={filterStato} onValueChange={setFilterStato}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stato test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="completato">Completato</SelectItem>
                <SelectItem value="da_fare">Da fare</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRuolo} onValueChange={setFilterRuolo}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i ruoli</SelectItem>
                {RUOLI_AZIENDALI.map((ruolo) => (
                  <SelectItem key={ruolo} value={ruolo}>{ruolo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterFunzione} onValueChange={setFilterFunzione}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Funzione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le funzioni</SelectItem>
                {FUNZIONI.map((funzione) => (
                  <SelectItem key={funzione} value={funzione}>{funzione}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV} disabled={!sortedCandidati || sortedCandidati.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
            {isSuperadmin && (
              <Button 
                variant="outline" 
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="border-accent/50 hover:bg-accent/10"
              >
                <TestTube2 className={`h-4 w-4 mr-2 ${seedMutation.isPending ? 'animate-pulse' : ''}`} />
                {seedMutation.isPending ? 'Generazione...' : 'Rigenera Demo'}
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : sortedCandidati && sortedCandidati.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={sortedCandidati.length > 0 && selectedIds.size === sortedCandidati.length}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <SortableHeader field="cognome">Candidato</SortableHeader>
                        {isSuperadmin && <TableHead>Azienda</TableHead>}
                        <TableHead>Sesso</TableHead>
                        <SortableHeader field="eta">Età</SortableHeader>
                        <SortableHeader field="ruolo_attuale">Ruolo</SortableHeader>
                        <SortableHeader field="funzione">Funzione</SortableHeader>
                        <TableHead>Stato</TableHead>
                        <TableHead>Profilo</TableHead>
                        <TableHead>Leadership</TableHead>
                        <TableHead>Maturità</TableHead>
                        <TableHead>Potenziale</TableHead>
                        <SortableHeader field="created_at">Data</SortableHeader>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCandidati.map((candidato) => (
                        <TableRow 
                          key={candidato.id}
                          className={selectedIds.has(candidato.id) ? 'bg-muted/50' : ''}
                        >
                          <TableCell>
                            <Checkbox 
                              checked={selectedIds.has(candidato.id)}
                              onCheckedChange={() => toggleSelect(candidato.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {candidato.cognome} {candidato.nome}
                            </div>
                          </TableCell>
                          {isSuperadmin && (
                            <TableCell>{candidato.aziende?.nome || '-'}</TableCell>
                          )}
                          <TableCell>{candidato.sesso || '-'}</TableCell>
                          <TableCell>{candidato.eta || '-'}</TableCell>
                          <TableCell>{candidato.ruolo_attuale || '-'}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{candidato.funzione || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={candidato.test_completato ? 'default' : 'secondary'}>
                              {candidato.test_completato ? 'Completato' : 'Da fare'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {candidato.test_completato && candidato.profili_candidato?.profilo_tipo ? (
                              <Badge variant={getBadgeVariant(candidato.profili_candidato.profilo_tipo)}>
                                {getProfiloTipoLabel(candidato.profili_candidato.profilo_tipo as any)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidato.profili_candidato?.leadership_pct != null ? (
                              <span className="font-medium">{candidato.profili_candidato.leadership_pct.toFixed(0)}%</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidato.profili_candidato?.maturita_pct != null ? (
                              <span className="font-medium">{candidato.profili_candidato.maturita_pct.toFixed(0)}%</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidato.profili_candidato?.potenziale_pct != null ? (
                              <span className="font-medium">{candidato.profili_candidato.potenziale_pct.toFixed(0)}%</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {candidato.data_test 
                              ? format(new Date(candidato.data_test), 'dd MMM yyyy', { locale: it })
                              : format(new Date(candidato.created_at), 'dd MMM yyyy', { locale: it })
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!candidato.test_completato && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(
                                    `Accedi al test: ${window.location.origin}/auth`,
                                    candidato.id
                                  )}
                                >
                                  {copiedId === candidato.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {candidato.test_completato && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCandidato(candidato);
                                    setIsDrawerOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Dettaglio
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare {selectedIds.size} candidati e tutti i loro dati 
                (risposte, risultati, profili). Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(Array.from(selectedIds))}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? 'Eliminazione...' : 'Elimina definitivamente'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

        {/* Drawer Dettaglio Candidato */}
        <CandidatoDrawer
          candidato={selectedCandidato}
          open={isDrawerOpen}
          onOpenChange={(open) => {
            setIsDrawerOpen(open);
            if (!open) setSelectedCandidato(null);
          }}
        />
      </NotionLayout>
    </ProtectedRoute>
  );
}