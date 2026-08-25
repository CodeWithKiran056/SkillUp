const { Pinecone } = require("@pinecone-database/pinecone");


const pinecone = new Pinecone({

apiKey: process.env.PINECONE_API_KEY

});


const index = pinecone.index(
process.env.PINECONE_INDEX
);



const storeVectors = async(chunks)=>{


try{


console.log(
"Received chunks:",
chunks.length
);



const records = chunks
.map((chunk,index)=>({

id:`doc-${Date.now()}-${index}`,

values:chunk.embedding,

metadata:{
text:chunk.text
}

}));



console.log(
"Uploading records:",
records.length
);



await index.upsert({

records:records

});



console.log(
"Vectors uploaded successfully"
);



}


catch(error){


console.log(
"Pinecone Store Error:",
error.message
);


throw error;


}



};



module.exports = storeVectors;