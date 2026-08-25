import { useEffect, useRef } from "react";
import mermaid from "mermaid";


function EdithDiagram({code}){


const diagramRef = useRef(null);



useEffect(()=>{


mermaid.initialize({

startOnLoad:false,

theme:"dark",

securityLevel:"loose"

});



const renderDiagram = async()=>{


try{


if(!code || !diagramRef.current) return;



const {svg}=await mermaid.render(

"edithDiagram",

code.trim()

);



diagramRef.current.innerHTML = svg;



}

catch(error){


console.log(
"Mermaid Diagram Error:",
error
);


}


};



renderDiagram();



},[code]);





return(


<div className="
my-6
rounded-2xl
border
border-[#26262F]
bg-[#15151B]
p-6
overflow-x-auto
">


<div

ref={diagramRef}

/>



</div>


);


}



export default EdithDiagram;