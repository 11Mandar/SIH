import { Server, Binary, Cpu, Database, CheckCircle2, Zap } from "lucide-react";

export function DataFlowPipeline() {
  const ringColors = [
    "#4F46E5", // Indigo
    "#7C3AED", // Violet
    "#2563EB", // Blue
    "#06B6D4", // Cyan
    "#0891B2", // Teal
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EC4899", // Pink
  ];

  const stages = [
    {
      id: "sources",
      label: "Log Sources",
      subtext: "Windows · Syslog · Router",
      icon: Server,
      accent: "#4F46E5",
      metrics: "Live Ingestion",
    },
    {
      id: "detection",
      label: "Format Detection",
      subtext: "EVTX · RFC5424 · JSON",
      icon: Binary,
      accent: "#06B6D4",
      metrics: "99.8% Match",
    },
    {
      id: "normalization",
      label: "Normalization",
      subtext: "ULPF Schema Mapping",
      icon: Cpu,
      accent: "#10B981",
      metrics: "Schema Unified",
    },
    {
      id: "storage",
      label: "Secure Storage",
      subtext: "PostgreSQL & Audit DB",
      icon: Database,
      accent: "#EC4899",
      metrics: "Indexed & Traceable",
    },
  ];

  return (
    <div className="panel-surface rounded-xl p-5 sm:p-6 border border-accent/20">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-success animate-status-pulse" />
            <h2 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
              Real-time Ingestion & Normalization Architecture
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Universal Log Pre-Processing Framework telemetry and data-flow pipeline
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] px-3 py-1 rounded bg-surface-raised border border-border">
          <Zap size={13} className="text-accent" />
          <span className="text-text-secondary">Pipeline Latency:</span>
          <span className="text-status-success font-semibold">1.4 ms</span>
        </div>
      </div>

      {/* Interactive visual pipeline */}
      <div className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isLast = idx === stages.length - 1;

            return (
              <div key={stage.id} className="relative flex flex-col">
                {/* Node Box */}
                <div className="flex-1 rounded-lg bg-surface-raised border border-border/90 p-4 transition-all hover:border-accent/40 group">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="p-2 rounded-md transition-colors"
                      style={{
                        backgroundColor: `${stage.accent}15`,
                        borderColor: `${stage.accent}30`,
                        borderWidth: 1,
                      }}
                    >
                      <Icon size={18} style={{ color: stage.accent }} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg text-text-secondary border border-border">
                      STAGE 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold font-mono text-text-primary tracking-wide">
                    {stage.label}
                  </h3>
                  <p className="text-[11px] text-text-secondary font-mono mt-0.5 truncate">
                    {stage.subtext}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-text-muted">{stage.metrics}</span>
                    <CheckCircle2 size={13} className="text-status-success" />
                  </div>
                </div>

                {/* Connecting animated line to next stage (visible on desktop) */}
                {!isLast && (
                  <div
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-[2px] z-10 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="w-full h-full bg-border relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse"
                        style={{
                          animationDuration: "1.5s",
                          animationIterationCount: "infinite",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SVG animated particles traveling along the pipeline representing the 8-color ring palette */}
        <div className="mt-4 pt-2 hidden md:block overflow-hidden">
          <svg className="w-full h-4" viewBox="0 0 800 16" fill="none">
            {/* Guide line */}
            <line x1="20" y1="8" x2="780" y2="8" stroke="#1F2937" strokeWidth="1" />
            <line
              x1="20"
              y1="8"
              x2="780"
              y2="8"
              stroke="#06B6D4"
              strokeWidth="1"
              strokeDasharray="4 8"
              strokeOpacity="0.4"
            />

            {/* 8 Traveling particle pulses colored using Chetas ring palette */}
            {ringColors.map((color, idx) => (
              <circle key={idx} r="3.5" fill={color} opacity="0.9">
                <animate
                  attributeName="cx"
                  from="30"
                  to="770"
                  dur="4s"
                  begin={`${idx * 0.5}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values="8;8;8"
                  dur="4s"
                  begin={`${idx * 0.5}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="2;4;2"
                  dur="4s"
                  begin={`${idx * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
