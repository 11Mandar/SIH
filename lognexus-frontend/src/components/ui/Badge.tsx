export type BadgeTone = "success" | "warning" | "error" | "inactive" | "accent" | "info";

interface BadgeProps {
  label: string;
  tone: BadgeTone;
  size?: "sm" | "md";
}

const toneStyles: Record<BadgeTone, string> = {
  success: "bg-status-success/15 text-status-success border-status-success/30",
  warning: "bg-status-warning/15 text-status-warning border-status-warning/30",
  error: "bg-status-error/15 text-status-error border-status-error/30",
  inactive: "bg-surface-raised text-text-muted border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
  info: "bg-[#7C3AED]/20 text-[#C4B5FD] border-[#7C3AED]/40",
};

export function Badge({ label, tone, size = "md" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono tracking-tight ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      } font-medium ${toneStyles[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

export function statusToTone(status: string): BadgeTone {
  switch (status) {
    case "Active":
    case "Normalized":
    case "Valid":
    case "Approved":
    case "Success":
      return "success";
    case "Warning":
    case "Processing":
    case "Pending":
      return "warning";
    case "Validation Failed":
    case "Invalid":
    case "Rejected":
    case "Failed":
      return "error";
    case "AI-Suggested":
    case "AI Suggested":
    case "Pending Human Validation":
    case "AI Inferred":
      return "info";
    case "Inactive":
      return "inactive";
    default:
      return "inactive";
  }
}
