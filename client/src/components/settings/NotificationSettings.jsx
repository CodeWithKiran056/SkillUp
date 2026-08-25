import { useState } from "react";

function Toggle({ title, description, defaultValue = false }) {
  const [enabled, setEnabled] = useState(defaultValue);

  return (
    <div className="flex items-center justify-between bg-[#202028] rounded-xl p-5">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {description}
        </p>
      </div>

      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-14 h-8 rounded-full transition relative ${
          enabled ? "bg-[#E76F51]" : "bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-8">
      <h2 className="text-2xl font-bold">
        Notifications
      </h2>

      <p className="text-gray-400 mt-2">
        Choose which notifications you want to receive.
      </p>

      <div className="mt-8 space-y-5">
        <Toggle
          title="Email Notifications"
          description="Receive important updates through email."
          defaultValue={true}
        />

        <Toggle
          title="Study Reminders"
          description="Get reminders before your study sessions."
          defaultValue={true}
        />

        <Toggle
          title="Partner Requests"
          description="Notify when someone sends a study request."
          defaultValue={true}
        />

        <Toggle
          title="EDITH AI Suggestions"
          description="Receive AI-powered study recommendations."
          defaultValue={true}
        />

        <Toggle
          title="Achievement Alerts"
          description="Celebrate streaks, badges and milestones."
          defaultValue={true}
        />

        <Toggle
          title="Product Updates"
          description="Receive updates about new SkillUp features."
        />
      </div>

      <button className="mt-8 bg-[#E76F51] hover:bg-[#d85d40] px-6 py-3 rounded-xl transition">
        Save Notification Settings
      </button>
    </div>
  );
}

export default NotificationSettings;