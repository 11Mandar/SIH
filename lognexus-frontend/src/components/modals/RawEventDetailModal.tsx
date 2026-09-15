import type { RawLog } from "../../types";
import { Modal } from "../ui/Modal";

interface RawEventDetailModalProps {
  log: RawLog | null;
  onClose: () => void;
}

export function RawEventDetailModal({ log, onClose }: RawEventDetailModalProps) {
  if (!log) return null;

  return (
    <Modal
      open={!!log}
      onClose={onClose}
      title={log.source}
      subtitle={`${log.timestamp} · ${log.format}`}
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Raw Event</p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-text-secondary">
            {log.rawEvent}
          </pre>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">Source</dt>
            <dd className="mt-1 text-text-primary">{log.source}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">Timestamp</dt>
            <dd className="mt-1 font-mono text-xs text-text-primary">{log.timestamp}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">Format</dt>
            <dd className="mt-1 text-text-primary">{log.format}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">Provenance ID</dt>
            <dd className="mt-1 font-mono text-xs text-accent">{log.provenanceId}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
