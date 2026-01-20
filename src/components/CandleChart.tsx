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
  ReferenceArea
} from 'recharts';
import { generateCandleChartData } from '@/lib/chartMapping';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CandleChartProps {
  scalePunteggi: Record<string, number>;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm">{data.fullName}</p>
        <p className={cn(
          "text-lg font-bold",
          data.value >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {data.value > 0 ? '+' : ''}{data.value}
        </p>
        <p className="text-xs text-muted-foreground">
          Valore grezzo: {data.rawValue}/200
        </p>
      </div>
    );
  }
  return null;
};

const renderValueLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value === 0) return null;
  
  const xPos = width >= 0 ? x + width + 5 : x + width - 25;
  const yPos = y + height / 2 + 4;
  
  return (
    <text
      x={xPos}
      y={yPos}
      fill={value >= 0 ? '#16a34a' : '#dc2626'}
      fontSize={11}
      fontWeight="bold"
    >
      {value > 0 ? '+' : ''}{value}
    </text>
  );
};

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
            tick={{ fontSize }}
            height={isMobile ? 60 : 40}
            interval={0}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
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
