const mongoose = require("mongoose");


const skillSchema = new mongoose.Schema(

    {

        name: {
            type: String,
            required: true,
            trim: true
        },


        category: {

            type: String,
            required: true,
            enum: [
                "Frontend",
                "Backend",
                "Database",
                "Programming",
                "AI",
                "Design",
                "Other"
            ]

        },


        level: {

            type: String,
            required: true,
            enum: [
                "Beginner",
                "Intermediate",
                "Advanced"
            ],

            default: "Beginner"

        },


        description: {

            type: String,
            default: ""

        },


        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        }


    },

    {
        timestamps: true
    }

);



module.exports = mongoose.model(
    "Skill",
    skillSchema
);