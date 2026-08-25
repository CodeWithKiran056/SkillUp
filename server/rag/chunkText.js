const chunkText = (
  text,
  chunkSize = 1000,
  overlap = 200
) => {


const chunks = [];

let start = 0;



while(start < text.length){


const end = start + chunkSize;



const chunk = text.slice(
  start,
  end
);



chunks.push({

id:`chunk-${chunks.length + 1}`,

text:chunk.trim()

});



start = end - overlap;


}



return chunks;


};



module.exports = chunkText;