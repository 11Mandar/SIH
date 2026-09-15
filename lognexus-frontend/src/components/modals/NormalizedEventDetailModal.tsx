import { ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import type { NormalizedLog } from "../../types";
import { Modal } from "../ui/Modal";
import { Badge, statusToTone } from "../ui/Badge";

interface NormalizedEventDetailModalProps {
  log: NormalizedLog | null;
  onClose: () => void;
}

// This modal is the central demo feature of LogNexus: it makes the
// Source -> Format Detection -> Parsing -> Normalization -> Validation
// pipeline visible for a single event, end to end.
export function NormalizedEventDetailModal({ log, onClose }: NormalizedEventDetailModalProps) {
  if (!log) return null;
  const isValid = log.validationStatus === "Valid";

  return (
    <Modal
      open={!!log}
      onClose={onClose}
      title={`${log.eventType} · ${log.source}`}
      subtitle={`${log.timestamp} · ${log.format}`}
      widthClassName="max-w-3xl"
    >
      <div className="flex flex-col gap-5">
        {/* RAW EVENT */}
        <section>
          <SectionLabel>Raw Event</SectionLabel>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-text-secondary">
            {log.rawEvent}
          </pre>
        </section>

        <FlowArrow />

        {/* PARSED FIELDS */}
        <section>
          <SectionLabel>Parsed Fields</SectionLabel>
          <FieldTable rows={log.parsedFields} keyLabel="Field" valueLabel="Value" />
        </section>

        <FlowArrow />

        {/* NORMALIZED EVENT */}
        <section>
          <SectionLabel>Normalized Event</SectionLabel>
          <FieldTable rows={log.normalizedFields} keyLabel="Standard Field" valueLabel="Value" accent />
        </section>

        <FlowArrow />

        {/* VALIDATION */}
        <section>
          <SectionLabel>Validation</SectionLabel>
          <div className="mt-2 rounded-md border border-border bg-bg p-4">
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 size={16} className="text-status-success" />
              ) : (
                <XCircle size={16} className="text-status-error" />
              )}
              <Badge label={log.validationStatus} tone={statusToTone(log.validationStatus)} />
            </div>
            <ul className="mt-3 space-y-1.5">
              {log.validationNotes.map((note) => (
                <li key={note} className="text-sm text-text-secondary">
                  • {note}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <FlowArrow />

        {/* PROVENANCE */}
        <section>
          <SectionLabel>Provenance</SectionLabel>
          <div className="mt-2 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-sm text-accent">
            {log.provenanceId}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{children}</p>;
}

function FlowArrow() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <ArrowDown size={16} className="text-text-muted" />
    </div>
  );
}

function FieldTable({
  rows,
  keyLabel,
  valueLabel,
  accent = false,
}: {
  rows: { field: string; value: string }[];
  keyLabel: string;
  valueLabel: string;
  accent?: boolean;
}) {
  return (
    <div className={`mt-2 overflow-hidden rounded-md border ${accent ? "border-accent/30" : "border-border"}`}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className={`text-xs font-medium uppercase tracking-wide text-text-secondary ${accent ? "bg-accent/5" : "bg-bg"}`}>
            <th className="px-3 py-2">{keyLabel}</th>
            <th className="px-3 py-2">{valueLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.field}>
              <td className="px-3 py-2 font-mono text-xs text-text-secondary">{row.field}</td>
              <td className="px-3 py-2 font-mono text-xs text-text-primary">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
