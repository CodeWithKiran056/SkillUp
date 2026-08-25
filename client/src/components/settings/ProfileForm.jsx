import ProfilePhoto from "./ProfilePhoto";

function ProfileForm() {
  return (
    <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-8">

      <div className="border-b border-[#26262F] pb-6">

        <h2 className="text-3xl font-bold">
          Personal Information
        </h2>

        <p className="mt-2 text-gray-400">
          Update your public profile and account information.
        </p>

      </div>

      {/* Profile Photo */}

      <div className="mt-8">
        <ProfilePhoto />
      </div>

      {/* Form */}

      <div className="mt-10 grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-400">
            First Name
          </label>

          <input
            type="text"
            placeholder="Kiran"
            className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition-all duration-200 focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/10"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-400">
            Last Name
          </label>

          <input
            type="text"
            placeholder="Naik"
            className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition-all duration-200 focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/10"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-400">
            Username
          </label>

          <input
            type="text"
            placeholder="@kirannaik"
            className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition-all duration-200 focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/10"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-400">
            College
          </label>

          <input
            type="text"
            placeholder="Your College"
            className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition-all duration-200 focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/10"
          />

        </div>

        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-medium text-gray-400">
            Bio
          </label>

          <textarea
            rows={5}
            placeholder="Tell other students about yourself, your interests, learning goals, and the technologies you enjoy working with."
            className="w-full resize-none rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition-all duration-200 focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/10"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-400">
            GitHub Profile
          </label>

          <input
            type="url"
            placeholder="https://github.com/username"
            className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition-all duration-200 focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/10"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-400">
            LinkedIn Profile
          </label>

          <input
            type="url"
            placeholder="https://linkedin.com/in/username"
            className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition-all duration-200 focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/10"
          />

        </div>

      </div>

      {/* Buttons */}

      <div className="mt-10 flex flex-wrap gap-4">

        <button className="rounded-xl bg-[#E76F51] px-6 py-3 font-medium transition hover:bg-[#d65f43]">
          Save Changes
        </button>

        <button className="rounded-xl border border-[#26262F] bg-[#111116] px-6 py-3 font-medium transition hover:border-[#E76F51]">
          Cancel
        </button>

      </div>

    </div>
  );
}

export default ProfileForm;