// Service layer: this is the ONLY place that should know whether data
// is coming from mock fixtures or the real FastAPI backend.
//
// Every function currently resolves mock data wrapped in a Promise, so
// pages already call these as async operations. When the backend is
// ready, replace a function body with a `fetch(`${API_BASE_URL}/...`)`
// call — no page or component needs to change.
//
// Expected backend routes (not yet implemented):
//   /api/v1/events
//   /api/v1/sources
//   /api/v1/raw-events
//   /api/v1/normalized-events
//   /api/v1/source-profiles
//   /api/v1/audit-logs

import type {
  AuditLogEntry,
  DashboardStats,
  EventActivityPoint,
  NormalizedLog,
  RawLog,
  RecentEvent,
  Source,
  SourceDistributionPoint,
  SourceProfile,
} from "../types";


export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Simulated network latency so loading states are visible during the
// demo even though the data is local. Safe to remove once real
// requests are wired in.
function resolveMock<T>(data: T, delayMs = 250): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/stats`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  return response.json();
}

export async function getEventActivity(): Promise<EventActivityPoint[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/activity`);

  if (!response.ok) {
    throw new Error("Failed to fetch event activity");
  }

  return response.json();
}

export async function getSourceDistribution(): Promise<SourceDistributionPoint[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/source-distribution`);

  if (!response.ok) {
    throw new Error("Failed to fetch source distribution");
  }

  return response.json();
}

export async function getRecentEvents(): Promise<RecentEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/recent-events`);

  if (!response.ok) {
    throw new Error("Failed to fetch recent events");
  }

  return response.json();
}

export async function getSources(): Promise<Source[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sources`);

  if (!response.ok) {
    throw new Error("Failed to fetch sources");
  }

  const data = await response.json();

  return data.map((source: any) => ({
    id: String(source.source_id),
    name: String(source.source_name ?? ""),
    type: String(source.source_type ?? ""),
    hostOrIp: String(source.hostname ?? source.ip_address ?? "-"),
    ingestionMethod: String(source.ingestion_method ?? ""),
    status: String(source.status ?? ""),
    events: Number(source.events ?? 0),
    lastSeen: String(source.last_seen_at ?? "-"),
  }));
}

export async function getRawLogs(): Promise<RawLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/raw-events`);

  if (!response.ok) {
    throw new Error("Failed to fetch raw events");
  }

  const data = await response.json();

  return data.map((event: any) => ({
    id: String(event.raw_event_id),
    timestamp: String(event.received_at ?? ""),
    source: String(event.source_name ?? "Windows"),
    format: String(event.detected_format ?? "Unknown"),
    rawEvent: String(
      typeof event.raw_event === "string"
        ? event.raw_event
        : JSON.stringify(event.raw_event ?? {})
    ),
    provenanceId: String(event.trace_id ?? ""),
  }));
}

export async function getNormalizedLogs(): Promise<NormalizedLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/normalized-events`);

  if (!response.ok) {
    throw new Error("Failed to fetch normalized events");
  }

  const data = await response.json();

  return data.map((event: any) => ({
    id: String(event.normalized_event_id),
    eventId: String(event.event_id),
    timestamp: event.timestamp,
    source: event.source_type ?? "Unknown",
    eventType: event.event_type ?? "Unknown",
    severity: event.severity ?? "Info",
    sourceIp: event.source_ip ?? "-",
    destinationIp: event.destination_ip ?? "-",
    user: event.user_name ?? event.user_id ?? "-",
    action: event.action ?? "-",
    outcome: event.outcome ?? "-",
    system: event.system ?? "-",
    device: event.device ?? "-",
    message: event.message ?? "",
    traceId: event.trace_id,
    validationStatus: event.validation_status ?? "pending",
  }));
}

export async function getSourceProfiles(): Promise<SourceProfile[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/source-profiles`);

  if (!response.ok) {
    throw new Error("Failed to fetch source profiles");
  }

  const data = await response.json();

  return data.map((profile: any) => ({
    id: String(profile.source_profile_id),
    name: String(profile.profile_name ?? ""),
    type: profile.source_type ?? "Windows",
    status: profile.status ?? "Pending Human Validation",
    parser: String(profile.format ?? "Unknown"),
    mapping: Array.isArray(profile.field_mapping)
      ? profile.field_mapping
      : [],
    aiSuggested: profile.ai_suggested ?? false,
    suggestionNote: profile.suggestion_note ?? undefined,
  }));
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/audit-logs`);

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  const data = await response.json();

  return data.map((log: any) => ({
    id: String(log.audit_id),
    timestamp: String(log.timestamp ?? ""),
    user: String(log.user ?? "System"),
    action: String(log.action ?? ""),
    resource: String(log.resource_type ?? ""),
    status: log.status ?? "Failed",
  }));
}

// Placeholder for future source registration. Intentionally does NOT
// perform a real network request yet — the backend endpoint does not
// exist. Wire this to `POST ${API_BASE_URL}/api/v1/sources` once it does.
export async function addSource(_input: Omit<Source, "id" | "events" | "lastSeen">): Promise<void> {
  await resolveMock(undefined, 300);
}


export async function reviewSourceProfile(
  id: string,
  decision: "Approved" | "Rejected"
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/source-profiles/${id}/review?decision=${decision}`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to review source profile");
  }
}