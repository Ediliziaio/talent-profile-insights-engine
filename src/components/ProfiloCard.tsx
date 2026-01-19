import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getProfiloTipoLabel, getProfiloTipoDescription } from '@/lib/scoring';
import { ProfiloTipo } from '@/types/database';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface ProfiloCardProps {
  leadership_pct: number;
  maturita_pct: number;
  potenziale_pct: number;
  profilo_tipo: ProfiloTipo;
  stress_zone: boolean;
  schematicita: number;
  out_points: string[];
  strength_points: string[];
}

export function ProfiloCard({
  leadership_pct,
  maturita_pct,
  potenziale_pct,
  profilo_tipo,
  stress_zone,
  schematicita,
  out_points,
  strength_points,
}: ProfiloCardProps) {
  const getBadgeVariant = (tipo: ProfiloTipo) => {
    switch (tipo) {
      case 'LEADER': return 'default';
      case 'STRATEGIST': return 'secondary';
      case 'EXECUTOR': return 'outline';
      case 'IN_TRANSIZIONE': return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profilo Tipo
            <Badge variant={getBadgeVariant(profilo_tipo)} className="text-sm">
              {getProfiloTipoLabel(profilo_tipo)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {getProfiloTipoDescription(profilo_tipo)}
          </p>
        </CardContent>
      </Card>

      {/* Percentage Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Indicatori Percentuali</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Leadership (Area Risultati)</span>
              <span className="text-sm font-bold">{leadership_pct.toFixed(1)}%</span>
            </div>
            <Progress value={leadership_pct} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Maturità (Area Pianificazione)</span>
              <span className="text-sm font-bold">{maturita_pct.toFixed(1)}%</span>
            </div>
            <Progress value={maturita_pct} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Potenziale (Area Azione)</span>
              <span className="text-sm font-bold">{potenziale_pct.toFixed(1)}%</span>
            </div>
            <Progress value={potenziale_pct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Schematicità & Stress */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Schematicità
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{schematicita}</p>
            <p className="text-xs text-muted-foreground">
              {schematicita < 100 ? 'Bassa (flessibile)' : 
               schematicita > 140 ? 'Alta (rigido)' : 'Ottimale'}
            </p>
          </CardContent>
        </Card>

        <Card className={stress_zone ? 'border-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${stress_zone ? 'text-destructive' : ''}`} />
              Stress Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${stress_zone ? 'text-destructive' : 'text-success'}`}>
              {stress_zone ? 'Attiva' : 'No'}
            </p>
            <p className="text-xs text-muted-foreground">
              {stress_zone ? 'Richiede attenzione' : 'Nella norma'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strength & Out Points */}
      <div className="grid md:grid-cols-2 gap-4">
        {strength_points.length > 0 && (
          <Card className="border-success/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-success">
                <TrendingUp className="h-4 w-4" />
                Punti di Forza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {strength_points.map((point, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {out_points.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <TrendingDown className="h-4 w-4" />
                Aree Critiche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {out_points.map((point, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
