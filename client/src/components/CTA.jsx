import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Button from "./Button";


function CTA() {

  const navigate = useNavigate();


  return (

    <section className="relative overflow-hidden px-8 py-24">


      {/* Background */}

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E76F51]/10 blur-[200px]" />




      <motion.div

        initial={{
          opacity: 0,
          y: 30,
        }}

        whileInView={{
          opacity: 1,
          y: 0,
        }}

        viewport={{
          once: true,
        }}

        transition={{
          duration: 0.6,
        }}

        className="relative mx-auto max-w-6xl rounded-3xl border border-[#26262F] bg-[#15151B] p-8 text-center sm:p-12"

      >



        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">

          Get Started

        </span>





        <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">

          Ready to Build

          <br />

          Better Study Habits?

        </h2>





        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">

          Create your profile, connect with compatible study partners,
          join collaborative study sessions, and keep your learning
          organized in one place.

        </p>






        <div className="mt-10 flex flex-wrap justify-center gap-4">



          <Button

            onClick={() => navigate("/register")}

            className="flex items-center gap-2"

          >

            Get Started

            <ArrowRight size={18} />

          </Button>






          <Button

            variant="secondary"

            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }

          >

            Explore Features

          </Button>



        </div>




      </motion.div>



    </section>

  );

}


export default CTA;