import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ClipboardList, Eye, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Candidato, Azienda, ProfiloCandidato } from '@/types/database';
import { getProfiloTipoLabel } from '@/lib/scoring';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Risultati() {
  const { profile } = useAuth();
  const isSuperadmin = profile?.ruolo === 'superadmin';
  const [filterAzienda, setFilterAzienda] = useState<string>('all');

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

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Risultati Test</h1>
              <p className="text-muted-foreground">Visualizza i profili dei candidati che hanno completato il test</p>
            </div>
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
                      <TableRow key={candidato.id}>
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
      </Layout>
    </ProtectedRoute>
  );
}
