import { useState } from "react";
import LayoutSidebar from "../layout/Sidebar";

function Sidebar({ collapsed, onCollapsedChange, setSidebarOpen, sidebarOpen }) {
  const [internalOpen, setInternalOpen] = useState(true);

  if (typeof collapsed === "boolean" && onCollapsedChange) {
    return <LayoutSidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange} />;
  }

  const expanded = typeof sidebarOpen === "boolean" ? sidebarOpen : internalOpen;

  return (
    <LayoutSidebar
      collapsed={!expanded}
      onCollapsedChange={(nextCollapsed) => {
        const nextOpen = !nextCollapsed;

        if (setSidebarOpen) {
          setSidebarOpen(nextOpen);
          return;
        }

        setInternalOpen(nextOpen);
      }}
    />
  );
}

export default Sidebar;
