import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RisposteDettagliate } from '@/components/RisposteDettagliate';
import { PDFExportButton, PDFReportButton, PDFSyndromeReportButton, InterviewSheetPDFButton } from '@/components/PDFExportButton';
import { ManagementGuideV5 } from '@/components/ManagementGuideV5';
import { ActionPlanCardV5 } from '@/components/ActionPlanCardV5';
import { HeroCardV3 } from '@/components/HeroCardV3';
import { AlertBannerV3 } from '@/components/AlertBannerV3';
import { CompatibilitaTabV3 } from '@/components/CompatibilitaTabV3';
import { ProfiloTabV3 } from '@/components/ProfiloTabV3';
import { InterpretazioneDati } from '@/components/InterpretazioneDati';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Mail, Phone, Briefcase, Building2, Calendar,
  Brain, Loader2, User, Target, BookOpen, UserCog, MessageSquare,
  MoreHorizontal, FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Candidato, ProfiloCandidato, ProfiloTipo, ProfiloTipoV5, ReliabilityIndex, TraitCode } from '@/types/database';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';
import { calculateRoleMatchingV5Cached } from '@/lib/roleMatchingV5Cache';
import { mapFunzioneToRuoloV5 } from '@/lib/roleMatchingV5';
import { getActiveSyndromes, SyndromeResult, TraitScores } from '@/lib/syndromes';
import { calculateStressZoneSeverity } from '@/lib/stressZone';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type CandidatoWithRelations = Candidato & {
  aziende: { nome: string } | null;
  profili_candidato: ProfiloCandidato | null;
};

