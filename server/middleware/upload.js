const multer = require("multer");


const storage = multer.diskStorage({

destination:(req,file,cb)=>{

cb(null,"uploads/");

},


filename:(req,file,cb)=>{

cb(
null,
Date.now()+"-"+file.originalname
);

}

});


const upload = multer({

storage:storage,

limits:{
fileSize:10*1024*1024
},

fileFilter:(req,file,cb)=>{


const allowed=[

"application/pdf",

"image/png",

"image/jpeg",

"image/jpg"

];


if(allowed.includes(file.mimetype)){

cb(null,true);

}

else{

cb(
new Error("Only PDF and Images allowed")
);

}


}

});


module.exports=upload;