import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, TrendingUp, Users, Target, RefreshCw } from 'lucide-react';
import { 
  generateInterpretazione, 
  calculateSecondaryIndices,
  InterpretazioneItem 
} from '@/lib/interpretazioneProfile';
import { cn } from '@/lib/utils';

interface InterpretazioneDatiProps {
  scalePunteggi: Record<string, number>;
  schematicita: number;
  stressZone: boolean;
  outPoints: string[];
  strengthPoints: string[];
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
          <p className="text-sm text-muted-foreground">
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

export function InterpretazioneDati({
  scalePunteggi,
  schematicita,
  stressZone,
  outPoints,
  strengthPoints
}: InterpretazioneDatiProps) {
  const interpretazioni = generateInterpretazione(
    scalePunteggi,
    schematicita,
    stressZone,
    outPoints,
    strengthPoints
  );

  const indici = calculateSecondaryIndices(scalePunteggi);

  const critici = interpretazioni.filter(i => i.tipo === 'critico');
  const attenzione = interpretazioni.filter(i => i.tipo === 'attenzione');
  const forze = interpretazioni.filter(i => i.tipo === 'forza');
  const info = interpretazioni.filter(i => i.tipo === 'info');

  return (
    <div className="space-y-6">
      {/* Alert principale se stress zone */}
      {stressZone && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stress Zone Attiva</AlertTitle>
          <AlertDescription>
            Il candidato mostra segnali di vulnerabilità. Si raccomanda una valutazione approfondita 
            prima di procedere con l'inserimento in ruoli ad alta pressione.
          </AlertDescription>
        </Alert>
      )}

      {/* Indici Secondari */}
      <Card>
        <CardHeader>
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

      {/* Interpretazioni per categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interpretazione Dati</CardTitle>
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
              Il profilo rientra nella norma senza particolari evidenze da segnalare.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
