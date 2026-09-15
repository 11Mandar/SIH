import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function Card({
  children,
  className = "",
  title,
  subtitle,
  action,
  noPadding = false,
}: CardProps) {
  return (
    <div className={`rounded-xl panel-surface border border-border shadow-lg ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border px-5 py-4 bg-surface-raised/40">
          <div>
            {title && (
              <h3 className="text-sm font-semibold font-mono text-text-primary tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs font-mono text-text-secondary">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}
