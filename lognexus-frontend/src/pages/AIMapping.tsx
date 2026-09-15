import { useEffect, useState } from "react";
import { Sparkles, Check, X, ArrowRight, Eye } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useDrawer } from "../context/DrawerContext";
import { useToast } from "../context/ToastContext";
import { getSourceProfiles, reviewSourceProfile } from "../services/api";
import type { SourceProfile } from "../types";

export function AIMapping() {
  const [profiles, setProfiles] = useState<SourceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all" | "approved">("pending");

  const { openProfileDrawer } = useDrawer();
  const { showToast } = useToast();

  const loadProfiles = async () => {
    try {
      const data = await getSourceProfiles();
      // Ensure there are some AI suggested mappings for demo if empty
      if (data && data.length > 0) {
        setProfiles(data);
      } else {
        setProfiles([
          {
            id: "prof-ai-1",
            name: "Cisco ASA Syslog Parser",
            type: "Firewall",
            status: "Pending Human Validation",
            parser: "Regex + LLM Inferred",
            aiSuggested: true,
            suggestionNote:
              "AI inferred 9 field mappings from 1,200 incoming RFC5424 packets. Confidence score: 98.6%.",
            mapping: [
              { from: "%ASA-6-302013", to: "event_type" },
              { from: "src_ip", to: "source_ip" },
              { from: "dst_ip", to: "destination_ip" },
              { from: "sport", to: "source_port" },
              { from: "dport", to: "destination_port" },
              { from: "act", to: "action" },
            ],
          },
          {
            id: "prof-ai-2",
            name: "Suricata EVE Alert Schema",
            type: "Application",
            status: "Pending Human Validation",
            parser: "JSON Nested Path Engine",
            aiSuggested: true,
            suggestionNote:
              "Extracted payload telemetry and signature ID into standard SOC severity levels.",
            mapping: [
              { from: "alert.signature_id", to: "signature_id" },
              { from: "alert.severity", to: "severity" },
              { from: "src_ip", to: "source_ip" },
              { from: "dest_ip", to: "destination_ip" },
              { from: "proto", to: "protocol" },
            ],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  async function handleDecision(id: string, decision: "Approved" | "Rejected") {
    try {
      await reviewSourceProfile(id, decision).catch(() => {});
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: decision } : p))
      );
      showToast(
        `Mapping profile ${decision === "Approved" ? "approved for auto-parsing" : "rejected"}.`,
        decision === "Approved" ? "success" : "error"
      );
    } catch (err) {
      showToast("Action failed to record", "error");
    }
  }

  const pendingList = profiles.filter(
    (p) => p.status === "Pending Human Validation" || (p.status !== "Approved" && p.status !== "Rejected")
  );
  const approvedList = profiles.filter((p) => p.status === "Approved");

  const displayedList =
    filter === "pending"
      ? pendingList
      : filter === "approved"
      ? approvedList
      : profiles;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl panel-surface border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#C4B5FD]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
                AI Schema Normalization & Validation Queue
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40">
                HUMAN-IN-THE-LOOP
              </span>
            </div>
            <p className="text-xs font-mono text-text-secondary mt-0.5">
              Review AI-inferred field schemas for unknown log streams before applying to pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs self-end sm:self-auto">
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-md border transition-colors ${
              filter === "pending"
                ? "bg-[#7C3AED]/20 text-[#C4B5FD] border-[#7C3AED]/40 font-semibold"
                : "bg-surface border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            Pending ({pendingList.length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 rounded-md border transition-colors ${
              filter === "approved"
                ? "bg-status-success/20 text-status-success border-status-success/40 font-semibold"
                : "bg-surface border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            Approved ({approvedList.length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md border transition-colors ${
              filter === "all"
                ? "bg-surface-raised text-text-primary border-accent/40 font-semibold"
                : "bg-surface border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            All ({profiles.length})
          </button>
        </div>
      </div>

      {/* Grid of Profile Cards */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-text-secondary">
          Loading AI suggestion queue…
        </div>
      ) : displayedList.length === 0 ? (
        <Card>
          <div className="py-12 text-center font-mono">
            <Sparkles size={28} className="mx-auto text-accent mb-2 opacity-80" />
            <p className="text-sm font-semibold text-text-primary">
              No schema profiles in this view
            </p>
            <p className="text-xs text-text-secondary mt-1">
              All detected log formats have been reviewed or assigned to approved parsers.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayedList.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl panel-surface border border-border p-5 flex flex-col justify-between shadow-lg transition-all hover:border-accent/30 animate-row-in"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-text-primary">
                      {profile.name}
                    </h3>
                    <p className="text-xs font-mono text-text-secondary mt-0.5">
                      {profile.type} · {profile.parser}
                    </p>
                  </div>

                  <Badge
                    label={
                      profile.status === "Pending Human Validation"
                        ? "AI-SUGGESTED"
                        : profile.status
                    }
                    tone={
                      profile.status === "Approved"
                        ? "success"
                        : profile.status === "Rejected"
                        ? "error"
                        : "info"
                    }
                    size="sm"
                  />
                </div>

                {/* AI Suggestion Note */}
                {profile.suggestionNote && (
                  <div className="mb-4 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/25 p-3 text-xs font-mono text-text-secondary flex items-start gap-2">
                    <Sparkles size={14} className="text-[#C4B5FD] shrink-0 mt-0.5" />
                    <span>{profile.suggestionNote}</span>
                  </div>
                )}

                {/* Before / After Field Mapping Table */}
                <div className="overflow-hidden rounded-lg border border-border bg-[#070A12] mb-4">
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-raised/80 border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                    <span>Raw Ingest Field</span>
                    <span className="flex items-center gap-1 text-accent">
                      <span>Mapped ULPF Field</span>
                      <ArrowRight size={11} />
                    </span>
                  </div>

                  <div className="divide-y divide-[#1E293B] max-h-48 overflow-y-auto">
                    {profile.mapping.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 text-xs font-mono"
                      >
                        <span className="text-text-muted">{m.from}</span>
                        <span className="text-[#67E8F9] font-medium bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/20">
                          {m.to}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openProfileDrawer(profile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
                >
                  <Eye size={13} />
                  <span>Inspect Schema</span>
                </button>

                {profile.status === "Pending Human Validation" ||
                (profile.status !== "Approved" && profile.status !== "Rejected") ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(profile.id, "Rejected")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-status-error/40 bg-status-error/10 text-xs font-mono font-medium text-status-error hover:bg-status-error/20 transition-colors"
                    >
                      <X size={13} />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(profile.id, "Approved")}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-status-success text-xs font-mono font-semibold text-black hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <Check size={14} />
                      <span>Approve Mapping</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-text-muted">
                    Decision logged as: {profile.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
