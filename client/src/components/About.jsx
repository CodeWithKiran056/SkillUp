import {
  ArrowRight,
  Users,
  Brain,
  MessageSquare,
  BarChart3
} from "lucide-react";

import { motion } from "framer-motion";
import Button from "./Button";


const features = [
  {
    icon: Users,
    title: "Study Partner Matching",
    description:
      "Find students with similar goals, subjects and learning interests."
  },

  {
    icon: Brain,
    title: "Personalized Suggestions",
    description:
      "AI recommends suitable study partners and learning paths."
  },

  {
    icon: MessageSquare,
    title: "Collaborative Study Rooms",
    description:
      "Discuss, share knowledge and learn together in real-time."
  },

  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track your improvement through smart learning analytics."
  }
];



function About() {


  return (

    <section
      id="about"
      className="
      relative
      overflow-hidden
      mx-auto
      max-w-7xl
      px-8
      py-28
      "
    >


      {/* Background Glow */}

      <div
        className="
        absolute
        left-[-200px]
        top-20
        h-[400px]
        w-[400px]
        rounded-full
        bg-[#E76F51]/10
        blur-[180px]
        "
      />



      <div
        className="
        relative
        grid
        items-center
        gap-16
        lg:grid-cols-2
        "
      >



        {/* LEFT CONTENT */}


        <motion.div

          initial={{
            opacity:0,
            x:-40
          }}

          whileInView={{
            opacity:1,
            x:0
          }}

          viewport={{
            once:true
          }}

          transition={{
            duration:0.7
          }}

        >



          <span
            className="
            text-sm
            font-semibold
            uppercase
            tracking-[0.3em]
            text-[#E76F51]
            "
          >
            About SkillUp
          </span>



          <h2
            className="
            mt-6
            text-4xl
            font-bold
            leading-tight
            sm:text-5xl
            "
          >

            Helping Students

            <br />

            <span className="text-[#E76F51]">
              Learn Better Together.
            </span>

          </h2>




          <p
            className="
            mt-8
            max-w-xl
            text-lg
            leading-8
            text-gray-400
            "
          >

            SkillUp is an AI-powered student collaboration platform
            that helps learners discover compatible study partners,
            collaborate in real-time study rooms, and improve learning
            outcomes through personalized recommendations.

          </p>




          <Button

            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }

            className="
            mt-10
            flex
            items-center
            gap-2
            "

          >

            Explore Platform

            <ArrowRight size={18}/>

          </Button>



        </motion.div>





        {/* RIGHT FEATURE CARDS */}



        <motion.div

          initial={{
            opacity:0,
            x:40
          }}

          whileInView={{
            opacity:1,
            x:0
          }}

          viewport={{
            once:true
          }}

          transition={{
            duration:0.7
          }}

          className="
          grid
          gap-5
          sm:grid-cols-2
          "

        >



          {
            features.map(({icon:Icon,title,description},index)=>(


              <motion.div

                key={title}


                initial={{
                  opacity:0,
                  y:30
                }}


                whileInView={{
                  opacity:1,
                  y:0
                }}


                viewport={{
                  once:true
                }}


                transition={{
                  duration:0.5,
                  delay:index*0.1
                }}


                whileHover={{
                  y:-8
                }}


                className="
                group
                rounded-3xl
                border
                border-[#26262F]
                bg-[#15151B]/80
                p-6
                backdrop-blur-xl
                transition
                hover:border-[#E76F51]
                hover:shadow-[0_0_40px_rgba(231,111,81,0.15)]
                "

              >



                <div
                  className="
                  mb-5
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#E76F51]/10
                  transition
                  group-hover:bg-[#E76F51]/20
                  "
                >

                  <Icon
                    size={23}
                    className="text-[#E76F51]"
                  />

                </div>




                <h3
                  className="
                  text-lg
                  font-semibold
                  "
                >
                  {title}
                </h3>



                <p
                  className="
                  mt-3
                  text-sm
                  leading-7
                  text-gray-400
                  "
                >

                  {description}

                </p>



              </motion.div>


            ))
          }



        </motion.div>



      </div>


    </section>

  );

}


export default About;