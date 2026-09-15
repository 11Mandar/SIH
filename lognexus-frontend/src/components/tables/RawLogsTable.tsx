import { FileSearch, ChevronRight } from "lucide-react";
import type { RawLog } from "../../types";
import { EmptyState } from "../ui/EmptyState";

interface RawLogsTableProps {
  logs: RawLog[];
  onSelect: (log: RawLog) => void;
}

function truncate(text: string, max = 90): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}

export function RawLogsTable({ logs, onSelect }: RawLogsTableProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No raw events match your filters"
        description="Try clearing the search box or source/format filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-xs font-mono">
        <thead>
          <tr className="border-b border-border bg-surface-raised/40 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
            <th className="px-5 py-3">Timestamp</th>
            <th className="px-5 py-3">Source</th>
            <th className="px-5 py-3">Format</th>
            <th className="px-5 py-3">Raw Event Preview</th>
            <th className="px-5 py-3">Provenance ID</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onSelect(log)}
              className="cursor-pointer transition-colors hover:bg-surface-raised/70 group animate-row-in"
            >
              <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                {log.timestamp}
              </td>
              <td className="px-5 py-3 font-semibold text-text-primary group-hover:text-accent transition-colors">
                {log.source}
              </td>
              <td className="px-5 py-3">
                <span className="px-2 py-0.5 rounded bg-bg text-text-muted border border-border text-[11px]">
                  {log.format}
                </span>
              </td>
              <td className="max-w-[360px] px-5 py-3 text-text-secondary truncate">
                {truncate(log.rawEvent)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-accent font-bold">
                {log.provenanceId}
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
