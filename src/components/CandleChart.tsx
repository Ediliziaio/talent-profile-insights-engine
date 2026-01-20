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
  LabelList,
} from 'recharts';
import { generateCandleChartData, CandleData } from '@/lib/chartMapping';
import { cn } from '@/lib/utils';

interface CandleChartProps {
  scalePunteggi: Record<string, number>;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CandleData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs z-50">
      <p className="font-semibold text-foreground mb-1">{data.label}</p>
      <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
      <div className={`text-lg font-bold ${data.isPositive ? 'text-primary' : 'text-accent'}`}>
        {data.value > 0 ? '+' : ''}{data.value.toFixed(0)}
      </div>
      <p className="text-xs mt-2 text-foreground/80">{data.tooltipText}</p>
    </div>
  );
}

// Custom label for values on bars
function renderValueLabel(props: any) {
  const { x, y, width, height, value } = props;
  const isPositive = value >= 0;
  
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
      textAnchor="start"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight={600}
    >
      {value > 0 ? '+' : ''}{value.toFixed(0)}
    </text>
  );
}

export function CandleChart({ scalePunteggi, className, layout = 'vertical' }: CandleChartProps) {
  const isMobile = useIsMobile();
  const chartData = useMemo(() => generateCandleChartData(scalePunteggi), [scalePunteggi]);
  
  const chartHeight = isMobile ? 360 : 480;
  const yAxisWidth = isMobile ? 85 : 130;
  const fontSize = isMobile ? 10 : 12;

  if (layout === 'horizontal') {
    return (
      <div className={cn("w-full", className)}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <ReferenceArea x1={-40} x2={-15} fill="#fee2e2" fillOpacity={0.5} />
            <ReferenceArea x1={-15} x2={15} fill="#fef9c3" fillOpacity={0.5} />
            <ReferenceArea x1={15} x2={40} fill="#dcfce7" fillOpacity={0.5} />
            
            <XAxis 
              type="number" 
              domain={[-40, 40]} 
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
              tick={{ fontSize }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={yAxisWidth}
              tick={{ fontSize }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3" />
            <Bar dataKey="value" label={renderValueLabel}>
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

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? 0 : 20, bottom: 20 }}>
          <ReferenceArea y1={-40} y2={-15} fill="#fee2e2" fillOpacity={0.5} />
          <ReferenceArea y1={-15} y2={15} fill="#fef9c3" fillOpacity={0.5} />
          <ReferenceArea y1={15} y2={40} fill="#dcfce7" fillOpacity={0.5} />
          
          <XAxis 
            dataKey="name" 
            tick={{ fontSize, angle: isMobile ? -45 : 0, textAnchor: isMobile ? 'end' : 'middle' }}
            height={isMobile ? 60 : 40}
            interval={0}
          />
          <YAxis 
            domain={[-40, 40]} 
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
            tick={{ fontSize }}
            width={isMobile ? 35 : 45}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Bar dataKey="value" label={renderValueLabel}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value >= 0 ? '#22c55e' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'gap-4'} justify-center mt-2 ${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-100 border border-red-300" />
          <span>Critico (&lt;-15)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-yellow-100 border border-yellow-300" />
          <span>Attenzione (±15)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-100 border border-green-300" />
          <span>Ottimale (&gt;15)</span>
        </div>
      </div>
    </div>
  );
}
  // Layout orizzontale originale
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          {/* Zone di sfondo */}
          <ReferenceArea y1={-100} y2={-30} fill="hsl(var(--destructive))" fillOpacity={0.05} />
          <ReferenceArea y1={-30} y2={30} fill="hsl(var(--muted))" fillOpacity={0.1} />
          <ReferenceArea y1={30} y2={100} fill="hsl(var(--success))" fillOpacity={0.05} />
          
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
          <ReferenceLine y={-30} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
          <ReferenceLine y={30} stroke="hsl(var(--success))" strokeDasharray="3 3" strokeOpacity={0.4} />
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
