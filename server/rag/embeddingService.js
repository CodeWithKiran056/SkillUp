const axios = require("axios");


const createEmbedding = async(text, inputType="passage")=>{


try{


const response = await axios.post(

"https://integrate.api.nvidia.com/v1/embeddings",


{

model:"nvidia/nemotron-3-embed-1b",


input:text,


input_type:inputType


},


{

headers:{


Authorization:
`Bearer ${process.env.NVIDIA_API_KEY}`,


"Content-Type":"application/json"


}


}

);



return response.data.data[0].embedding;



}

catch(error){


console.log(
"Embedding Error:",
error.response?.data || error.message
);


throw error;


}


};



module.exports = createEmbedding;