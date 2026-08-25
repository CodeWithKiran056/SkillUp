import { ChevronLeft, ChevronRight, GraduationCap, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { getUser, logoutUser } from "../../utils/auth";
import { Button, Tooltip } from "../ui";
import { navItems } from "./navigation";

function Sidebar({ collapsed, onCollapsedChange }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-[var(--border-subtle)] bg-[var(--app-bg-elevated)]/95 text-[var(--text-primary)] lg:flex lg:flex-col",
        collapsed ? "w-[5.5rem]" : "w-72"
      )}
    >
      <div className="flex h-16 items-center border-b border-[var(--border-subtle)] px-4">
        <div className={cn("flex flex-1 items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]">
            <GraduationCap size={21} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-5">SkillUp AI</h1>
              <p className="truncate text-xs text-[var(--text-muted)]">Learning workspace</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end px-4 py-3">
        <Button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => onCollapsedChange(!collapsed)}
          size="icon"
          variant="ghost"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ icon: Icon, label, path }) => {
          const link = (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                )
              }
            >
              <Icon size={19} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );

          return collapsed ? (
            <Tooltip content={label} key={label} side="right">
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3",
            collapsed && "justify-center"
          )}
        >
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name || "Student"}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {user?.email || "SkillUp Member"}
              </p>
            </div>
          )}
          <Button aria-label="Log out" onClick={handleLogout} size="icon" variant="ghost">
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
