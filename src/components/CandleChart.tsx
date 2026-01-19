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
  const data = useMemo(() => generateCandleChartData(scalePunteggi), [scalePunteggi]);

  if (layout === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        <ResponsiveContainer width="100%" height={480}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
          >
            {/* Zone di sfondo colorate */}
            <ReferenceArea x1={-100} x2={-30} fill="hsl(var(--destructive))" fillOpacity={0.05} />
            <ReferenceArea x1={-30} x2={30} fill="hsl(var(--muted))" fillOpacity={0.1} />
            <ReferenceArea x1={30} x2={100} fill="hsl(var(--success))" fillOpacity={0.05} />
            
            {/* Linee di riferimento */}
            <ReferenceLine x={-30} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
            <ReferenceLine x={30} stroke="hsl(var(--success))" strokeDasharray="3 3" strokeOpacity={0.4} />
            
            <XAxis 
              type="number"
              domain={[-100, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}`}
              ticks={[-100, -50, 0, 50, 100]}
            />
            <YAxis 
              type="category"
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
              width={130}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} 
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              barSize={28}
            >
              {data.map((entry) => (
                <Cell 
                  key={entry.id}
                  fill={entry.isPositive ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                />
              ))}
              <LabelList 
                dataKey="value" 
                content={renderValueLabel}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legenda migliorata */}
        <div className="flex flex-wrap justify-center gap-6 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary shadow-sm" />
            <span className="text-sm text-muted-foreground">Sopra la media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent shadow-sm" />
            <span className="text-sm text-muted-foreground">Sotto la media</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>|</span>
            <span className="bg-success/10 px-2 py-0.5 rounded text-success">+30 Forza</span>
            <span className="bg-destructive/10 px-2 py-0.5 rounded text-destructive">-30 Attenzione</span>
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
      
      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-sm text-muted-foreground">Sopra la media</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent" />
          <span className="text-sm text-muted-foreground">Sotto la media</span>
        </div>
      </div>
    </div>
  );
}
