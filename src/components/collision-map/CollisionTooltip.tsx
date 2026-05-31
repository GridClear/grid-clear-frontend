interface TooltipProps {
  x: number;
  y: number;
  type: 'dot' | 'hex';
  properties: Record<string, unknown>;
  containerWidth: number;
}

const INJURY_COLOR: Record<string, string> = {
  Fatal: 'text-red-400',
  Major: 'text-orange-400',
  Minor: 'text-yellow-400',
  Minimal: 'text-yellow-200',
};

export function CollisionTooltip({ x, y, type, properties, containerWidth }: TooltipProps) {
  const flipLeft = x > containerWidth * 0.62;

  const style: React.CSSProperties = {
    position: 'absolute',
    top: Math.max(8, y - 44),
    left: flipLeft ? undefined : x + 14,
    right: flipLeft ? containerWidth - x + 14 : undefined,
    pointerEvents: 'none',
    zIndex: 40,
  };

  if (type === 'dot') {
    const injury = properties.worstInjury as string;
    const injuryClass = INJURY_COLOR[injury] ?? 'text-white/70';
    return (
      <div
        className="absolute bg-[#0a0a0c]/95 border border-white/10 p-3 font-mono text-[9px] uppercase tracking-wider max-w-[210px]"
        style={style}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5 gap-4">
          <span className={`font-bold ${injuryClass}`}>{injury} INJURY</span>
          <span className="text-white/40 shrink-0">{properties.date as string}</span>
        </div>
        <div className="text-white font-semibold text-[10px] mb-1.5 leading-tight">
          {properties.street as string}
        </div>
        <div className="space-y-0.5 text-white/50">
          {Boolean(properties.neighbourhood) && properties.neighbourhood !== '—' && (
            <div className="text-white/40">{properties.neighbourhood as string}</div>
          )}
          <div>
            Users:{' '}
            <span className="text-white/70">{properties.roadUsers as string}</span>
          </div>
          <div>
            Road:{' '}
            <span className="text-white/70">{properties.rdsfcond as string}</span>
          </div>
          <div>
            Light:{' '}
            <span className="text-white/70">{properties.light as string}</span>
          </div>
          {properties.impactype !== '—' && (
            <div>
              Impact:{' '}
              <span className="text-white/70">{properties.impactype as string}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hex tooltip
  const tier = (properties.tier as string).toUpperCase();
  const tierColor =
    tier === 'CRITICAL' ? 'text-red-400' :
    tier === 'HIGH'     ? 'text-orange-400' :
    tier === 'MEDIUM'   ? 'text-yellow-400' :
                          'text-white/60';

  return (
    <div
      className="absolute bg-[#0a0a0c]/95 border border-white/10 p-3 font-mono text-[9px] uppercase tracking-wider"
      style={style}
    >
      <div className="text-white font-bold mb-1.5">HOTSPOT ZONE</div>
      <div className="space-y-0.5 text-white/50">
        <div>
          Collisions:{' '}
          <span className="text-white font-bold">{properties.count as number}</span>
        </div>
        <div>
          Risk score:{' '}
          <span className="text-white">
            {Math.round((properties.score as number) * 100)}%
          </span>
        </div>
        <div>
          Tier: <span className={tierColor}>{tier}</span>
        </div>
      </div>
    </div>
  );
}
