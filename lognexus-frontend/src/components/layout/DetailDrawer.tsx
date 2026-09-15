import { useEffect } from "react";
import { X, Copy, Check, ShieldCheck, Terminal, FileCode, CheckCircle2, ArrowRight } from "lucide-react";
import { useDrawer } from "../../context/DrawerContext";
import { useState } from "react";

export function DetailDrawer() {
  const { isOpen, content, closeDrawer } = useDrawer();
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  if (!isOpen || !content) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Faint backdrop blur and dim */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 pointer-events-none">
        <aside
          className="w-screen max-w-3xl pointer-events-auto panel-surface border-l border-accent/25 shadow-2xl flex flex-col animate-drawer-in"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-raised/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-md bg-accent/10 text-accent border border-accent/20">
                <Terminal size={18} />
              </div>
              <div className="min-w-0">
                {content.type === "event" && (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold font-mono text-text-primary truncate">
                        EVENT INSPECTION
                      </h2>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-accent/15 text-accent border border-accent/30">
                        PROVENANCE
                      </span>
                    </div>
                    <p className="text-xs font-mono text-text-secondary truncate mt-0.5">
                      Trace ID: <span className="text-accent">{content.provenanceId}</span>
                    </p>
                  </>
                )}

                {content.type === "source" && (
                  <>
                    <h2 className="text-sm font-semibold font-mono text-text-primary truncate">
                      SOURCE: {content.source.name}
                    </h2>
                    <p className="text-xs font-mono text-text-secondary truncate mt-0.5">
                      {content.source.type} · {content.source.hostOrIp}
                    </p>
                  </>
                )}

                {content.type === "profile" && (
                  <>
                    <h2 className="text-sm font-semibold font-mono text-text-primary truncate">
                      SCHEMA MAPPING PROFILE
                    </h2>
                    <p className="text-xs font-mono text-text-secondary truncate mt-0.5">
                      {content.profile.name} · {content.profile.parser}
                    </p>
                  </>
                )}

                {content.type === "custom" && (
                  <>
                    <h2 className="text-sm font-semibold text-text-primary truncate">{content.title}</h2>
                    {content.subtitle && (
                      <p className="text-xs text-text-secondary truncate mt-0.5">{content.subtitle}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {content.type === "event" && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(content.provenanceId)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface border border-border transition-colors"
                  title="Copy Trace ID"
                >
                  {copied ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy ID"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close drawer"
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {content.type === "event" && (
              <div className="space-y-6">
                {/* Visual Provenance Bridge */}
                <div className="rounded-lg p-3 bg-surface-raised border border-border flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-status-success animate-status-pulse" />
                    <span className="text-text-secondary">Pipeline Provenance Verified</span>
                  </div>
                  <div className="text-text-secondary text-[11px]">
                    Raw Hash <ArrowRight size={12} className="inline mx-1 text-accent" /> Normalized Output
                  </div>
                </div>

                {/* Side-by-Side: Raw vs Normalized */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Raw Event */}
                  <div className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-raised">
                      <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-accent-teal" />
                        <span className="text-xs font-mono font-semibold text-text-primary">
                          Raw Log Stream
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg text-text-secondary border border-border">
                        {content.rawLog?.format || "Raw Input"}
                      </span>
                    </div>
                    <div className="p-4 flex-1">
                      <pre className="text-xs font-mono text-[#A5B4FC] bg-[#070A12] p-3 rounded-md overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[#1E293B]">
                        {content.rawLog?.rawEvent ||
                          (content.normalizedLog?.rawEvent
                            ? content.normalizedLog.rawEvent
                            : JSON.stringify(
                                {
                                  provenance_id: content.provenanceId,
                                  raw_payload: "Event captured from UDP / Syslog stream",
                                  timestamp: new Date().toISOString(),
                                },
                                null,
                                2
                              ))}
                      </pre>
                    </div>
                  </div>

                  {/* Right: Normalized JSON Record */}
                  <div className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-raised">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-status-success" />
                        <span className="text-xs font-mono font-semibold text-text-primary">
                          Normalized Schema (ULPF)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-success-soft text-status-success border border-status-success/30">
                        Normalized
                      </span>
                    </div>
                    <div className="p-4 flex-1">
                      <pre className="text-xs font-mono text-[#67E8F9] bg-[#070A12] p-3 rounded-md overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[#1E293B]">
                        {content.normalizedLog
                          ? JSON.stringify(
                              {
                                id: content.normalizedLog.id,
                                timestamp: content.normalizedLog.timestamp,
                                source: content.normalizedLog.source,
                                event_type: content.normalizedLog.eventType,
                                severity: (content.normalizedLog as any).severity || "Info",
                                source_ip: content.normalizedLog.sourceIp,
                                destination_ip: content.normalizedLog.destinationIp,
                                action: content.normalizedLog.action,
                                provenance_id: content.normalizedLog.provenanceId,
                                validation_status: content.normalizedLog.validationStatus,
                              },
                              null,
                              2
                            )
                          : JSON.stringify(
                              {
                                provenance_id: content.provenanceId,
                                status: "Normalized",
                                format: content.rawLog?.format || "Standard",
                                source: content.rawLog?.source || "Network Device",
                                processed_at: new Date().toISOString(),
                              },
                              null,
                              2
                            )}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Parsed Fields Grid */}
                {content.normalizedLog?.parsedFields && content.normalizedLog.parsedFields.length > 0 && (
                  <div className="rounded-lg border border-border bg-surface p-4">
                    <h3 className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider mb-3">
                      Extracted Normalized Fields
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                      {content.normalizedLog.parsedFields.map((f, i) => (
                        <div key={i} className="p-2.5 rounded bg-bg border border-border">
                          <span className="block text-[11px] text-text-secondary">{f.field}</span>
                          <span className="block text-text-primary font-medium truncate mt-0.5">
                            {f.value || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {content.type === "source" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <span className="text-xs text-text-secondary font-mono">Status</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-status-success animate-status-pulse" />
                      <span className="text-sm font-semibold text-text-primary font-mono">
                        {content.source.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <span className="text-xs text-text-secondary font-mono">Total Events</span>
                    <p className="mt-1 text-base font-bold font-mono text-accent">
                      {content.source.events.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-border space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-secondary">Host / IP:</span>
                    <span className="text-text-primary">{content.source.hostOrIp}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-secondary">Ingestion Method:</span>
                    <span className="text-text-primary">{content.source.ingestionMethod}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-secondary">Source Type:</span>
                    <span className="text-text-primary">{content.source.type}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-text-secondary">Last Active:</span>
                    <span className="text-text-primary">{content.source.lastSeen}</span>
                  </div>
                </div>
              </div>
            )}

            {content.type === "profile" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface-raised border border-border">
                  <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
                    <CheckCircle2 size={15} className="text-accent" />
                    <span>Parser: {content.profile.parser}</span>
                  </div>
                  {content.profile.suggestionNote && (
                    <p className="mt-2 text-xs text-text-secondary font-mono border-l-2 border-status-info pl-2">
                      {content.profile.suggestionNote}
                    </p>
                  )}
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-raised text-text-secondary border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5">Source Field</th>
                        <th className="px-4 py-2.5">Target Normalized Field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {content.profile.mapping.map((m, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-text-secondary">{m.from}</td>
                          <td className="px-4 py-2 text-accent font-semibold">{m.to}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {content.type === "custom" && content.content}
          </div>
        </aside>
      </div>
    </div>
  );
}
