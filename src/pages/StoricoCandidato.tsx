/**
 * StoricoCandidato - Pagina per visualizzare l'evoluzione temporale di un candidato
 * Sezione 16.1 del Manuale V5
 * 
 * Nota: Per lo storico è necessario salvare più profili_candidato nel tempo.
 * Attualmente ogni candidato ha un solo profilo. Questa pagina mostra la struttura
 * per future implementazioni con storico assessment multipli.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, History, TrendingUp, TrendingDown, 
  Calendar, Brain, BarChart3, Info, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { TRAIT_LABELS, TraitCode } from '@/types/database';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';

type Candidato = Tables<'candidati'>;
type ProfiloCandidato = Tables<'profili_candidato'>;

type CandidatoWithProfilo = Candidato & {
  profili_candidato: ProfiloCandidato | null;
  aziende: { nome: string } | null;
};

// Solo i 15 tratti V5 (senza CTRL)
const TRAIT_CODES: TraitCode[] = [
  'ORG', 'AUT', 'GP', 'ADS', 'DET', 'VEN', 'HRM', 
  'LDR', 'PRO', 'COM', 'ESP', 'RC', 'FIN', 'SUC', 'PRI'
];

const TRAIT_COLORS: Partial<Record<TraitCode, string>> = {
  ORG: '#3b82f6', AUT: '#10b981', GP: '#f59e0b', ADS: '#8b5cf6', 
  DET: '#ef4444', VEN: '#ec4899', HRM: '#14b8a6', LDR: '#f97316',
  PRO: '#06b6d4', COM: '#84cc16', ESP: '#a855f7', RC: '#6366f1',
  FIN: '#22c55e', SUC: '#eab308', PRI: '#78716c'
};

export default function StoricoCandidato() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch candidato
  const { data: candidato, isLoading } = useQuery({
    queryKey: ['candidato-storico', id],
    queryFn: async () => {
      if (!id) throw new Error('ID non valido');
      const { data, error } = await supabase
        .from('candidati')
        .select('*, aziende(nome), profili_candidato(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CandidatoWithProfilo;
    },
    enabled: !!id,
  });

  const profilo = candidato?.profili_candidato;
  const traits = (profilo?.traits_v5 as Record<string, number>) || {};

  // Simula dati storici per demo (in produzione verranno da DB)
  // TODO: Implementare tabella storico_assessment con FK a candidato
  const hasStorico = false; // In futuro: profili_candidato.length > 1
  
  // Dati mock per visualizzazione (singolo assessment)
  const currentData = profilo ? [{
    date: profilo.updated_at ? format(new Date(profilo.updated_at), 'MMM yyyy', { locale: it }) : 'Attuale',
    ...traits,
    essere: profilo.essere_pct,
    fare: profilo.fare_pct,
    avere: profilo.avere_pct,
  }] : [];

  // Macro aree per grafico
  const macroAreaData = profilo ? [{
    name: profilo.updated_at ? format(new Date(profilo.updated_at), 'dd/MM/yyyy') : 'Attuale',
    ESSERE: profilo.essere_pct ?? 0,
    FARE: profilo.fare_pct ?? 0,
    AVERE: profilo.avere_pct ?? 0,
  }] : [];

  if (isLoading) {
    return (
      <ProtectedRoute>
        <NotionLayout>
          <div className="container max-w-5xl py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </NotionLayout>
      </ProtectedRoute>
    );
  }

  if (!candidato) {
    return (
      <ProtectedRoute>
        <NotionLayout>
          <div className="container max-w-5xl py-6">
            <Alert variant="destructive">
              <AlertTitle>Candidato non trovato</AlertTitle>
              <AlertDescription>
                Il candidato richiesto non esiste o non hai i permessi per visualizzarlo.
              </AlertDescription>
            </Alert>
          </div>
        </NotionLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <NotionLayout>
        <div className="container max-w-5xl py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/candidati/${id}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6" />
                Storico: {candidato.cognome} {candidato.nome}
              </h1>
              <p className="text-muted-foreground text-sm">
                Evoluzione nel tempo dei punteggi V5
              </p>
            </div>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{candidato.cognome} {candidato.nome}</CardTitle>
                  <CardDescription>
                    {candidato.ruolo_attuale || 'N/D'} • {candidato.aziende?.nome || 'N/D'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {candidato.data_test 
                    ? format(new Date(candidato.data_test), 'dd/MM/yyyy', { locale: it })
                    : 'N/D'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Alert: Funzionalità futura */}
          {!hasStorico && (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
              <Info className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800 dark:text-blue-400">
                Storico non disponibile
              </AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Questo candidato ha completato un solo assessment. Lo storico sarà 
                disponibile quando verranno effettuati assessment successivi per 
                monitorare l'evoluzione nel tempo.
              </AlertDescription>
            </Alert>
          )}

          {/* Macro Aree Attuali */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Macro Aree - Snapshot Attuale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={macroAreaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="5 5" label="50%" />
                    <Line type="monotone" dataKey="ESSERE" stroke="#3b82f6" strokeWidth={2} dot={{ r: 6 }} />
                    <Line type="monotone" dataKey="FARE" stroke="#10b981" strokeWidth={2} dot={{ r: 6 }} />
                    <Line type="monotone" dataKey="AVERE" stroke="#f59e0b" strokeWidth={2} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tratti V5 Attuali */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                15 Tratti V5 - Valori Attuali
              </CardTitle>
              <CardDescription>
                Range: -100 (minimo) → +100 (massimo)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TRAIT_CODES.map(code => {
                  const value = traits[code] ?? 0;
                  return (
                    <div key={code} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: TRAIT_COLORS[code] }}
                      />
                      <span className="text-sm font-medium flex-1">
                        {TRAIT_LABELS[code]}
                      </span>
                      <span className={cn(
                        "font-bold",
                        value >= 50 && "text-green-600",
                        value >= 20 && value < 50 && "text-blue-600",
                        value >= 0 && value < 20 && "text-amber-600",
                        value < 0 && "text-red-600"
                      )}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Placeholder per evoluzione futura */}
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Evoluzione nel Tempo</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Quando il candidato completerà assessment successivi, qui comparirà 
                un grafico che mostra l'evoluzione di ogni tratto nel tempo, 
                permettendo di monitorare crescita e cambiamenti.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Miglioramenti</span>
                <Separator orientation="vertical" className="h-4" />
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span>Peggioramenti</span>
              </div>
            </CardContent>
          </Card>

          {/* Azioni */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/candidati/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al Profilo
            </Button>
            <Button variant="outline" onClick={() => navigate('/confronto')}>
              Confronta con Altri
            </Button>
          </div>
        </div>
      </NotionLayout>
    </ProtectedRoute>
  );
}
