import { Inbox } from "lucide-react";
import type { RecentEvent } from "../../types";
import { Badge, statusToTone } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";

interface RecentEventsTableProps {
  events: RecentEvent[];
  onSelectEvent?: (event: RecentEvent) => void;
}

export function RecentEventsTable({ events, onSelectEvent }: RecentEventsTableProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No recent events"
        description="New events will appear here as they arrive."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised/40 text-xs font-mono font-medium uppercase tracking-wide text-text-secondary">
            <th className="px-5 py-3">Timestamp</th>
            <th className="px-5 py-3">Source</th>
            <th className="px-5 py-3">Event Type</th>
            <th className="px-5 py-3">Format</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Provenance Trace ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((event) => (
            <tr
              key={event.id}
              onClick={() => onSelectEvent?.(event)}
              className="cursor-pointer transition-colors hover:bg-surface-raised/70 animate-row-in"
            >
              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-text-secondary">
                {event.timestamp}
              </td>
              <td className="px-5 py-3 font-mono text-xs font-medium text-text-primary">
                {event.source}
              </td>
              <td className="px-5 py-3 font-mono text-xs text-text-secondary">{event.eventType}</td>
              <td className="px-5 py-3 font-mono text-xs text-text-secondary">
                <span className="px-2 py-0.5 rounded bg-bg text-text-muted border border-border">
                  {event.format}
                </span>
              </td>
              <td className="px-5 py-3">
                <Badge label={event.status} tone={statusToTone(event.status)} />
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-accent">
                {event.provenanceId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
