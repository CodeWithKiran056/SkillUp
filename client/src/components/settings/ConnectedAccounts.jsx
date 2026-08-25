import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { CheckCircle2, Link2 } from "lucide-react";

const accounts = [
  {
    name: "Google",
    icon: FcGoogle,
    connected: true,
    email: "kiran@gmail.com",
  },
  {
    name: "GitHub",
    icon: FaGithub,
    connected: false,
    email: "Not Connected",
  },
  {
    name: "LinkedIn",
    icon: FaLinkedin,
    connected: false,
    email: "Not Connected",
  },
];

function ConnectedAccounts() {
  return (
    <div className="bg-[#15151B] border border-gray-800 rounded-2xl p-8">
      <h2 className="text-2xl font-bold">Connected Accounts</h2>

      <p className="text-gray-400 mt-2">
        Connect your external accounts for secure login and profile
        synchronization.
      </p>

      <div className="mt-8 space-y-5">
        {accounts.map((account) => {
          const Icon = account.icon;

          return (
            <div
              key={account.name}
              className="flex items-center justify-between bg-[#202028] rounded-2xl p-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-[#2b2b35] flex items-center justify-center text-3xl">
                  <Icon />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    {account.name}
                  </h3>

                  <p className="text-gray-400 text-sm">
                    {account.email}
                  </p>

                  {account.connected && (
                    <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
                      <CheckCircle2 size={16} />
                      Connected
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`px-5 py-3 rounded-xl font-medium transition ${
                  account.connected
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#E76F51] hover:bg-[#d85d40]"
                }`}
              >
                {account.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-[#202028] rounded-xl p-5 flex items-start gap-3">
        <Link2 className="text-[#E76F51] mt-1" />

        <p className="text-gray-300 leading-7">
          Connected accounts help you sign in securely, synchronize your
          profile, and enable future features like GitHub repository import,
          Google Sign-In, and LinkedIn profile verification. Your accounts are
          only accessed with your permission.
        </p>
      </div>
    </div>
  );
}

export default ConnectedAccounts;