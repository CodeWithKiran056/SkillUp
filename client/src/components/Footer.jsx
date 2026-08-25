import {
  GraduationCap,
  Mail,
} from "lucide-react";

function Footer() {
  return (
    <footer
      id="footer"
      className="mt-24 border-t border-[#26262F]"
    >
      <div className="mx-auto max-w-7xl px-8 py-16">

        <div className="grid gap-12 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#E76F51] p-2">
                <GraduationCap
                  size={24}
                  className="text-white"
                />
              </div>

              <h2 className="text-3xl font-bold">
                Skill<span className="text-[#E76F51]">Up</span>
              </h2>
            </div>

            <p className="mt-6 max-w-lg leading-8 text-gray-400">
              SkillUp is a student collaboration platform designed to help
              learners connect with study partners, join collaborative study
              sessions, and monitor their learning progress in one place.
            </p>

            <button className="mt-8 flex h-11 w-11 items-center justify-center rounded-xl border border-[#26262F] bg-[#15151B] transition hover:border-[#E76F51]">
              <Mail size={20} />
            </button>

          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">
              Navigation
            </h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <a href="#" className="transition hover:text-white">
                  Home
                </a>
              </li>

              <li>
                <a href="#about" className="transition hover:text-white">
                  About
                </a>
              </li>

              <li>
                <a href="#features" className="transition hover:text-white">
                  Features
                </a>
              </li>

              <li>
                <a href="#footer" className="transition hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">
              Contact
            </h3>

            <div className="space-y-4 text-gray-400">
              <p>Mumbai, Maharashtra</p>
              <p>India</p>
              <p>Available for student collaboration</p>
            </div>
          </div>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#26262F] pt-8 text-center text-sm text-gray-500 md:flex-row">

          <p>
            © 2026 SkillUp. All rights reserved.
          </p>

          <p>
            Built with React, Tailwind CSS & Framer Motion
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;