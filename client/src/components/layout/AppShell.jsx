import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import AppBackground from "./AppBackground";
import MobileNavigation from "./MobileNavigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getPageTitle } from "./navigation";

function AppShell({
  actions,
  children,
  contentClassName,
  contentScroll = true,
  title,
}) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(
    () => title || getPageTitle(location.pathname),
    [location.pathname, title]
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <AppBackground />
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <MobileNavigation open={mobileOpen} onOpenChange={setMobileOpen} />

        <main className="flex h-screen min-w-0 flex-1 flex-col">
          <Topbar actions={actions} onMobileMenu={() => setMobileOpen(true)} title={pageTitle} />
          <div
            className={cn(
              "min-h-0 flex-1",
              contentScroll && "overflow-y-auto",
              contentScroll ? "px-4 pb-8 sm:px-6 lg:px-8" : "overflow-hidden",
              contentClassName
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
