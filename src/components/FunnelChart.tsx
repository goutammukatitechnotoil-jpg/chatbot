import { FunnelStage } from '../types/analytics';

interface FunnelChartProps {
  stages: FunnelStage[];
}

export function FunnelChart({ stages }: FunnelChartProps) {
  const maxValue = Math.max(...stages.map(s => s.value));

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const widthPercent = (stage.value / maxValue) * 100;
        const conversionRate = stage.percentage || 0;

        return (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{stage.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-gray-900">{stage.value.toLocaleString()}</div>
                {conversionRate > 0 && (
                  <div className="text-xs text-gray-500">{conversionRate}% conversion</div>
                )}
              </div>
            </div>

            <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 flex items-center justify-center group-hover:opacity-90"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: stage.color,
                }}
              >
                <span className="text-white text-sm font-semibold">
                  {widthPercent.toFixed(0)}%
                </span>
              </div>
            </div>

            {index < stages.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="w-0.5 h-4 bg-gray-300"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
