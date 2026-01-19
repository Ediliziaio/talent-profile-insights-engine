import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Building2, Copy, Check, Download, Search, Users, ArrowUpDown } from 'lucide-react';
import { Azienda } from '@/types/database';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type SortField = 'nome' | 'settore' | 'created_at' | 'candidati_count';
type SortOrder = 'asc' | 'desc';

type AziendaWithCount = Azienda & {
  candidati_count: number;
};

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function Aziende() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAzienda, setEditingAzienda] = useState<Azienda | null>(null);
  const [deleteAzienda, setDeleteAzienda] = useState<Azienda | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
    aziendaNome: string;
  } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [filterSettore, setFilterSettore] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [formData, setFormData] = useState({
    nome: '',
    settore: '',
    email_contatto: '',
    telefono: '',
    indirizzo: '',
    attiva: true,
  });

  // Fetch aziende with candidate count
  const { data: aziende, isLoading } = useQuery({
    queryKey: ['aziende-with-counts'],
    queryFn: async () => {
      const { data: aziendeData, error: aziendeError } = await supabase
        .from('aziende')
        .select('*')
        .order('created_at', { ascending: false });
      if (aziendeError) throw aziendeError;

      // Fetch candidate counts per company
      const { data: countData, error: countError } = await supabase
        .from('candidati')
        .select('azienda_id');
      
      if (countError) throw countError;

      // Calculate counts
      const countMap = new Map<string, number>();
      countData?.forEach(c => {
        countMap.set(c.azienda_id, (countMap.get(c.azienda_id) || 0) + 1);
      });

      return (aziendeData as Azienda[]).map(a => ({
        ...a,
        candidati_count: countMap.get(a.id) || 0,
      })) as AziendaWithCount[];
    },
  });

  // Get unique sectors for filter
  const settori = useMemo(() => {
    if (!aziende) return [];
    const uniqueSettori = [...new Set(aziende.map(a => a.settore).filter(Boolean))];
    return uniqueSettori.sort();
  }, [aziende]);

  // Filter and sort aziende
  const filteredAziende = useMemo(() => {
    if (!aziende) return [];
    
    let filtered = [...aziende];
    
    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.nome.toLowerCase().includes(search) ||
        a.email_contatto?.toLowerCase().includes(search) ||
        a.settore?.toLowerCase().includes(search)
      );
    }
    
    // Status filter
    if (filterStato === 'attiva') {
      filtered = filtered.filter(a => a.attiva);
    } else if (filterStato === 'disattiva') {
      filtered = filtered.filter(a => !a.attiva);
    }
    
    // Sector filter
    if (filterSettore && filterSettore !== 'all') {
      filtered = filtered.filter(a => a.settore === filterSettore);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [aziende, searchTerm, filterStato, filterSettore, sortField, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    if (!aziende) return { total: 0, attive: 0, disattive: 0, totalCandidati: 0 };
    return {
      total: aziende.length,
      attive: aziende.filter(a => a.attiva).length,
      disattive: aziende.filter(a => !a.attiva).length,
      totalCandidati: aziende.reduce((sum, a) => sum + a.candidati_count, 0),
    };
  }, [aziende]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // 1. Create azienda
      const { data: azienda, error: aziendaError } = await supabase
        .from('aziende')
        .insert({
          nome: data.nome,
          settore: data.settore || null,
          email_contatto: data.email_contatto || null,
          telefono: data.telefono || null,
          indirizzo: data.indirizzo || null,
          attiva: data.attiva,
        })
        .select()
        .single();

      if (aziendaError) throw aziendaError;

      // 2. Create user for azienda
      const password = generatePassword();
      const email = data.email_contatto || `azienda_${azienda.id}@talentprofile.local`;

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: data.nome,
            ruolo: 'azienda',
          }
        }
      });

      if (signUpError) throw signUpError;

      // 3. Update profile with azienda_id
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ruolo: 'azienda',
            azienda_id: azienda.id,
            nome: data.nome,
            email: email,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }

      return { azienda, email, password };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['aziende-with-counts'] });
      setIsDialogOpen(false);
      resetForm();
      setGeneratedCredentials({
        email: result.email,
        password: result.password,
        aziendaNome: result.azienda.nome,
      });
      toast({
        title: 'Azienda creata',
        description: 'Azienda e utente creati con successo',
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('aziende')
        .update({
          nome: data.nome,
          settore: data.settore || null,
          email_contatto: data.email_contatto || null,
          telefono: data.telefono || null,
          indirizzo: data.indirizzo || null,
          attiva: data.attiva,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aziende-with-counts'] });
      setIsDialogOpen(false);
      setEditingAzienda(null);
      resetForm();
      toast({
        title: 'Azienda aggiornata',
        description: 'Le modifiche sono state salvate',
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('aziende').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aziende-with-counts'] });
      setDeleteAzienda(null);
      toast({
        title: 'Azienda eliminata',
        description: 'L\'azienda è stata rimossa',
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
      settore: '',
      email_contatto: '',
      telefono: '',
      indirizzo: '',
      attiva: true,
    });
  };

  const openEditDialog = (azienda: Azienda) => {
    setEditingAzienda(azienda);
    setFormData({
      nome: azienda.nome,
      settore: azienda.settore || '',
      email_contatto: azienda.email_contatto || '',
      telefono: azienda.telefono || '',
      indirizzo: azienda.indirizzo || '',
      attiva: azienda.attiva ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAzienda) {
      updateMutation.mutate({ id: editingAzienda.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    if (!filteredAziende || filteredAziende.length === 0) return;

    const headers = ['Nome', 'Settore', 'Email', 'Telefono', 'Indirizzo', 'Stato', 'N. Candidati', 'Data Creazione'];
    const rows = filteredAziende.map(a => [
      a.nome,
      a.settore || '',
      a.email_contatto || '',
      a.telefono || '',
      a.indirizzo || '',
      a.attiva ? 'Attiva' : 'Disattiva',
      a.candidati_count.toString(),
      a.created_at ? format(new Date(a.created_at), 'dd/MM/yyyy', { locale: it }) : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aziende_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({ title: 'Esportazione completata', description: `${filteredAziende.length} aziende esportate` });
  };

  const getSettoreBadgeColor = (settore: string | null) => {
    if (!settore) return 'secondary';
    const hash = settore.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['default', 'secondary', 'outline'] as const;
    return colors[hash % colors.length];
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
    <ProtectedRoute allowedRoles={['superadmin']}>
      <NotionLayout>
        <div className="space-y-6">
          {/* Header con statistiche */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Gestione Aziende</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-muted-foreground">{stats.total} totali</span>
                <span className="flex items-center gap-1 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {stats.attive} attive
                </span>
                <span className="flex items-center gap-1 text-yellow-600">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  {stats.disattive} disattive
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <Users className="h-3 w-3" />
                  {stats.totalCandidati} candidati
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportCSV} disabled={!filteredAziende?.length}>
                <Download className="h-4 w-4 mr-2" />
                Esporta CSV
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingAzienda(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Azienda
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAzienda ? 'Modifica Azienda' : 'Nuova Azienda'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAzienda
                          ? 'Modifica i dati dell\'azienda'
                          : 'Inserisci i dati della nuova azienda. Verrà creato automaticamente un account di accesso.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Azienda *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settore">Settore</Label>
                        <Input
                          id="settore"
                          value={formData.settore}
                          onChange={(e) => setFormData({ ...formData, settore: e.target.value })}
                          placeholder="es. Tecnologia, Edilizia, Servizi..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_contatto">Email Contatto</Label>
                        <Input
                          id="email_contatto"
                          type="email"
                          value={formData.email_contatto}
                          onChange={(e) => setFormData({ ...formData, email_contatto: e.target.value })}
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
                      <div className="space-y-2">
                        <Label htmlFor="indirizzo">Indirizzo</Label>
                        <Input
                          id="indirizzo"
                          value={formData.indirizzo}
                          onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="attiva"
                          checked={formData.attiva}
                          onCheckedChange={(checked) => setFormData({ ...formData, attiva: checked })}
                        />
                        <Label htmlFor="attiva">Azienda attiva</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingAzienda ? 'Salva Modifiche' : 'Crea Azienda'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filtri */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca per nome, email, settore..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterStato} onValueChange={setFilterStato}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="attiva">Attive</SelectItem>
                    <SelectItem value="disattiva">Disattive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSettore} onValueChange={setFilterSettore}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Settore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i settori</SelectItem>
                    {settori.map((s) => (
                      <SelectItem key={s} value={s!}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(searchTerm || filterStato !== 'all' || filterSettore !== 'all') && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Visualizzati {filteredAziende.length} di {stats.total} aziende</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setSearchTerm(''); setFilterStato('all'); setFilterSettore('all'); }}
                  >
                    Resetta filtri
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabella */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : filteredAziende && filteredAziende.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="nome">Nome</SortableHeader>
                      <SortableHeader field="settore">Settore</SortableHeader>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefono</TableHead>
                      <TableHead>Stato</TableHead>
                      <SortableHeader field="candidati_count">Candidati</SortableHeader>
                      <SortableHeader field="created_at">Creazione</SortableHeader>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAziende.map((azienda) => (
                      <TableRow key={azienda.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {azienda.nome}
                          </div>
                        </TableCell>
                        <TableCell>
                          {azienda.settore ? (
                            <Badge variant={getSettoreBadgeColor(azienda.settore)}>
                              {azienda.settore}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{azienda.email_contatto || '-'}</TableCell>
                        <TableCell>{azienda.telefono || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={azienda.attiva ? 'default' : 'secondary'}>
                            {azienda.attiva ? 'Attiva' : 'Disattiva'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{azienda.candidati_count}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {azienda.created_at 
                            ? format(new Date(azienda.created_at), 'dd MMM yyyy', { locale: it })
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(azienda)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteAzienda(azienda)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna azienda trovata</p>
                  <p className="text-sm">
                    {searchTerm || filterStato !== 'all' || filterSettore !== 'all' 
                      ? 'Prova a modificare i filtri' 
                      : 'Crea la prima azienda per iniziare'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteAzienda} onOpenChange={() => setDeleteAzienda(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare l'azienda "{deleteAzienda?.nome}"? 
                Questa azione è irreversibile e rimuoverà anche tutti i candidati associati.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAzienda && deleteMutation.mutate(deleteAzienda.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Credentials Dialog */}
        <Dialog open={!!generatedCredentials} onOpenChange={() => setGeneratedCredentials(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Credenziali Azienda Create</DialogTitle>
              <DialogDescription>
                Copia e conserva queste credenziali per l'azienda "{generatedCredentials?.aziendaNome}".
                La password non potrà essere visualizzata nuovamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials?.email || ''} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedCredentials?.email || '', 'email')}
                  >
                    {copiedId === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                    onClick={() => copyToClipboard(generatedCredentials?.password || '', 'password')}
                  >
                    {copiedId === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setGeneratedCredentials(null)}>Chiudi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </NotionLayout>
    </ProtectedRoute>
  );
}
