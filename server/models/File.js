const mongoose = require("mongoose");


const fileSchema = new mongoose.Schema(
{
    fileName:
    {
        type:String,
        required:true
    },


    fileUrl:
    {
        type:String,
        required:true
    },


    fileType:
    {
        type:String,
        default:"pdf"
    },


    uploadedBy:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    roomId:
    {
        type:String,
        default:""
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("File", fileSchema);