import { Menu, Search, UserCircle } from "lucide-react";
import { getUser } from "../../utils/auth";
import { Button, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator, Input } from "../ui";
import NotificationBell from "./NotificationBell";

function Topbar({ actions, onMobileMenu, title }) {
  const user = getUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--app-bg)]/92 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <Button
        aria-label="Open navigation"
        className="lg:hidden"
        onClick={onMobileMenu}
        size="icon"
        variant="ghost"
      >
        <Menu size={20} />
      </Button>

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">SkillUp AI workspace</p>
      </div>

      <div className="relative min-w-0 flex-1 sm:ml-4">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          size={17}
        />
        <Input
          aria-label="Search"
          className="h-10 bg-[var(--surface-1)] pl-10"
          placeholder="Search partners, skills, subjects..."
        />
      </div>

      {actions && <div className="hidden items-center gap-2 md:flex">{actions}</div>}

      <NotificationBell />

      <Dropdown
        trigger={
          <button
            className="flex h-10 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2 text-left transition-colors hover:bg-[var(--surface-2)]"
            type="button"
          >
            <UserCircle className="text-[var(--accent)]" size={24} />
            <span className="hidden min-w-0 lg:block">
              <span className="block max-w-36 truncate text-sm font-medium">
                {user?.name || "Student"}
              </span>
              <span className="block max-w-36 truncate text-xs text-[var(--text-muted)]">
                {user?.email || "SkillUp Member"}
              </span>
            </span>
          </button>
        }
      >
        <DropdownLabel>Account</DropdownLabel>
        <div className="px-3 pb-2 text-sm">
          <p className="truncate font-medium text-[var(--text-primary)]">{user?.name || "Student"}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">
            {user?.email || "SkillUp Member"}
          </p>
        </div>
        <DropdownSeparator />
        <DropdownItem onClick={() => {}}>Profile</DropdownItem>
        <DropdownItem onClick={() => {}}>Preferences</DropdownItem>
      </Dropdown>
    </header>
  );
}

export default Topbar;
