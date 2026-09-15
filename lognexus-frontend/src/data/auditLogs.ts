import type { AuditLogEntry } from "../types";

// Mock audit trail of administrative actions.
// In production: GET /api/v1/audit-logs
export const auditLogs: AuditLogEntry[] = [
  {
    id: "audit-0001",
    timestamp: "10:31:22",
    user: "admin",
    action: "Approved Source Profile",
    resource: "Firewall CEF Profile",
    status: "Success",
  },
  {
    id: "audit-0002",
    timestamp: "10:32:10",
    user: "admin",
    action: "Added Source",
    resource: "Windows-PC-01",
    status: "Success",
  },
  {
    id: "audit-0003",
    timestamp: "10:35:41",
    user: "analyst",
    action: "Viewed Event",
    resource: "prov-8f21a4c0",
    status: "Success",
  },
  {
    id: "audit-0004",
    timestamp: "10:38:02",
    user: "analyst",
    action: "Filtered Raw Logs",
    resource: "Source: Firewall-01",
    status: "Success",
  },
  {
    id: "audit-0005",
    timestamp: "10:40:55",
    user: "admin",
    action: "Rejected Source Profile",
    resource: "Unknown IoT Format v2",
    status: "Success",
  },
  {
    id: "audit-0006",
    timestamp: "10:41:30",
    user: "system",
    action: "Auto-Registered Source",
    resource: "Cloud-Gateway-01",
    status: "Success",
  },
  {
    id: "audit-0007",
    timestamp: "10:42:47",
    user: "analyst",
    action: "Exported Normalized Events",
    resource: "Last 24 hours",
    status: "Failed",
  },
];
