import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center px-6">

      <div className="max-w-xl text-center">

        {/* Logo */}

        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
          SkillUp
        </span>


        {/* Error */}

        <h1 className="mt-8 text-8xl font-black text-[#E76F51]">
          404
        </h1>


        <h2 className="mt-6 text-3xl font-bold">
          Page Not Found
        </h2>


        <p className="mt-4 leading-7 text-gray-400">
          The page you are looking for doesn't exist or may have been moved.
          Let's get you back to learning.
        </p>


        {/* Buttons */}

        <div className="mt-10 flex flex-wrap justify-center gap-4">


          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl bg-[#E76F51] px-6 py-3 font-medium transition hover:bg-[#d65f43]"
          >

            <Home size={18} />

            Go Home

          </Link>



          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-[#26262F] bg-[#15151B] px-6 py-3 font-medium transition hover:border-[#E76F51]"
          >

            <ArrowLeft size={18} />

            Dashboard

          </Link>


        </div>


      </div>

    </div>
  );
}

export default NotFound;