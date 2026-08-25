import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";
import axios from "axios";
import Button from "../components/Button";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: cleanEmail,
        }
      );

      const message =
        response.data?.message ||
        "If an account with that email exists, a password reset link has been sent.";

      setSuccessMessage(message);
      setSent(true);
    } catch (err) {
      console.error(
        "Forgot Password Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to process password reset request. Please try again later."
      );
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
            Forgot Password?
          </h1>

          <p className="mt-4 leading-7 text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {!sent ? (
          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-3xl border border-[#26262F] bg-[#15151B] p-8"
          >
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-[#26262F] bg-[#111116] px-4">
              <Mail
                size={18}
                className="text-gray-400"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full bg-transparent py-4 outline-none text-white"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-6 w-full"
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
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
              Check your email
            </h2>

            <p className="mt-4 leading-7 text-gray-400">
              {successMessage ||
                "If an account with that email exists, a password reset link has been sent."}
            </p>

            <button
              type="button"
              onClick={() => {
                setSent(false);
                setError("");
              }}
              className="mt-6 text-sm text-[#E76F51] transition hover:text-[#d65f43]"
            >
              Use a different email
            </button>
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

export default ForgotPassword;

