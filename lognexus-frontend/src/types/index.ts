// Shared domain types for LogNexus.
// These mirror the shape the FastAPI backend is expected to return
// once /api/v1/* endpoints are wired up (see src/services/api.ts).

export type SourceType =
  | "Windows"
  | "Linux"
  | "Firewall"
  | "Router"
  | "Application"
  | "Cloud/IoT";

export type SourceStatus = "Active" | "Warning" | "Inactive";

export type IngestionMethod = "Agent" | "Syslog" | "API";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  hostOrIp: string;
  ingestionMethod: IngestionMethod;
  status: SourceStatus;
  events: number;
  lastSeen: string; // HH:MM:SS
}

export type LogFormat = "Windows Event Log" | "Syslog" | "CEF" | "JSON";

export interface RawLog {
  id: string;
  timestamp: string;
  source: string;
  sourceType: SourceType;
  format: LogFormat;
  rawEvent: string; // pretty-printed / original text exactly as received
  provenanceId: string;
}

export type NormalizedStatus = "Normalized" | "Processing" | "Validation Failed";
export type ValidationStatus = "Valid" | "Invalid" | "Pending";

export interface ParsedField {
  field: string;
  value: string;
}

export interface NormalizedLog {
  id: string;
  timestamp: string;
  source: string;
  sourceType: SourceType;
  eventType: string;
  device: string;
  sourceIp: string | null;
  destinationIp: string | null;
  action: string | null;
  provenanceId: string;
  validationStatus: ValidationStatus;
  status: NormalizedStatus;

  // Fields that power the Raw -> Parsed -> Normalized -> Provenance drill-down.
  rawEvent: string;
  format: LogFormat;
  parsedFields: ParsedField[];
  normalizedFields: ParsedField[];
  validationNotes: string[];
}

export type ProfileStatus = "Approved" | "Pending Human Validation" | "Rejected";

export interface FieldMapping {
  from: string;
  to: string;
}

export interface SourceProfile {
  id: string;
  name: string;
  type: SourceType;
  status: ProfileStatus;
  parser: string;
  mapping: FieldMapping[];
  aiSuggested?: boolean;
  suggestionNote?: string;
}

export type AuditStatus = "Success" | "Failed";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: AuditStatus;
}

export interface DashboardStats {
  totalSources: number;
  totalEvents: number;
  normalizedEvents: number;
  processingErrors: number;
}

export interface EventActivityPoint {
  time: string; // e.g. "10:00"
  events: number;
}

export interface SourceDistributionPoint {
  sourceType: SourceType;
  events: number;
}

export interface RecentEvent {
  id: string;
  timestamp: string;
  source: string;
  eventType: string;
  format: LogFormat;
  status: NormalizedStatus;
  provenanceId: string;
}
