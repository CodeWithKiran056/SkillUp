import { GraduationCap, LogOut, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { getUser, logoutUser } from "../../utils/auth";
import { Button } from "../ui";
import { navItems } from "./navigation";

function MobileNavigation({ open, onOpenChange }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logoutUser();
    onOpenChange(false);
    navigate("/login");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Close navigation"
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        type="button"
      />

      <aside className="relative flex h-full w-[19rem] max-w-[86vw] flex-col border-r border-[var(--border-subtle)] bg-[var(--app-bg-elevated)] shadow-[var(--shadow-lg)]">
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
              <GraduationCap size={21} />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-5">SkillUp AI</h1>
              <p className="text-xs text-[var(--text-muted)]">Learning workspace</p>
            </div>
          </div>
          <Button aria-label="Close navigation" onClick={() => onOpenChange(false)} size="icon" variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={label}
              to={path}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                )
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-4">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
            <p className="truncate text-sm font-medium">{user?.name || "Student"}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {user?.email || "SkillUp Member"}
            </p>
            <Button className="mt-3 w-full justify-start" onClick={handleLogout} variant="secondary">
              <LogOut size={17} />
              Log out
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default MobileNavigation;
