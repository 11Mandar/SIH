import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Radio, ListTree, Sparkles, ScrollText } from "lucide-react";

interface NavItem {
  to: string;
  code: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { to: "/overview", code: "01", label: "OVERVIEW", icon: LayoutDashboard },
  { to: "/sources", code: "02", label: "SOURCES", icon: Radio },
  { to: "/logs", code: "03", label: "LOGS", icon: ListTree },
  { to: "/ai-mapping", code: "04", label: "AI MAPPING", icon: Sparkles },
  { to: "/audit", code: "05", label: "AUDIT", icon: ScrollText },
];

export function NavigationTabs() {
  const location = useLocation();

  // Hide horizontal tabs if on /settings or /login
  if (location.pathname === "/settings" || location.pathname === "/login") {
    return null;
  }

  return (
    <nav className="w-full border-b border-border bg-bg px-4 sm:px-6">
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            (item.to === "/logs" &&
              (location.pathname === "/raw-logs" || location.pathname === "/normalized-logs")) ||
            (item.to === "/ai-mapping" && location.pathname === "/source-profiles");

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono transition-all duration-150 border-b-2 whitespace-nowrap ${
                isActive
                  ? "text-text-primary border-[#06B6D4] bg-surface/60 font-semibold"
                  : "text-text-secondary border-transparent hover:text-text-primary hover:bg-surface/30"
              }`}
            >
              <span
                className={`text-[10px] ${
                  isActive ? "text-accent" : "text-text-muted"
                }`}
              >
                [{item.code}]
              </span>
              <Icon
                size={14}
                className={isActive ? "text-accent" : "text-text-secondary"}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-gradient-to-r from-accent-indigo via-accent to-accent-teal shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
