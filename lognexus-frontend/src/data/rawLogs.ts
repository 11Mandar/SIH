import type { RawLog } from "../types";

// Mock raw events exactly as received from each source, before any
// parsing or normalization. In production: GET /api/v1/raw-events
export const rawLogs: RawLog[] = [
  {
    id: "raw-0001",
    timestamp: "2026-09-06 10:30:22",
    source: "Windows-PC-01",
    sourceType: "Windows",
    format: "Windows Event Log",
    rawEvent: JSON.stringify(
      {
        event_id: 16,
        source: "Microsoft-Windows-Kernel-General",
        computer: "WINDOWS-PC",
        time_generated: "2026-09-06T10:30:22Z",
        level: "Information",
        message: "The system time was changed.",
      },
      null,
      2
    ),
    provenanceId: "prov-8f21a4c0",
  },
  {
    id: "raw-0002",
    timestamp: "2026-09-06 10:30:22",
    source: "Firewall-01",
    sourceType: "Firewall",
    format: "Syslog",
    rawEvent: "<134>Sep 06 10:30:22 FW01 DENY src=10.1.1.5 dst=8.8.8.8 spt=51321 dpt=443 proto=TCP",
    provenanceId: "prov-3d9b7e12",
  },
  {
    id: "raw-0003",
    timestamp: "2026-09-06 10:30:19",
    source: "Firewall-01",
    sourceType: "Firewall",
    format: "CEF",
    rawEvent:
      "CEF:0|Vendor|Firewall|1.0|100|Connection denied|8|src=10.1.1.5 dst=8.8.8.8 spt=51321 dpt=443 act=deny",
    provenanceId: "prov-5a6c9f88",
  },
  {
    id: "raw-0004",
    timestamp: "2026-09-06 10:30:11",
    source: "Linux-Server-01",
    sourceType: "Linux",
    format: "Syslog",
    rawEvent: "<38>Sep 06 10:30:11 linux-server-01 sshd[2331]: Accepted publickey for deploy from 192.168.1.55 port 55210 ssh2",
    provenanceId: "prov-1e44b021",
  },
  {
    id: "raw-0005",
    timestamp: "2026-09-06 10:29:58",
    source: "App-Server-01",
    sourceType: "Application",
    format: "JSON",
    rawEvent: JSON.stringify(
      {
        level: "ERROR",
        service: "checkout-api",
        request_id: "req-9931",
        message: "Payment gateway timeout",
        status_code: 504,
      },
      null,
      2
    ),
    provenanceId: "prov-7c02e945",
  },
  {
    id: "raw-0006",
    timestamp: "2026-09-06 10:29:40",
    source: "Windows-PC-01",
    sourceType: "Windows",
    format: "Windows Event Log",
    rawEvent: JSON.stringify(
      {
        event_id: 4624,
        source: "Microsoft-Windows-Security-Auditing",
        computer: "WINDOWS-PC",
        time_generated: "2026-09-06T10:29:40Z",
        level: "Information",
        message: "An account was successfully logged on.",
      },
      null,
      2
    ),
    provenanceId: "prov-04af6b33",
  },
  {
    id: "raw-0007",
    timestamp: "2026-09-06 10:29:33",
    source: "Router-Core-01",
    sourceType: "Router",
    format: "Syslog",
    rawEvent: "<190>Sep 06 10:29:33 router-core-01 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down",
    provenanceId: "prov-c81df370",
  },
  {
    id: "raw-0008",
    timestamp: "2026-09-06 10:29:12",
    source: "Cloud-Gateway-01",
    sourceType: "Cloud/IoT",
    format: "JSON",
    rawEvent: JSON.stringify(
      {
        device_id: "sensor-441",
        event: "telemetry_upload",
        battery_pct: 62,
        status: "ok",
      },
      null,
      2
    ),
    provenanceId: "prov-e619ad02",
  },
];
