import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { NavigationTabs } from "./NavigationTabs";
import { DetailDrawer } from "./DetailDrawer";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-dot-matrix text-text-primary flex flex-col selection:bg-accent/25 selection:text-white">
      {/* Top command bar */}
      <TopBar />

      {/* Horizontal terminal navigation segmented tabs */}
      <NavigationTabs />

      {/* Full-width command center content area */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Contextual right sliding drawer for inspecting logs, sources, and mappings */}
      <DetailDrawer />
    </div>
  );
}
