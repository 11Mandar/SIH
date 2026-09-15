import type {
  DashboardStats,
  EventActivityPoint,
  SourceDistributionPoint,
  RecentEvent,
} from "../types";

// In production: GET /api/v1/events (aggregated) backs all of this.
export const dashboardStats: DashboardStats = {
  totalSources: 12,
  totalEvents: 24581,
  normalizedEvents: 23940,
  processingErrors: 641,
};

// Event volume over the last 24 hours, sampled every 2 hours.
export const eventActivity: EventActivityPoint[] = [
  { time: "00:00", events: 320 },
  { time: "02:00", events: 210 },
  { time: "04:00", events: 180 },
  { time: "06:00", events: 260 },
  { time: "08:00", events: 890 },
  { time: "10:00", events: 1420 },
  { time: "12:00", events: 1680 },
  { time: "14:00", events: 1510 },
  { time: "16:00", events: 1730 },
  { time: "18:00", events: 1290 },
  { time: "20:00", events: 940 },
  { time: "22:00", events: 610 },
];

export const sourceDistribution: SourceDistributionPoint[] = [
  { sourceType: "Windows", events: 8625 },
  { sourceType: "Linux", events: 5923 },
  { sourceType: "Firewall", events: 6231 },
  { sourceType: "Router", events: 1284 },
  { sourceType: "Application", events: 4006 },
  { sourceType: "Cloud/IoT", events: 512 },
];

export const recentEvents: RecentEvent[] = [
  {
    id: "recent-0001",
    timestamp: "10:30:22",
    source: "Firewall-01",
    eventType: "Network Activity",
    format: "Syslog",
    status: "Normalized",
    provenanceId: "prov-3d9b7e12",
  },
  {
    id: "recent-0002",
    timestamp: "10:30:22",
    source: "Windows-PC-01",
    eventType: "Windows Event",
    format: "Windows Event Log",
    status: "Normalized",
    provenanceId: "prov-8f21a4c0",
  },
  {
    id: "recent-0003",
    timestamp: "10:30:19",
    source: "Firewall-01",
    eventType: "Network Activity",
    format: "CEF",
    status: "Normalized",
    provenanceId: "prov-5a6c9f88",
  },
  {
    id: "recent-0004",
    timestamp: "10:30:11",
    source: "Linux-Server-01",
    eventType: "Authentication",
    format: "Syslog",
    status: "Normalized",
    provenanceId: "prov-1e44b021",
  },
  {
    id: "recent-0005",
    timestamp: "10:29:58",
    source: "App-Server-01",
    eventType: "Application Error",
    format: "JSON",
    status: "Validation Failed",
    provenanceId: "prov-7c02e945",
  },
  {
    id: "recent-0006",
    timestamp: "10:29:33",
    source: "Router-Core-01",
    eventType: "Interface State Change",
    format: "Syslog",
    status: "Processing",
    provenanceId: "prov-c81df370",
  },
];
