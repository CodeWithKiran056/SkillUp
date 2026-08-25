import {
  AlertTriangle,
  Download,
  Trash2,
  UserX,
} from "lucide-react";

function DangerZone() {
  return (
    <div className="bg-[#15151B] border border-red-900 rounded-2xl p-8">

      <div className="flex items-center gap-3">
        <AlertTriangle className="text-red-500" size={28} />

        <div>
          <h2 className="text-2xl font-bold text-red-400">
            Danger Zone
          </h2>

          <p className="text-gray-400">
            These actions are sensitive and may permanently affect your account.
          </p>
        </div>
      </div>

      {/* Export Data */}
      <div className="mt-8 bg-[#202028] rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            Export Account Data
          </h3>

          <p className="text-gray-400 mt-1">
            Download a copy of your profile, study history, and account data.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-[#E76F51] hover:bg-[#d85d40] px-5 py-3 rounded-xl transition">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Deactivate */}
      <div className="mt-6 bg-[#202028] rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            Deactivate Account
          </h3>

          <p className="text-gray-400 mt-1">
            Temporarily disable your account. You can reactivate it anytime by logging in.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-5 py-3 rounded-xl transition">
          <UserX size={18} />
          Deactivate
        </button>
      </div>

      {/* Delete */}
      <div className="mt-6 bg-[#202028] rounded-xl p-6 flex items-center justify-between border border-red-900">
        <div>
          <h3 className="font-semibold text-lg text-red-400">
            Delete Account
          </h3>

          <p className="text-gray-400 mt-1">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl transition">
          <Trash2 size={18} />
          Delete
        </button>
      </div>

    </div>
  );
}

export default DangerZone;