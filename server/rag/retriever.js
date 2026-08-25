const { Pinecone } = require("@pinecone-database/pinecone");

const createEmbedding = require("./embeddingService");


const pinecone = new Pinecone({

apiKey: process.env.PINECONE_API_KEY

});


const index = pinecone.index(
process.env.PINECONE_INDEX
);




const retrieveContext = async(question)=>{


try{


// 1. Create question vector

const queryVector = await createEmbedding(
question,
"query"
);



// 2. Search Pinecone

const result = await index.query({


vector: queryVector,


topK: 3,


includeMetadata:true


});





const contexts = result.matches.map(
(match)=>match.metadata.text
);



console.log(
"Relevant chunks found:",
contexts.length
);



return contexts.join("\n\n");



}


catch(error){


console.log(
"Retriever Error:",
error.message
);


throw error;


}


};



module.exports = retrieveContext;