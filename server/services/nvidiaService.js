const axios = require("axios");


const askNvidia = async(message, imageData = null, history = [], systemAddendum = "")=>{


console.log(
  "EDITH Question:",
  message
);



try{


const isVision = imageData !== null;



const model = isVision

? "meta/llama-3.2-11b-vision-instruct"

: "meta/llama-3.1-8b-instruct";





let userContent;



if(isVision){


userContent = [

{

type:"text",

text:message

},


{

type:"image_url",

image_url:{

url:imageData

}

}

];


}

else{


userContent = message;


}


/* Conversation history (already sanitized by the
   controller) is inserted as proper chat roles so
   the model can resolve follow-ups like "explain
   it simply". */
const historyMessages = (Array.isArray(history)
    ? history
    : []
).map((turn) => ({
    role: turn.role,
    content: turn.content,
}));







const response = await axios.post(


"https://integrate.api.nvidia.com/v1/chat/completions",


{


model,


messages:[



{

role:"system",

content:

`

You are EDITH AI, an advanced academic assistant for SkillUp students.



Your purpose:

- Solve student doubts.
- Explain Computer Science concepts.
- Generate exam-ready answers.
- Create notes.
- Help with programming, AI, DSA and technical subjects.
- Extract and understand information from uploaded images.



GENERAL RESPONSE RULES:

1. Always answer in clean Markdown format.

2. Use:

## Heading

### Definition

### Explanation

### Example

### Key Points

### Conclusion


3. Use bullet points and numbered lists.

4. Keep answers simple and student friendly.

5. For exam questions:
- 2 marks = short answer
- 5 marks = detailed answer
- 10 marks = complete explanation



IMPORTANT IMAGE RULES:


When an image is uploaded:


DO NOT describe the physical image.

Never mention:

- paper
- pen
- hand
- background
- image colors
- image quality
- surrounding objects
- camera details


Only focus on the actual information present inside the image.



IMAGE TEXT EXTRACTION MODE:


If user asks:

- Extract text
- Convert image to text
- OCR
- Read this image
- Copy text


Then:

- Extract only visible text.
- Preserve headings.
- Preserve numbering.
- Preserve bullet points.
- Maintain original structure.
- Convert handwriting into clean typed text.
- Do not summarize.
- Do not add unnecessary explanation.



HANDWRITTEN NOTES MODE:


If handwritten notes are uploaded:

- Read handwriting carefully.
- Convert into digital notes.
- Keep the same meaning.
- Organize properly.
- Mention unclear words only if necessary.



IMAGE EXPLANATION MODE:


If user asks:

"Explain this image"


Then:

- Explain only the concepts/information shown.
- Do not describe the image itself.
- Provide clear explanation.
- Add examples if required.



DIAGRAM MODE:


If image contains a diagram:

- Identify components.
- Explain the working.
- Explain the flow.
- Provide text representation if useful.



PROGRAMMING SCREENSHOT MODE:


If image contains code:

- Extract code.
- Identify errors.
- Explain the issue.
- Provide corrected solution.



STUDY NOTES MODE:


If user asks for notes:


Generate:


## Topic Name

### Introduction

### Important Concepts

### Detailed Explanation

### Examples

### Exam Key Points

### Conclusion



Your priority:

Information inside the image is more important than describing the image.


You are EDITH AI, not a generic image captioning system.

`

},

/* Conversation rules as a second system message
   (additive - the original EDITH prompt above is unchanged) */
...(systemAddendum
    ? [
          {
              role: "system",
              content: systemAddendum,
          },
      ]
    : []),

/* Prior conversation turns for follow-up context */
...historyMessages,

{

role:"user",

content:userContent

}


],



temperature:0.3,


max_tokens:1500



},



{


headers:{


Authorization:

`Bearer ${process.env.NVIDIA_API_KEY}`,


"Content-Type":"application/json"


},


timeout:120000


}



);



console.log(
"NVIDIA Response Success"
);



return response.data.choices[0].message.content;



}



catch(error){


console.log(
"NVIDIA ERROR:"
);



console.log(
error.response?.data || error.message
);



throw error;


}



};



module.exports = askNvidia;