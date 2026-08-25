import { BrainCircuit } from "lucide-react";

function AISettings() {
  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-8">
      <div className="flex items-center gap-3">
        <BrainCircuit className="text-[#E76F51]" size={28} />

        <div>
          <h2 className="text-2xl font-bold">
            AI Preferences
          </h2>

          <p className="text-gray-400 mt-1">
            Help EDITH AI personalize your learning experience.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <div>
          <label className="block mb-2 text-gray-400">
            Preferred Subject
          </label>

          <select className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 outline-none">
            <option>Data Structures</option>
            <option>Algorithms</option>
            <option>React</option>
            <option>Python</option>
            <option>Machine Learning</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-gray-400">
            Learning Style
          </label>

          <select className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 outline-none">
            <option>Visual</option>
            <option>Reading/Writing</option>
            <option>Hands-on Practice</option>
            <option>Video Based</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-gray-400">
            Daily Study Goal
          </label>

          <input
            type="number"
            placeholder="2 Hours"
            className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-400">
            Preferred Session
          </label>

          <select className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 outline-none">
            <option>30 Minutes</option>
            <option>45 Minutes</option>
            <option>1 Hour</option>
            <option>2 Hours</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2 text-gray-400">
            Weak Subjects
          </label>

          <textarea
            rows="4"
            placeholder="Example: Graph Theory, Dynamic Programming..."
            className="w-full bg-[#202028] border border-gray-700 rounded-xl px-4 py-3 outline-none"
          />
        </div>

      </div>

      <button className="mt-8 bg-[#E76F51] hover:bg-[#d85d40] px-6 py-3 rounded-xl transition">
        Save AI Preferences
      </button>
    </div>
  );
}

export default AISettings;