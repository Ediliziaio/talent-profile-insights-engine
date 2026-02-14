/**
 * TraitCandleChart - Grafico a candele verticali per i 15 tratti V5
 * Barre verticali bidirezionali raggruppate per area con zone colorate,
 * soglie ruolo e tooltip ricco.
 */

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
  Customized,
} from 'recharts';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraitCode, TRAIT_LABELS } from '@/types/database';
import { useIsMobile } from '@/hooks/use-mobile';

interface TraitThreshold {
  trait: TraitCode;
  soglia: number;
  tipo: 'min' | 'max' | 'range';
}

interface TraitCandleChartProps {
  traits: Record<string, number>;
  thresholds?: TraitThreshold[];
  showThresholdIndicator?: boolean;
  showValueLabels?: boolean;
}

const AREA_GROUPS: {
  label: string;
  color: string;
  barColor: string;
  traits: TraitCode[];
}[] = [
  { label: 'ESSERE', color: '#3B82F6', barColor: '#3B82F6', traits: ['ORG', 'AUT', 'GP'] },
  { label: 'FARE', color: '#F59E0B', barColor: '#F59E0B', traits: ['ADS', 'DET', 'VEN', 'HRM'] },
  { label: 'AVERE', color: '#8B5CF6', barColor: '#8B5CF6', traits: ['LDR', 'PRO', 'COM', 'ESP'] },
  { label: 'INDICATORI', color: '#6B7280', barColor: '#6B7280', traits: ['RC', 'FIN', 'SUC', 'PRI'] },
];

function getValueLabel(value: number): { text: string; color: string } {
  if (value >= 50) return { text: 'Alto', color: '#16a34a' };
  if (value >= 20) return { text: 'Buono', color: '#3B82F6' };
  if (value >= 0) return { text: 'Medio', color: '#6B7280' };
  if (value >= -30) return { text: 'Basso', color: '#d97706' };
  return { text: 'Critico', color: '#dc2626' };
}

interface ChartDataItem {
  code: TraitCode;
  label: string;
  value: number;
  barColor: string;
  areaLabel: string;
  areaColor: string;
  threshold?: TraitThreshold;
  meetsThreshold?: boolean | null;
  isGroupStart: boolean;
}

function buildChartData(
  traits: Record<string, number>,
  thresholds: TraitThreshold[],
  showThresholdIndicator: boolean
): ChartDataItem[] {
  const data: ChartDataItem[] = [];
  for (const group of AREA_GROUPS) {
    group.traits.forEach((trait, idx) => {
      const value = traits[trait] ?? 0;
      const threshold = thresholds.find(t => t.trait === trait);
      let meetsThreshold: boolean | null = null;
      if (threshold && showThresholdIndicator) {
        if (threshold.tipo === 'min') meetsThreshold = value >= threshold.soglia;
        else if (threshold.tipo === 'max') meetsThreshold = value <= threshold.soglia;
      }
      data.push({
        code: trait,
        label: TRAIT_LABELS[trait],
        value,
        barColor: group.barColor,
        areaLabel: group.label,
        areaColor: group.color,
        threshold,
        meetsThreshold,
        isGroupStart: idx === 0,
      });
    });
  }
  return data;
}

// Custom tooltip
const CandleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartDataItem;
  const vl = getValueLabel(d.value);
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.barColor }} />
        <span className="font-semibold text-sm text-popover-foreground">{d.label}</span>
        <span className="text-[10px] text-muted-foreground uppercase ml-auto">{d.areaLabel}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold" style={{ color: d.value >= 0 ? '#16a34a' : '#dc2626' }}>
          {d.value > 0 ? '+' : ''}{d.value}
        </span>
        <span className="text-xs font-medium" style={{ color: vl.color }}>{vl.text}</span>
      </div>
      {d.threshold && (
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5">
          {d.meetsThreshold ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className="text-xs text-muted-foreground">
            Soglia {d.threshold.tipo === 'min' ? '≥' : '≤'} {d.threshold.soglia}
            {d.meetsThreshold ? ' — Soddisfatto' : ' — Non soddisfatto'}
          </span>
        </div>
      )}
    </div>
  );
};

