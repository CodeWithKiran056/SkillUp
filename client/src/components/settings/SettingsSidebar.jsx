import {
  User,
  Mail,
  Shield,
  Bell,
  Palette,
  Lock,
  Bot,
  Link,
  AlertTriangle,
} from "lucide-react";

const menu = [
  {
    id: "profile",
    title: "Profile",
    icon: User,
  },
  {
    id: "account",
    title: "Account",
    icon: Mail,
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
  },
  {
    id: "appearance",
    title: "Appearance",
    icon: Palette,
  },
  {
    id: "privacy",
    title: "Privacy",
    icon: Lock,
  },
  {
    id: "ai",
    title: "AI Preferences",
    icon: Bot,
  },
  {
    id: "connected",
    title: "Connected Accounts",
    icon: Link,
  },
  {
    id: "danger",
    title: "Danger Zone",
    icon: AlertTriangle,
  },
];

function SettingsSidebar({ activeTab, setActiveTab }) {
  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-4 sticky top-6">
      <h2 className="text-xl font-bold mb-6 text-white">Settings</h2>

      <div className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-[#E76F51] text-white"
                  : "text-gray-400 hover:bg-[#202028] hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SettingsSidebar;