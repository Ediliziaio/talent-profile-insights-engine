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
  ReferenceArea,
  LabelList
} from 'recharts';
import { generateCandleChartData, CandleData } from '@/lib/chartMapping';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CandleChartProps {
  scalePunteggi: Record<string, number>;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  showLabels?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as CandleData;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 max-w-[280px]">
        <p className="font-semibold text-sm mb-1">{data.label}</p>
        <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
        <p className={cn(
          "text-lg font-bold",
          data.value >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {data.value > 0 ? '+' : ''}{data.value.toFixed(0)}
        </p>
        <p className="text-xs text-muted-foreground mt-1 italic">
          {data.tooltipText}
        </p>
      </div>
    );
  }
  return null;
};

// Custom label per mostrare i valori sulle barre
const renderBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value === 0 || Math.abs(value) < 3) return null;
  
  // Posizione: alla fine della barra
  const xPos = width >= 0 ? x + width + 4 : x + width - 28;
  const yPos = y + height / 2 + 4;
  
  return (
    <text
      x={xPos}
      y={yPos}
      fill={value >= 0 ? '#16a34a' : '#dc2626'}
      fontSize={10}
      fontWeight="bold"
    >
      {value > 0 ? '+' : ''}{Math.round(value)}
    </text>
  );
};

// Etichetta nome completo per layout verticale
const FullNameLabel = ({ x, y, width, height, value, data }: any) => {
  if (!data) return null;
  const xPos = width >= 0 ? x + 4 : x + width - 4;
  const yPos = y + height / 2;
  
  return (
    <text
      x={xPos}
      y={yPos}
      fill="hsl(var(--foreground))"
      fontSize={9}
      fontWeight="500"
      dominantBaseline="middle"
      textAnchor={width >= 0 ? "start" : "end"}
      className="opacity-80"
    >
      {data.label}
    </text>
  );
};

export function CandleChart({ 
  scalePunteggi, 
  className, 
  layout = 'vertical',
  showLabels = true 
}: CandleChartProps) {
  const isMobile = useIsMobile();
  const chartData = useMemo(() => generateCandleChartData(scalePunteggi), [scalePunteggi]);
  
  // Altezza dinamica basata su numero di barre
  const barHeight = isMobile ? 32 : 40;
  const chartHeight = chartData.length * barHeight + 60;
  const yAxisWidth = isMobile ? 90 : 120;
  const fontSize = isMobile ? 10 : 11;

  if (layout === 'horizontal') {
    return (
      <div className={cn("w-full", className)}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 10, right: 45, left: 10, bottom: 10 }}
          >
            {/* Zone colorate di sfondo */}
            <ReferenceArea x1={-40} x2={-15} fill="#fee2e2" fillOpacity={0.5} />
            <ReferenceArea x1={-15} x2={15} fill="#fef9c3" fillOpacity={0.5} />
            <ReferenceArea x1={15} x2={40} fill="#dcfce7" fillOpacity={0.5} />
            
            <XAxis 
              type="number" 
              domain={[-40, 40]} 
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
              tick={{ fontSize }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              dataKey="label" 
              type="category" 
              width={yAxisWidth}
              tick={{ fontSize, fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              label={showLabels ? renderBarLabel : undefined}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value >= 0 ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Layout verticale (default) - mostra come barre orizzontali per migliore leggibilità nomi
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 10, right: 45, left: 5, bottom: 10 }}
        >
          {/* Zone colorate di sfondo */}
          <ReferenceArea x1={-50} x2={-15} fill="#fee2e2" fillOpacity={0.4} />
          <ReferenceArea x1={-15} x2={15} fill="#fef9c3" fillOpacity={0.4} />
          <ReferenceArea x1={15} x2={50} fill="#dcfce7" fillOpacity={0.4} />
          
          <XAxis 
            type="number"
            domain={[-50, 50]} 
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
            tick={{ fontSize }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            dataKey="label"
            type="category"
            width={yAxisWidth}
            tick={{ 
              fontSize: isMobile ? 9 : 11, 
              fill: 'hsl(var(--foreground))',
              fontWeight: 500
            }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
          
          <Bar 
            dataKey="value"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value >= 0 ? '#22c55e' : '#ef4444'}
                fillOpacity={0.85}
              />
            ))}
            {showLabels && (
              <LabelList 
                dataKey="value" 
                position="right"
                formatter={(value: number) => value !== 0 ? `${value > 0 ? '+' : ''}${Math.round(value)}` : ''}
                style={{ 
                  fontSize: 10, 
                  fontWeight: 'bold',
                  fill: 'hsl(var(--foreground))'
                }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'gap-4'} justify-center mt-3 ${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-200 border border-red-400" />
          <span>Critico (&lt;-15)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400" />
          <span>Attenzione (±15)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-200 border border-green-400" />
          <span>Ottimale (&gt;15)</span>
        </div>
      </div>
    </div>
  );
}
