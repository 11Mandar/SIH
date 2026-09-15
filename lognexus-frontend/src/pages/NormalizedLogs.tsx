import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { NormalizedLogsTable } from "../components/tables/NormalizedLogsTable";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { NormalizedEventDetailModal } from "../components/modals/NormalizedEventDetailModal";
import { getNormalizedLogs } from "../services/api";
import type { NormalizedLog, NormalizedStatus } from "../types";

const PAGE_SIZE = 6;
const statuses: NormalizedStatus[] = ["Normalized", "Processing", "Validation Failed"];

export function NormalizedLogs() {
  const [logs, setLogs] = useState<NormalizedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NormalizedLog | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | NormalizedStatus>("all");
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").toLowerCase();

  useEffect(() => {
    let cancelled = false;
    getNormalizedLogs().then((data) => {
      if (!cancelled) {
        setLogs(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      if (
        query &&
        !log.source.toLowerCase().includes(query) &&
        !log.eventType.toLowerCase().includes(query) &&
        !log.provenanceId.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [logs, statusFilter, query]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-sm text-text-secondary">
        Every event below started as a different raw format — Windows Event Log, Syslog, CEF, JSON — and has been
        converted into one common representation. Click any row to see the full raw → parsed → normalized →
        validation → provenance chain.
      </p>

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Normalized Events</h3>
            <p className="mt-0.5 text-xs text-text-secondary">Common representation across all source formats</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | NormalizedStatus)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={9} />
        ) : (
          <NormalizedLogsTable logs={paged} onSelect={setSelected} />
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-text-secondary">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <NormalizedEventDetailModal log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
