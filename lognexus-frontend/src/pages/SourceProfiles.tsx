import { useEffect, useState } from "react";
import { Check, Pencil, Sparkles, X } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge, statusToTone } from "../components/ui/Badge";
import {
  getSourceProfiles,
  reviewSourceProfile,
} from "../services/api";
import type { SourceProfile } from "../types";

export function SourceProfiles() {
  const [profiles, setProfiles] = useState<SourceProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSourceProfiles().then((data) => {
      if (!cancelled) {
        setProfiles(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const approved = profiles.filter((p) => p.status === "Approved");
  const pending = profiles.filter((p) => p.status === "Pending Human Validation");

  async function handleDecision(
  id: string,
  decision: "Approved" | "Rejected"
) {
  try {
    await reviewSourceProfile(id, decision);

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: decision } : p
      )
    );
  } catch (error) {
    console.error("Failed to review source profile:", error);
  }
}

  if (loading) {
    return <p className="text-sm text-text-secondary">Loading source profiles…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-sm font-semibold text-text-primary">Approved Profiles</h2>
        <p className="mt-1 text-xs text-text-secondary">
          Reusable field mappings applied automatically to future events from a known source format
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {approved.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <h2 className="text-sm font-semibold text-text-primary">Pending AI Suggestions</h2>
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          Unrecognized source formats with AI-inferred field mappings, awaiting human validation before reuse
        </p>
        {pending.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-text-secondary">No pending suggestions right now.</p>
          </Card>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pending.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} onDecision={handleDecision} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileCard({
  profile,
  onDecision,
}: {
  profile: SourceProfile;
  onDecision?: (id: string, decision: "Approved" | "Rejected") => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{profile.name}</h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            {profile.type} · {profile.parser}
          </p>
        </div>
        <Badge label={profile.status} tone={statusToTone(profile.status)} />
      </div>

      {profile.suggestionNote && (
        <p className="mt-3 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-text-secondary">
          {profile.suggestionNote}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-bg text-xs font-medium uppercase tracking-wide text-text-secondary">
              <th className="px-3 py-2">Source Field</th>
              <th className="px-3 py-2">Normalized Field</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profile.mapping.map((m) => (
              <tr key={`${m.from}-${m.to}`}>
                <td className="px-3 py-2 font-mono text-xs text-text-secondary">{m.from}</td>
                <td className="px-3 py-2 font-mono text-xs text-text-primary">{m.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onDecision && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onDecision(profile.id, "Approved")}
            className="flex items-center gap-1.5 rounded-md bg-status-success px-3.5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            <Check size={15} />
            Approve
          </button>
          <button
            type="button"
            onClick={() => onDecision(profile.id, "Rejected")}
            className="flex items-center gap-1.5 rounded-md border border-status-error/40 px-3.5 py-2 text-sm font-medium text-status-error transition-colors hover:bg-status-error-soft"
          >
            <X size={15} />
            Reject
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
          >
            <Pencil size={15} />
            Edit Mapping
          </button>
        </div>
      )}
    </Card>
  );
}
