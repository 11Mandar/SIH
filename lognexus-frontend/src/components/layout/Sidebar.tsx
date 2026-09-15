import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  FileText,
  Layers,
  Fingerprint,
  ClipboardList,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sources", label: "Sources", icon: Server },
  { to: "/raw-logs", label: "Raw Logs", icon: FileText },
  { to: "/normalized-logs", label: "Normalized Logs", icon: Layers },
  { to: "/source-profiles", label: "Source Profiles", icon: Fingerprint },
  { to: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
];

interface SidebarProps {
  /** Controls the mobile off-canvas drawer (below the lg breakpoint). */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Backdrop, mobile only */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-surface transition-transform duration-150 lg:z-30 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
          <img
            src="/origin-logo.png"
            alt="Origin"
            className="h-10 w-10 shrink-0 object-contain"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-text-primary">
              LOGNEXUS
            </p>

            <p className="truncate text-[11px] leading-tight text-text-secondary">
              Universal Log Pre-processing Framework
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings + Status */}
        <div className="border-t border-border px-3 py-4">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              }`
            }
          >
            <Settings size={18} className="shrink-0" />
            <span>Settings</span>
          </NavLink>

          <div className="mt-4 flex items-center gap-2 px-3 text-xs text-text-secondary">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-status-success"
              aria-hidden="true"
            />
            <span>System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}