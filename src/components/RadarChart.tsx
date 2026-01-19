import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getScaleForRadarChart, getScoreColor } from '@/lib/scoring';

interface RadarChartProps {
  punteggi: Record<string, number>;
}

export function RadarChart({ punteggi }: RadarChartProps) {
  const data = getScaleForRadarChart(punteggi);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{data.label}</p>
          <p className="text-lg font-bold" style={{ color: getScoreColor(data.punteggio) }}>
            {data.punteggio}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsRadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="label" 
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 200]} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="Profilo"
          dataKey="punteggio"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
          strokeWidth={2}
          dot={(props: any) => {
            const { cx, cy, payload } = props;
            const color = getScoreColor(payload.punteggio);
            return (
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={color}
                stroke="white"
                strokeWidth={2}
              />
            );
          }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
