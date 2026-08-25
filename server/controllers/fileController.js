const cloudinary = require("../config/cloudinary");

const File = require("../models/File");



// Upload PDF
// POST /api/files/upload

const uploadFile = async (req, res) => {

    try {


        if(!req.file){

            return res.status(400).json({

                success:false,

                message:"Please upload a PDF file"

            });

        }



        const result = await cloudinary.uploader.upload(

            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,

            {
                resource_type:"raw",
                folder:"skillup_files"
            }

        );



        const file = await File.create({

            fileName:req.file.originalname,

            fileUrl:result.secure_url,

            fileType:req.file.mimetype,

            uploadedBy:req.user.id,

            roomId:req.body.roomId || ""

        });



        res.status(201).json({

            success:true,

            message:"File uploaded successfully",

            file

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};





// Get Files By Room
// GET /api/files/:roomId

const getFilesByRoom = async(req,res)=>{


    try{


        const files = await File.find({

            roomId:req.params.roomId

        })
        .populate(
            "uploadedBy",
            "name email profileImage"
        );



        res.status(200).json({

            success:true,

            count:files.length,

            files

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};





// Delete File
// DELETE /api/files/:id

const deleteFile = async(req,res)=>{


    try{


        const file = await File.findOneAndDelete({

            _id:req.params.id,

            uploadedBy:req.user.id

        });



        if(!file){

            return res.status(404).json({

                success:false,

                message:"File not found"

            });

        }



        res.status(200).json({

            success:true,

            message:"File deleted successfully"

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};





module.exports = {

    uploadFile,

    getFilesByRoom,

    deleteFile

};