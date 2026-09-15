import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Download,
  Terminal,
  FileCode,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge, statusToTone } from "../components/ui/Badge";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { useDrawer } from "../context/DrawerContext";
import { useToast } from "../context/ToastContext";
import { exportToCsv } from "../utils/csvExport";
import { getNormalizedLogs, getRawLogs } from "../services/api";
import type { NormalizedLog, RawLog } from "../types";

const PAGE_SIZE = 7;

interface CombinedLogEvent {
  id: string;
  provenanceId: string;
  timestamp: string;
  source: string;
  format: string;
  rawEvent: string;
  normalizedLog?: NormalizedLog;
  rawLog?: RawLog;
  eventType: string;
  severity: string;
  sourceIp: string;
  destinationIp: string;
  action: string;
  status: string;
}

export function Logs() {
  const [combinedLogs, setCombinedLogs] = useState<CombinedLogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CombinedLogEvent | null>(null);

  // Search & filter states
  const [provenanceQuery, setProvenanceQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [searchParams] = useSearchParams();
  const globalQ = (searchParams.get("q") ?? "").trim();

  const { openEventDrawer } = useDrawer();
  const { showToast } = useToast();

  useEffect(() => {
    if (globalQ) {
      setProvenanceQuery(globalQ);
    }
  }, [globalQ]);

  const loadLogs = async () => {
    try {
      const [rawList, normList] = await Promise.all([
        getRawLogs().catch(() => []),
        getNormalizedLogs().catch(() => []),
      ]);

      // Merge raw and normalized events by provenanceId / traceId
      const map = new Map<string, CombinedLogEvent>();

      // Index raw logs
      for (const r of rawList) {
        const key = r.provenanceId || r.id;
        map.set(key, {
          id: r.id,
          provenanceId: r.provenanceId || r.id,
          timestamp: r.timestamp,
          source: r.source,
          format: r.format,
          rawEvent: r.rawEvent,
          rawLog: r,
          eventType: "Raw Ingestion",
          severity: "Info",
          sourceIp: "-",
          destinationIp: "-",
          action: "-",
          status: "Processing",
        });
      }

      // Merge normalized logs
      for (const n of normList) {
        const key = n.provenanceId || n.id;
        const existing = map.get(key);
        if (existing) {
          existing.normalizedLog = n;
          existing.eventType = n.eventType;
          existing.severity = (n as any).severity || "Info";
          existing.sourceIp = n.sourceIp || "-";
          existing.destinationIp = n.destinationIp || "-";
          existing.action = n.action || "-";
          existing.status = n.status || "Normalized";
        } else {
          map.set(key, {
            id: n.id,
            provenanceId: n.provenanceId || n.id,
            timestamp: n.timestamp,
            source: n.source,
            format: n.format || "Universal",
            rawEvent: n.rawEvent || JSON.stringify(n),
            normalizedLog: n,
            eventType: n.eventType,
            severity: (n as any).severity || "Info",
            sourceIp: n.sourceIp || "-",
            destinationIp: n.destinationIp || "-",
            action: n.action || "-",
            status: n.status || "Normalized",
          });
        }
      }

      const list = Array.from(map.values());
      setCombinedLogs(list);
      if (list.length > 0 && !selectedEvent) {
        setSelectedEvent(list[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const formats = useMemo(
    () => Array.from(new Set(combinedLogs.map((l) => l.format))),
    [combinedLogs]
  );

  // Live filter as user types provenance trace ID or general query
  const filtered = useMemo(() => {
    return combinedLogs.filter((log) => {
      if (formatFilter !== "all" && log.format !== formatFilter) return false;
      if (statusFilter !== "all" && log.status !== statusFilter) return false;

      if (provenanceQuery) {
        const q = provenanceQuery.toLowerCase();
        const matchesProv = log.provenanceId.toLowerCase().includes(q);
        const matchesEvent = log.eventType.toLowerCase().includes(q);
        const matchesSource = log.source.toLowerCase().includes(q);
        const matchesRaw = log.rawEvent.toLowerCase().includes(q);
        if (!matchesProv && !matchesEvent && !matchesSource && !matchesRaw) {
          return false;
        }
      }
      return true;
    });
  }, [combinedLogs, formatFilter, statusFilter, provenanceQuery]);

  useEffect(() => {
    setPage(1);
  }, [formatFilter, statusFilter, provenanceQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Exact-match jump when pressing enter on provenance search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = provenanceQuery.trim().toLowerCase();
      if (!q) return;

      const exactMatch = combinedLogs.find(
        (l) => l.provenanceId.toLowerCase() === q || l.provenanceId.toLowerCase().includes(q)
      );
      if (exactMatch) {
        setSelectedEvent(exactMatch);
        openEventDrawer(exactMatch.provenanceId, exactMatch.rawLog, exactMatch.normalizedLog);
      }
    }
  };

  const handleExportCsv = () => {
    exportToCsv(
      "logs",
      filtered,
      [
        { key: "timestamp", header: "timestamp" },
        { key: "provenanceId", header: "provenance_id" },
        { key: "eventType", header: "event_type" },
        { key: "severity", header: "severity" },
        { key: "sourceIp", header: "source_ip" },
        { key: "destinationIp", header: "destination_ip" },
        {
          key: "user_name",
          header: "user_name",
          format: (row) => (row.normalizedLog as any)?.user || "system",
        },
        { key: "action", header: "action" },
        {
          key: "outcome",
          header: "outcome",
          format: (row) => (row.normalizedLog as any)?.outcome || "Success",
        },
        {
          key: "message",
          header: "message",
          format: (row) => (row.normalizedLog as any)?.message || row.eventType,
        },
        {
          key: "rawEvent",
          header: "raw_event",
          format: (row) => row.rawEvent,
        },
      ],
      (msg) => showToast(msg, "success")
    );
  };

  const handleRowClick = (log: CombinedLogEvent) => {
    setSelectedEvent(log);
    openEventDrawer(log.provenanceId, log.rawLog, log.normalizedLog);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls & Search Header */}
      <div className="p-4 rounded-xl panel-surface border border-accent/20 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent">
              <Terminal size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
                Event Provenance & Normalization Split Stream
              </h2>
              <p className="text-xs font-mono text-text-secondary mt-0.5">
                Raw input side-by-side with parsed and standardized schema linked by trace ID
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            <button
              type="button"
              onClick={loadLogs}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-mono font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
              title="Refresh logs"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-mono font-semibold text-accent hover:bg-accent/20 transition-colors shadow-sm"
              title="Export visible rows to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dedicated Provenance ID Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-border/70">
          <div className="md:col-span-6 relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-accent"
            />
            <input
              type="text"
              value={provenanceQuery}
              onChange={(e) => setProvenanceQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by provenance ID (press Enter for detail drawer)..."
              className="w-full rounded-lg border border-border bg-bg px-3.5 py-2 pl-9 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs font-mono text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All Formats</option>
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs font-mono text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Normalized">Normalized</option>
              <option value="Processing">Processing</option>
              <option value="Validation Failed">Validation Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Split Stream */}
      <Card noPadding>
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-4 font-mono">
            <AlertCircle size={32} className="mx-auto text-status-warning mb-3 opacity-80" />
            <p className="text-sm font-semibold text-text-primary">
              No event found for provenance ID{" "}
              <span className="text-accent">&ldquo;{provenanceQuery}&rdquo;</span>
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Verify the trace identifier or clear filter parameters to view the complete log stream.
            </p>
            <button
              type="button"
              onClick={() => {
                setProvenanceQuery("");
                setFormatFilter("all");
                setStatusFilter("all");
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-surface-raised border border-border text-xs text-accent hover:bg-surface-hover transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised/40 text-xs font-mono font-medium uppercase tracking-wide text-text-secondary">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Provenance Trace ID</th>
                  <th className="px-4 py-3">Source & Format</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">IP Route</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((event) => {
                  const isSelected = selectedEvent?.provenanceId === event.provenanceId;

                  return (
                    <tr
                      key={event.id}
                      onClick={() => handleRowClick(event)}
                      className={`cursor-pointer transition-colors font-mono text-xs ${
                        isSelected
                          ? "bg-accent/10 border-l-2 border-accent"
                          : "hover:bg-surface-raised/70"
                      } animate-row-in`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                        {event.timestamp}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-bg text-accent border border-accent/25 font-bold">
                          {event.provenanceId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-text-primary">{event.source}</span>
                          <span className="text-[10px] text-text-muted">{event.format}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {event.eventType}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {event.sourceIp !== "-" || event.destinationIp !== "-" ? (
                          <span className="text-[11px]">
                            {event.sourceIp} → {event.destinationIp}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={event.status} tone={statusToTone(event.status)} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(event);
                          }}
                          className="px-2.5 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Maximize2 size={11} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-5 py-3.5 bg-surface-raised/30 font-mono text-xs text-text-secondary">
            <p>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              <span className="text-text-primary font-semibold">{filtered.length}</span> trace events
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded p-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded p-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Inline Split Preview Card of Currently Selected Event */}
      {selectedEvent && (
        <div className="rounded-xl panel-surface border border-accent/25 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-success animate-status-pulse" />
              <h3 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
                Split Trace View — Provenance:{" "}
                <span className="text-accent">{selectedEvent.provenanceId}</span>
              </h3>
            </div>
            <button
              onClick={() =>
                openEventDrawer(
                  selectedEvent.provenanceId,
                  selectedEvent.rawLog,
                  selectedEvent.normalizedLog
                )
              }
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
            >
              <span>Open in Full Right Drawer</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
            {/* Raw side */}
            <div className="rounded-lg border border-border bg-[#070A12] p-3.5">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E293B] text-text-muted text-[11px]">
                <span className="flex items-center gap-1.5 text-accent-teal">
                  <FileCode size={13} />
                  Raw Ingest Stream ({selectedEvent.format})
                </span>
                <span>Exact received payload</span>
              </div>
              <pre className="text-[#A5B4FC] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                {selectedEvent.rawEvent}
              </pre>
            </div>

            {/* Normalized side */}
            <div className="rounded-lg border border-border bg-[#070A12] p-3.5">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E293B] text-text-muted text-[11px]">
                <span className="flex items-center gap-1.5 text-status-success">
                  <ShieldCheck size={13} />
                  ULPF Normalized Record
                </span>
                <span>Universal Schema</span>
              </div>
              <pre className="text-[#67E8F9] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                {selectedEvent.normalizedLog
                  ? JSON.stringify(
                      {
                        id: selectedEvent.normalizedLog.id,
                        timestamp: selectedEvent.normalizedLog.timestamp,
                        source: selectedEvent.normalizedLog.source,
                        event_type: selectedEvent.normalizedLog.eventType,
                        severity: (selectedEvent.normalizedLog as any).severity || "Info",
                        source_ip: selectedEvent.normalizedLog.sourceIp,
                        destination_ip: selectedEvent.normalizedLog.destinationIp,
                        action: selectedEvent.normalizedLog.action,
                        provenance_id: selectedEvent.provenanceId,
                        validation: selectedEvent.normalizedLog.validationStatus,
                      },
                      null,
                      2
                    )
                  : JSON.stringify(
                      {
                        provenance_id: selectedEvent.provenanceId,
                        status: selectedEvent.status,
                        event_type: selectedEvent.eventType,
                        source: selectedEvent.source,
                      },
                      null,
                      2
                    )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
