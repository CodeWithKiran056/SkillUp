const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(

{
    name:{
        type:String,
        required:true,
        trim:true
    },


    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },


    password:{
        type:String,
        required:true,
        minlength:6
    },


    profileImage:{
        type:String,
        default:""
    },


    bio:{
        type:String,
        default:""
    },


    skills:[
        {
            type:String
        }
    ],


    interests:{
        type:[String],
        default:[]
    },


    learningRequirements:{
        type:[String],
        default:[]
    },


    role:{
        type:String,
        enum:[
            "student",
            "mentor"
        ],
        default:"student"
    },


    isVerified:{
        type:Boolean,
        default:false
    },


    resetPasswordToken:{
        type:String,
        default:undefined
    },


    resetPasswordExpire:{
        type:Date,
        default:undefined
    },

    connectionRequests:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[]
        }
    ],

    connections:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[]
        }
    ]

},

{
    timestamps:true
}

);


module.exports = mongoose.model(
    "User",
    userSchema
);