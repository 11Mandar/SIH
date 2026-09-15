import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { RawLogsTable } from "../components/tables/RawLogsTable";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { RawEventDetailModal } from "../components/modals/RawEventDetailModal";
import { getRawLogs, getSources } from "../services/api";
import type { RawLog, Source } from "../types";

const PAGE_SIZE = 5;

export function RawLogs() {
  const [logs, setLogs] = useState<RawLog[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RawLog | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").toLowerCase();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRawLogs(), getSources()]).then(([logsRes, sourcesRes]) => {
      if (cancelled) return;
      setLogs(logsRes);
      setSources(sourcesRes);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const formats = useMemo(() => Array.from(new Set(logs.map((l) => l.format))), [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (sourceFilter !== "all" && log.source !== sourceFilter) return false;
      if (formatFilter !== "all" && log.format !== formatFilter) return false;
      if (query && !log.rawEvent.toLowerCase().includes(query) && !log.source.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [logs, sourceFilter, formatFilter, query]);

  useEffect(() => {
    setPage(1);
  }, [sourceFilter, formatFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Raw Events</h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              Original log events exactly as received, before parsing or normalization
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All Sources</option>
              {sources.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All Formats</option>
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <TableSkeleton rows={5} columns={5} /> : <RawLogsTable logs={paged} onSelect={setSelected} />}

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

      <RawEventDetailModal log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
