import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, TrendingUp, Users, Target, RefreshCw, ChevronDown, MessageSquare } from 'lucide-react';
import { 
  generateInterpretazione, 
  calculateSecondaryIndices,
  InterpretazioneItem 
} from '@/lib/interpretazioneProfile';
import { 
  StressZoneSeverity, 
  calculateStressZoneSeverity,
  getStressZoneSeverityColor,
  getStressZoneText,
  getStressZoneSeverityLabel
} from '@/lib/stressZone';
import { getScaleRangeText } from '@/lib/scaleTexts';
import { generateColloquioQuestions, ColloquioArea } from '@/lib/colloquioQuestions';
import { StressZoneHero } from '@/components/StressZoneHero';
import { cn } from '@/lib/utils';
import { ScalaCode, SCALE_LABELS } from '@/types/database';

interface InterpretazioneDatiProps {
  scalePunteggi: Record<string, number>;
  schematicita: number;
  stressZone: boolean;
  stressZoneSeverity?: StressZoneSeverity;
  outPoints: string[];
  strengthPoints: string[];
  profiloTipo?: string;
}

function InterpretazioneCard({ item }: { item: InterpretazioneItem }) {
  const icons = {
    critico: <AlertTriangle className="h-4 w-4" />,
    attenzione: <AlertCircle className="h-4 w-4" />,
    forza: <CheckCircle2 className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />
  };

  const colors = {
    critico: 'border-destructive bg-destructive/5',
    attenzione: 'border-amber-500 bg-amber-50',
    forza: 'border-green-500 bg-green-50',
    info: 'border-blue-500 bg-blue-50'
  };

  const textColors = {
    critico: 'text-destructive',
    attenzione: 'text-amber-700',
    forza: 'text-green-700',
    info: 'text-blue-700'
  };

  return (
    <div className={cn("border-l-4 p-4 rounded-r-lg", colors[item.tipo])}>
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5", textColors[item.tipo])}>
          {icons[item.tipo]}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn("font-semibold", textColors[item.tipo])}>
              {item.titolo}
            </h4>
            {item.valore > 0 && (
              <Badge variant="outline" className="text-xs">
                {item.valore}/200
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {item.descrizione}
          </p>
        </div>
      </div>
    </div>
  );
}

function IndiceSecondario({ 
  label, 
  value, 
  icon: Icon,
  description 
}: { 
  label: string; 
  value: number; 
  icon: React.ElementType;
  description: string;
}) {
  const normalizedValue = ((value - 0) / 200) * 100;
  const isLow = value < 80;
  const isHigh = value > 140;

  return (
    <div className="space-y-2 p-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <Progress 
          value={normalizedValue} 
          className={cn(
            "h-2 flex-1",
            isLow && "[&>div]:bg-destructive",
            isHigh && "[&>div]:bg-green-500"
          )} 
        />
        <span className={cn(
          "text-lg font-bold w-12 text-right",
          isLow && "text-destructive",
          isHigh && "text-green-600"
        )}>
          {value}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ColloquioQuestionCard({ area }: { area: ColloquioArea }) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "border-l-4 p-4 rounded-r-lg flex items-center justify-between hover:bg-muted/50 transition-colors",
          area.priorita === 'alta' ? "border-destructive bg-destructive/5" : 
          area.priorita === 'media' ? "border-amber-500 bg-amber-50" : 
          "border-blue-500 bg-blue-50"
        )}>
          <div className="flex items-center gap-3 text-left">
            <Badge variant={area.priorita === 'alta' ? 'destructive' : 'secondary'} className="text-xs">
              {area.priorita.toUpperCase()}
            </Badge>
            <span className="font-semibold text-sm">{area.area}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{area.domande.length} domande</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 bg-muted/20 rounded-b-lg space-y-3">
          <p className="text-xs text-muted-foreground italic">{area.motivazione}</p>
          <ul className="space-y-2">
            {area.domande.map((domanda, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2 bg-background p-2 rounded">
                <span className="text-primary font-bold">{idx + 1}.</span>
                <span className="text-foreground">"{domanda}"</span>
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ScaleInterpretationCard({ scala, valore }: { scala: ScalaCode; valore: number }) {
  const info = getScaleRangeText(scala, valore);
  
  const getZonaColor = (livello: string) => {
    switch (livello) {
      case 'Critico': return 'bg-destructive text-destructive-foreground';
      case 'Carenza Significativa': return 'bg-red-500 text-white';
      case 'Sotto la Media': return 'bg-amber-500 text-white';
      case 'Nella Norma': return 'bg-muted text-muted-foreground';
      case 'Sopra la Media': return 'bg-blue-500 text-white';
      case 'Eccellenza': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded transition-colors">
        <div className="flex items-center gap-3">
          <Badge className={cn("text-xs", getZonaColor(info.livello))}>{info.livello}</Badge>
          <span className="font-medium text-sm">{SCALE_LABELS[scala]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold",
            valore < 60 ? "text-destructive" :
            valore < 80 ? "text-amber-600" :
            valore > 160 ? "text-green-600" :
            valore > 140 ? "text-blue-600" : "text-muted-foreground"
          )}>
            {valore}/200
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-muted/30 rounded mt-1 space-y-2">
        <p className="text-sm">{info.testo}</p>
        {info.implicazioni && (
          <p className="text-xs text-muted-foreground italic">{info.implicazioni}</p>
        )}
        {info.domande_colloquio.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Domande suggerite:</p>
            <ul className="space-y-1">
              {info.domande_colloquio.slice(0, 2).map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function InterpretazioneDati({
  scalePunteggi,
  schematicita,
  stressZone,
  stressZoneSeverity: propSeverity,
  outPoints,
  strengthPoints,
  profiloTipo
}: InterpretazioneDatiProps) {
  // Calcola la severità se non fornita
  const stressZoneSeverity = propSeverity || calculateStressZoneSeverity(
    scalePunteggi['SV'] || 100,
    scalePunteggi['CF'] || 100
  );

  const interpretazioni = generateInterpretazione(
    scalePunteggi,
    schematicita,
    stressZone,
    outPoints,
    strengthPoints,
    stressZoneSeverity
  );

  const indici = calculateSecondaryIndices(scalePunteggi);
  
  // Genera domande per il colloquio
  const colloquioQuestions = generateColloquioQuestions(
    scalePunteggi,
    stressZoneSeverity,
    profiloTipo || ''
  );

  const critici = interpretazioni.filter(i => i.tipo === 'critico');
  const attenzione = interpretazioni.filter(i => i.tipo === 'attenzione');
  const forze = interpretazioni.filter(i => i.tipo === 'forza');
  const info = interpretazioni.filter(i => i.tipo === 'info');

  // Scale da mostrare nell'interpretazione dettagliata
  const scaleToShow: ScalaCode[] = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA'];

  return (
    <div className="space-y-6">
      {/* Stress Zone Hero - Nuovo componente prominente */}
      <StressZoneHero
        sv={scalePunteggi['SV'] || 100}
        cf={scalePunteggi['CF'] || 100}
        severity={stressZoneSeverity}
      />

      {/* Indici Secondari */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Indici Sintetici</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <IndiceSecondario
              label="Leadership Naturale"
              value={indici.leadershipNaturale}
              icon={TrendingUp}
              description="Capacità di guidare e influenzare"
            />
            <IndiceSecondario
              label="Worker Index"
              value={indici.workerIndex}
              icon={Target}
              description="Produttività e orientamento al risultato"
            />
            <IndiceSecondario
              label="Attitudine Vendita"
              value={indici.attitudineVendita}
              icon={Users}
              description="Propensione commerciale e relazionale"
            />
            <IndiceSecondario
              label="Flessibilità al Cambiamento"
              value={indici.flessibilitaCambiamento}
              icon={RefreshCw}
              description="Capacità di adattarsi (alto = flessibile)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Domande Suggerite per il Colloquio */}
      {colloquioQuestions.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-primary" />
              Domande Suggerite per il Colloquio
              <Badge variant="outline" className="ml-2">{colloquioQuestions.length} aree</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {colloquioQuestions.map((area) => (
              <ColloquioQuestionCard key={area.id} area={area} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Interpretazione Dettagliata per Scala */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Interpretazione Dettagliata Scale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {scaleToShow.map((scala) => (
            <ScaleInterpretationCard 
              key={scala} 
              scala={scala} 
              valore={scalePunteggi[scala] || 100} 
            />
          ))}
        </CardContent>
      </Card>

      {/* Pattern e Interpretazioni per categoria */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pattern e Segnali Identificati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {critici.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Aree Critiche ({critici.length})
              </h4>
              {critici.map((item, idx) => (
                <InterpretazioneCard key={idx} item={item} />
              ))}
            </div>
          )}

          {attenzione.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Punti di Attenzione ({attenzione.length})
              </h4>
              {attenzione.map((item, idx) => (
                <InterpretazioneCard key={idx} item={item} />
              ))}
            </div>
          )}

          {forze.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Punti di Forza ({forze.length})
              </h4>
              {forze.map((item, idx) => (
                <InterpretazioneCard key={idx} item={item} />
              ))}
            </div>
          )}

          {info.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Note ({info.length})
              </h4>
              {info.map((item, idx) => (
                <InterpretazioneCard key={idx} item={item} />
              ))}
            </div>
          )}

          {interpretazioni.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Il profilo rientra nella norma senza particolari pattern o segnali da evidenziare.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
