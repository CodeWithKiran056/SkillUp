const { PDFParse } = require("pdf-parse");
const fs = require("fs");


const extractPDFText = async(filePath)=>{


try{


const pdfBuffer = fs.readFileSync(
filePath
);



const parser = new PDFParse({

data:pdfBuffer

});



const data = await parser.getText();



await parser.destroy();



return data.text;



}


catch(error){


console.log(
"PDF Extraction Error:",
error.message
);


throw error;


}


};



module.exports = extractPDFText;