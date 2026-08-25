import { Moon, Sun, Monitor } from "lucide-react";

function AppearanceSettings() {
  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        Appearance
      </h2>

      <div className="space-y-6">

        {/* Theme */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Theme
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <button className="flex flex-col items-center gap-3 border border-[#E76F51] bg-[#202028] rounded-xl p-5 hover:border-[#E76F51] transition">
              <Moon className="text-[#E76F51]" size={30} />
              <span>Dark</span>
            </button>

            <button className="flex flex-col items-center gap-3 border border-gray-700 rounded-xl p-5 hover:border-[#E76F51] transition">
              <Sun size={30} />
              <span>Light</span>
            </button>

            <button className="flex flex-col items-center gap-3 border border-gray-700 rounded-xl p-5 hover:border-[#E76F51] transition">
              <Monitor size={30} />
              <span>System</span>
            </button>

          </div>
        </div>

        {/* Font Size */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Font Size
          </h3>

          <select className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-[#E76F51]">
            <option>Small</option>
            <option selected>Medium</option>
            <option>Large</option>
          </select>
        </div>

        {/* Accent Color */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Accent Color
          </h3>

          <div className="flex gap-4">

            <button className="w-10 h-10 rounded-full bg-[#E76F51] border-2 border-white"></button>

            <button className="w-10 h-10 rounded-full bg-blue-500"></button>

            <button className="w-10 h-10 rounded-full bg-green-500"></button>

            <button className="w-10 h-10 rounded-full bg-purple-500"></button>

          </div>
        </div>

        {/* Save */}
        <div className="pt-4">
          <button className="bg-[#E76F51] hover:bg-[#d85d40] px-6 py-3 rounded-xl font-medium transition">
            Save Changes
          </button>
        </div>

      </div>

    </div>
  );
}

export default AppearanceSettings;