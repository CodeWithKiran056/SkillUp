import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import axios from "axios";

import Button from "../components/Button";
import {
  clearAuth,
  saveToken,
  saveUser,
} from "../utils/auth";


function Register() {

  const navigate = useNavigate();


  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [form, setForm] = useState({

    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,

  });


  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);




  const handleChange = (e) => {


    const { name, value, type, checked } = e.target;


    setForm({

      ...form,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    });


  };


  const passwordRules = {

    length:
      form.password.length >= 8,

    uppercase:
      /[A-Z]/.test(form.password),

    lowercase:
      /[a-z]/.test(form.password),

    number:
      /[0-9]/.test(form.password),

    special:
      /[!@#$%^&*]/.test(form.password),

  };


  const isPasswordValid =
    Object.values(passwordRules).every(Boolean);


  const passwordsMatch =
    form.password &&
    form.password === form.confirmPassword;




  const handleSubmit = async (e) => {


    e.preventDefault();


    setError("");
    setSuccess("");


    if (!form.firstName) {

      setError("First name is required");

      return;

    }


    if (!form.lastName) {

      setError("Last name is required");

      return;

    }


    if (!form.email) {

      setError("Email is required");

      return;

    }


    if (!form.password) {

      setError("Password is required");

      return;

    }


    if (!isPasswordValid) {

      setError(
        "Password does not meet requirements"
      );

      return;

    }


    if (!passwordsMatch) {

      setError(
        "Passwords do not match"
      );

      return;

    }


    if (!form.terms) {

      setError(
        "Please accept Terms and Privacy Policy"
      );

      return;

    }


    try {

      setLoading(true);

      /*
       * Create the account on the backend.
       * The authenticated user MUST come from the
       * current login/registration session returned by
       * the server — never from a stale local object.
       */
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          password: form.password,
        }
      );


      const { token, user } = response.data;

      /*
       * Registration succeeded. Wipe any stale session first,
       * then persist the REAL backend session (token + user
       * that carries a real id). The password is NEVER written
       * to localStorage — the authenticated user always comes
       * from the current session returned by the server.
       */
      clearAuth();
      saveToken(token);
      saveUser(user);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });

      /*
       * Move to the dashboard — the user now holds a real
       * backend session (token + user with a real id).
       */
      navigate("/dashboard", { replace: true });

    } catch (err) {

      console.error(
        "Register Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to create account."
      );

    } finally {

      setLoading(false);

    }

  };
    return (

    <div className="min-h-screen bg-[#0B0B0F] text-white">


      <div className="mx-auto flex min-h-screen max-w-7xl">


        {/* Left Side */}


        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[54%] xl:px-16">


          <div className="w-full max-w-md">


            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">

              SkillUp

            </span>


            <h1 className="mt-6 text-4xl font-bold tracking-tight">

              Create Account

            </h1>


            <p className="mt-3 leading-7 text-gray-400">

              Join SkillUp and connect with students to learn,
              collaborate and grow together.

            </p>


            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-5"
            >




              {/* Name */}


              <div className="grid gap-5 md:grid-cols-2">


                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">

                    First Name

                  </label>


                  <input

                    type="text"

                    name="firstName"

                    value={form.firstName}

                    onChange={handleChange}

                    placeholder="Kiran"

                    className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition focus:border-[#E76F51]"

                  />

                </div>


                <div>


                  <label className="mb-2 block text-sm font-medium text-gray-300">

                    Last Name

                  </label>


                  <input

                    type="text"

                    name="lastName"

                    value={form.lastName}

                    onChange={handleChange}

                    placeholder="Naik"

                    className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition focus:border-[#E76F51]"

                  />


                </div>


              </div>




              {/* Email */}


              <div>


                <label className="mb-2 block text-sm font-medium text-gray-300">

                  Email

                </label>


                <input

                  type="email"

                  name="email"

                  value={form.email}

                  onChange={handleChange}

                  placeholder="name@example.com"

                  className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 outline-none transition focus:border-[#E76F51]"

                />


              </div>




              {/* Password */}


              <div>


                <label className="mb-2 block text-sm font-medium text-gray-300">

                  Password

                </label>


                <div className="relative">


                  <input

                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }

                    name="password"

                    value={form.password}

                    onChange={handleChange}

                    placeholder="Create password"

                    className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 pr-12 outline-none transition focus:border-[#E76F51]"

                  />


                  <button

                    type="button"

                    onClick={() =>
                      setShowPassword(!showPassword)
                    }

                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"

                  >

                    {
                      showPassword
                        ?
                      <EyeOff size={20}/>
                        :
                      <Eye size={20}/>
                    }


                  </button>


                </div>


              </div>




              {/* Password Rules */}


              <div className="rounded-xl border border-[#26262F] bg-[#111116] p-4">


                <p className="mb-3 text-sm text-gray-400">

                  Password must contain:

                </p>


                <div className="grid grid-cols-2 gap-3 text-sm">


                  {
                    Object.entries({

                      "8 characters":
                        passwordRules.length,

                      "Uppercase":
                        passwordRules.uppercase,

                      "Lowercase":
                        passwordRules.lowercase,

                      "Number":
                        passwordRules.number,

                      "Special":
                        passwordRules.special,

                    }).map(([text, valid]) => (


                      <div
                        key={text}
                        className="flex items-center gap-2"
                      >


                        {
                          valid
                            ?
                          <Check
                            size={16}
                            className="text-green-400"
                          />
                            :
                          <X
                            size={16}
                            className="text-red-400"
                          />
                        }


                        <span className="text-gray-400">

                          {text}

                        </span>


                      </div>


                    ))
                  }


                </div>


              </div>
                            {/* Confirm Password */}


              <div>


                <label className="mb-2 block text-sm font-medium text-gray-300">

                  Confirm Password

                </label>


                <div className="relative">


                  <input

                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }

                    name="confirmPassword"

                    value={form.confirmPassword}

                    onChange={handleChange}

                    placeholder="Confirm password"

                    className="w-full rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 pr-12 outline-none transition focus:border-[#E76F51]"

                  />




                  <button

                    type="button"

                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }

                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"

                  >

                    {
                      showConfirmPassword
                        ?
                      <EyeOff size={20}/>
                        :
                      <Eye size={20}/>
                    }


                  </button>


                </div>


              </div>




              {/* Error */}


              {
                error && (

                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">

                    {error}

                  </div>

                )
              }


              {
                success && (

                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">

                    {success}

                  </div>

                )
              }




              {/* Terms */}


              <label className="flex items-start gap-3 text-sm text-gray-400">


                <input

                  type="checkbox"

                  name="terms"

                  checked={form.terms}

                  onChange={handleChange}

                  className="mt-1 h-4 w-4 accent-[#E76F51]"

                />


                <span>

                  I agree to the Terms of Service and Privacy Policy.

                </span>


              </label>




              {/* Button */}


              <Button

                type="submit"

                disabled={loading}

                className="w-full disabled:cursor-not-allowed disabled:opacity-50"

              >


                {loading
                  ? "Creating Account..."
                  : "Create Account"}


              </Button>


              <p className="text-center text-sm text-gray-400">

                Already have an account?{" "}


                <Link

                  to="/login"

                  className="font-medium text-[#E76F51] hover:text-[#d65f43]"

                >

                  Sign In

                </Link>


              </p>


            </form>


          </div>


        </div>


        {/* Right Side */}


        <div className="hidden w-[46%] border-l border-[#26262F] bg-[#111116] lg:flex">


          <div className="flex w-full flex-col justify-center p-12">


            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">

              SkillUp

            </span>


            <h2 className="mt-6 text-5xl font-bold leading-tight">

              Start Your

              <br />

              Learning Journey


            </h2>


            <p className="mt-6 max-w-md text-lg leading-8 text-gray-400">

              Create your profile, find study partners,
              join collaborative sessions and improve your skills.


            </p>


            <div className="mt-12 rounded-2xl border border-[#26262F] bg-[#15151B] p-8">


              <h3 className="text-2xl font-semibold">

                Why Join SkillUp?


              </h3>


              <div className="mt-6 space-y-4">


                <div className="rounded-xl border border-[#26262F] bg-[#111116] px-5 py-4 text-gray-300">

                  Find students with similar learning goals.


                </div>


                <div className="rounded-xl border border-[#26262F] bg-[#111116] px-5 py-4 text-gray-300">

                  Collaborate through AI-powered recommendations.


                </div>


                <div className="rounded-xl border border-[#26262F] bg-[#111116] px-5 py-4 text-gray-300">

                  Track your progress and learning journey.


                </div>


              </div>


            </div>


          </div>


        </div>


      </div>


    </div>


  );


}


export default Register;
