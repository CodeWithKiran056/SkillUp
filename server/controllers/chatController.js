const Message = require("../models/Message");


// Get Chat History
// GET /api/chat/:roomId

const getMessages = async(req,res)=>{


    try{


        const { roomId } = req.params;



        const messages = await Message.find({

            roomId

        })
        .populate(
            "sender",
            "name profileImage"
        )
        .sort({
            createdAt:1
        });



        res.status(200).json({

            success:true,

            count:messages.length,

            messages

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};



module.exports = {

    getMessages

};