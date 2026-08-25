import {
  Mail,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";

function AccountSettings() {
  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-8">
      <h2 className="text-2xl font-bold">
        Account Settings
      </h2>

      <p className="text-gray-400 mt-2">
        Manage your email addresses and account information.
      </p>

      {/* Primary Email */}
      <div className="mt-8 bg-[#202028] rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Mail className="text-[#E76F51]" />

            <div>
              <h3 className="font-semibold">
                Primary Email
              </h3>

              <p className="text-gray-400">
                kiran@example.com
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            Verified
          </div>
        </div>

        <button className="mt-6 bg-[#E76F51] px-5 py-3 rounded-xl hover:bg-[#d85d40] transition">
          Change Email
        </button>
      </div>

      {/* Secondary Emails */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">
          Secondary Emails
        </h3>

        <div className="mt-5 space-y-4">

          <div className="flex justify-between items-center bg-[#202028] rounded-xl p-4">
            <div>
              <p className="font-medium">
                example2@gmail.com
              </p>

              <span className="text-sm text-gray-400">
                Backup Email
              </span>
            </div>

            <button className="text-red-400 hover:text-red-300">
              <Trash2 />
            </button>
          </div>

          <button className="flex items-center gap-2 bg-[#202028] hover:bg-[#2a2a34] px-5 py-3 rounded-xl transition">
            <Plus size={18} />
            Add Secondary Email
          </button>

        </div>
      </div>
    </div>
  );
}

export default AccountSettings;