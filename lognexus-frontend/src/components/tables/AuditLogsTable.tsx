import { ClipboardX, User } from "lucide-react";
import type { AuditLogEntry } from "../../types";
import { Badge, statusToTone } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";

interface AuditLogsTableProps {
  entries: AuditLogEntry[];
}

export function AuditLogsTable({ entries }: AuditLogsTableProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={ClipboardX}
        title="No audit entries match filter criteria"
        description="Try clearing search queries or changing status filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-xs font-mono">
        <thead>
          <tr className="border-b border-border bg-surface-raised/50 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
            <th className="px-5 py-3">Timestamp (UTC)</th>
            <th className="px-5 py-3">Operator / Actor</th>
            <th className="px-5 py-3">Security Action</th>
            <th className="px-5 py-3">Target Resource</th>
            <th className="px-5 py-3">Outcome</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="transition-colors hover:bg-surface-raised/70 animate-row-in"
            >
              <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                {entry.timestamp}
              </td>
              <td className="px-5 py-3 text-text-primary font-semibold">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-accent" />
                  <span>{entry.user}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-accent font-medium">{entry.action}</td>
              <td className="px-5 py-3 text-text-secondary">
                <span className="px-2 py-0.5 rounded bg-bg text-text-muted border border-border">
                  {entry.resource}
                </span>
              </td>
              <td className="px-5 py-3">
                <Badge label={entry.status} tone={statusToTone(entry.status)} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
