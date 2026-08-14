import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NotionLayout } from '@/components/NotionLayout';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CandidatoDrawer } from '@/components/CandidatoDrawer';
import { FitIndicator } from '@/components/FitIndicator';
import { DateRangePicker } from '@/components/DateRangePicker';
import { CandidatiFilters } from '@/components/CandidatiFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Users, Copy, Check, Eye, Key, RefreshCw, Download, ArrowUpDown, 
  TestTube2, Trash2, CalendarIcon, Search, AlertTriangle, Filter, 
  CheckCircle2, Clock, TrendingUp, UserCheck, Mail, Phone, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Candidato, Azienda, AccessoAzienda, ProfiloCandidato, RUOLI_AZIENDALI, FUNZIONI } from '@/types/database';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';
import { format, subDays, subMonths, startOfDay, endOfDay, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

type SortField = 'cognome' | 'eta' | 'ruolo_attuale' | 'funzione' | 'created_at' | 'data_test' | 'fit_score';
type SortOrder = 'asc' | 'desc';

type AnalisiCandidato = {
  fit_score: number | null;
  fit_verdict: string | null;
};

type CandidatoWithRelations = Candidato & { 
  aziende: { nome: string } | null;
  profili_candidato: ProfiloCandidato | null;
  analisi_candidato: AnalisiCandidato[] | null;
};

// Tipo per duplicati
type DuplicateInfo = {
  candidatoId: string;
  aziendaNome: string;
  matchType: 'email' | 'telefono';
};

export default function Candidati() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterAzienda, setFilterAzienda] = useState<string>('all');
  /* Lo stato può arrivare dall'URL: la dashboard linka /candidati?stato=completato
     per portare l'utente direttamente sulla coda che ha appena visto. */
  const [searchParams] = useSearchParams();
  const statoIniziale = searchParams.get('stato');
  const [filterStato, setFilterStato] = useState<string>(
    statoIniziale === 'completato' || statoIniziale === 'da_fare' ? statoIniziale : 'all'
  );
  const [filterRuolo, setFilterRuolo] = useState<string>('all');
  const [filterFunzione, setFilterFunzione] = useState<string>('all');
  const [filterFitVerdict, setFilterFitVerdict] = useState<string>('all');
  const [filterSesso, setFilterSesso] = useState<string>('all');
  const [filterEta, setFilterEta] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
    nome: string;
    cognome: string;
  } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Date filters
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined);
  const [filterTestDateFrom, setFilterTestDateFrom] = useState<Date | undefined>(undefined);
  const [filterTestDateTo, setFilterTestDateTo] = useState<Date | undefined>(undefined);
  const [datePreset, setDatePreset] = useState<string>('all');

  // State per drawer dettaglio candidato
  const [selectedCandidato, setSelectedCandidato] = useState<CandidatoWithRelations | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const currentAziendaId = isSuperadmin ? filterAzienda : profile?.azienda_id;

  // Clear one-time password when switching company
  useEffect(() => {
    setGeneratedPassword(null);
  }, [currentAziendaId]);

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

  // Query per rilevare duplicati cross-azienda
  const { data: allCandidatiForDuplicates } = useQuery({
    queryKey: ['candidati-duplicati'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidati')
        .select('id, email, telefono, azienda_id, nome, cognome, aziende(nome)');
      if (error) throw error;
      return data as Array<{
        id: string;
        email: string | null;
        telefono: string | null;
        azienda_id: string;
        nome: string;
        cognome: string;
        aziende: { nome: string } | null;
      }>;
    },
  });

  // Funzione per trovare duplicati
  const getDuplicateInfo = (candidato: CandidatoWithRelations): DuplicateInfo[] => {
    if (!allCandidatiForDuplicates) return [];
    
    const duplicates: DuplicateInfo[] = [];
    
    allCandidatiForDuplicates.forEach(c => {
      if (c.id === candidato.id || c.azienda_id === candidato.azienda_id) return;
      
      if (candidato.email && c.email && candidato.email.toLowerCase() === c.email.toLowerCase()) {
        duplicates.push({
          candidatoId: c.id,
          aziendaNome: c.aziende?.nome || 'Azienda sconosciuta',
          matchType: 'email',
        });
      }
      
      if (candidato.telefono && c.telefono && candidato.telefono === c.telefono) {
        // Evita duplicati se già presente per email
        if (!duplicates.some(d => d.candidatoId === c.id)) {
          duplicates.push({
            candidatoId: c.id,
            aziendaNome: c.aziende?.nome || 'Azienda sconosciuta',
            matchType: 'telefono',
          });
        }
      }
    });
    
    return duplicates;
  };

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

  const PAGE_SIZE = 50;

  /* Costruisce la query filtrata lato server. Riusata dalla lista paginata e
     dall'export CSV (che scarica tutte le pagine del filtro corrente). */
  const buildCandidatiQuery = useCallback(() => {
    // Con il filtro sul verdetto l'embed deve diventare inner join, ma solo in
    // quel caso: !inner fisso escluderebbe chi non ha ancora completato il test.
    const embedAnalisi = filterFitVerdict && filterFitVerdict !== 'all'
      ? 'analisi_candidato!inner(fit_score, fit_verdict)'
      : 'analisi_candidato(fit_score, fit_verdict)';

    let query = supabase
      .from('candidati')
      .select(`*, aziende(nome), profili_candidato(*), ${embedAnalisi}`, { count: 'exact' });

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
    if (filterFitVerdict && filterFitVerdict !== 'all') {
      query = query.eq('analisi_candidato.fit_verdict', filterFitVerdict);
    }
    if (filterSesso && filterSesso !== 'all') {
      query = query.eq('sesso', filterSesso);
    }
    if (filterEta && filterEta !== 'all') {
      const [min, max] =
        filterEta === '18-30' ? [18, 30]
        : filterEta === '31-45' ? [31, 45]
        : filterEta === '46-60' ? [46, 60]
        : [61, null];
      query = query.gte('eta', min);
      if (max !== null) query = query.lte('eta', max);
    }
    if (searchTerm && searchTerm.trim()) {
      // I caratteri speciali di PostgREST nel termine romperebbero l'espressione or()
      const term = searchTerm.trim().replace(/[%,()]/g, ' ').trim();
      if (term) {
        const pattern = `%${term}%`;
        query = query.or(
          ['nome', 'cognome', 'email', 'ruolo_attuale', 'funzione']
            .map((c) => `${c}.ilike.${pattern}`)
            .join(',')
        );
      }
    }
    if (filterDateFrom) query = query.gte('created_at', startOfDay(filterDateFrom).toISOString());
    if (filterDateTo) query = query.lte('created_at', endOfDay(filterDateTo).toISOString());
    if (filterTestDateFrom) query = query.gte('data_test', startOfDay(filterTestDateFrom).toISOString());
    if (filterTestDateTo) query = query.lte('data_test', endOfDay(filterTestDateTo).toISOString());

    // Ordinamento lato server: con la paginazione l'ordine client varrebbe
    // solo dentro la singola pagina. analisi_candidato è one-to-one, quindi
    // PostgREST può ordinare il parent per fit_score con la sintassi embed(col).
    if (sortField === 'fit_score') {
      query = query.order('analisi_candidato(fit_score)', {
        ascending: sortOrder === 'asc',
      });
    } else {
      query = query.order(sortField, { ascending: sortOrder === 'asc', nullsFirst: false });
    }
    // Spareggio stabile: senza, le righe a parità di valore possono
    // ripresentarsi o sparire cambiando pagina.
    query = query.order('id', { ascending: true });

    return query;
  }, [filterAzienda, filterStato, filterRuolo, filterFunzione, filterFitVerdict, filterSesso, filterEta, searchTerm, filterDateFrom, filterDateTo, filterTestDateFrom, filterTestDateTo, sortField, sortOrder]);

  const { data: candidatiPage, isLoading } = useQuery({
    queryKey: ['candidati', filterAzienda, filterStato, filterRuolo, filterFunzione, filterFitVerdict, filterSesso, filterEta, searchTerm, filterDateFrom, filterDateTo, filterTestDateFrom, filterTestDateTo, sortField, sortOrder, page],
    queryFn: async () => {
      const { data, error, count } = await buildCandidatiQuery().range(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE - 1
      );
      if (error) throw error;
      return {
        rows: (data || []) as unknown as CandidatoWithRelations[],
        count: count ?? 0,
      };
    },
    placeholderData: (prev) => prev,
  });

  const candidati = candidatiPage?.rows;
  const totalCount = candidatiPage?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Cambio filtri, ricerca o ordinamento: si riparte dalla prima pagina
  useEffect(() => {
    setPage(0);
  }, [filterAzienda, filterStato, filterRuolo, filterFunzione, filterFitVerdict, filterSesso, filterEta, searchTerm, filterDateFrom, filterDateTo, filterTestDateFrom, filterTestDateTo, sortField, sortOrder]);

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
    onSuccess: (result) => {
      if (result.plainPassword) {
        setGeneratedPassword(result.plainPassword);
      }
      queryClient.invalidateQueries({ queryKey: ['accesso-azienda'] });
      toast({
        title: 'Credenziali generate',
        description: 'Le nuove credenziali sono state create con successo',
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
        await supabase.from('analisi_candidato').delete().eq('candidato_id', id);
        await supabase.from('profili_candidato').delete().eq('candidato_id', id);
        await supabase.from('risultati').delete().eq('candidato_id', id);
        await supabase.from('risposte').delete().eq('candidato_id', id);
        const { error } = await supabase.from('candidati').delete().eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidati'] });
      const count = singleDeleteId ? 1 : selectedIds.size;
      setSelectedIds(new Set());
      setSingleDeleteId(null);
      setIsDeleteDialogOpen(false);
      toast({ title: 'Candidati eliminati', description: `${count} candidat${count === 1 ? 'o rimosso' : 'i rimossi'}` });
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
    onError: (error: Error) => {
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

  // L'ordinamento è applicato dal server (vedi buildCandidatiQuery): qui si
  // espone solo la pagina corrente con il nome storico usato dal resto del file.
  const sortedCandidati = candidati ?? [];

  const EXPORT_MAX = 10_000;

  const exportCSV = async () => {
    if (totalCount === 0) return;

    // L'export riguarda l'intero filtro corrente, non la pagina visibile:
    // si scaricano tutte le pagine (con un tetto di sicurezza per il browser).
    let tutti: CandidatoWithRelations[] = [];
    try {
      for (let from = 0; from < Math.min(totalCount, EXPORT_MAX); from += 1000) {
        const { data, error } = await buildCandidatiQuery().range(from, from + 999);
        if (error) throw error;
        tutti = tutti.concat((data || []) as unknown as CandidatoWithRelations[]);
        if (!data || data.length < 1000) break;
      }
    } catch {
      toast({ title: 'Errore export', description: 'Riprova più tardi.', variant: 'destructive' });
      return;
    }

    const headers = ['Cognome', 'Nome', 'Sesso', 'Età', 'Ruolo', 'Funzione', 'Email', 'Telefono', 'Stato Test', 'Data Creazione', 'Azienda', 'Profilo', 'Leadership%', 'Maturità%', 'Potenziale%'];
    const rows = tutti.map(c => [
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

    toast({
      title: 'Esportazione completata',
      description: `${tutti.length} candidati esportati${totalCount > EXPORT_MAX ? ` (primi ${EXPORT_MAX} di ${totalCount})` : ''}`,
    });
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

  // KPI Statistics
  const stats = useMemo(() => {
    if (!candidati) return { total: 0, completati: 0, inAttesa: 0, idonei: 0, avgFit: 0 };
    const completati = candidati.filter(c => c.test_completato).length;
    const inAttesa = candidati.length - completati;
    const idonei = candidati.filter(c => {
      const verdict = Array.isArray(c.analisi_candidato) ? c.analisi_candidato[0]?.fit_verdict : null;
      return verdict === 'IDONEO';
    }).length;
    const fitScores = candidati
      .map(c => Array.isArray(c.analisi_candidato) ? c.analisi_candidato[0]?.fit_score : null)
      .filter((s): s is number => s !== null);
    const avgFit = fitScores.length > 0 ? Math.round(fitScores.reduce((a, b) => a + b, 0) / fitScores.length) : 0;
    
    return { total: candidati.length, completati, inAttesa, idonei, avgFit };
  }, [candidati]);

  const hasActiveFilters = filterStato !== 'all' || filterSesso !== 'all' || filterEta !== 'all' || 
    filterRuolo !== 'all' || filterFunzione !== 'all' || filterFitVerdict !== 'all' ||
    filterDateFrom !== undefined || filterDateTo !== undefined || 
    filterTestDateFrom !== undefined || filterTestDateTo !== undefined;

  const resetFilters = () => {
    setFilterStato('all');
    setFilterSesso('all');
    setFilterEta('all');
    setFilterRuolo('all');
    setFilterFunzione('all');
    setFilterFitVerdict('all');
    setSearchTerm('');
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    setFilterTestDateFrom(undefined);
    setFilterTestDateTo(undefined);
    setDatePreset('all');
  };

  // Date preset handler
  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    
    switch (preset) {
      case 'today':
        setFilterDateFrom(today);
        setFilterDateTo(today);
        break;
      case 'week':
        setFilterDateFrom(subDays(today, 7));
        setFilterDateTo(today);
        break;
      case 'month':
        setFilterDateFrom(subMonths(today, 1));
        setFilterDateTo(today);
        break;
      case '3months':
        setFilterDateFrom(subMonths(today, 3));
        setFilterDateTo(today);
        break;
      case 'all':
      default:
        setFilterDateFrom(undefined);
        setFilterDateTo(undefined);
        break;
    }
  };


  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <NotionLayout>
        <TooltipProvider>
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Candidati</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedIds.size > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Elimina ({selectedIds.size})
                    </Button>
                  )}
                  
                  {isSuperadmin && aziende && (
                    <Select value={filterAzienda} onValueChange={setFilterAzienda}>
                      <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="Azienda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutte</SelectItem>
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
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Nuovo</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <form onSubmit={handleSubmit}>
                        <DialogHeader>
                          <DialogTitle>Nuovo Candidato</DialogTitle>
                          <DialogDescription>
                            Verranno generate automaticamente le credenziali di accesso.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
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
                            <Label>Ruolo</Label>
                            <Select
                              value={formData.ruolo_attuale}
                              onValueChange={(value) => setFormData({ ...formData, ruolo_attuale: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona" />
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
                                <SelectValue placeholder="Seleziona" />
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
                            {createMutation.isPending ? 'Creazione...' : 'Crea'}
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
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Totale</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-1">{stats.total}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Completati</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-1">{stats.completati}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-muted-foreground">In Attesa</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-1">{stats.inAttesa}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-accent" />
                      <span className="text-xs text-muted-foreground">Idonei</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-1">{stats.idonei}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 col-span-2 md:col-span-1">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Fit Medio</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-1">{stats.avgFit}%</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Credenziali Card */}
            {currentAziendaId && currentAziendaId !== 'all' && (
              <Card className="border-accent/30 bg-accent/5">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-accent" />
                      <CardTitle className="text-sm md:text-base">Credenziali Candidati</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => credentialsMutation.mutate({ aziendaId: currentAziendaId, regenerate: !!accessoAzienda })}
                      disabled={credentialsMutation.isPending}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${credentialsMutation.isPending ? 'animate-spin' : ''}`} />
                      {accessoAzienda ? 'Rigenera' : 'Genera'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  {isLoadingAccesso ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                      Caricamento...
                    </div>
                  ) : accessoAzienda ? (
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Username</Label>
                        <div className="flex gap-1">
                          <Input value={accessoAzienda.username} readOnly className="font-mono text-sm h-8" />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => copyToClipboard(accessoAzienda.username, 'az-username')}
                          >
                            {copiedId === 'az-username' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Password</Label>
                        <div className="flex gap-1">
                          <Input value={generatedPassword || 'Genera per ottenere la password'} readOnly className="font-mono text-sm h-8" />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => generatedPassword && copyToClipboard(generatedPassword, 'az-password')}
                            disabled={!generatedPassword}
                          >
                            {copiedId === 'az-password' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full h-8"
                          onClick={() => {
                            const text = `Credenziali:\nUsername: ${accessoAzienda.username}\nPassword: ${generatedPassword || '(genera per ottenere la password)'}\nLink: ${window.location.origin}/auth`;
                            copyToClipboard(text, 'az-all');
                          }}
                        >
                          {copiedId === 'az-all' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          Copia tutto
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Clicca "Genera" per creare le credenziali di accesso.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca candidato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              
              {/* Mobile: Filter button */}
              {isMobile ? (
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <Filter className="h-4 w-4" />
                      Filtri
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {[filterStato, filterSesso, filterEta, filterRuolo, filterFunzione, filterFitVerdict]
                            .filter(f => f !== 'all').length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filtri</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <CandidatiFilters
                        datePreset={datePreset}
                        onDatePresetChange={applyDatePreset}
                        filterDateFrom={filterDateFrom}
                        filterDateTo={filterDateTo}
                        onFilterDateFromChange={(d) => { setFilterDateFrom(d); setDatePreset('custom'); }}
                        onFilterDateToChange={(d) => { setFilterDateTo(d); setDatePreset('custom'); }}
                        filterTestDateFrom={filterTestDateFrom}
                        filterTestDateTo={filterTestDateTo}
                        onFilterTestDateFromChange={setFilterTestDateFrom}
                        onFilterTestDateToChange={setFilterTestDateTo}
                        filterStato={filterStato}
                        onFilterStatoChange={setFilterStato}
                        filterSesso={filterSesso}
                        onFilterSessoChange={setFilterSesso}
                        filterEta={filterEta}
                        onFilterEtaChange={setFilterEta}
                        filterRuolo={filterRuolo}
                        onFilterRuoloChange={setFilterRuolo}
                        filterFunzione={filterFunzione}
                        onFilterFunzioneChange={setFilterFunzione}
                        filterFitVerdict={filterFitVerdict}
                        onFilterFitVerdictChange={setFilterFitVerdict}
                        hasActiveFilters={hasActiveFilters}
                        onResetFilters={resetFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                /* Desktop: Inline filters */
                <div className="flex flex-wrap items-center gap-2">
                  {/* Date preset buttons */}
                  <div className="flex gap-1 mr-2">
                    {[
                      { value: 'all', label: 'Tutti' },
                      { value: 'today', label: 'Oggi' },
                      { value: 'week', label: '7g' },
                      { value: 'month', label: '30g' },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        variant={datePreset === preset.value ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => applyDatePreset(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Date picker popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-9 gap-1",
                          (filterDateFrom || filterDateTo) && "border-primary text-primary"
                        )}
                      >
                        <CalendarIcon className="h-3 w-3" />
                        {filterDateFrom || filterDateTo ? (
                          <span className="text-xs">
                            {filterDateFrom ? format(filterDateFrom, "dd/MM", { locale: it }) : "..."} - {filterDateTo ? format(filterDateTo, "dd/MM", { locale: it }) : "..."}
                          </span>
                        ) : (
                          <span className="text-xs">Data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="space-y-4">
                        <DateRangePicker
                          label="Data Registrazione"
                          fromDate={filterDateFrom}
                          toDate={filterDateTo}
                          onFromChange={(d) => { setFilterDateFrom(d); setDatePreset('custom'); }}
                          onToChange={(d) => { setFilterDateTo(d); setDatePreset('custom'); }}
                        />
                        <DateRangePicker
                          label="Data Test"
                          fromDate={filterTestDateFrom}
                          toDate={filterTestDateTo}
                          onFromChange={setFilterTestDateFrom}
                          onToChange={setFilterTestDateTo}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Select value={filterStato} onValueChange={setFilterStato}>
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="completato">Completato</SelectItem>
                      <SelectItem value="da_fare">Da fare</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSesso} onValueChange={setFilterSesso}>
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue placeholder="Sesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterEta} onValueChange={setFilterEta}>
                    <SelectTrigger className="w-[90px] h-9">
                      <SelectValue placeholder="Età" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte</SelectItem>
                      <SelectItem value="18-30">18-30</SelectItem>
                      <SelectItem value="31-45">31-45</SelectItem>
                      <SelectItem value="46-60">46-60</SelectItem>
                      <SelectItem value="60+">60+</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterFitVerdict} onValueChange={setFilterFitVerdict}>
                    <SelectTrigger className="w-[100px] h-9">
                      <SelectValue placeholder="Fit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="IDONEO">Idoneo</SelectItem>
                      <SelectItem value="VALUTARE">Valutare</SelectItem>
                      <SelectItem value="NON_IDONEO">Non Idoneo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={exportCSV} disabled={!sortedCandidati || sortedCandidati.length === 0} className="h-9">
                    <Download className="h-4 w-4" />
                  </Button>
                  {isSuperadmin && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => seedMutation.mutate()}
                      disabled={seedMutation.isPending}
                      className="h-9 border-accent/50 hover:bg-accent/10"
                    >
                      <TestTube2 className={`h-4 w-4 ${seedMutation.isPending ? 'animate-pulse' : ''}`} />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Active filters chips (mobile) */}
            {isMobile && hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filterStato !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Stato: {filterStato === 'completato' ? 'Completato' : 'Da fare'}
                  </Badge>
                )}
                {filterSesso !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Sesso: {filterSesso}
                  </Badge>
                )}
                {filterEta !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Età: {filterEta}
                  </Badge>
                )}
                {filterFitVerdict !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Fit: {filterFitVerdict}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
                  Resetta
                </Button>
              </div>
            )}

            {/* Results count */}
            {(searchTerm || hasActiveFilters) && (
              <p className="text-sm text-muted-foreground">
                {totalCount} risultati trovati
              </p>
            )}

            {/* Table / Card View */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  </div>
                ) : sortedCandidati && sortedCandidati.length > 0 ? (
                  isMobile ? (
                    // Mobile Card View
                    <div className="divide-y">
                      {sortedCandidati.map((candidato) => {
                        const duplicates = getDuplicateInfo(candidato);
                        const hasDuplicates = duplicates.length > 0;
                        const fitScore = Array.isArray(candidato.analisi_candidato) 
                          ? candidato.analisi_candidato[0]?.fit_score 
                          : null;
                        
                        return (
                          <div 
                            key={candidato.id} 
                            className={cn(
                              "p-4 space-y-3",
                              selectedIds.has(candidato.id) && "bg-primary/5"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Checkbox 
                                  checked={selectedIds.has(candidato.id)}
                                  onCheckedChange={() => toggleSelect(candidato.id)}
                                  className="shrink-0"
                                />
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                                  {candidato.nome?.[0]}{candidato.cognome?.[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1">
                                    <p className="font-medium text-sm truncate">{candidato.cognome} {candidato.nome}</p>
                                    {hasDuplicates && (
                                      <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />
                                    )}
                                  </div>
                                  {candidato.email && (
                                    <p className="text-xs text-muted-foreground truncate">{candidato.email}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {candidato.test_completato ? (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    className="h-8 px-2 text-xs whitespace-nowrap"
                                    onClick={() => navigate(`/candidati/${candidato.id}`)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Vedi
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => copyToClipboard(
                                      `${window.location.origin}/auth`,
                                      candidato.id
                                    )}
                                  >
                                    {copiedId === candidato.id ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                    )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setSingleDeleteId(candidato.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Badge 
                                variant={candidato.test_completato ? 'default' : 'secondary'}
                                className={cn(
                                  "text-xs",
                                  candidato.test_completato && 'bg-green-100 text-green-700 hover:bg-green-100'
                                )}
                              >
                                {candidato.test_completato ? 'Completato' : 'Da fare'}
                              </Badge>
                              
                              {fitScore != null && (
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-bold",
                                  fitScore >= 65 ? "bg-green-100 text-green-700" :
                                  fitScore >= 40 ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                )}>
                                  Fit {fitScore}%
                                </span>
                              )}
                              
                              {candidato.eta && (
                                <span className="text-muted-foreground">{candidato.eta} anni</span>
                              )}
                              {candidato.ruolo_attuale && (
                                <span className="text-muted-foreground">{candidato.ruolo_attuale}</span>
                              )}
                            </div>
                            
                            {hasDuplicates && (
                              <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 rounded px-2 py-1">
                                <AlertTriangle className="h-3 w-3" />
                                Presente in: {duplicates.map(d => d.aziendaNome).join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Desktop Table View
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox 
                                checked={sortedCandidati.length > 0 && selectedIds.size === sortedCandidati.length}
                                onCheckedChange={toggleSelectAll}
                              />
                            </TableHead>
                            <SortableHeader field="cognome">Candidato</SortableHeader>
                            {isSuperadmin && <TableHead>Azienda</TableHead>}
                            <SortableHeader field="eta">Età</SortableHeader>
                            <SortableHeader field="ruolo_attuale">Ruolo</SortableHeader>
                            <TableHead>Stato</TableHead>
                            <SortableHeader field="fit_score">Fit</SortableHeader>
                            <TableHead>Profilo</TableHead>
                            <SortableHeader field="created_at">Data</SortableHeader>
                            <TableHead className="text-right w-32">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedCandidati.map((candidato, index) => {
                            const duplicates = getDuplicateInfo(candidato);
                            const hasDuplicates = duplicates.length > 0;
                            const fitScore = Array.isArray(candidato.analisi_candidato) 
                              ? candidato.analisi_candidato[0]?.fit_score 
                              : null;
                            
                            return (
                              <TableRow 
                                key={candidato.id}
                                className={cn(
                                  "transition-colors",
                                  selectedIds.has(candidato.id) ? 'bg-primary/10' : index % 2 === 0 ? 'bg-muted/20' : '',
                                  "hover:bg-muted/50"
                                )}
                              >
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedIds.has(candidato.id)}
                                    onCheckedChange={() => toggleSelect(candidato.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                      {candidato.nome?.[0]}{candidato.cognome?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">{candidato.cognome} {candidato.nome}</p>
                                        {hasDuplicates && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="font-medium">Multi-azienda</p>
                                              {duplicates.map((d, i) => (
                                                <p key={i} className="text-xs">
                                                  {d.aziendaNome} (via {d.matchType})
                                                </p>
                                              ))}
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {candidato.email && (
                                          <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {candidato.email}
                                          </span>
                                        )}
                                        {candidato.telefono && (
                                          <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {candidato.telefono}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                {isSuperadmin && (
                                  <TableCell className="text-sm">{candidato.aziende?.nome || '-'}</TableCell>
                                )}
                                <TableCell className="text-center">
                                  {candidato.eta ? `${candidato.eta}` : '-'}
                                  {candidato.sesso && <span className="text-muted-foreground ml-1">({candidato.sesso})</span>}
                                </TableCell>
                                <TableCell className="max-w-[120px] truncate">{candidato.ruolo_attuale || '-'}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={candidato.test_completato ? 'default' : 'secondary'}
                                    className={cn(
                                      "text-xs",
                                      candidato.test_completato && 'bg-green-100 text-green-700 hover:bg-green-100'
                                    )}
                                  >
                                    {candidato.test_completato ? 'OK' : 'Attesa'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {fitScore != null ? (
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-xs font-bold",
                                      fitScore >= 65 ? "bg-green-100 text-green-700" :
                                      fitScore >= 40 ? "bg-yellow-100 text-yellow-700" :
                                      "bg-red-100 text-red-700"
                                    )}>
                                      {fitScore}%
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {candidato.test_completato && candidato.profili_candidato?.profilo_tipo ? (
                                    <Badge variant={getBadgeVariant(candidato.profili_candidato.profilo_tipo)} className="text-xs">
                                      {getProfiloTipoV5Label(candidato.profili_candidato.profilo_tipo as any)}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(new Date(candidato.created_at), 'dd/MM/yy', { locale: it })}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    {!candidato.test_completato ? (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => copyToClipboard(
                                          `${window.location.origin}/auth`,
                                          candidato.id
                                        )}
                                      >
                                        {copiedId === candidato.id ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    ) : (
                                      <Button 
                                        variant="default" 
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => navigate(`/candidati/${candidato.id}`)}
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Vedi
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => {
                                        setSingleDeleteId(candidato.id);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )
                ) : searchTerm || hasActiveFilters ? (
                  <div className="p-10 text-center">
                    <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="font-medium">Nessun candidato con questi filtri</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Prova ad allargare la ricerca o azzera i filtri.
                    </p>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Azzera i filtri
                    </Button>
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="font-medium">Non hai ancora candidati</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md mx-auto">
                      Aggiungi chi stai valutando e mandagli il link: risponde in 15 minuti dal
                      telefono e tu ricevi il report. Oppure cerca fra chi il test l’ha già fatto.
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Aggiungi candidato
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate('/marketplace')}>
                        Cerca candidati
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paginazione server-side */}
            {totalCount > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  Pagina {page + 1} di {totalPages} — {totalCount} candidati
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0 || isLoading}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Precedente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1 || isLoading}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  >
                    Successiva <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) setSingleDeleteId(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                <AlertDialogDescription>
                  {singleDeleteId ? (
                    (() => {
                      const c = candidati?.find(c => c.id === singleDeleteId);
                      return `Stai per eliminare ${c?.cognome} ${c?.nome} e tutti i suoi dati. Questa azione non può essere annullata.`;
                    })()
                  ) : (
                    `Stai per eliminare ${selectedIds.size} candidati e tutti i loro dati. Questa azione non può essere annullata.`
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    const ids = singleDeleteId ? [singleDeleteId] : Array.from(selectedIds);
                    deleteMutation.mutate(ids);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteMutation.isPending ? 'Eliminazione...' : 'Elimina'}
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
                  Credenziali per "{generatedCredentials?.nome} {generatedCredentials?.cognome}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="flex gap-2">
                    <Input value={generatedCredentials?.username || ''} readOnly className="font-mono" />
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
                    <Input value={generatedCredentials?.password || ''} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedCredentials?.password || '', 'cred-password')}
                    >
                      {copiedId === 'cred-password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setGeneratedCredentials(null)}>Chiudi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Candidato Detail Drawer */}
          <CandidatoDrawer
            candidato={selectedCandidato}
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
          />
        </TooltipProvider>
      </NotionLayout>
    </ProtectedRoute>
  );
}
