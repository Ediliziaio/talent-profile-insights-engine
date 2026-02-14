/**
 * AreaGaugeSVG - Gauge semicircolare SVG per macro-aree
 * Usato nella HeroCardV3 per ESSERE, FARE, AVERE
 */

interface AreaGaugeSVGProps {
  value: number; // 0-100
  label: string;
  color: string; // hex color
  size?: number;
}

export function AreaGaugeSVG({ value, label, color, size = 100 }: AreaGaugeSVGProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const radius = 34;
  const strokeWidth = 8;
  const cx = 50;
  const cy = 48;
  
  // Semicircle arc from 180° to 0° (left to right)
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAngle = Math.PI;
  const progressAngle = startAngle - (clampedValue / 100) * totalAngle;
  
  // Background arc (full semicircle)
  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy - radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy - radius * Math.sin(endAngle);
  const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 0 1 ${bgX2} ${bgY2}`;
  
  // Progress arc
  const progX1 = cx + radius * Math.cos(startAngle);
  const progY1 = cy - radius * Math.sin(startAngle);
  const progX2 = cx + radius * Math.cos(progressAngle);
  const progY2 = cy - radius * Math.sin(progressAngle);
  const largeArc = clampedValue > 50 ? 1 : 0;
  const progPath = clampedValue > 0
    ? `M ${progX1} ${progY1} A ${radius} ${radius} 0 ${largeArc} 1 ${progX2} ${progY2}`
    : '';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.7} viewBox="0 0 100 70">
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        {progPath && (
          <path
            d={progPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* Value text */}
        <text
          x={cx}
          y={58}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="16"
          fontWeight="bold"
        >
          {Math.round(clampedValue)}%
        </text>
      </svg>
      <span className="text-xs font-medium text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}
