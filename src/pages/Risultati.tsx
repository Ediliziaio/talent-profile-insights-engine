import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ClipboardList, Eye, Calendar, User, TestTube2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Candidato, Azienda, ProfiloCandidato } from '@/types/database';
import { getProfiloTipoLabel } from '@/lib/scoring';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function Risultati() {
  const { profile } = useAuth();
  const isSuperadmin = profile?.ruolo === 'superadmin';
  const [filterAzienda, setFilterAzienda] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: aziende } = useQuery({
    queryKey: ['aziende'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Azienda[];
    },
    enabled: isSuperadmin,
  });

  const { data: candidatiConProfilo, isLoading } = useQuery({
    queryKey: ['candidati-risultati', filterAzienda],
    queryFn: async () => {
      let query = supabase
        .from('candidati')
        .select(`
          *,
          aziende(nome),
          profili_candidato(*)
        `)
        .eq('test_completato', true)
        .order('data_test', { ascending: false });

      if (filterAzienda && filterAzienda !== 'all') {
        query = query.eq('azienda_id', filterAzienda);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Candidato & { 
        aziende: { nome: string } | null;
        profili_candidato: ProfiloCandidato | null;
      })[];
    },
  });

  const getBadgeVariant = (tipo: string | null) => {
    switch (tipo) {
      case 'LEADER': return 'default';
      case 'STRATEGIST': return 'secondary';
      case 'EXECUTOR': return 'outline';
      case 'IN_TRANSIZIONE': return 'destructive';
      default: return 'secondary';
    }
  };

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
      if (!response.ok) throw new Error(result.error || 'Errore generazione demo');
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['candidati-risultati'] });
      toast({ title: 'Demo rigenerati', description: result.message });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['candidati-risultati'] });
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setIsDeleteDialogOpen(false);
      toast({ title: 'Candidati eliminati', description: `${count} candidati rimossi` });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

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
    if (selectedIds.size === candidatiConProfilo?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidatiConProfilo?.map(c => c.id) || []));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Risultati Test</h1>
              <p className="text-muted-foreground">Visualizza i profili dei candidati che hanno completato il test</p>
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
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : candidatiConProfilo && candidatiConProfilo.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={candidatiConProfilo.length > 0 && selectedIds.size === candidatiConProfilo.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Candidato</TableHead>
                      {isSuperadmin && <TableHead>Azienda</TableHead>}
                      <TableHead>Data Test</TableHead>
                      <TableHead>Profilo</TableHead>
                      <TableHead>Leadership</TableHead>
                      <TableHead>Maturità</TableHead>
                      <TableHead>Potenziale</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatiConProfilo.map((candidato) => (
                      <TableRow key={candidato.id} className={selectedIds.has(candidato.id) ? 'bg-muted/50' : ''}>
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
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {candidato.data_test 
                              ? format(new Date(candidato.data_test), 'dd MMM yyyy', { locale: it })
                              : '-'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(candidato.profili_candidato?.profilo_tipo || null)}>
                            {candidato.profili_candidato?.profilo_tipo 
                              ? getProfiloTipoLabel(candidato.profili_candidato.profilo_tipo as any)
                              : 'N/A'
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {candidato.profili_candidato?.leadership_pct?.toFixed(0) || '-'}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {candidato.profili_candidato?.maturita_pct?.toFixed(0) || '-'}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {candidato.profili_candidato?.potenziale_pct?.toFixed(0) || '-'}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/risultati/${candidato.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Dettaglio
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun risultato disponibile</p>
                  <p className="text-sm">I risultati appariranno quando i candidati completeranno il test</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
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
      </Layout>
    </ProtectedRoute>
  );
}
