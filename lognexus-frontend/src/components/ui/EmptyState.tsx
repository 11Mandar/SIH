import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised border border-border text-accent/60">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-semibold font-mono text-text-primary">{title}</p>
        <p className="mt-1 text-xs font-mono text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
