import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

import Button from "../components/Button";
import {
  clearAuth,
  saveToken,
  saveUser,
} from "../utils/auth";
import { API_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Email and password are required."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Start from a clean session so a stale user object from a
       * previous account can NEVER survive this login attempt.
       */
      clearAuth();

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: cleanEmail,
          password,
        }
      );

      const {
        token,
        user,
      } = response.data;

      if (!token) {
        throw new Error(
          "Login response did not contain a token."
        );
      }

      saveToken(token);

      if (user) {
        saveUser(user);
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl">

        {/* LEFT SIDE */}

        <div className="flex w-full items-center justify-center px-6 lg:w-[54%]">
          <div className="w-full max-w-md">

            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
              SkillUp
            </span>

            <h1 className="mt-6 text-4xl font-bold">
              Welcome Back
            </h1>

            <p className="mt-3 leading-7 text-gray-400">
              Sign in to continue your learning
              journey and connect with your study
              partners.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-6"
            >

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition focus:border-[#E76F51]"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#E76F51] transition hover:text-[#d65f43]"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 pr-12 outline-none focus:border-[#E76F51]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* LOGIN */}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#E76F51] transition hover:text-[#d65f43]"
                >
                  Create one
                </Link>
              </p>

            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="hidden w-[46%] bg-[#111116] lg:flex">
          <div className="flex w-full flex-col justify-center p-12">

            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
              SkillUp
            </span>

            <h2 className="mt-6 text-5xl font-bold leading-tight">
              Learn Better.
              <br />
              Together.
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-gray-400">
              Connect with students, create study
              rooms, exchange skills and collaborate
              in a better learning environment.
            </p>

            <div className="mt-12 rounded-2xl border border-[#26262F] bg-[#15151B] p-8">

              <h3 className="text-2xl font-semibold">
                Built for Collaborative Learning
              </h3>

              <p className="mt-5 leading-8 text-gray-400">
                SkillUp helps students connect with
                learners, join study sessions and
                improve together.
              </p>

              <div className="mt-8 space-y-4">

                <div className="rounded-xl border border-[#26262F] bg-[#111116] px-5 py-4">
                  Find study partners based on your
                  interests.
                </div>

                <div className="rounded-xl border border-[#26262F] bg-[#111116] px-5 py-4">
                  Create and join collaborative study
                  rooms.
                </div>

                <div className="rounded-xl border border-[#26262F] bg-[#111116] px-5 py-4">
                  Learn together and track your
                  progress.
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;