import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProfileCircles } from '@/components/ProfileCircles';
import { CandleChart } from '@/components/CandleChart';
import { InterpretazioneDati } from '@/components/InterpretazioneDati';
import { AnalisiPsicologica, AnalisiPsicologicaPlaceholder, AnalisiAI } from '@/components/AnalisiPsicologica';
import { RisposteDettagliate } from '@/components/RisposteDettagliate';
import { FitIndicator } from '@/components/FitIndicator';
import { PDFExportButton } from '@/components/PDFExportButton';
import { StressZoneHero } from '@/components/StressZoneHero';
import { RoleMatchingCard } from '@/components/RoleMatchingCard';
import { ExecutiveSummaryCardV5 } from '@/components/ExecutiveSummaryCardV5';
import { SintesiFinaleCard } from '@/components/SintesiFinaleCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Mail, Phone, Briefcase, Building2, Calendar, 
  Brain, Loader2, AlertTriangle, TrendingUp, TrendingDown, 
  Activity, Target, Shield, Lightbulb, XCircle, CheckCircle2,
  User, HelpCircle, BarChart3, FileText, MessageSquare, Sparkles,
  Award, Clock, Percent, AlertCircle, ClipboardCheck
} from 'lucide-react';
import { Candidato, ProfiloCandidato, ProfiloTipo } from '@/types/database';
import { getProfiloTipoLabel } from '@/lib/scoring';
import { 
  getProfiloDescription, 
  getMacrocategoria, 
  MACROCATEGORIA_INFO,
  ProfiloDescription 
} from '@/lib/profiloDescriptions';
import { calculateStressZoneSeverity, StressZoneSeverity, getStressZoneSeverityLabel } from '@/lib/stressZone';
import { calculateRoleMatching, calculateAllRolesCompatibility, ROLE_PROFILES, getVerdictLabel } from '@/lib/roleMatching';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type CandidatoWithRelations = Candidato & {
  aziende: { nome: string } | null;
  profili_candidato: ProfiloCandidato | null;
};

