import { ShieldCheck, Smartphone, Monitor, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-8">
      <h2 className="text-2xl font-bold">
        Security
      </h2>

      <p className="text-gray-400 mt-2">
        Protect your account with strong security settings.
      </p>

      {/* Password */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          Change Password
        </h3>

        <div className="space-y-4">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Current Password"
            className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E76F51] outline-none"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E76F51] outline-none"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E76F51] outline-none"
          />

          <button
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-2 text-[#E76F51]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPassword ? "Hide Passwords" : "Show Passwords"}
          </button>

          <button className="bg-[#E76F51] hover:bg-[#d85d40] px-6 py-3 rounded-xl transition">
            Update Password
          </button>

        </div>
      </div>

      {/* Two Factor */}
      <div className="mt-12 bg-[#202028] rounded-xl p-6 flex justify-between items-center">
        <div className="flex gap-4">
          <ShieldCheck className="text-green-400" />

          <div>
            <h3 className="font-semibold">
              Two-Factor Authentication
            </h3>

            <p className="text-gray-400 text-sm">
              Add an extra layer of security to your account.
            </p>
          </div>
        </div>

        <button className="bg-[#E76F51] px-5 py-2 rounded-lg">
          Enable
        </button>
      </div>

      {/* Active Devices */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">
          Active Devices
        </h3>

        <div className="space-y-4">

          <div className="bg-[#202028] rounded-xl p-5 flex justify-between">
            <div className="flex gap-4">
              <Monitor />

              <div>
                <h4 className="font-semibold">
                  Windows PC
                </h4>

                <p className="text-gray-400 text-sm">
                  Chrome • Pune • Active Now
                </p>
              </div>
            </div>

            <span className="text-green-400">
              Current
            </span>
          </div>

          <div className="bg-[#202028] rounded-xl p-5 flex justify-between">
            <div className="flex gap-4">
              <Smartphone />

              <div>
                <h4 className="font-semibold">
                  Android Phone
                </h4>

                <p className="text-gray-400 text-sm">
                  Last active 2 hours ago
                </p>
              </div>
            </div>

            <button className="text-red-400">
              Logout
            </button>
          </div>

        </div>

        <button className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl">
          Logout from All Devices
        </button>
      </div>
    </div>
  );
}

export default SecuritySettings;