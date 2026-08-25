const Skill = require("../models/Skill");


// Add Skill
// POST /api/skills

const addSkill = async (req, res) => {

    try {

        const {
            name,
            category,
            level,
            description
        } = req.body;


        const skill = await Skill.create({

            name,
            category,
            level,
            description,
            user: req.user.id

        });


        res.status(201).json({

            success:true,
            message:"Skill added successfully",
            skill

        });


    } catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




// Get User Skills
// GET /api/skills

const getSkills = async(req,res)=>{

    try{


        const skills = await Skill.find({
            user:req.user.id
        });


        res.status(200).json({

            success:true,
            count:skills.length,
            skills

        });


    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




// Get Single Skill
// GET /api/skills/:id

const getSkillById = async(req,res)=>{

    try{


        const skill = await Skill.findOne({

            _id:req.params.id,
            user:req.user.id

        });


        if(!skill){

            return res.status(404).json({

                success:false,
                message:"Skill not found"

            });

        }


        res.status(200).json({

            success:true,
            skill

        });


    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




// Update Skill
// PUT /api/skills/:id

const updateSkill = async(req,res)=>{

    try{


        const allowedFields = {

            name:req.body.name,
            category:req.body.category,
            level:req.body.level,
            description:req.body.description

        };


        const skill = await Skill.findOneAndUpdate(

            {
                _id:req.params.id,
                user:req.user.id
            },

            allowedFields,

            {
                new:true,
                runValidators:true
            }

        );



        if(!skill){

            return res.status(404).json({

                success:false,
                message:"Skill not found"

            });

        }



        res.status(200).json({

            success:true,
            message:"Skill updated successfully",
            skill

        });


    }catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




// Delete Skill
// DELETE /api/skills/:id

const deleteSkill = async(req,res)=>{

    try{


        const skill = await Skill.findOneAndDelete({

            _id:req.params.id,
            user:req.user.id

        });



        if(!skill){

            return res.status(404).json({

                success:false,
                message:"Skill not found"

            });

        }



        res.status(200).json({

            success:true,
            message:"Skill deleted successfully"

        });



    }catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




module.exports = {

    addSkill,
    getSkills,
    getSkillById,
    updateSkill,
    deleteSkill

};