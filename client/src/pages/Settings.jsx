import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Lock,
  User,
  Trash2,
  Loader2,
  Camera,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { getToken, getUser, saveUser } from "../utils/auth";

const API_URL = "http://localhost:5000";

/* =============================================================
   ChipEditor - add/remove tag editor for skills, interests
   and learning requirements.
   ============================================================= */
function ChipEditor({
  values,
  onChange,
  placeholder,
}) {
  const [input, setInput] = useState("");

  const addValue = () => {
    const value = input.trim();

    if (!value) return;

    const exists = values.some(
      (v) => v.toLowerCase() === value.toLowerCase()
    );

    if (exists) {
      setInput("");
      return;
    }

    onChange([...values, value]);
    setInput("");
  };

  const removeValue = (value) => {
    onChange(values.filter((v) => v !== value));
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          maxLength={60}
          className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#E76F51]"
        />

        <button
          type="button"
          onClick={addValue}
          disabled={!input.trim()}
          aria-label="Add"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E76F51] text-white transition hover:bg-[#d85e40] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </div>

      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="flex items-center gap-1.5 rounded-lg border border-[#26262F] bg-[#111116] px-3 py-1.5 text-xs text-gray-200"
            >
              {value}

              <button
                type="button"
                onClick={() => removeValue(value)}
                aria-label={`Remove ${value}`}
                className="text-gray-500 transition hover:text-red-400"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* =============================================================
   Settings
   ============================================================= */
function Settings() {
  /* Profile state */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] =
    useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState(
    []
  );
  const [
    learningRequirements,
    setLearningRequirements,
  ] = useState([]);

  /* Photo upload */
  const photoInputRef = useRef(null);
  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  /* Profile load + save */
  const [loadingProfile, setLoadingProfile] =
    useState(true);
  const [savingProfile, setSavingProfile] =
    useState(false);
  const [profileFeedback, setProfileFeedback] =
    useState(null);

  /* Password change */
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [pwdSaving, setPwdSaving] =
    useState(false);
  const [pwdFeedback, setPwdFeedback] =
    useState(null);

  /* Load the REAL profile from the backend on mount.
     localStorage is only synced AFTER the backend
     confirms a change - never used as source of truth. */
  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();

      if (!token) {
        setProfileFeedback({
          type: "error",
          text: "Please login again.",
        });
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData =
          response.data?.user;

        setName(userData?.name || "");
        setEmail(userData?.email || "");
        setProfileImage(
          userData?.profileImage || ""
        );
        setSkills(userData?.skills || []);
        setInterests(
          userData?.interests || []
        );
        setLearningRequirements(
          userData?.learningRequirements ||
            []
        );
      } catch (err) {
        console.error(
          "Profile load error:",
          err.response?.data || err.message
        );
        setProfileFeedback({
          type: "error",
          text:
            err.response?.status === 401
              ? "Your session has expired. Please log in again."
              : "Unable to load your profile.",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  /* Save profile changes */
  const handleSaveProfile = async () => {
    if (savingProfile) return;

    if (!name.trim()) {
      setProfileFeedback({
        type: "error",
        text: "Name cannot be empty.",
      });
      return;
    }

    setSavingProfile(true);
    setProfileFeedback(null);

    try {
      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        {
          name: name.trim(),
          skills,
          interests,
          learningRequirements,
          profileImage,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      /* Backend confirmed - now sync local session
         so Topbar/name reflect the change immediately. */
      const updatedUser = response.data?.user;

      const storedUser = getUser();
      if (storedUser && updatedUser) {
        saveUser({
          ...storedUser,
          name: updatedUser.name,
          profileImage: updatedUser.profileImage,
        });
      }

      setName(updatedUser?.name || name.trim());
      setSkills(updatedUser?.skills || skills);
      setInterests(
        updatedUser?.interests || interests
      );
      setLearningRequirements(
        updatedUser?.learningRequirements ||
          learningRequirements
      );

      setProfileFeedback({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (err) {
      console.error(
        "Profile save error:",
        err.response?.data || err.message
      );
      setProfileFeedback({
        type: "error",
        text:
          err.response?.data?.message ||
          "Unable to update your profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  /* Change password (separate submit) */
  const handleChangePassword = async () => {
    if (pwdSaving) return;

    setPwdFeedback(null);

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPwdFeedback({
        type: "error",
        text: "Please fill in all password fields.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPwdFeedback({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdFeedback({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    setPwdSaving(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPwdFeedback({
        type: "success",
        text:
          response.data?.message ||
          "Password changed successfully.",
      });
    } catch (err) {
      console.error(
        "Change password error:",
        err.response?.status || err.message
      );
      setPwdFeedback({
        type: "error",
        text:
          err.response?.data?.message ||
          "Unable to change your password.",
      });
    } finally {
      setPwdSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile || uploadingPhoto)
      return;

    setUploadingPhoto(true);
    setProfileFeedback(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(
        `${API_URL}/api/users/profile-image`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setProfileImage(
        response.data?.profileImage || ""
      );

      /* Keep the local session in sync */
      const storedUser = getUser();
      if (storedUser) {
        saveUser({
          ...storedUser,
          profileImage:
            response.data?.profileImage,
        });
      }

      setProfileFeedback({
        type: "success",
        text: "Profile photo updated.",
      });
    } catch (err) {
      console.error(
        "Photo upload error:",
        err.response?.data || err.message
      );
      setProfileFeedback({
        type: "error",
        text:
          err.response?.data?.message ||
          "Unable to upload photo.",
      });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };


  const feedbackClasses = (type) =>
    type === "success"
      ? "flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
      : "flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400";

  const FeedbackIcon = ({ type }) =>
    type === "success" ? (
      <CheckCircle2 size={16} />
    ) : (
      <AlertCircle size={16} />
    );

  if (loadingProfile) {
    return (
      <>
        <section className="border-b border-[#26262F] py-8">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
            Settings
          </span>
          <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
            Account Settings
          </h1>
        </section>

        <div className="mt-16 flex items-center justify-center gap-3 text-gray-400">
          <Loader2
            size={20}
            className="animate-spin text-[#E76F51]"
          />
          Loading your profile…
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-[#26262F] py-8">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
          Settings
        </span>

        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Account Settings
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-400">
          Manage your profile, skills and security.
        </p>
      </section>

      <div className="mt-8 space-y-6 pb-12">
        {profileFeedback && (
          <div className={feedbackClasses(profileFeedback.type)}>
            <FeedbackIcon type={profileFeedback.type} />
            {profileFeedback.text}
          </div>
        )}

        {/* Account */}
        <section className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">
          <div className="mb-6 flex items-center gap-3">
            <User size={22} className="text-[#E76F51]" />
            <h2 className="text-2xl font-semibold">Account</h2>
          </div>

          {/* Profile Photo - real backend upload */}
          <div className="mb-8 flex items-center gap-5">
            {profileImage ? (
              <img
                src={
                  /^https?:\/\//.test(profileImage)
                    ? profileImage
                    : `${API_URL}${profileImage}`
                }
                alt="Profile"
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#26262F] bg-[#111116] text-2xl font-semibold text-[#E76F51]">
                {(name || "S").charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#26262F] bg-[#111116] px-4 py-2 text-sm text-gray-300 transition hover:border-[#E76F51] hover:text-[#E76F51]">
                {uploadingPhoto ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Camera size={15} />
                )}
                {uploadingPhoto ? "Uploading…" : "Change photo"}
                <input
                  ref={photoInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or WEBP · max 5MB
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 text-sm text-white outline-none transition focus:border-[#E76F51]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Email{" "}
                <span className="text-xs text-gray-600">
                  (read-only)
                </span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 text-sm text-gray-500 outline-none"
              />
            </div>
          </div>
        </section>


        {/* Skills */}
        <section className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">
          <div className="mb-2 flex items-center gap-3">
            <User size={22} className="text-[#E76F51]" />
            <h2 className="text-2xl font-semibold">Skills</h2>
          </div>
          <p className="mb-5 text-sm text-gray-400">
            Used to match you with study partners.
          </p>

          <ChipEditor
            values={skills}
            onChange={setSkills}
            placeholder="Add a skill (e.g. React, Python) and press Enter"
          />
        </section>

        {/* Interests */}
        <section className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">
          <div className="mb-2 flex items-center gap-3">
            <User size={22} className="text-[#E76F51]" />
            <h2 className="text-2xl font-semibold">Interests</h2>
          </div>
          <p className="mb-5 text-sm text-gray-400">
            Topics you enjoy learning about.
          </p>

          <ChipEditor
            values={interests}
            onChange={setInterests}
            placeholder="Add an interest (e.g. Web Development) and press Enter"
          />
        </section>

        {/* Learning Requirements */}
        <section className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">
          <div className="mb-2 flex items-center gap-3">
            <User size={22} className="text-[#E76F51]" />
            <h2 className="text-2xl font-semibold">
              Learning Requirements
            </h2>
          </div>
          <p className="mb-5 text-sm text-gray-400">
            What you want to learn — this directly affects your
            partner matches.
          </p>

          <ChipEditor
            values={learningRequirements}
            onChange={setLearningRequirements}
            placeholder="Add a learning goal (e.g. Node.js) and press Enter"
          />

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile || loadingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E76F51] px-8 py-3 font-medium transition hover:bg-[#d85e40] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingProfile && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">
          <div className="mb-6 flex items-center gap-3">
            <Lock size={22} className="text-[#E76F51]" />
            <h2 className="text-2xl font-semibold">Security</h2>
          </div>

          {pwdFeedback && (
            <div className={`mb-5 ${feedbackClasses(pwdFeedback.type)}`}>
              <FeedbackIcon type={pwdFeedback.type} />
              {pwdFeedback.text}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              autoComplete="current-password"
              className="rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 text-sm text-white outline-none transition focus:border-[#E76F51]"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 6 characters)"
              autoComplete="new-password"
              className="rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 text-sm text-white outline-none transition focus:border-[#E76F51]"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              autoComplete="new-password"
              className="rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 text-sm text-white outline-none transition focus:border-[#E76F51]"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={pwdSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E76F51] px-8 py-3 font-medium transition hover:bg-[#d85e40] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pwdSaving && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {pwdSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </section>

        {/* Danger Zone - honest unavailable state */}
        <section className="rounded-2xl border border-red-500/30 bg-[#15151B] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Trash2 size={22} className="text-red-500" />
            <h2 className="text-2xl font-semibold text-red-400">
              Danger Zone
            </h2>
          </div>

          <p className="leading-7 text-gray-400">
            Account deletion is not available yet.
          </p>

          <button
            type="button"
            disabled
            title="Account deletion is currently unavailable"
            className="mt-4 cursor-not-allowed rounded-xl bg-red-600/40 px-6 py-3 font-medium text-red-200"
          >
            Delete Account (Unavailable)
          </button>
        </section>
      </div>
    </>
  );
}

export default Settings;

