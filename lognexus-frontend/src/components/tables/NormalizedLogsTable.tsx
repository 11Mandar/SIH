import { Layers, ChevronRight } from "lucide-react";
import type { NormalizedLog } from "../../types";
import { Badge, statusToTone } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";

interface NormalizedLogsTableProps {
  logs: NormalizedLog[];
  onSelect: (log: NormalizedLog) => void;
}

export function NormalizedLogsTable({ logs, onSelect }: NormalizedLogsTableProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No normalized events match your filters"
        description="Try clearing the search box or status filter."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-left text-xs font-mono">
        <thead>
          <tr className="border-b border-border bg-surface-raised/40 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
            <th className="px-5 py-3">Timestamp</th>
            <th className="px-5 py-3">Source</th>
            <th className="px-5 py-3">Event Type</th>
            <th className="px-5 py-3">Device</th>
            <th className="px-5 py-3">Src IP</th>
            <th className="px-5 py-3">Dst IP</th>
            <th className="px-5 py-3">Action</th>
            <th className="px-5 py-3">Provenance ID</th>
            <th className="px-5 py-3">Validation</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onSelect(log)}
              className="cursor-pointer transition-colors hover:bg-surface-raised/70 animate-row-in group"
            >
              <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                {log.timestamp}
              </td>
              <td className="px-5 py-3 font-semibold text-text-primary group-hover:text-accent transition-colors">
                {log.source}
              </td>
              <td className="px-5 py-3 text-text-secondary">{log.eventType}</td>
              <td className="px-5 py-3 text-text-muted">{log.device}</td>
              <td className="px-5 py-3 text-text-secondary">{log.sourceIp ?? "—"}</td>
              <td className="px-5 py-3 text-text-secondary">{log.destinationIp ?? "—"}</td>
              <td className="px-5 py-3 text-text-secondary">{log.action ?? "—"}</td>
              <td className="whitespace-nowrap px-5 py-3 text-accent font-bold">
                {log.provenanceId}
              </td>
              <td className="px-5 py-3">
                <Badge label={log.validationStatus} tone={statusToTone(log.validationStatus)} size="sm" />
              </td>
              <td className="pr-4 text-text-muted group-hover:text-accent">
                <ChevronRight size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
