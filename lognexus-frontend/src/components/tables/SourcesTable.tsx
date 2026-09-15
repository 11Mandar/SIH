import { ServerOff, ChevronRight } from "lucide-react";
import type { Source } from "../../types";
import { Badge, statusToTone } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";

interface SourcesTableProps {
  sources: Source[];
  onSelectSource?: (source: Source) => void;
}

export function SourcesTable({ sources, onSelectSource }: SourcesTableProps) {
  if (sources.length === 0) {
    return (
      <EmptyState
        icon={ServerOff}
        title="No sources match your search"
        description="Try a different name, type, or IP address."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised/40 text-xs font-mono font-medium uppercase tracking-wide text-text-secondary">
            <th className="px-5 py-3">Source Name</th>
            <th className="px-5 py-3">Source Type</th>
            <th className="px-5 py-3">Host/IP</th>
            <th className="px-5 py-3">Ingestion Method</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Events</th>
            <th className="px-5 py-3">Last Seen</th>
            <th className="px-3 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sources.map((source) => (
            <tr
              key={source.id}
              onClick={() => onSelectSource?.(source)}
              className="cursor-pointer transition-colors hover:bg-surface-raised/70 animate-row-in group"
            >
              <td className="px-5 py-3.5 font-mono text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                {source.name}
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">
                <span className="px-2 py-0.5 rounded bg-bg text-text-secondary border border-border">
                  {source.type}
                </span>
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">{source.hostOrIp}</td>
              <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">
                {source.ingestionMethod}
              </td>
              <td className="px-5 py-3.5">
                <Badge label={source.status} tone={statusToTone(source.status)} size="sm" />
              </td>
              <td className="px-5 py-3.5 text-right font-mono text-xs font-bold text-accent">
                {source.events.toLocaleString()}
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-text-muted">{source.lastSeen}</td>
              <td className="px-3 py-3.5 text-text-muted group-hover:text-text-primary text-right">
                <ChevronRight size={15} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
