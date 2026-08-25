const User = require("../models/User");

const calculateMatchScore = require("../utils/matchAlgorithm");


// Find Matching Users
// GET /api/match
// Private

const findMatches = async (req, res) => {

    try {


        // Current logged in user (include connections for status check)

        const currentUser = await User.findById(req.user.id)
            .select("-password");



        if (!currentUser) {

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }



        // Find other users

        const users = await User.find({

            _id:{
                $ne:req.user.id
            }

        })
        .select("-password");



        // Build lookup sets for O(1) checks
        const connectedIds = new Set(
            (currentUser.connections || []).map(id => String(id))
        );
        // Users the CURRENT user has sent a request TO — i.e., current user is in their connectionRequests
        // We check this by looking at each user's connectionRequests in the loop below.



        const matches = await Promise.all(users.map(async user => {


            // Full real profile objects (skills,
            // interests, learningRequirements).
            const result = calculateMatchScore(
                currentUser,
                user
            );

            // Determine connection status
            let connectionStatus = "none";
            if (connectedIds.has(String(user._id))) {
                connectionStatus = "connected";
            } else if (
                (user.connectionRequests || []).some(
                    id => String(id) === String(req.user.id)
                )
            ) {
                connectionStatus = "pending";
            }


            return {

                userId: user._id,

                name: user.name,

                profileImage: user.profileImage,

                role: user.role,

                score: result.score,

                commonSkills: result.commonSkills,

                missingSkills: result.missingSkills,

                commonInterests:
                    result.commonInterests,

                commonRequirements:
                    result.commonRequirements,

                partnerCanHelpWith:
                    result.partnerCanHelpWith,

                youCanHelpWith:
                    result.youCanHelpWith,

                connectionStatus,

            };


        }));



        // Remove zero matches

        const filteredMatches = matches.filter(

            match => match.score > 0

        );



        // Sort highest score first

        filteredMatches.sort(

            (a,b)=> b.score - a.score

        );



        res.status(200).json({

            success:true,

            count:filteredMatches.length,

            matches:filteredMatches

        });



    } catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};



module.exports = {

    findMatches

};