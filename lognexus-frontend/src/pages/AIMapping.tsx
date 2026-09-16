import { useEffect, useState } from "react";
import {
  Sparkles,
  Check,
  X,
  ArrowRight,
  Eye,
  Loader2,
  Plus,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useDrawer } from "../context/DrawerContext";
import { useToast } from "../context/ToastContext";

import {
  getSourceProfiles,
  reviewSourceProfile,
  inferLogMapping,
  validateSourceProfile,
} from "../services/api";

import type { SourceProfile, FieldMapping } from "../types";

interface PendingMapping {
  profileName: string;
  sourceType: string;
  vendor: string;
  format: string;
  logSample: string;
  mappings: FieldMapping[];
}

export function AIMapping() {
  const [profiles, setProfiles] = useState<SourceProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"pending" | "all" | "approved">(
    "pending",
  );

  // Human-validation / AI inference state
  const [showInference, setShowInference] = useState(false);
  const [logSample, setLogSample] = useState("");
  const [profileName, setProfileName] = useState(
    "Generic Firewall Log Profile",
  );
  const [sourceType, setSourceType] = useState("Syslog");
  const [vendor, setVendor] = useState("Generic");
  const [format, setFormat] = useState("Custom Firewall Log");

  const [pendingMapping, setPendingMapping] = useState<PendingMapping | null>(
    null,
  );

  const [inferring, setInferring] = useState(false);
  const [saving, setSaving] = useState(false);

  const { openProfileDrawer } = useDrawer();
  const { showToast } = useToast();

  // ------------------------------------------------------------
  // Load existing approved/reviewed profiles
  // ------------------------------------------------------------

  const loadProfiles = async () => {
    try {
      const data = await getSourceProfiles();
      setProfiles(data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load source profiles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // ------------------------------------------------------------
  // AI INFERENCE
  // ------------------------------------------------------------

  async function handleInferMapping() {
    if (!logSample.trim()) {
      showToast("Enter a log sample first", "error");
      return;
    }

    setInferring(true);

    try {
      const response = await inferLogMapping(logSample);

      const aiMappings = response?.mapping?.mappings || [];

      if (aiMappings.length === 0) {
        showToast("AI did not return any field mappings", "error");
        return;
      }

      const mappings: FieldMapping[] = aiMappings.map((mapping) => ({
        from: mapping.source_field,
        to: mapping.target_field,
        confidence: mapping.confidence,
        reason: mapping.reason,
      }));

      setPendingMapping({
        profileName,
        sourceType,
        vendor,
        format,
        logSample,
        mappings,
      });

      showToast(`AI generated ${mappings.length} field mappings`, "success");
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error ? error.message : "AI mapping inference failed",
        "error",
      );
    } finally {
      setInferring(false);
    }
  }

  // ------------------------------------------------------------
  // EDIT AI MAPPING
  // ------------------------------------------------------------

  function updateMapping(index: number, targetField: string) {
    setPendingMapping((current) => {
      if (!current) return current;

      return {
        ...current,
        mappings: current.mappings.map((mapping, mappingIndex) =>
          mappingIndex === index
            ? {
                ...mapping,
                to: targetField,
              }
            : mapping,
        ),
      };
    });
  }

  // ------------------------------------------------------------
  // APPROVE AI MAPPING
  // ------------------------------------------------------------

  async function handleApproveMapping() {
    if (!pendingMapping) return;

    setSaving(true);

    try {
      const result = await validateSourceProfile({
        profile_name: pendingMapping.profileName,
        source_type: pendingMapping.sourceType,
        vendor: pendingMapping.vendor,
        format: pendingMapping.format,

        field_mapping: pendingMapping.mappings.map((mapping) => ({
          source_field: mapping.from,
          target_field: mapping.to,
          confidence: mapping.confidence,
          reason: mapping.reason,
        })),

        parser_config: {
          delimiter: "|",
        },

        decision: "Approved",
        approved_by: 1,
      });

      showToast(
        `Mapping approved and saved as Source Profile #${result.source_profile_id}`,
        "success",
      );

      // Clear pending review
      setPendingMapping(null);
      setLogSample("");
      setShowInference(false);

      // Reload actual profiles from backend
      await loadProfiles();

      setFilter("approved");
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Failed to save approved mapping",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------------------
  // REJECT AI MAPPING
  // ------------------------------------------------------------

  function handleRejectMapping() {
    setPendingMapping(null);
    showToast("AI mapping rejected", "error");
  }

  // ------------------------------------------------------------
  // EXISTING PROFILE REVIEW
  // ------------------------------------------------------------

  async function handleDecision(id: string, decision: "Approved" | "Rejected") {
    try {
      await reviewSourceProfile(id, decision);

      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: decision } : p)),
      );

      showToast(
        `Mapping profile ${
          decision === "Approved" ? "approved for auto-parsing" : "rejected"
        }.`,
        decision === "Approved" ? "success" : "error",
      );
    } catch (err) {
      console.error(err);
      showToast("Action failed to record", "error");
    }
  }

  // ------------------------------------------------------------
  // FILTERS
  // ------------------------------------------------------------

  const approvedList = profiles.filter((p) => p.status === "Approved");

  // Local AI mapping is the pending human-review item.
  const pendingCount = pendingMapping ? 1 : 0;

  const displayedList =
    filter === "approved" ? approvedList : filter === "all" ? profiles : [];

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

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
              Review AI-inferred field schemas for unknown log streams before
              applying to pipeline
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
            Pending ({pendingCount})
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

      {/* ======================================================
          AI INFERENCE BUTTON
      ====================================================== */}

      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-mono text-text-primary">
                Unknown Log Source
              </h3>

              <p className="text-xs text-text-secondary font-mono mt-1">
                Submit a sample log to generate an AI field mapping.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInference((value) => !value)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-mono font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              {showInference ? "Close" : "New AI Mapping"}
            </button>
          </div>

          {showInference && (
            <div className="space-y-4">
              {/* Profile metadata */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-secondary mb-1">
                    PROFILE NAME
                  </label>

                  <input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-secondary mb-1">
                    SOURCE TYPE
                  </label>

                  <input
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-secondary mb-1">
                    VENDOR
                  </label>

                  <input
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-secondary mb-1">
                    LOG FORMAT
                  </label>

                  <input
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Log sample */}

              <div>
                <label className="block text-[11px] font-mono text-text-secondary mb-1">
                  UNKNOWN LOG SAMPLE
                </label>

                <textarea
                  value={logSample}
                  onChange={(e) => setLogSample(e.target.value)}
                  rows={4}
                  placeholder="Paste an unknown log sample here..."
                  className="w-full px-3 py-3 rounded-lg bg-[#070A12] border border-border text-xs font-mono text-text-primary outline-none focus:border-accent resize-y"
                />
              </div>

              <button
                type="button"
                onClick={handleInferMapping}
                disabled={inferring}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-black text-xs font-mono font-semibold disabled:opacity-50"
              >
                {inferring ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    AI ANALYZING...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    INFER FIELD MAPPING
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ======================================================
          PENDING HUMAN VALIDATION
      ====================================================== */}

      {pendingMapping && (
        <Card>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-mono text-text-primary">
                    {pendingMapping.profileName}
                  </h3>

                  <Badge label="AI-SUGGESTED" tone="info" size="sm" />
                </div>

                <p className="text-xs text-text-secondary font-mono mt-1">
                  {pendingMapping.sourceType} · {pendingMapping.vendor} ·{" "}
                  {pendingMapping.format}
                </p>
              </div>

              <span className="px-2 py-1 rounded-md bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#C4B5FD] text-[10px] font-mono">
                PENDING HUMAN VALIDATION
              </span>
            </div>

            {/* AI explanation */}

            <div className="mb-4 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/25 p-3 text-xs font-mono text-text-secondary">
              <div className="flex items-center gap-2 mb-1 text-[#C4B5FD]">
                <Sparkles size={14} />
                AI FIELD INFERENCE
              </div>
              AI-generated mappings must be reviewed by a human before they
              become a reusable Source Profile.
            </div>

            {/* Mapping table */}

            <div className="overflow-hidden rounded-lg border border-border bg-[#070A12]">
              <div className="grid grid-cols-[1fr_30px_1fr] px-3 py-2 bg-surface-raised/80 border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                <span>Raw Ingest Field</span>

                <span />

                <span>ULPF Field</span>
              </div>

              <div className="divide-y divide-[#1E293B]">
                {pendingMapping.mappings.map((mapping, index) => (
                  <div
                    key={`${mapping.from}-${index}`}
                    className="grid grid-cols-[1fr_30px_1fr] items-center px-3 py-2 gap-2"
                  >
                    <div>
                      <span className="text-xs font-mono text-text-muted">
                        {mapping.from}
                      </span>

                      {mapping.confidence !== undefined && (
                        <span className="ml-2 text-[10px] font-mono text-status-success">
                          {Math.round(mapping.confidence * 100)}%
                        </span>
                      )}
                    </div>

                    <ArrowRight size={12} className="text-accent" />

                    <div>
                      <input
                        value={mapping.to}
                        onChange={(e) => updateMapping(index, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md bg-surface border border-border text-xs font-mono text-[#67E8F9] outline-none focus:border-accent"
                      />

                      {mapping.reason && (
                        <p className="text-[10px] text-text-muted font-mono mt-1">
                          {mapping.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw sample */}

            <div className="mt-4">
              <p className="text-[11px] font-mono text-text-secondary mb-1">
                ORIGINAL LOG SAMPLE
              </p>

              <pre className="p-3 rounded-lg bg-[#070A12] border border-border text-[11px] font-mono text-text-muted overflow-x-auto whitespace-pre-wrap">
                {pendingMapping.logSample}
              </pre>
            </div>

            {/* Human actions */}

            <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRejectMapping}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-status-error/40 bg-status-error/10 text-xs font-mono font-medium text-status-error hover:bg-status-error/20 disabled:opacity-50"
              >
                <X size={14} />
                Reject
              </button>

              <button
                type="button"
                onClick={handleApproveMapping}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-status-success text-xs font-mono font-semibold text-black hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Approve & Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ======================================================
          EXISTING APPROVED PROFILES
      ====================================================== */}

      {filter !== "pending" && (
        <>
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-secondary">
              Loading schema profiles...
            </div>
          ) : displayedList.length === 0 ? (
            <Card>
              <div className="py-12 text-center font-mono">
                <Sparkles
                  size={28}
                  className="mx-auto text-accent mb-2 opacity-80"
                />

                <p className="text-sm font-semibold text-text-primary">
                  No schema profiles in this view
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {displayedList.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-xl panel-surface border border-border p-5 flex flex-col justify-between shadow-lg transition-all hover:border-accent/30"
                >
                  <div>
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
                        label={profile.status}
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

                    <div className="overflow-hidden rounded-lg border border-border bg-[#070A12] mb-4">
                      <div className="flex items-center justify-between px-3 py-2 bg-surface-raised/80 border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                        <span>Raw Ingest Field</span>

                        <span className="flex items-center gap-1 text-accent">
                          ULPF Field
                          <ArrowRight size={11} />
                        </span>
                      </div>

                      <div className="divide-y divide-[#1E293B] max-h-48 overflow-y-auto">
                        {profile.mapping?.map((mapping, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-2 text-xs font-mono"
                          >
                            <span className="text-text-muted">
                              {mapping.from}
                            </span>

                            <span className="flex items-center gap-2">
                              <ArrowRight size={11} className="text-accent" />

                              <span className="text-[#67E8F9] font-medium bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/20">
                                {mapping.to}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => openProfileDrawer(profile)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
                    >
                      <Eye size={13} />
                      Inspect Schema
                    </button>

                    {profile.status !== "Approved" &&
                      profile.status !== "Rejected" && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(profile.id, "Rejected")
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-status-error/40 bg-status-error/10 text-xs font-mono font-medium text-status-error"
                          >
                            <X size={13} />
                            Reject
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(profile.id, "Approved")
                            }
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-status-success text-xs font-mono font-semibold text-black"
                          >
                            <Check size={14} />
                            Approve Mapping
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
