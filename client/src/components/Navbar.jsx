import { useEffect, useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";


function Navbar() {


  const [scrolled,setScrolled] = useState(false);
  const [menuOpen,setMenuOpen] = useState(false);



  useEffect(()=>{


    const handleScroll = ()=>{

      setScrolled(window.scrollY > 20);

    };


    window.addEventListener(
      "scroll",
      handleScroll
    );


    return ()=>{

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };


  },[]);



  const links = [

    {
      name:"Home",
      href:"#"
    },

    {
      name:"About",
      href:"#about"
    },

    {
      name:"Features",
      href:"#features"
    },

    {
      name:"Contact",
      href:"#footer"
    }

  ];




  return (

<header

className={`
fixed top-0 left-0 w-full z-50
transition-all duration-500

${
scrolled

?

"bg-[#0B0B0F]/70 backdrop-blur-xl border-b border-[#26262F] shadow-lg shadow-black/20"

:

"bg-transparent"

}

`}

>


<div

className="
mx-auto max-w-7xl
px-8 h-20
flex items-center
justify-between
"

>



{/* Logo */}


<Link

to="/"

className="
flex items-center gap-3
group
"

>


<div

className="
relative
rounded-xl
bg-[#E76F51]
p-2
transition
group-hover:scale-110
"

>


<div

className="
absolute inset-0
rounded-xl
bg-[#E76F51]
blur-lg
opacity-40
"

></div>



<GraduationCap

size={24}

className="
relative text-white
"

/>


</div>



<h1

className="
text-2xl
font-bold
text-white
"

>

Skill

<span className="text-[#E76F51]">

Up

</span>


</h1>


</Link>







{/* Desktop Navigation */}


<nav

className="
hidden md:flex
items-center
gap-10
"

>


{
links.map((link)=>(


<a

key={link.name}

href={link.href}

className="
text-gray-400
transition
duration-300

hover:text-white

relative

after:absolute
after:left-0
after:-bottom-2
after:h-[2px]
after:w-0
after:bg-[#E76F51]

hover:after:w-full
after:transition-all

"

>

{link.name}


</a>


))

}


</nav>






{/* Buttons */}


<div

className="
hidden md:flex
items-center
gap-5
"

>


<Link

to="/login"

className="
text-gray-400
hover:text-white
transition
"

>

Login

</Link>




<Link

to="/register"

className="
relative
overflow-hidden

rounded-xl
bg-[#E76F51]

px-6 py-3

font-medium
text-white

transition

hover:-translate-y-1

"

>


<span className="relative z-10">

Get Started

</span>


<div

className="
absolute inset-0
bg-gradient-to-r
from-[#E76F51]
to-[#ff8b6b]

opacity-0
transition

hover:opacity-100

"

/>


</Link>


</div>







{/* Mobile Button */}


<button

onClick={()=>setMenuOpen(!menuOpen)}

className="
md:hidden
text-white
"

>

{

menuOpen

?

<X size={28}/>

:

<Menu size={28}/>

}


</button>




</div>







{/* Mobile Menu */}


{

menuOpen &&

<div

className="
md:hidden

bg-[#111116]/95
backdrop-blur-xl

border-t
border-[#26262F]

"

>


<div

className="
flex flex-col
gap-5
px-8 py-6
"

>


{

links.map((link)=>(


<a

key={link.name}

href={link.href}

onClick={()=>setMenuOpen(false)}

className="
text-gray-300
hover:text-white
"

>

{link.name}

</a>


))

}



<Link

to="/login"

className="
text-gray-300
"

>

Login

</Link>




<Link

to="/register"

className="
rounded-xl
bg-[#E76F51]
py-3
text-center
"

>

Get Started

</Link>


</div>


</div>

}


</header>


  );


}


export default Navbar;