import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

import EdithDiagram from "../components/EdithDiagram";
import { getToken } from "../utils/auth";
import { API_URL } from "../config/api";

import {
  Send,
  Download,
  Loader2,
  Paperclip,
  X,
  Image,
  FileText,
  Code,
  Brain,
  BookOpen,
  Trash2
} from "lucide-react";


function EdithAI(){


const [message,setMessage] = useState("");

const [chat,setChat] = useState([]);

const [loading,setLoading] = useState(false);

const [file,setFile] = useState(null);



/* Auto-scroll to latest message like a real chat app */
const chatScrollRef = useRef(null);

useEffect(()=>{

if(chatScrollRef.current){

chatScrollRef.current.scrollTo({

top:chatScrollRef.current.scrollHeight,

behavior:"smooth"

});

}

},[chat.length,loading]);





// File Upload

const handleFile = (e)=>{


const selectedFile = e.target.files[0];


if(selectedFile){

setFile(selectedFile);

}


};





// Remove File

const removeFile = ()=>{

setFile(null);

};





// Clear Chat

const clearChat = ()=>{


setChat([]);

setMessage("");

setFile(null);


};







// Ask EDITH AI

const askAI = async()=>{


if(!message.trim() && !file) return;


if(loading) return;





const userQuestion = message;



/* Conversation history sent to the backend so
   follow-ups ("explain it simply") work. Capped
   again server-side. */
const history = chat

.filter((item)=>item.text && (item.type==="user"||item.type==="ai"))

.slice(-10)

.map((item)=>({

role:item.type==="user" ? "user" : "assistant",

content:item.text

}));



setChat((prev)=>[

...prev,

{

type:"user",

text:userQuestion,

file:file?.name || null

}

]);





setMessage("");

setLoading(true);





try{


const formData = new FormData();



formData.append(
"message",
userQuestion
);


/* Conversation context */
formData.append(
"history",
JSON.stringify(history)
);





if(file){


formData.append(
"file",
file
);


}





const response = await axios.post(

`${API_URL}/api/ai/chat`,

formData,

{

headers:{

"Content-Type":"multipart/form-data",

Authorization:`Bearer ${getToken()}`

}

}

);







setChat((prev)=>[

...prev,

{

type:"ai",

text:response.data.answer

}

]);





setFile(null);



}

catch(error){


/* Honest, non-technical error states.
   Never exposes tokens or raw stack traces. */
console.log(
"EDITH ERROR:",
error?.response?.status || error?.message
);


let errorText =
"Sorry, EDITH is unable to respond right now. Please try again.";


if(error?.response?.status === 401){

errorText = "Your session has expired. Please log in again to keep chatting with EDITH.";

}
else if(error?.code === "ECONNABORTED"){

errorText = "EDITH took too long to respond. Please try again.";

}
else if(error?.response?.data?.message){

errorText = `EDITH request failed: ${error.response.data.message}`;

}


setChat((prev)=>[

...prev,

{

type:"ai",

text:errorText

}

]);



}



setLoading(false);



};







// Download AI Response PDF

const downloadPDF = (text)=>{


const pdf = new jsPDF();



pdf.setFontSize(18);



pdf.text(

"SkillUp - EDITH AI",

10,

15

);




pdf.setFontSize(12);



const lines = pdf.splitTextToSize(

text,

180

);



pdf.text(

lines,

10,

30

);



pdf.save(

"EDITH_AI_Response.pdf"

);


};









// Mermaid Diagram Detection

const renderMarkdown = (text)=>{


const mermaidRegex =

/```mermaid([\s\S]*?)```/;



const match = text.match(
mermaidRegex
);





if(match){


return {


diagram:
match[1],


text:
text.replace(
mermaidRegex,
""
)


};


}





return {


diagram:null,


text


};



};







const suggestions = [


{

title:"Explain Topic",

icon:BookOpen,

text:"Explain any topic with definition, examples and important points."

},



{

title:"Generate Notes",

icon:FileText,

text:"Generate detailed exam notes."

},



{

title:"Explain Code",

icon:Code,

text:"Explain this code step by step."

},



{

title:"Create Quiz",

icon:Brain,

text:"Create quiz questions with answers."

}


];

return(

<>





{/* Clear Chat Button */}

<div className="
absolute
right-8
top-5
z-20
">


<button

onClick={clearChat}

className="
flex
items-center
gap-2
rounded-lg
px-3
py-2
text-sm
text-gray-400
transition
hover:bg-[#15151B]
hover:text-red-400
"

>

<Trash2 size={15}/>

Clear

</button>


</div>









{/* Chat Area */}


<section ref={chatScrollRef} className="
flex-1
overflow-y-auto
px-8
py-8
">





{

chat.length===0 ? (




<div className="
flex
h-full
flex-col
items-center
justify-center
text-center
">





<div className="
flex
h-24
w-24
items-center
justify-center
rounded-3xl
bg-[#E76F51]/10
">


<span className="text-5xl">

✨

</span>


</div>





<h1 className="
mt-8
text-4xl
font-bold
">

How can I help you today?

</h1>





<p className="
mt-3
max-w-xl
text-gray-400
">

Ask EDITH anything about studies,
projects, coding or any subject.

</p>







<div className="
mt-8
grid
max-w-4xl
grid-cols-2
gap-4
">



{

suggestions.map((item)=>{


const Icon=item.icon;



return(


<button

key={item.title}

onClick={()=>setMessage(item.text)}

className="
rounded-2xl
border
border-[#26262F]
bg-[#15151B]
p-5
text-left
transition
hover:border-[#E76F51]
"

>



<div className="
flex
items-center
gap-3
">


<Icon

size={22}

className="text-[#E76F51]"

/>


<h3 className="font-semibold">

{item.title}

</h3>


</div>




<p className="
mt-2
text-sm
text-gray-400
">

{item.text}

</p>



</button>


)


})


}



</div>






</div>





)

:



(





<div className="
mx-auto
w-full
max-w-6xl
space-y-6
">





{

chat.map((item,index)=>{



const result = item.type==="ai"

?
renderMarkdown(item.text)

:

{

text:item.text,

diagram:null

};





return(




<div

key={index}

className={`flex ${
item.type==="user"

?

"justify-end"

:

"justify-start"

}`}

>





<div

className={`max-w-5xl rounded-2xl px-6 py-5 ${
item.type==="user"


?

"bg-[#E76F51] text-white"


:


"border border-[#26262F] bg-[#15151B] text-gray-300"

}`}

>







{

item.file && (


<div className="
mb-3
flex
items-center
gap-2
rounded-lg
bg-black/20
px-3
py-2
text-sm
">


<FileText size={16}/>


{item.file}


</div>


)

}









{

item.type==="ai"


?


<>


<ReactMarkdown

components={{



h2:({children})=>(

<h2 className="
mt-5
text-2xl
font-bold
text-white
">

{children}

</h2>

),




h3:({children})=>(

<h3 className="
mt-4
font-semibold
text-[#E76F51]
">

{children}

</h3>

),




strong:({children})=>(

<strong className="text-white">

{children}

</strong>

)


,

code:({children}) => (
  <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[13px] text-[#ffb39a]">
    {children}
  </code>
),

pre:({children}) => (
  <pre className="my-3 overflow-x-auto rounded-xl border border-[#26262F] bg-[#111116] p-4 text-sm text-gray-200">
    {children}
  </pre>
),

li:({children}) => (
  <li className="ml-5 list-disc marker:text-[#E76F51]">
    {children}
  </li>
)

}}


>

{result.text}


</ReactMarkdown>






{


result.diagram && (


<EdithDiagram

code={result.diagram}

/>


)

}





</>



:



<p>

{item.text}

</p>



}








{

item.type==="ai" && (


<button

onClick={()=>downloadPDF(item.text)}

className="
mt-5
flex
items-center
gap-2
rounded-xl
bg-[#E76F51]
px-4
py-2
text-sm
font-medium
hover:bg-[#d85e40]
"

>


<Download size={16}/>


Download PDF


</button>


)


}




</div>






</div>



)



})

}


{
loading && (

<div className="
flex
items-center
gap-3
rounded-xl
border
border-[#26262F]
bg-[#15151B]
p-4
text-gray-400
">

<Loader2

size={18}

className="
animate-spin
text-[#E76F51]
"

/>


EDITH is thinking...


</div>

)

}





</div>


)


}





</section>








{/* Input Area */}


<div className="
sticky
bottom-0
w-full
bg-[#0B0B0F]
px-8
pb-6
pt-3
">





<div className="
mx-auto
flex
w-full
max-w-6xl
items-end
gap-3
rounded-2xl
border
border-[#26262F]
bg-[#15151B]
p-3
shadow-2xl
">







{/* Upload Button */}



<label

className="
flex
h-12
w-12
cursor-pointer
items-center
justify-center
rounded-xl
bg-[#111116]
text-gray-400
transition
hover:bg-[#E76F51]/20
hover:text-[#E76F51]
"

>


<Paperclip size={20}/>



<input

type="file"

hidden

accept="
image/*,
application/pdf
"

onChange={handleFile}

/>



</label>









{/* Message Box */}



<textarea

value={message}

onChange={(e)=>setMessage(e.target.value)}


disabled={loading}


onKeyDown={(e)=>{


if(e.key==="Enter" && !e.shiftKey){


e.preventDefault();


askAI();


}


}}


placeholder="Ask EDITH anything..."


className="
min-h-[56px]
max-h-40
flex-1
resize-none
bg-transparent
p-3
text-white
outline-none
placeholder:text-gray-500
"


/>









{/* Send Button */}



<button


onClick={askAI}


disabled={loading}


className="
flex
h-12
w-12
items-center
justify-center
rounded-xl
bg-[#E76F51]
transition
hover:bg-[#d85e40]
disabled:opacity-50
"


>


{

loading

?

<Loader2

size={20}

className="animate-spin"

/>


:


<Send size={20}/>


}


</button>





</div>









{/* File Preview */}



{

file && (


<div className="
mx-auto
mt-3
flex
w-full
max-w-6xl
items-center
justify-between
rounded-xl
border
border-[#26262F]
bg-[#15151B]
px-4
py-3
">







<div className="
flex
items-center
gap-3
">







{

file.type.startsWith("image")


?


<Image

size={20}

className="text-[#E76F51]"

/>



:


<FileText

size={20}

className="text-[#E76F51]"

/>



}








<div>


<p className="text-sm font-medium">


{file.name}


</p>



<p className="text-xs text-gray-500">


Ready for EDITH


</p>


</div>






</div>









<button


onClick={removeFile}


className="
rounded-lg
p-2
text-gray-400
transition
hover:bg-red-500/10
hover:text-red-400
"


>


<X size={18}/>


</button>








</div>



)

}









<p className="
mt-3
text-center
text-xs
text-gray-500
">


EDITH AI can make mistakes. Verify important information.


</p>





</div>







</>






);



}



export default EdithAI;
