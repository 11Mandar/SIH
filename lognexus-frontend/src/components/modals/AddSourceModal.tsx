import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Info } from "lucide-react";
import type { IngestionMethod, Source, SourceType } from "../../types";
import { Modal } from "../ui/Modal";
import { addSource } from "../../services/api";

interface AddSourceModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (source: Omit<Source, "id" | "events" | "lastSeen">) => void;
}

const sourceTypes: SourceType[] = ["Windows", "Linux", "Firewall", "Router", "Application", "Cloud/IoT"];
const ingestionMethods: IngestionMethod[] = ["Agent", "Syslog", "API"];

export function AddSourceModal({ open, onClose, onAdded }: AddSourceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SourceType>("Windows");
  const [hostOrIp, setHostOrIp] = useState("");
  const [ingestionMethod, setIngestionMethod] = useState<IngestionMethod>("Agent");
  const [submitting, setSubmitting] = useState(false);

  function resetAndClose() {
    setName("");
    setType("Windows");
    setHostOrIp("");
    setIngestionMethod("Agent");
    setSubmitting(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !hostOrIp.trim()) return;
    setSubmitting(true);
    const newSource = { name: name.trim(), type, hostOrIp: hostOrIp.trim(), ingestionMethod, status: "Active" as const };
    await addSource(newSource);
    onAdded(newSource);
    resetAndClose();
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="Add Source" subtitle="Register a new log source for onboarding">
      <div className="mb-4 flex items-start gap-2.5 rounded-md border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-text-secondary">
        <Info size={15} className="mt-0.5 shrink-0 text-accent" />
        <p>
          This form is a UI demonstration. It does not yet call the FastAPI backend — no source is actually
          registered. Once <code className="font-mono text-accent">POST /api/v1/sources</code> exists, this will
          submit to it directly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Source Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Windows-PC-03"
            required
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Source Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SourceType)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              {sourceTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ingestion Method">
            <select
              value={ingestionMethod}
              onChange={(e) => setIngestionMethod(e.target.value as IngestionMethod)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              {ingestionMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Host / IP">
          <input
            type="text"
            value={hostOrIp}
            onChange={(e) => setHostOrIp(e.target.value)}
            placeholder="e.g. 192.168.1.40"
            required
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </Field>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add Source"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  );
}
