/**
 * ManagementGuideV5 - SEZIONE 9: Come Gestire [Nome]
 * 
 * Testi narrativi per il manager basati sui pattern del profilo.
 * Consigli pratici e operativi per gestire al meglio la persona.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserCog, 
  AlertTriangle, 
  Lightbulb, 
  Clock,
  CheckCircle2,
  XCircle,
  Target
} from "lucide-react";
import { TraitCode } from "@/types/database";
import { 
  getPersonalizedManagementTips, 
  getPersonalizedClosingText 
} from "@/lib/managementTipsV5";

interface ManagementGuideV5Props {
  candidatoNome: string;
  candidatoSesso: string | null;
  traits: Record<TraitCode, number>;
  syndromes?: string[];
}

// Icona per tipo di consiglio
function getTipIcon(tipId: string) {
  if (tipId.startsWith('gp_')) return AlertTriangle;
  if (tipId.includes('alto')) return CheckCircle2;
  if (tipId.includes('basso')) return XCircle;
  return Lightbulb;
}

// Colore per tipo di consiglio
function getTipColor(tipId: string, isPriorityOne?: boolean) {
  if (isPriorityOne) return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
  if (tipId.includes('alto')) return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800';
  if (tipId.includes('basso')) return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
  return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
}

export function ManagementGuideV5({
  candidatoNome,
  candidatoSesso,
  traits,
  syndromes
}: ManagementGuideV5Props) {
  const tips = getPersonalizedManagementTips(traits, candidatoNome, candidatoSesso, syndromes);
  const closingText = getPersonalizedClosingText(candidatoNome, candidatoSesso);
  
  // Separa il tip prioritario (GP < 21) dagli altri
  const priorityTip = tips.find(t => t.tip.isPriorityOne);
  const otherTips = tips.filter(t => !t.tip.isPriorityOne);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          Come Gestire {candidatoNome}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Guida pratica per il manager diretto
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Priorità assoluta se presente */}
        {priorityTip && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <Badge variant="destructive" className="mb-2">
                  PRIORITÀ ASSOLUTA
                </Badge>
                <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                  {priorityTip.testo}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Altri consigli */}
        {otherTips.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Consigli Operativi
            </h4>
            <div className="grid gap-3">
              {otherTips.map(({ tip, testo }) => {
                const Icon = getTipIcon(tip.id);
                const colorClass = getTipColor(tip.id);
                
                return (
                  <div 
                    key={tip.id}
                    className={`p-4 border rounded-lg ${colorClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-background rounded-md flex-shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {testo}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Nessun consiglio specifico */}
        {tips.length === 0 && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {candidatoNome} ha un profilo equilibrato che non richiede attenzioni particolari nella gestione.
              Applica le normali buone pratiche manageriali.
            </p>
          </div>
        )}
        
        {/* Nota finale - sempre presente */}
        <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-background rounded-lg flex-shrink-0">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-1">Nota Importante</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {closingText}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
