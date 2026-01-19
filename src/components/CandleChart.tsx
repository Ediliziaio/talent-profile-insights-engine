import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { generateCandleChartData, CandleData } from '@/lib/chartMapping';

interface CandleChartProps {
  scalePunteggi: Record<string, number>;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CandleData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-semibold text-foreground mb-1">{data.label}</p>
      <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
      <div className={`text-sm font-medium ${data.isPositive ? 'text-primary' : 'text-accent'}`}>
        {data.value > 0 ? '+' : ''}{data.value.toFixed(0)}
      </div>
      <p className="text-xs mt-2 text-foreground/80">{data.tooltipText}</p>
    </div>
  );
}

export function CandleChart({ scalePunteggi, className }: CandleChartProps) {
  const data = useMemo(() => generateCandleChartData(scalePunteggi), [scalePunteggi]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis 
            dataKey="label" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            domain={[-100, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 4, 4]}
            maxBarSize={40}
          >
            {data.map((entry) => (
              <Cell 
                key={entry.id}
                fill={entry.isPositive ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legenda */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-sm text-muted-foreground">Tratto positivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent" />
          <span className="text-sm text-muted-foreground">Tratto negativo</span>
        </div>
      </div>
    </div>
  );
}
