const extractPDFText = require("./pdfProcessor");
const chunkText = require("./chunkText");
const createEmbedding = require("./embeddingService");
const storeVectors = require("./vectorStore");


const processDocument = async(filePath)=>{


try{


// 1. Extract PDF text

const text = await extractPDFText(
filePath
);



console.log(
"PDF text extracted"
);



// 2. Create chunks

const chunks = chunkText(
text
);



console.log(
"Chunks created:",
chunks.length
);



// 3. Generate embeddings

for(let chunk of chunks){


const vector = await createEmbedding(
chunk.text,
"passage"
);


chunk.embedding = vector;


}
console.log(
"First embedding length:",
chunks[0].embedding.length
);


console.log(
"Embeddings generated"
);



// 4. Store in Pinecone

await storeVectors(
chunks
);



console.log(
"Document stored in knowledge base"
);



return true;



}

catch(error){


console.log(
"Document Processing Error:",
error.message
);


throw error;


}



};



module.exports = processDocument;