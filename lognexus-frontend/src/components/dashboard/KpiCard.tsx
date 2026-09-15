import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  tone?: "default" | "error" | "warning" | "info" | "success";
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  subtext,
  tone = "default",
}: KpiCardProps) {
  const toneClasses = {
    default: {
      border: "border-border hover:border-accent/40",
      iconBg: "bg-accent/10 text-accent border border-accent/25",
      text: "text-text-primary",
    },
    success: {
      border: "border-status-success/30 hover:border-status-success/60",
      iconBg: "bg-status-success/10 text-status-success border border-status-success/30",
      text: "text-status-success",
    },
    error: {
      border: "border-status-error/30 hover:border-status-error/60",
      iconBg: "bg-status-error/10 text-status-error border border-status-error/30",
      text: "text-status-error",
    },
    warning: {
      border: "border-status-warning/30 hover:border-status-warning/60",
      iconBg: "bg-status-warning/10 text-status-warning border border-status-warning/30",
      text: "text-status-warning",
    },
    info: {
      border: "border-status-info/30 hover:border-status-info/60",
      iconBg: "bg-status-info/10 text-status-info border border-status-info/30",
      text: "text-[#A78BFA]",
    },
  }[tone];

  return (
    <div
      className={`rounded-xl panel-surface p-5 transition-all duration-200 ${toneClasses.border} shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-bold font-mono tracking-tight ${toneClasses.text}`}>
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-[11px] font-mono text-text-muted truncate">{subtext}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses.iconBg}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}