export default function CandidatoDettaglio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reportRef = useRef<HTMLDivElement>(null);
  const [showRisposte, setShowRisposte] = useState(false);

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

  // Extract data before any conditional returns
  const profilo = candidato?.profili_candidato;
  const scalePunteggi = (profilo?.scale_punteggi as Record<string, number>) || {};
  const stressZone = profilo?.stress_zone || false;
  const schematicita = profilo?.schematicita || 100;

  // V5 Data
  const assessmentVersion = (profilo as any)?.assessment_version as 'v4' | 'v5' | undefined || 'v4';
  const isV5 = assessmentVersion === 'v5';
  const traitsV5 = (profilo as any)?.traits_v5 as Record<string, number> | undefined;
  const esserePct = (profilo as any)?.essere_pct as number | undefined;
  const farePct = (profilo as any)?.fare_pct as number | undefined;
  const averePct = (profilo as any)?.avere_pct as number | undefined;
  const profiloTipoV5 = (profilo as any)?.profilo_tipo_v5 as ProfiloTipoV5 | undefined;
  const reliabilityIndex = (profilo as any)?.reliability_index as ReliabilityIndex | undefined;
  const syndromesFromDB = (profilo as any)?.syndromes_detected as SyndromeResult[] | undefined;
  const profiloTipo = (profilo?.profilo_tipo as ProfiloTipo) || null;

  // Calculate syndromes
  const syndromes = useMemo(() => {
    if (!isV5 || !traitsV5) return [];
    if (syndromesFromDB && syndromesFromDB.length > 0) return syndromesFromDB;
    const traitScores: TraitScores = {
      ORG: traitsV5.ORG ?? 0, AUT: traitsV5.AUT ?? 0, GP: traitsV5.GP ?? 0,
      ADS: traitsV5.ADS ?? 0, DET: traitsV5.DET ?? 0, VEN: traitsV5.VEN ?? 0,
      HRM: traitsV5.HRM ?? 0, LDR: traitsV5.LDR ?? 0, PRO: traitsV5.PRO ?? 0,
      COM: traitsV5.COM ?? 0, ESP: traitsV5.ESP ?? 0, RC: traitsV5.RC ?? 0,
      FIN: traitsV5.FIN ?? 0, SUC: traitsV5.SUC ?? 0, PRI: traitsV5.PRI ?? 0,
    };
    return getActiveSyndromes(traitScores, candidato?.eta ?? undefined);
  }, [isV5, traitsV5, syndromesFromDB, candidato?.eta]);

  // Stress zone (legacy, needed for colloquio)
  const sv = scalePunteggi['SV'];
  const cf = scalePunteggi['CF'];
  const hasValidStressData = sv !== undefined && cf !== undefined;
  const stressZoneSeverity = hasValidStressData
    ? calculateStressZoneSeverity(sv, cf)
    : calculateStressZoneSeverity(0, 0);

  const ruoloRichiesto = mapFunzioneToRuoloV5(candidato?.funzione || 'Venditore/Commerciale');

  // Loading
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

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'azienda']}>
      <NotionLayout>
        <div className="space-y-4 pb-24 md:pb-8">
          {/* HEADER compatto */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/candidati')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {candidato.cognome} {candidato.nome}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mt-0.5">
                {candidato.aziende?.nome && <span>{candidato.aziende.nome}</span>}
                {candidato.funzione && (
                  <>
                    <span>•</span>
                    <span>{candidato.funzione}</span>
                  </>
                )}
                {candidato.eta && (
                  <>
                    <span>•</span>
                    <span>{candidato.eta} anni</span>
                  </>
                )}
                {candidato.data_test && (
                  <>
                    <span>•</span>
                    <span>{format(new Date(candidato.data_test), 'dd/MM/yyyy', { locale: it })}</span>
                  </>
                )}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {profilo && (
                <>
                  <PDFReportButton
                    candidatoNome={candidato.nome}
                    candidatoCognome={candidato.cognome}
                    eta={candidato.eta}
                    email={candidato.email}
                    telefono={candidato.telefono}
                    azienda={candidato.aziende?.nome}
                    ruoloRichiesto={ruoloRichiesto}
                    profiloTipo={profiloTipo}
                    scalePunteggi={scalePunteggi}
                    stressZone={stressZone}
                    dataTest={candidato.data_test}
                    schematicita={profilo?.schematicita ?? 100}
                  />
                  {isV5 && syndromes.length > 0 && (
                    <PDFSyndromeReportButton
                      candidatoNome={candidato.nome}
                      candidatoCognome={candidato.cognome}
                      azienda={candidato.aziende?.nome}
                      ruoloRichiesto={candidato.funzione || undefined}
                      dataTest={candidato.data_test}
                      syndromes={syndromes}
                    />
                  )}
                  {isV5 && traitsV5 && profiloTipoV5 && reliabilityIndex && (
                    <InterviewSheetPDFButton
                      candidato={{
                        nome: candidato.nome,
                        cognome: candidato.cognome,
                        sesso: candidato.sesso,
                        ruolo_attuale: candidato.ruolo_attuale,
                        data_test: candidato.data_test,
                        funzione: candidato.funzione,
                      }}
                      traits={traitsV5 as Record<TraitCode, number>}
                      macroAreas={{
                        essere: esserePct || 0,
                        fare: farePct || 0,
                        avere: averePct || 0,
                      }}
                      profiloTipo={profiloTipoV5}
                      reliabilityIndex={reliabilityIndex}
                      syndromes={syndromes}
                      roleMatch={calculateRoleMatchingV5Cached(
                        ruoloRichiesto,
                        traitsV5 as Record<TraitCode, number> as any,
                        candidato.eta ?? undefined
                      )}
                    />
                  )}
                  {/* More menu (Risposte) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowRisposte(!showRisposte)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {showRisposte ? 'Nascondi Risposte' : 'Mostra Risposte Dettagliate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <PDFExportButton
                    targetRef={reportRef}
                    fileName={`${candidato.cognome}_${candidato.nome}`}
                    className="hidden sm:flex"
                  />
                </>
              )}
            </div>
          </div>

          {profilo ? (
            <div ref={reportRef} className="space-y-4 bg-background">
              {/* HERO CARD */}
              {isV5 && traitsV5 && (
                <HeroCardV3
                  traitsV5={traitsV5}
                  esserePct={esserePct}
                  farePct={farePct}
                  averePct={averePct}
                  profiloTipoV5={profiloTipoV5}
                  ruoloRichiesto={ruoloRichiesto}
                  candidatoNome={candidato.nome}
                  candidatoSesso={candidato.sesso}
                  eta={candidato.eta}
                />
              )}

              {/* ALERT BANNER */}
              {isV5 && traitsV5 && (
                <AlertBannerV3
                  candidatoNome={candidato.nome}
                  syndromes={syndromes}
                  gpValue={traitsV5.GP}
                  reliabilityIndex={reliabilityIndex}
                  rcValue={traitsV5.RC}
                />
              )}

              {/* 4 TAB */}
              <Tabs defaultValue="compatibilita" className="w-full">
                <TabsList className="flex w-full mb-4">
                  <TabsTrigger value="compatibilita" className="flex-1 gap-1.5 text-xs sm:text-sm">
                    <Target className="h-4 w-4" />
                    <span>Compatibilità</span>
                  </TabsTrigger>
                  <TabsTrigger value="profilo" className="flex-1 gap-1.5 text-xs sm:text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>Profilo</span>
                  </TabsTrigger>
                  <TabsTrigger value="gestione" className="flex-1 gap-1.5 text-xs sm:text-sm">
                    <UserCog className="h-4 w-4" />
                    <span>Gestione</span>
                  </TabsTrigger>
                  <TabsTrigger value="colloquio" className="flex-1 gap-1.5 text-xs sm:text-sm">
                    <MessageSquare className="h-4 w-4" />
                    <span>Colloquio</span>
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: Compatibilità */}
                <TabsContent value="compatibilita" className="mt-4 space-y-6">
                  {isV5 && traitsV5 ? (
                    <CompatibilitaTabV3
                      traitsV5={traitsV5}
                      ruoloRichiesto={ruoloRichiesto}
                      candidatoNome={candidato.nome}
                      candidatoSesso={candidato.sesso}
                      candidateAge={candidato.eta ?? undefined}
                      syndromes={syndromes}
                      reliabilityIndex={reliabilityIndex}
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Dati V5 non disponibili per questo candidato.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* TAB 2: Profilo */}
                <TabsContent value="profilo" className="mt-4 space-y-6">
                  {isV5 && traitsV5 ? (
                    <ProfiloTabV3
                      candidatoNome={candidato.nome}
                      candidatoSesso={candidato.sesso}
                      traits={traitsV5 as Record<TraitCode, number>}
                      macroAree={{
                        essere: esserePct || 0,
                        fare: farePct || 0,
                        avere: averePct || 0,
                      }}
                      profiloTipoV5={profiloTipoV5}
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Dati V5 non disponibili per questo candidato.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* TAB 3: Gestione */}
                <TabsContent value="gestione" className="mt-4 space-y-6">
                  {isV5 && traitsV5 ? (
                    <>
                      <ManagementGuideV5
                        candidatoNome={candidato.nome}
                        candidatoSesso={candidato.sesso}
                        traits={traitsV5 as Record<TraitCode, number>}
                        syndromes={syndromes.map(s => s.code)}
                      />
                      <ActionPlanCardV5
                        candidatoNome={candidato.nome}
                        sesso={candidato.sesso}
                        traits={traitsV5 as Record<TraitCode, number>}
                        syndromes={syndromes}
                        reliabilityIndex={reliabilityIndex || 'CAUTION'}
                      />
                    </>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Dati V5 non disponibili per questo candidato.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* TAB 4: Colloquio */}
                <TabsContent value="colloquio" className="mt-4 space-y-6">
                  <InterpretazioneDati
                    scalePunteggi={scalePunteggi}
                    schematicita={schematicita}
                    stressZone={stressZone}
                    stressZoneSeverity={stressZoneSeverity}
                    outPoints={(profilo?.out_points as string[]) || []}
                    strengthPoints={(profilo?.strength_points as string[]) || []}
                    profiloTipo={profiloTipo || undefined}
                    showOnlyColloquio={true}
                  />
                </TabsContent>
              </Tabs>

              {/* Risposte Dettagliate (hidden by default, toggle via menu) */}
              {showRisposte && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Risposte Dettagliate</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowRisposte(false)}>
                      Chiudi
                    </Button>
                  </div>
                  <RisposteDettagliate candidatoId={id!} />
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Test non completato</h3>
                <p className="text-muted-foreground">
                  Il candidato non ha ancora completato il questionario.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile fixed back button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-40">
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium"
            onClick={() => navigate('/candidati')}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna alla lista candidati
          </Button>
        </div>
      </NotionLayout>
    </ProtectedRoute>
  );
}
