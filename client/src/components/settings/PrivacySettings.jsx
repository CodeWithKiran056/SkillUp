import { useState } from "react";

function Toggle({ title, description, defaultValue }) {
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
          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-8">
      <h2 className="text-2xl font-bold">
        Privacy
      </h2>

      <p className="text-gray-400 mt-2">
        Control who can view your profile and interact with you.
      </p>

      <div className="mt-8 space-y-5">

        <Toggle
          title="Public Profile"
          description="Allow everyone to discover your profile."
          defaultValue={true}
        />

        <Toggle
          title="Show Email Address"
          description="Display your email on your public profile."
          defaultValue={false}
        />

        <Toggle
          title="Show College"
          description="Display your college and course information."
          defaultValue={true}
        />

        <Toggle
          title="Allow Direct Messages"
          description="Anyone can send you a message."
          defaultValue={true}
        />

        <Toggle
          title="Allow Study Requests"
          description="Receive study partner requests."
          defaultValue={true}
        />

      </div>

      <button className="mt-8 bg-[#E76F51] hover:bg-[#d85d40] px-6 py-3 rounded-xl transition">
        Save Privacy Settings
      </button>
    </div>
  );
}

export default PrivacySettings;