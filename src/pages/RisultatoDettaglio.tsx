import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RadarChart } from '@/components/RadarChart';
import { ProfiloCard } from '@/components/ProfiloCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { Candidato, ProfiloCandidato, SCALE_LABELS, ScalaCode, ProfiloTipo } from '@/types/database';
import { getScoreColorClass } from '@/lib/scoring';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function RisultatoDettaglio() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['risultato-dettaglio', id],
    queryFn: async () => {
      if (!id) throw new Error('ID non valido');

      const { data: candidato, error: candidatoError } = await supabase
        .from('candidati')
        .select(`
          *,
          aziende(nome),
          profili_candidato(*)
        `)
        .eq('id', id)
        .single();

      if (candidatoError) throw candidatoError;

      return candidato as Candidato & {
        aziende: { nome: string } | null;
        profili_candidato: ProfiloCandidato | null;
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !data) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
        <Layout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Errore nel caricamento del risultato</p>
            <Link to="/risultati">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna ai Risultati
              </Button>
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const profilo = data.profili_candidato;
  const scalePunteggi = (profilo?.scale_punteggi as Record<string, number>) || {};
  const outPoints = (profilo?.out_points as string[]) || [];
  const strengthPoints = (profilo?.strength_points as string[]) || [];

  const orderedScales: ScalaCode[] = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA', 'SC'];

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to="/risultati">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {data.cognome} {data.nome}
              </h1>
              <p className="text-muted-foreground">{data.aziende?.nome}</p>
            </div>
          </div>

          {/* Candidate Info */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{data.email || 'N/A'}</span>
                </div>
                {data.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{data.telefono}</span>
                  </div>
                )}
                {data.ruolo_attuale && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{data.ruolo_attuale}</span>
                  </div>
                )}
                {data.data_test && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Test: {format(new Date(data.data_test), 'dd MMMM yyyy', { locale: it })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {profilo ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Profilo Grafico</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadarChart punteggi={scalePunteggi} />
                </CardContent>
              </Card>

              {/* Profile Summary */}
              <ProfiloCard
                leadership_pct={profilo.leadership_pct || 0}
                maturita_pct={profilo.maturita_pct || 0}
                potenziale_pct={profilo.potenziale_pct || 0}
                profilo_tipo={(profilo.profilo_tipo as ProfiloTipo) || 'EXECUTOR'}
                stress_zone={profilo.stress_zone || false}
                schematicita={profilo.schematicita || 100}
                out_points={outPoints}
                strength_points={strengthPoints}
              />

              {/* Scale Details Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Dettaglio Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scala</TableHead>
                        <TableHead>Codice</TableHead>
                        <TableHead className="text-right">Punteggio</TableHead>
                        <TableHead className="text-right">Interpretazione</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderedScales.map((scala) => {
                        const punteggio = scalePunteggi[scala] || 100;
                        let interpretation = 'Nella norma';
                        if (punteggio < 80) interpretation = 'Area critica';
                        else if (punteggio < 120) interpretation = 'Sotto la media';
                        else if (punteggio > 160) interpretation = 'Punto di forza';
                        else if (punteggio > 140) interpretation = 'Sopra la media';

                        return (
                          <TableRow key={scala}>
                            <TableCell className="font-medium">
                              {SCALE_LABELS[scala]}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{scala}</Badge>
                            </TableCell>
                            <TableCell className={`text-right font-bold ${getScoreColorClass(punteggio)}`}>
                              {punteggio}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {interpretation}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Il profilo del candidato non è ancora disponibile.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
