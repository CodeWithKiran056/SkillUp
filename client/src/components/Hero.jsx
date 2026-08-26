import { useNavigate } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

import Button from "./Button";
import skillupHero from "../assets/skillup-hero.png";


function Hero(){

const navigate = useNavigate();


return (

<section className="
relative
overflow-hidden
pt-32
pb-24
">


{/* Background subtle glow */}

<div

className="
absolute
left-1/2
top-[-250px]
h-[650px]
w-[650px]
-translate-x-1/2
rounded-full
bg-[#E76F51]/10
blur-[220px]
"

/>




<div

className="
relative
mx-auto
grid
max-w-7xl
items-center
gap-12
px-8
lg:grid-cols-2
"

>


{/* LEFT SIDE */}

<motion.div

initial={{
opacity:0,
y:40
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:0.7
}}

>


<div

className="
inline-flex
items-center
gap-3
rounded-full
border
border-[#26262F]
bg-[#15151B]
px-5
py-2
text-sm
text-gray-300
"

>

<span

className="
h-2
w-2
rounded-full
bg-[#E76F51]
"

/>


Students • AI Matching • Live Collaboration


</div>



<h1

className="
mt-8
text-5xl
font-bold
leading-tight
tracking-tight
sm:text-6xl
lg:text-7xl
"

>

Study Smarter.


<br/>


<span className="text-[#E76F51]">

Together.

</span>


</h1>


<p

className="
mt-8
max-w-xl
text-lg
leading-8
text-gray-400
"

>

SkillUp helps students discover compatible study partners,
collaborate in real time, and receive personalized AI
recommendations to improve learning outcomes.

</p>
{/* BUTTONS */}

<div

className="
mt-10
flex
flex-wrap
gap-4
"

>


<Button

onClick={()=>navigate("/register")}

className="
flex
items-center
gap-2
"

>

Get Started

<ArrowRight size={18}/>

</Button>





<Button

variant="secondary"

/* No demo video exists yet - the button stays visually
   consistent but is intentionally non-functional until
   the real demo is created. The tooltip explains why. */

disabled

title="Demo coming soon"

className="
flex
items-center
gap-2
"

>

<Play size={18}/>

Watch Demo


</Button>


</div>



</motion.div>







{/* RIGHT SIDE IMAGE */}



<motion.div

initial={{

opacity:0,

x:50

}}



animate={{

opacity:1,

x:0

}}



transition={{

duration:0.8

}}



className="
relative
flex
justify-center
items-center
"

>


<motion.img


src={skillupHero}


alt="SkillUp AI Learning"



animate={{

y:[0,-8,0]

}}



transition={{

duration:5,

repeat:Infinity,

ease:"easeInOut"

}}



className="
relative
z-10
w-full
max-w-xl
object-contain
drop-shadow-2xl
"

 />


</motion.div>

      </div>

    </section>

  );


}


export default Hero;