// Custom X axis tick with rotation on mobile
const CustomXTick = ({ x, y, payload, isMobile }: any) => {
  const code = payload.value as string;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor={isMobile ? 'end' : 'middle'}
        fill="hsl(var(--foreground))"
        fontSize={isMobile ? 9 : 11}
        fontWeight={600}
        transform={isMobile ? 'rotate(-45)' : undefined}
      >
        {code}
      </text>
    </g>
  );
};

// Custom bar label showing value on top/bottom
const renderValueLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value === 0) return null;
  const isPositive = value >= 0;
  const yPos = isPositive ? y - 6 : y + height + 14;
  return (
    <text
      x={x + width / 2}
      y={yPos}
      textAnchor="middle"
      fill={isPositive ? '#16a34a' : '#dc2626'}
      fontSize={10}
      fontWeight={700}
    >
      {value > 0 ? '+' : ''}{Math.round(value)}
    </text>
  );
};

// Custom threshold markers rendered as SVG layer
function ThresholdMarkers({ data, chartLeft, chartRight, chartTop, chartBottom, xScale, yScale }: {
  data: ChartDataItem[];
  chartLeft: number;
  chartRight: number;
  chartTop: number;
  chartBottom: number;
  xScale: (code: string) => number;
  yScale: (value: number) => number;
}) {
  return (
    <g>
      {data.map((d) => {
        if (!d.threshold) return null;
        const cx = xScale(d.code);
        const cy = yScale(d.threshold.soglia);
        const halfW = 14;
        return (
          <g key={`thresh-${d.code}`}>
            {/* Threshold line on this bar */}
            <line
              x1={cx - halfW}
              y1={cy}
              x2={cx + halfW}
              y2={cy}
              stroke="#ef4444"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            {/* Small triangles */}
            <polygon
              points={`${cx - halfW - 4},${cy} ${cx - halfW},${cy - 4} ${cx - halfW},${cy + 4}`}
              fill="#ef4444"
            />
            <polygon
              points={`${cx + halfW + 4},${cy} ${cx + halfW},${cy - 4} ${cx + halfW},${cy + 4}`}
              fill="#ef4444"
            />
            {/* Check/X icon above bar */}
            {d.meetsThreshold !== null && (
              <g transform={`translate(${cx}, ${chartTop - 8})`}>
                {d.meetsThreshold ? (
                  <circle r={7} fill="#22c55e" opacity={0.9}>
                    <title>Requisito soddisfatto</title>
                  </circle>
                ) : (
                  <circle r={7} fill="#ef4444" opacity={0.9}>
                    <title>Requisito non soddisfatto</title>
                  </circle>
                )}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={10}
                  fontWeight={700}
                >
                  {d.meetsThreshold ? '✓' : '✗'}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

// Area group labels along the top
function AreaGroupLabels({ data, xScale, chartTop }: {
  data: ChartDataItem[];
  xScale: (code: string) => number;
  chartTop: number;
}) {
  const groups: { label: string; color: string; startX: number; endX: number }[] = [];
  let currentGroup = '';
  let startX = 0;
  let endX = 0;
  let color = '';

  for (const d of data) {
    const cx = xScale(d.code);
    if (d.areaLabel !== currentGroup) {
      if (currentGroup) {
        groups.push({ label: currentGroup, color, startX, endX });
      }
      currentGroup = d.areaLabel;
      color = d.areaColor;
      startX = cx;
      endX = cx;
    } else {
      endX = cx;
    }
  }
  if (currentGroup) {
    groups.push({ label: currentGroup, color, startX, endX });
  }

  return (
    <g>
      {groups.map((g) => {
        const midX = (g.startX + g.endX) / 2;
        return (
          <g key={g.label}>
            <text
              x={midX}
              y={chartTop - 22}
              textAnchor="middle"
              fill={g.color}
              fontSize={10}
              fontWeight={700}
              letterSpacing="0.05em"
            >
              {g.label}
            </text>
            {/* Separator line before group (except first) */}
            {g.startX !== groups[0].startX && (
              <line
                x1={g.startX - 16}
                y1={chartTop - 30}
                x2={g.startX - 16}
                y2={chartTop + 10}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

// Custom content layer for thresholds and group labels
const CustomLayer = (props: any) => {
  const { data, showThresholdIndicator, formattedGraphicalItems, xAxisMap, yAxisMap, offset } = props;
  if (!formattedGraphicalItems?.length || !xAxisMap || !yAxisMap) return null;

  const xAxis = Object.values(xAxisMap)[0] as any;
  const yAxis = Object.values(yAxisMap)[0] as any;
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const xScale = (code: string) => {
    const val = xAxis.scale(code);
    return typeof val === 'number' ? val + (xAxis.bandSize || 0) / 2 : 0;
  };
  const yScale = (value: number) => {
    const val = yAxis.scale(value);
    return typeof val === 'number' ? val : 0;
  };

  const chartTop = offset?.top || 40;

  return (
    <g>
      <AreaGroupLabels data={data} xScale={xScale} chartTop={chartTop} />
      {showThresholdIndicator && (
        <ThresholdMarkers
          data={data}
          chartLeft={0}
          chartRight={0}
          chartTop={chartTop}
          chartBottom={0}
          xScale={xScale}
          yScale={yScale}
        />
      )}
    </g>
  );
};

export function TraitCandleChart({
  traits,
  thresholds = [],
  showThresholdIndicator = false,
  showValueLabels = false,
}: TraitCandleChartProps) {
  const isMobile = useIsMobile();

  const chartData = useMemo(
    () => buildChartData(traits, thresholds, showThresholdIndicator),
    [traits, thresholds, showThresholdIndicator]
  );

  const chartHeight = isMobile ? 340 : 420;
  const marginTop = showThresholdIndicator ? 52 : 40;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          margin={{ top: marginTop, right: 12, left: 8, bottom: isMobile ? 50 : 30 }}
        >
          {/* Background zones */}
          <ReferenceArea y1={15} y2={80} fill="#dcfce7" fillOpacity={0.35} />
          <ReferenceArea y1={-15} y2={15} fill="#fef9c3" fillOpacity={0.35} />
          <ReferenceArea y1={-80} y2={-15} fill="#fee2e2" fillOpacity={0.35} />

          <XAxis
            dataKey="code"
            tick={<CustomXTick isMobile={isMobile} />}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            interval={0}
          />
          <YAxis
            domain={[-80, 80]}
            ticks={[-80, -60, -40, -20, 0, 20, 40, 60, 80]}
            tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}`}
            tick={{ fontSize: isMobile ? 9 : 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            width={isMobile ? 35 : 42}
          />

          <Tooltip content={<CandleTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />

          <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={1.5} />

          <Bar
            dataKey="value"
            radius={[4, 4, 4, 4]}
            maxBarSize={isMobile ? 28 : 38}
            label={showValueLabels ? renderValueLabel : undefined}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.barColor}
                fillOpacity={0.85}
              />
            ))}
          </Bar>

          <Customized
            component={(props: any) => (
              <CustomLayer {...props} data={chartData} showThresholdIndicator={showThresholdIndicator} />
            )}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className={cn(
        'flex justify-center mt-3 gap-4 text-muted-foreground font-medium',
        isMobile ? 'flex-wrap gap-2 text-[10px]' : 'text-xs'
      )}>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-green-200 border border-green-400" />
          <span>Ottimale (&gt;+15)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-yellow-200 border border-yellow-400" />
          <span>Attenzione (±15)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-red-200 border border-red-400" />
          <span>Critico (&lt;-15)</span>
        </div>
        {showThresholdIndicator && thresholds.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-0.5 bg-red-500 rounded" />
              <span>Soglia ruolo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>Soddisfatto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <span>Mancante</span>
            </div>
          </>
        )}
      </div>

      {/* Area color legend */}
      <div className={cn(
        'flex justify-center mt-2 gap-4 text-muted-foreground',
        isMobile ? 'flex-wrap gap-2 text-[10px]' : 'text-xs'
      )}>
        {AREA_GROUPS.map(g => (
          <div key={g.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.barColor }} />
            <span className="font-medium">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
