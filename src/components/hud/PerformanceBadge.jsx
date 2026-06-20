import { Gauge, Sparkles } from "lucide-react";

export default function PerformanceBadge({ onTogglePerformance, performanceMode }) {
  return (
    <button
      aria-label={performanceMode ? "Modo performance activo" : "Calidad premium activa"}
      aria-pressed={performanceMode}
      className={performanceMode ? "performance-badge active" : "performance-badge"}
      onClick={onTogglePerformance}
      type="button"
    >
      {performanceMode ? (
        <Gauge aria-hidden="true" size={16} />
      ) : (
        <Sparkles aria-hidden="true" size={16} />
      )}
      <span>{performanceMode ? "Modo performance" : "Calidad premium"}</span>
    </button>
  );
}
