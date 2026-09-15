import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ScrollText, Download, Filter, RefreshCw } from "lucide-react";
import { Card } from "../components/ui/Card";
import { AuditLogsTable } from "../components/tables/AuditLogsTable";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { useToast } from "../context/ToastContext";
import { exportToCsv } from "../utils/csvExport";
import { getAuditLogs } from "../services/api";
import type { AuditLogEntry } from "../types";

export function AuditLogs() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchParams] = useSearchParams();

  const { showToast } = useToast();
  const query = (searchParams.get("q") ?? "").toLowerCase();

  const loadAudit = async () => {
    try {
      const data = await getAuditLogs();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!query) return true;
      return (
        e.user.toLowerCase().includes(query) ||
        e.action.toLowerCase().includes(query) ||
        e.resource.toLowerCase().includes(query)
      );
    });
  }, [entries, query, statusFilter]);

  const handleExportCsv = () => {
    exportToCsv(
      "audit",
      filtered,
      [
        { key: "timestamp", header: "Timestamp (UTC)" },
        { key: "user", header: "Operator / User" },
        { key: "action", header: "Action" },
        { key: "resource", header: "Resource" },
        { key: "status", header: "Outcome" },
      ],
      (msg) => showToast(msg, "success")
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl panel-surface border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent">
            <ScrollText size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
              Immutable System & Security Audit Trail
            </h2>
            <p className="text-xs font-mono text-text-secondary mt-0.5">
              Cryptographic logging of analyst actions, schema updates, and administrative interventions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={loadAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-accent/40 bg-accent/10 text-accent font-semibold hover:bg-accent/20 transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <Card noPadding>
        {/* Table Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border px-5 py-3.5 bg-surface-raised/40 font-mono text-xs">
          <span className="text-text-secondary">
            Showing <span className="text-text-primary font-bold">{filtered.length}</span> of{" "}
            {entries.length} audit records
          </span>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-1.5 text-xs font-mono text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All Outcomes</option>
              <option value="Success">Success Only</option>
              <option value="Failed">Failed Only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={7} columns={5} />
        ) : (
          <AuditLogsTable entries={filtered} />
        )}
      </Card>
    </div>
  );
}