// Executive Summary Component
function ExecutiveSummaryCard({ 
  verdict, 
  fitScore, 
  probabilitySuccess,
  stressSeverity,
  profiloSintetico 
}: { 
  verdict: 'ASSUMERE' | 'VALUTARE' | 'SCARTARE' | null;
  fitScore: number | null;
  probabilitySuccess: number | null;
  stressSeverity?: StressZoneSeverity;
  profiloSintetico?: string | null;
}) {
  const verdictConfig = {
    ASSUMERE: { color: 'bg-green-100 border-green-500', textColor: 'text-green-700', icon: CheckCircle2, label: 'ASSUMERE' },
    VALUTARE: { color: 'bg-amber-100 border-amber-500', textColor: 'text-amber-700', icon: AlertCircle, label: 'VALUTARE' },
    SCARTARE: { color: 'bg-red-100 border-red-500', textColor: 'text-red-700', icon: XCircle, label: 'SCARTARE' },
  };

  const config = verdict ? verdictConfig[verdict] : null;
  const Icon = config?.icon || HelpCircle;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
      <CardContent className="pt-4 sm:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Verdict principale */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4",
              config?.color || "bg-muted border-muted-foreground/30"
            )}>
              <Icon className={cn("h-8 w-8 sm:h-10 sm:w-10", config?.textColor || "text-muted-foreground")} />
            </div>
            <Badge 
              className={cn(
                "mt-2 sm:mt-3 text-base sm:text-lg px-3 sm:px-4 py-1",
                config?.color,
                config?.textColor
              )}
              variant="outline"
            >
              {config?.label || 'N/D'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Verdetto HR</p>
          </div>

          {/* Metriche */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">FIT Score</span>
                <span className={cn(
                  "text-xl sm:text-2xl font-bold",
                  fitScore && fitScore >= 70 ? "text-green-600" :
                  fitScore && fitScore >= 50 ? "text-amber-600" : "text-red-600"
                )}>
                  {fitScore ?? 'N/D'}%
                </span>
              </div>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Prob. Successo 12m</span>
                <span className={cn(
                  "text-xl sm:text-2xl font-bold",
                  probabilitySuccess && probabilitySuccess >= 70 ? "text-green-600" :
                  probabilitySuccess && probabilitySuccess >= 50 ? "text-amber-600" : "text-red-600"
                )}>
                  {probabilitySuccess ?? 'N/D'}%
                </span>
              </div>
            </div>
            {stressSeverity && stressSeverity !== 'nessuna' && (
              <div className="p-2 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-destructive">Stress Zone</span>
                  <Badge variant="destructive" className="text-xs sm:text-sm">
                    {getStressZoneSeverityLabel(stressSeverity).toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Profilo Sintetico */}
          <div className="flex flex-col">
            <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">Profilo Sintetico</h4>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed line-clamp-5">
              {profiloSintetico || 'Analisi AI non ancora generata.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to map fit verdict to executive verdict
function mapFitVerdictToExecutive(fitVerdict?: string | null): 'ASSUMERE' | 'VALUTARE' | 'SCARTARE' | null {
  if (!fitVerdict) return null;
  switch (fitVerdict) {
    case 'IDONEO': return 'ASSUMERE';
    case 'NON_IDONEO': return 'SCARTARE';
    case 'VALUTARE': return 'VALUTARE';
    default: return null;
  }
}

export default function CandidatoDettaglio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch candidato data
  const { data: candidato, isLoading } = useQuery({
    queryKey: ['candidato-dettaglio', id],
    queryFn: async () => {
      if (!id) throw new Error('ID non valido');
      const { data, error } = await supabase
        .from('candidati')
        .select('*, aziende(nome), profili_candidato(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CandidatoWithRelations;
    },
    enabled: !!id,
  });

  // Fetch analisi AI
  const { data: analisi, isLoading: isLoadingAnalisi } = useQuery({
    queryKey: ['analisi-candidato', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('analisi_candidato')
        .select('*')
        .eq('candidato_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!candidato?.test_completato,
  });

  // Mutation per generare analisi
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Non autenticato');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-candidate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ candidato_id: id }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore nella generazione');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analisi-candidato', id] });
      toast({ title: 'Analisi generata', description: 'L\'analisi AI è stata completata' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
        <NotionLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </NotionLayout>
      </ProtectedRoute>
    );
  }

  if (!candidato) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
        <NotionLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Candidato non trovato</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/candidati')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna ai Candidati
            </Button>
          </div>
        </NotionLayout>
      </ProtectedRoute>
    );
  }

  const profilo = candidato.profili_candidato;
  const scalePunteggi = (profilo?.scale_punteggi as Record<string, number>) || {};
  const outPoints = (profilo?.out_points as string[]) || [];
  const strengthPoints = (profilo?.strength_points as string[]) || [];
  const stressZone = profilo?.stress_zone || false;
  const schematicita = profilo?.schematicita || 100;
  
  // Calcolo severità Stress Zone con valori reali (fallback a 0 per mostrare dati mancanti)
  const sv = scalePunteggi['SV'];
  const cf = scalePunteggi['CF'];
  const hasValidStressData = sv !== undefined && cf !== undefined;
  // Fallback a 0 invece di 100: se dati mancano, StressZoneHero mostrerà "Dati non disponibili"
  const effectiveSV = sv ?? 0;
  const effectiveCF = cf ?? 0;
  const stressZoneSeverity = hasValidStressData 
    ? calculateStressZoneSeverity(sv, cf)
    : calculateStressZoneSeverity(0, 0); // Questo attiverà il check "dati non disponibili" nel componente
  
  // Usa il profilo dal DB, non ricalcolarlo
  const profiloTipo = (profilo?.profilo_tipo as ProfiloTipo) || null;
  const profiloInfo = getProfiloDescription(profiloTipo);
  const macrocategoria = getMacrocategoria(profiloTipo);
  const macroInfo = MACROCATEGORIA_INFO[macrocategoria];

  // Trasforma analisi DB in formato componente
  const analisiFormatted: AnalisiAI | null = analisi ? {
    profilo_sintetico: analisi.profilo_sintetico || '',
    punti_forza: (analisi.punti_forza as string[]) || [],
    punti_debolezza: (analisi.punti_debolezza as string[]) || [],
    rischi_operativi: analisi.rischi_operativi || '',
    fit_score: analisi.fit_score || 0,
    fit_verdict: (analisi.fit_verdict as 'NON_IDONEO' | 'VALUTARE' | 'IDONEO') || 'VALUTARE',
    fit_motivo: analisi.fit_motivo || '',
    raccomandazione: (analisi.raccomandazione as any) || {
      decisione: 'VALUTARE',
      motivo_principale: '',
      rischio_aziendale: '',
      tempo_onboarding: '',
      probabilita_successo_12m: 0,
    },
    domande_colloquio: (analisi as any).domande_colloquio || [],
    stress_zone_severity: (analisi as any).stress_zone_severity || undefined,
    stress_zone_analisi: (analisi as any).stress_zone_analisi || undefined,
  } : null;

  const probabilitaSuccesso = analisiFormatted?.raccomandazione?.probabilita_successo_12m || 0;

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <NotionLayout>
        <div className="space-y-6 pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/candidati')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {candidato.cognome} {candidato.nome}
                  </h1>
                  <p className="text-muted-foreground">{candidato.aziende?.nome}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profilo && (
                <PDFExportButton 
                  targetRef={reportRef} 
                  fileName={`${candidato.cognome}_${candidato.nome}`}
                />
              )}
              {analisi?.fit_verdict && (
                <FitIndicator verdict={analisi.fit_verdict as any} size="lg" showLabel />
              )}
            </div>
          </div>

          {/* Info candidato */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 text-sm">
                {candidato.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{candidato.email}</span>
                  </div>
                )}
                {candidato.telefono && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{candidato.telefono}</span>
                  </div>
                )}
                {candidato.ruolo_attuale && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{candidato.ruolo_attuale}</span>
                  </div>
                )}
                {candidato.funzione && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{candidato.funzione}</span>
                  </div>
                )}
                {candidato.eta && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{candidato.eta} anni</span>
                  </div>
                )}
                {candidato.data_test && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Test: {format(new Date(candidato.data_test), 'dd/MM/yyyy', { locale: it })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {profilo ? (
            <div ref={reportRef} className="space-y-6 bg-background">
              {/* Executive Summary V5 - DETERMINISTICO */}
              <ExecutiveSummaryCardV5
                scalePunteggi={scalePunteggi}
                ruoloRichiesto={candidato.funzione || 'Ufficio vendite'}
                profiloTipo={profiloTipo}
                eta={candidato.eta}
                stressZone={stressZone}
              />

              {/* TABS per organizzare i contenuti */}
        <Tabs defaultValue="matching" className="w-full">
          <TabsList className="flex overflow-x-auto scrollbar-hide mb-4 sm:mb-6 w-full">
            <TabsTrigger value="matching" className="flex-1 min-w-[60px] text-xs sm:text-sm px-2 sm:px-4 gap-1">
              <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Match</span>
            </TabsTrigger>
            <TabsTrigger value="analisi" className="flex-1 min-w-[60px] text-xs sm:text-sm px-2 sm:px-4 gap-1">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Dati</span>
            </TabsTrigger>
            <TabsTrigger value="interpretazione" className="flex-1 min-w-[60px] text-xs sm:text-sm px-2 sm:px-4 gap-1">
              <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Interp</span>
            </TabsTrigger>
            <TabsTrigger value="profilo" className="flex-1 min-w-[60px] text-xs sm:text-sm px-2 sm:px-4 gap-1">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Profilo</span>
            </TabsTrigger>
            <TabsTrigger value="colloquio" className="flex-1 min-w-[60px] text-xs sm:text-sm px-2 sm:px-4 gap-1">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Coll</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 min-w-[60px] text-xs sm:text-sm px-2 sm:px-4 gap-1">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">AI</span>
            </TabsTrigger>
            <TabsTrigger value="risposte" className="flex-1 min-w-[60px] text-xs sm:text-sm px-2 sm:px-4 gap-1">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-sm">Risp</span>
            </TabsTrigger>
          </TabsList>
          
                {/* TAB: Matching Ruolo (NUOVO V5) */}
                <TabsContent value="matching" className="mt-6 space-y-6">
                  <RoleMatchingCard
                    ruoloRichiesto={candidato.funzione || 'Ufficio vendite'}
                    scalePunteggi={scalePunteggi}
                    profiloTipo={profiloTipo}
                    showFullDetails={true}
                    showNarrativeSections={true}
                  />
                  
                  {/* Sintesi Finale */}
                  <SintesiFinaleCard
                    candidatoNome={candidato.nome}
                    candidatoCognome={candidato.cognome}
                    eta={candidato.eta}
                    ruoloRichiesto={candidato.funzione || 'Ufficio vendite'}
                    profiloTipo={profiloTipo}
                    scalePunteggi={scalePunteggi}
                    stressZone={stressZone}
                  />
                </TabsContent>
                {/* TAB: Analisi Dati */}
                <TabsContent value="analisi" className="space-y-6 mt-6">
                  {/* I 3 Cerchi con tooltip esplicativo */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-semibold">Indicatori Principali</h2>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>
                              Le percentuali rappresentano il rapporto tra i punteggi ottenuti 
                              e il massimo potenziale (600 punti per area). Sono indipendenti 
                              dal grafico a candele che mostra lo scostamento dalla media (100).
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <ProfileCircles
                      leadership_pct={profilo.leadership_pct || 0}
                      maturita_pct={profilo.maturita_pct || 0}
                      potenziale_pct={profilo.potenziale_pct || 0}
                      scale_punteggi={scalePunteggi}
                    />
                  </div>

                  {/* Stress Zone Hero - UNICA rappresentazione con valori centralizzati */}
                  <StressZoneHero
                    sv={effectiveSV}
                    cf={effectiveCF}
                    severity={stressZoneSeverity}
                  />

                  {/* KPI Cards - senza Stress Zone duplicata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Activity className="h-4 w-4" />
                          <span className="text-xs font-medium">Schematicità</span>
                        </div>
                        <p className="text-2xl font-bold">{schematicita}</p>
                        <p className="text-xs text-muted-foreground">
                          {schematicita < 100 ? 'Flessibile' : 
                           schematicita > 140 ? 'Rigido' : 'Equilibrato'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs font-medium">Punti Forza</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{strengthPoints.length}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {strengthPoints.length > 0 ? strengthPoints[0] : 'Nessuno'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-destructive mb-1">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-xs font-medium">Aree Critiche</span>
                        </div>
                        <p className="text-2xl font-bold text-destructive">{outPoints.length}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {outPoints.length > 0 ? outPoints[0] : 'Nessuna'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Candle Chart */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle>Profilo Competenze</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>
                                Questo grafico mostra lo scostamento dalla media (100) per ogni macro-area.
                                Valori positivi (blu) indicano punti di forza, negativi (arancione) aree di miglioramento.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CandleChart scalePunteggi={scalePunteggi} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: Interpretazione */}
                <TabsContent value="interpretazione" className="mt-6">
                  <InterpretazioneDati
                    scalePunteggi={scalePunteggi}
                    schematicita={schematicita}
                    stressZone={stressZone}
                    stressZoneSeverity={stressZoneSeverity}
                    outPoints={outPoints}
                    strengthPoints={strengthPoints}
                    profiloTipo={profiloTipo || undefined}
                    showStressZoneHero={false}
                  />
                </TabsContent>

                {/* TAB: Profilo */}
                <TabsContent value="profilo" className="mt-6">
                  <Card className={cn("border-2", profiloInfo.colorBg)}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Badge className={macroInfo.colore}>
                            {macroInfo.label}
                          </Badge>
                          <CardTitle className="flex items-center gap-2">
                            <span className={profiloInfo.colorText}>{profiloInfo.label}</span>
                          </CardTitle>
                        </div>
                        <p className="text-lg italic text-muted-foreground">"{profiloInfo.motto}"</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-muted-foreground">{profiloInfo.descrizione_breve}</p>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Cosa vuole */}
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Cosa Vuole
                          </h4>
                          <ul className="space-y-1">
                            {profiloInfo.cosa_vuole.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Paura principale */}
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4 text-destructive" />
                            Paura Principale
                          </h4>
                          <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-lg">
                            {profiloInfo.paura_principale}
                          </p>
                        </div>

                        {/* Come gestirlo */}
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Come Gestirlo in Azienda
                          </h4>
                          <ul className="space-y-1">
                            {profiloInfo.come_gestirlo.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Errori da evitare */}
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            Errori da Evitare
                          </h4>
                          <ul className="space-y-1">
                            {profiloInfo.errori_da_evitare.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-destructive shrink-0 mt-1.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Ruoli ideali */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Ruoli Ideali</h4>
                        <div className="flex flex-wrap gap-2">
                          {profiloInfo.ruoli_ideali.map((ruolo, idx) => (
                            <Badge key={idx} variant="outline" className={profiloInfo.colorText}>
                              {ruolo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: Colloquio */}
                <TabsContent value="colloquio" className="mt-6">
                  <InterpretazioneDati
                    scalePunteggi={scalePunteggi}
                    schematicita={schematicita}
                    stressZone={stressZone}
                    stressZoneSeverity={stressZoneSeverity}
                    outPoints={outPoints}
                    strengthPoints={strengthPoints}
                    profiloTipo={profiloTipo || undefined}
                    showOnlyColloquio={true}
                  />
                </TabsContent>

                {/* TAB: AI Insights (Opzionale) */}
                <TabsContent value="ai" className="mt-6">
                  <Card className="border-2 border-dashed border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI Insights
                            <Badge variant="secondary" className="text-xs">Opzionale</Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Arricchimenti personalizzati aggiuntivi
                          </p>
                        </div>
                        <Button
                          variant={analisi ? "outline" : "default"}
                          size="sm"
                          onClick={() => generateMutation.mutate()}
                          disabled={generateMutation.isPending}
                          className="gap-2"
                        >
                          {generateMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              {analisi ? 'Rigenera' : 'Genera AI Insights'}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingAnalisi ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : analisiFormatted ? (
                        <AnalisiPsicologica analisi={analisiFormatted} candidatoNome={`${candidato.nome} ${candidato.cognome}`} />
                      ) : (
                        <AnalisiPsicologicaPlaceholder />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: Risposte Dettagliate */}
                <TabsContent value="risposte" className="space-y-6 mt-6">
                  <RisposteDettagliate candidatoId={id!} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Test non completato</h3>
                <p className="text-muted-foreground">
                  Il candidato non ha ancora completato il questionario psicologico.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </NotionLayout>
    </ProtectedRoute>
  );
}
