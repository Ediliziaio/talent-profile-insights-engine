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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Pencil, Trash2, Building2, Copy, Check, Download, Search, Users, 
  ArrowUpDown, Filter, CheckCircle2, XCircle, TrendingUp, Eye
} from 'lucide-react';
import { Azienda } from '@/types/database';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

type SortField = 'nome' | 'settore' | 'created_at' | 'candidati_count' | 'test_completati';
type SortOrder = 'asc' | 'desc';

type AziendaWithStats = Azienda & {
  candidati_count: number;
  test_completati: number;
  fit_medio: number | null;
  idonei: number;
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAzienda, setEditingAzienda] = useState<Azienda | null>(null);
  const [deleteAzienda, setDeleteAzienda] = useState<Azienda | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
    aziendaNome: string;
  } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [filterSettore, setFilterSettore] = useState<string>('all');
  const [filterCandidati, setFilterCandidati] = useState<string>('all');
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

  // Fetch aziende with enhanced stats
  const { data: aziende, isLoading } = useQuery({
    queryKey: ['aziende-with-stats'],
    queryFn: async () => {
      const { data: aziendeData, error: aziendeError } = await supabase
        .from('aziende')
        .select('*')
        .order('created_at', { ascending: false });
      if (aziendeError) throw aziendeError;

      // Fetch all candidati with their analisi
      const { data: candidatiData, error: candidatiError } = await supabase
        .from('candidati')
        .select('azienda_id, test_completato, analisi_candidato(fit_score, fit_verdict)');
      
      if (candidatiError) throw candidatiError;

      // Calculate stats per company
      const statsMap = new Map<string, { count: number; completati: number; fitScores: number[]; idonei: number }>();
      
      candidatiData?.forEach(c => {
        const stats = statsMap.get(c.azienda_id) || { count: 0, completati: 0, fitScores: [], idonei: 0 };
        stats.count++;
        if (c.test_completato) stats.completati++;
        
        const analisi = Array.isArray(c.analisi_candidato) ? c.analisi_candidato[0] : null;
        if (analisi?.fit_score) stats.fitScores.push(analisi.fit_score);
        if (analisi?.fit_verdict === 'IDONEO') stats.idonei++;
        
        statsMap.set(c.azienda_id, stats);
      });

      return (aziendeData as Azienda[]).map(a => {
        const stats = statsMap.get(a.id) || { count: 0, completati: 0, fitScores: [], idonei: 0 };
        const avgFit = stats.fitScores.length > 0 
          ? Math.round(stats.fitScores.reduce((acc, s) => acc + s, 0) / stats.fitScores.length)
          : null;
        
        return {
          ...a,
          candidati_count: stats.count,
          test_completati: stats.completati,
          fit_medio: avgFit,
          idonei: stats.idonei,
        };
      }) as AziendaWithStats[];
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
    
    // Candidati filter
    if (filterCandidati === 'con') {
      filtered = filtered.filter(a => a.candidati_count > 0);
    } else if (filterCandidati === 'senza') {
      filtered = filtered.filter(a => a.candidati_count === 0);
    } else if (filterCandidati === 'in_attesa') {
      filtered = filtered.filter(a => a.candidati_count > a.test_completati);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (aVal === null || aVal === undefined) aVal = sortField === 'candidati_count' || sortField === 'test_completati' ? -1 : '';
      if (bVal === null || bVal === undefined) bVal = sortField === 'candidati_count' || sortField === 'test_completati' ? -1 : '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [aziende, searchTerm, filterStato, filterSettore, filterCandidati, sortField, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    if (!aziende) return { total: 0, attive: 0, disattive: 0, totalCandidati: 0, avgCandidati: 0 };
    const totalCandidati = aziende.reduce((sum, a) => sum + a.candidati_count, 0);
    return {
      total: aziende.length,
      attive: aziende.filter(a => a.attiva).length,
      disattive: aziende.filter(a => !a.attiva).length,
      totalCandidati,
      avgCandidati: aziende.length > 0 ? Math.round(totalCandidati / aziende.length * 10) / 10 : 0,
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
      // Use edge function to create company without auto-login
      const { data: result, error } = await supabase.functions.invoke('create-company', {
        body: {
          nome: data.nome,
          settore: data.settore || null,
          email_contatto: data.email_contatto || null,
          telefono: data.telefono || null,
          indirizzo: data.indirizzo || null,
          attiva: data.attiva,
        }
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['aziende-with-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['aziende-with-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['aziende-with-stats'] });
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

    const headers = ['Nome', 'Settore', 'Email', 'Telefono', 'Indirizzo', 'Stato', 'Candidati', 'Completati', 'Fit Medio', 'Idonei', 'Data'];
    const rows = filteredAziende.map(a => [
      a.nome,
      a.settore || '',
      a.email_contatto || '',
      a.telefono || '',
      a.indirizzo || '',
      a.attiva ? 'Attiva' : 'Disattiva',
      a.candidati_count.toString(),
      a.test_completati.toString(),
      a.fit_medio?.toString() || '',
      a.idonei.toString(),
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

  const hasActiveFilters = filterStato !== 'all' || filterSettore !== 'all' || filterCandidati !== 'all';

  const resetFilters = () => {
    setFilterStato('all');
    setFilterSettore('all');
    setFilterCandidati('all');
    setSearchTerm('');
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

  // Filters content for mobile sheet
  const FiltersContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Stato</Label>
        <Select value={filterStato} onValueChange={setFilterStato}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="attiva">Attive</SelectItem>
            <SelectItem value="disattiva">Disattive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Settore</Label>
        <Select value={filterSettore} onValueChange={setFilterSettore}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Settore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {settori.map((s) => (
              <SelectItem key={s} value={s!}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Candidati</Label>
        <Select value={filterCandidati} onValueChange={setFilterCandidati}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Candidati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="con">Con candidati</SelectItem>
            <SelectItem value="senza">Senza candidati</SelectItem>
            <SelectItem value="in_attesa">Con test in attesa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
          Resetta filtri
        </Button>
      )}
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <NotionLayout>
        <div className="space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aziende</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportCSV} disabled={!filteredAziende?.length} className="h-9">
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingAzienda(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Nuova</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>
                          {editingAzienda ? 'Modifica Azienda' : 'Nuova Azienda'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingAzienda
                            ? 'Modifica i dati dell\'azienda'
                            : 'Verrà creato automaticamente un account di accesso.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
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
                          <Label htmlFor="settore">Settore</Label>
                          <Input
                            id="settore"
                            value={formData.settore}
                            onChange={(e) => setFormData({ ...formData, settore: e.target.value })}
                            placeholder="es. Tecnologia, Servizi..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email_contatto">Email</Label>
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
                          {editingAzienda ? 'Salva' : 'Crea'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Totale</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Attive</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stats.attive}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-muted-foreground">Disattive</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stats.disattive}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-muted-foreground">Candidati</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stats.totalCandidati}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 col-span-2 md:col-span-1">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Media/Azienda</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stats.avgCandidati}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca azienda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            {isMobile ? (
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Filter className="h-4 w-4" />
                    Filtri
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {[filterStato, filterSettore, filterCandidati].filter(f => f !== 'all').length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtri</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterStato} onValueChange={setFilterStato}>
                  <SelectTrigger className="w-[110px] h-9">
                    <SelectValue placeholder="Stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="attiva">Attive</SelectItem>
                    <SelectItem value="disattiva">Disattive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSettore} onValueChange={setFilterSettore}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Settore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    {settori.map((s) => (
                      <SelectItem key={s} value={s!}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCandidati} onValueChange={setFilterCandidati}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Candidati" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="con">Con candidati</SelectItem>
                    <SelectItem value="senza">Senza</SelectItem>
                    <SelectItem value="in_attesa">In attesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active filters chips (mobile) */}
          {isMobile && hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filterStato !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filterStato === 'attiva' ? 'Attive' : 'Disattive'}
                </Badge>
              )}
              {filterSettore !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filterSettore}
                </Badge>
              )}
              {filterCandidati !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filterCandidati === 'con' ? 'Con candidati' : filterCandidati === 'senza' ? 'Senza' : 'In attesa'}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
                Resetta
              </Button>
            </div>
          )}

          {/* Results count */}
          {(searchTerm || hasActiveFilters) && filteredAziende && (
            <p className="text-sm text-muted-foreground">
              {filteredAziende.length} di {stats.total} aziende
            </p>
          )}

          {/* Table / Card View */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : filteredAziende && filteredAziende.length > 0 ? (
                isMobile ? (
                  // Mobile Card View
                  <div className="divide-y">
                    {filteredAziende.map((azienda) => (
                      <div key={azienda.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{azienda.nome}</p>
                              {azienda.settore && (
                                <Badge variant={getSettoreBadgeColor(azienda.settore)} className="text-xs mt-1">
                                  {azienda.settore}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => navigate(`/candidati?azienda=${azienda.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(azienda)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <Badge variant={azienda.attiva ? 'default' : 'secondary'} className="text-xs">
                            {azienda.attiva ? 'Attiva' : 'Disattiva'}
                          </Badge>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {azienda.candidati_count} ({azienda.test_completati} ok)
                          </span>
                          {azienda.fit_medio && (
                            <span className="text-muted-foreground">
                              Fit: {azienda.fit_medio}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Desktop Table View
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader field="nome">Nome</SortableHeader>
                        <SortableHeader field="settore">Settore</SortableHeader>
                        <TableHead>Contatto</TableHead>
                        <TableHead>Stato</TableHead>
                        <SortableHeader field="candidati_count">Candidati</SortableHeader>
                        <SortableHeader field="test_completati">Completati</SortableHeader>
                        <TableHead>Fit Medio</TableHead>
                        <SortableHeader field="created_at">Data</SortableHeader>
                        <TableHead className="text-right w-28">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAziende.map((azienda, index) => (
                        <TableRow key={azienda.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {azienda.nome}
                            </div>
                          </TableCell>
                          <TableCell>
                            {azienda.settore ? (
                              <Badge variant={getSettoreBadgeColor(azienda.settore)} className="text-xs">
                                {azienda.settore}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="space-y-0.5">
                              {azienda.email_contatto && (
                                <p className="text-xs truncate max-w-[150px]">{azienda.email_contatto}</p>
                              )}
                              {azienda.telefono && (
                                <p className="text-xs text-muted-foreground">{azienda.telefono}</p>
                              )}
                              {!azienda.email_contatto && !azienda.telefono && (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={azienda.attiva ? 'default' : 'secondary'}
                              className={azienda.attiva ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                            >
                              {azienda.attiva ? 'Attiva' : 'Off'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{azienda.candidati_count}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={azienda.test_completati > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                              {azienda.test_completati}
                            </span>
                            {azienda.candidati_count > 0 && (
                              <span className="text-muted-foreground text-xs ml-1">
                                ({Math.round(azienda.test_completati / azienda.candidati_count * 100)}%)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {azienda.fit_medio ? (
                              <span className={`font-medium ${azienda.fit_medio >= 65 ? 'text-green-600' : azienda.fit_medio >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {azienda.fit_medio}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {azienda.created_at 
                              ? format(new Date(azienda.created_at), 'dd/MM/yy', { locale: it })
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => navigate(`/candidati?azienda=${azienda.id}`)}
                                title="Vedi candidati"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditDialog(azienda)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setDeleteAzienda(azienda)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna azienda trovata</p>
                  <p className="text-sm">
                    {searchTerm || hasActiveFilters 
                      ? 'Modifica i filtri' 
                      : 'Crea la prima azienda'
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
                Eliminare "{deleteAzienda?.nome}"? Verranno rimossi anche tutti i candidati associati.
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
              <DialogTitle>Credenziali Create</DialogTitle>
              <DialogDescription>
                Credenziali per "{generatedCredentials?.aziendaNome}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials?.email || ''} readOnly className="font-mono" />
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
                  <Input value={generatedCredentials?.password || ''} readOnly className="font-mono" />
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
