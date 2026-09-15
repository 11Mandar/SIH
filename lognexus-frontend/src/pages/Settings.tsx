import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Sliders, ArrowLeft, Check } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../services/api";

export function Settings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "Siddiqa Bagwan");
  const [email, setEmail] = useState(user?.email || "siddiqa.bagwan@chetas.sec");
  const [role, setRole] = useState(user?.role || "Lead SOC Analyst");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Preferences
  const [pageSize, setPageSize] = useState("10");
  const [timezone, setTimezone] = useState("UTC");
  const [refreshInterval, setRefreshInterval] = useState("5");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, role });
    showToast("Operator account profile updated successfully.", "success");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      showToast("Please fill in current and new password.", "error");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("New passwords do not match.", "error");
      return;
    }
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    showToast("Security credentials updated successfully.", "success");
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      "chetas_prefs",
      JSON.stringify({ pageSize, timezone, refreshInterval })
    );
    showToast("Interface and telemetry preferences saved.", "success");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/overview"
          className="inline-flex items-center gap-2 text-xs font-mono text-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Return to Command Center</span>
        </Link>
        <span className="text-xs font-mono text-text-muted">SYSTEM CONFIGURATION</span>
      </div>

      <div className="p-4 rounded-xl panel-surface border border-accent/20 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent">
          <Sliders size={20} />
        </div>
        <div>
          <h2 className="text-sm font-semibold font-mono text-text-primary uppercase tracking-wider">
            Platform & Operator Settings
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-0.5">
            Manage your SOC analyst identity, display preferences, and backend pipeline connection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Section */}
        <Card title="Operator Identity" subtitle="Profile information and security clearance">
          <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-text-secondary uppercase mb-1">Operator Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">Email / Alert Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">Assigned SOC Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-brand text-white font-semibold shadow hover:opacity-90 transition-opacity"
            >
              <Check size={14} />
              <span>Update Profile</span>
            </button>
          </form>
        </Card>

        {/* Change Password Section */}
        <Card title="Security Credentials" subtitle="Rotate operational password and keys">
          <form onSubmit={handleChangePassword} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-text-secondary uppercase mb-1">Current Password</label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">New Password</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-accent/40 bg-accent/10 text-accent font-semibold hover:bg-accent/20 transition-colors"
            >
              <KeyRound size={14} />
              <span>Rotate Password</span>
            </button>
          </form>
        </Card>

        {/* Preferences Section */}
        <Card title="Display & Telemetry Preferences" subtitle="Configure table display and intervals">
          <form onSubmit={handleSavePreferences} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Default Table Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="5">5 rows per view</option>
                <option value="10">10 rows per view</option>
                <option value="25">25 rows per view</option>
                <option value="50">50 rows per view</option>
              </select>
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Display Timezone for Timestamps
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="IST">Asia/Kolkata (IST, +05:30)</option>
                <option value="EST">America/New_York (EST, -05:00)</option>
                <option value="LOCAL">Host Local Machine Time</option>
              </select>
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Live Ingest Polling Rate
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="3">3 seconds (Real-time)</option>
                <option value="5">5 seconds (Standard SOC)</option>
                <option value="15">15 seconds (Low bandwidth)</option>
                <option value="0">Manual Refresh only</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-surface text-text-primary hover:border-accent transition-colors"
            >
              <Check size={14} />
              <span>Save Preferences</span>
            </button>
          </form>
        </Card>

        {/* System & Architecture Information */}
        <Card title="System Diagnostics" subtitle="Pipeline deployment and engine status">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Platform:</span>
              <span className="text-text-primary font-bold">Chetas SOC Command (ULPF)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">FastAPI Service:</span>
              <span className="text-accent">{API_BASE_URL || "http://localhost:8000"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Syslog / UDP Listener:</span>
              <span className="text-status-success">0.0.0.0:514 (ACTIVE)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Normalization Engine:</span>
              <span className="text-text-primary">Universal Schema v1.2</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-secondary">Storage Backend:</span>
              <span className="text-text-primary">PostgreSQL / SQLite fallback</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
