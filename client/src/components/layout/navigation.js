import {
  BarChart3,
  Bot,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  MessageCircle,
  MonitorPlay,
  Settings,
  Users,
} from "lucide-react";

export const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: Users,
    label: "Find Partner",
    path: "/find-partner",
  },
  {
    icon: BookOpen,
    label: "Study Rooms",
    path: "/study-room",
  },
  {
    icon: Bot,
    label: "EDITH AI",
    path: "/edith-ai",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/analytics",
  },
  {
    icon: CalendarDays,
    label: "My Sessions",
    path: "/mysessions",
  },
  {
    icon: MonitorPlay,
    label: "Saved Recordings",
    path: "/saved-recordings",
  },
  {
    icon: MessageCircle,
    label: "Messages",
    path: "/messages",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

export function getPageTitle(pathname) {
  return navItems.find((item) => item.path === pathname)?.label || "SkillUp AI";
}
