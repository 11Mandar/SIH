import type { SourceProfile } from "../types";

// Mock source profiles: reusable field mappings that let LogNexus
// automatically process future events from a known source format.
// In production: GET /api/v1/source-profiles
export const sourceProfiles: SourceProfile[] = [
  {
    id: "profile-windows-event",
    name: "Windows Event Profile",
    type: "Windows",
    status: "Approved",
    parser: "Windows Event Parser",
    mapping: [
      { from: "EventID", to: "event_id" },
      { from: "TimeGenerated", to: "timestamp" },
      { from: "SourceName", to: "source" },
      { from: "ComputerName", to: "device" },
      { from: "StringInserts", to: "message" },
    ],
  },
  {
    id: "profile-firewall-cef",
    name: "Firewall CEF Profile",
    type: "Firewall",
    status: "Approved",
    parser: "CEF Parser",
    mapping: [
      { from: "src", to: "source_ip" },
      { from: "dst", to: "destination_ip" },
      { from: "act", to: "action" },
      { from: "msg", to: "message" },
    ],
  },
  {
    id: "profile-linux-syslog",
    name: "Linux Syslog Profile",
    type: "Linux",
    status: "Approved",
    parser: "Syslog Parser (RFC 3164)",
    mapping: [
      { from: "hostname", to: "device" },
      { from: "process", to: "process_name" },
      { from: "src_ip", to: "source_ip" },
      { from: "user", to: "user" },
    ],
  },
  {
    id: "profile-app-json",
    name: "Application JSON Profile",
    type: "Application",
    status: "Approved",
    parser: "JSON Parser",
    mapping: [
      { from: "service", to: "device" },
      { from: "level", to: "severity" },
      { from: "message", to: "message" },
      { from: "status_code", to: "status_code" },
    ],
  },
  {
    id: "profile-new-firewall-pending",
    name: "New Firewall Format",
    type: "Firewall",
    status: "Pending Human Validation",
    parser: "AI-Suggested Parser (unconfirmed)",
    aiSuggested: true,
    suggestionNote:
      "This source type was not recognized by any existing profile. Field mappings below were inferred automatically and require human validation before this profile can be reused for future events.",
    mapping: [
      { from: "client_ip", to: "source_ip" },
      { from: "server_ip", to: "destination_ip" },
      { from: "decision", to: "action" },
    ],
  },
];
