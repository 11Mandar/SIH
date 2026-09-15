import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Download, Radio } from "lucide-react";
import { Card } from "../components/ui/Card";
import { SourcesTable } from "../components/tables/SourcesTable";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { AddSourceModal } from "../components/modals/AddSourceModal";
import { useDrawer } from "../context/DrawerContext";
import { useToast } from "../context/ToastContext";
import { exportToCsv } from "../utils/csvExport";
import { getSources } from "../services/api";
import type { Source } from "../types";

export function Sources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchParams] = useSearchParams();

  const { openSourceDrawer } = useDrawer();
  const { showToast } = useToast();

  const query = (searchParams.get("q") ?? "").toLowerCase();

  useEffect(() => {
    let cancelled = false;
    getSources().then((data) => {
      if (!cancelled) {
        setSources(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const types = useMemo(
    () => Array.from(new Set(sources.map((s) => s.type))),
    [sources]
  );

  const filtered = useMemo(() => {
    return sources.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (
        query &&
        !s.name.toLowerCase().includes(query) &&
        !s.type.toLowerCase().includes(query) &&
        !s.hostOrIp.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [sources, typeFilter, statusFilter, query]);

  const handleExportCsv = () => {
    exportToCsv(
      "sources",
      filtered,
      [
        { key: "name", header: "Source Name" },
        { key: "type", header: "Source Type" },
        { key: "hostOrIp", header: "Host / IP" },
        { key: "ingestionMethod", header: "Ingestion Method" },
        { key: "status", header: "Status" },
        { key: "events", header: "Total Events" },
        { key: "lastSeen", header: "Last Seen" },
      ],
      (msg) => showToast(msg, "success")
    );
  };

  function handleAdded(newSource: Omit<Source, "id" | "events" | "lastSeen">) {
    setSources((prev) => [
      {
        ...newSource,
        id: `src-local-${Date.now()}`,
        events: 0,
        lastSeen: "Just now",
      },
      ...prev,
    ]);
    showToast(`Source "${newSource.name}" registered successfully.`, "success");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Overview header stats banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl panel-surface border border-accent/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent">
            <Radio size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold font-mono text-text-primary">
              INGESTION NODES & TELEMETRY SOURCES
            </h2>
            <p className="text-xs font-mono text-text-secondary mt-0.5">
              Live ingest endpoints: UDP syslog (514), agent heartbeats, API webhooks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-mono font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            title="Download visible table as CSV"
          >
            <Download size={14} className="text-accent" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg gradient-brand px-3.5 py-1.5 text-xs font-mono font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            <span>Register Source</span>
          </button>
        </div>
      </div>

      <Card noPadding>
        {/* Table Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border px-5 py-3.5 bg-surface-raised/40">
          <div className="text-xs font-mono text-text-secondary">
            Showing <span className="text-text-primary font-bold">{filtered.length}</span> of{" "}
            {sources.length} configured sources
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-1.5 text-xs font-mono text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All Protocols</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-1.5 text-xs font-mono text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Warning">Warning</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : (
          <SourcesTable
            sources={filtered}
            onSelectSource={(source) => openSourceDrawer(source)}
          />
        )}
      </Card>

      <AddSourceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}
