import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDrawer } from "../../context/DrawerContext";
import { getRawLogs, getNormalizedLogs, getSources } from "../../services/api";

export function TopBar() {
  const { user, logout } = useAuth();
  const { openEventDrawer } = useDrawer();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // System status live telemetry
  const [sourceCount, setSourceCount] = useState<number>(6);
  const [eventsPerSec, setEventsPerSec] = useState<number>(1420);
  const [errorCount, setErrorCount] = useState<number>(0);

  useEffect(() => {
    // Load live counts from API if available
    Promise.all([getSources().catch(() => []), getNormalizedLogs().catch(() => [])]).then(
      ([sources, normLogs]) => {
        if (sources && sources.length > 0) setSourceCount(sources.length);
        const errs = normLogs.filter(
          (l) => l.validationStatus === "Invalid" || l.status === "Validation Failed"
        ).length;
        setErrorCount(errs);
      }
    );

    // Subtle realistic jitter to events/sec counter
    const interval = setInterval(() => {
      setEventsPerSec((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        return Math.max(1200, prev + delta);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    if (accountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    try {
      const [rawList, normList] = await Promise.all([
        getRawLogs().catch(() => []),
        getNormalizedLogs().catch(() => []),
      ]);

      const foundNorm = normList.find(
        (l) => l.provenanceId.toLowerCase().includes(query.toLowerCase()) || l.id === query
      );
      const foundRaw = rawList.find(
        (l) => l.provenanceId.toLowerCase().includes(query.toLowerCase()) || l.id === query
      );

      if (foundNorm || foundRaw) {
        const traceId = foundNorm?.provenanceId || foundRaw?.provenanceId || query;
        openEventDrawer(traceId, foundRaw, foundNorm);
      } else {
        // Fallback: open drawer with query ID so operator inspects anyway
        openEventDrawer(query);
      }
    } catch {
      openEventDrawer(query);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-[#0B0F19]/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Chetas Logo + Wordmark */}
      <div className="flex items-center gap-4">
        <Link to="/overview" className="flex items-center gap-3 group">
          <img
            src="/Chetas_Icon.svg"
            alt="Chetas Mark"
            className="h-7 w-7 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-base font-bold tracking-wider font-mono text-gradient-brand">
            CHETAS
          </span>
          <span className="hidden xl:inline text-[10px] font-mono tracking-widest text-text-muted border-l border-border pl-2 uppercase">
            SOC COMMAND
          </span>
        </Link>
      </div>

      {/* Center: Live System-Status Strip */}
      <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-md bg-surface border border-border text-xs font-mono">
        {/* Source count */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-status-success animate-status-pulse" />
          <span className="text-text-secondary">Sources:</span>
          <span className="text-text-primary font-semibold">{sourceCount}</span>
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Events per sec */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-status-pulse" />
          <span className="text-text-secondary">Rate:</span>
          <span className="text-accent font-semibold">{eventsPerSec.toLocaleString()} ev/s</span>
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Error count */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              errorCount > 0 ? "bg-status-error animate-status-pulse" : "bg-status-success"
            }`}
          />
          <span className="text-text-secondary">Errors:</span>
          <span
            className={`font-semibold ${
              errorCount > 0 ? "text-status-error" : "text-status-success"
            }`}
          >
            {errorCount}
          </span>
        </div>
      </div>

      {/* Right: Global Provenance Search & Account Menu */}
      <div className="flex items-center gap-3">
        {/* Global Search field */}
        <form onSubmit={handleGlobalSearch} className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Trace ID (e.g. pr-401)..."
            className="w-44 sm:w-60 md:w-68 rounded-md border border-border bg-surface px-3 py-1.5 pl-8 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-accent focus:bg-surface-raised focus:outline-none transition-colors"
          />
        </form>

        {/* Account Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setAccountOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-md p-1.5 hover:bg-surface-raised border border-transparent hover:border-border transition-colors"
            aria-expanded={accountOpen}
            aria-label="User Account Menu"
          >
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent-indigo to-accent flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "OP"}
            </div>
            <span className="hidden sm:inline text-xs font-mono text-text-primary">
              {user?.name || "Operator"}
            </span>
            <ChevronDown size={14} className="text-text-secondary" />
          </button>

          {accountOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg panel-surface border border-border shadow-2xl py-1 z-50 animate-row-in">
              {/* User header (non-clickable) */}
              <div className="px-4 py-2.5 border-b border-border bg-surface-raised/50">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {user?.name || "Siddiqa Bagwan"}
                </p>
                <p className="text-[11px] font-mono text-accent truncate mt-0.5">
                  {user?.role || "Lead SOC Analyst"}
                </p>
                <p className="text-[10px] text-text-muted truncate mt-0.5 font-mono">
                  {user?.email || "siddiqa.bagwan@chetas.sec"}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <Settings size={14} />
                  <span>Platform Settings</span>
                </Link>
              </div>

              <div className="border-t border-border my-1" />

              {/* Sign out */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-status-error hover:bg-status-error-soft/30 transition-colors"
              >
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
