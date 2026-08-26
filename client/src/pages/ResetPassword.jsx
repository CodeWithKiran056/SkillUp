import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import axios from "axios";
import Button from "../components/Button";

function ResetPassword() {
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!newPassword) {
      setError("New password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          password: newPassword,
        }
      );

      if (response.data?.success) {
        setSuccess(true);
      } else {
        setError(
          response.data?.message ||
            "Unable to reset password. Please try again."
        );
      }
    } catch (err) {
      console.error(
        "Reset Password Error:",
        err.response?.data?.message || err.message
      );

      const backendMessage = err.response?.data?.message;

      if (backendMessage === "Invalid or expired reset token") {
        setError("Invalid or expired reset link.");
      } else {
        setError(
          backendMessage ||
            "Unable to reset password. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
            SkillUp
          </span>

          <h1 className="mt-6 text-4xl font-bold">
            Reset Password
          </h1>

          <p className="mt-4 leading-7 text-gray-400">
            Create a strong, new password for your account.
          </p>
        </div>

        {!success ? (
          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-3xl border border-[#26262F] bg-[#15151B] p-8 space-y-6"
          >
            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 pr-12 outline-none transition focus:border-[#E76F51] text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 pr-12 outline-none transition focus:border-[#E76F51] text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        ) : (
          <div className="mt-10 rounded-3xl border border-[#26262F] bg-[#15151B] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle
                size={32}
                className="text-green-400"
              />
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              Password reset successful
            </h2>

            <p className="mt-4 leading-7 text-gray-400">
              Password reset successful. You can now login.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block w-full rounded-xl bg-[#E76F51] py-3 text-center text-sm font-medium text-white transition hover:bg-[#d65f43]"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

