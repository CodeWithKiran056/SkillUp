const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { createNotification } = require("../services/notificationService");


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public

const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;


        // Check required fields
        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });

        }


        // Check existing user
        const existingUser = await User.findOne({
            email
        });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });

        }


        // Hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );


        // Create user
        const user = await User.create({

            name,

            email,

            password: hashedPassword

        });


        // Generate token
        const token = generateToken(user._id);



        res.status(201).json({

            success: true,

            message: "Account created successfully",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });



    }
    catch(error){

        console.log(error);


        res.status(500).json({

            success:false,

            message:"Server error"

        });

    }

};




// @desc    Login user
// @route   POST /api/auth/login
// @access  Public


const loginUser = async(req,res)=>{


    try{


        const {email,password}=req.body;



        if(!email || !password){

            return res.status(400).json({

                success:false,

                message:"Email and password required"

            });

        }



        // Find user

        const user = await User.findOne({
            email
        });



        if(!user){

            return res.status(401).json({

                success:false,

                message:"Invalid credentials"

            });

        }



        // Compare password

        const isMatch = await bcrypt.compare(

            password,

            user.password

        );



        if(!isMatch){

            return res.status(401).json({

                success:false,

                message:"Invalid credentials"

            });

        }



        // Token

        const token = generateToken(user._id);



        res.status(200).json({

            success:true,

            message:"Login successful",

            token,

            user:{

                id:user._id,

                name:user.name,

                email:user.email

            }


        });



    }
    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:"Server error"

        });


    }


};




// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required"
            });

        }

        const user = await User.findOne({
            email
        });

        if (!user) {

            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent."
            });

        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token and store in user record
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Set expiry (15 minutes)
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0B0B0F; color: #FFFFFF; border-radius: 12px; border: 1px solid #26262F;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.25em; color: #E76F51;">SkillUp</span>
                    <h1 style="font-size: 24px; font-weight: bold; margin-top: 12px; color: #FFFFFF;">Password Reset Request</h1>
                </div>
                <div style="background-color: #15151B; padding: 20px; border-radius: 8px; border: 1px solid #26262F; line-height: 1.6; color: #CCCCCC;">
                    <p style="margin-top: 0;">Hello ${user.name || "there"},</p>
                    <p>You recently requested to reset the password for your SkillUp account. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${resetUrl}" style="background-color: #E76F51; color: #FFFFFF; padding: 12px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="font-size: 13px; color: #888888;">Or copy and paste this link into your browser:</p>
                    <p style="font-size: 13px; word-break: break-all; color: #E76F51;">${resetUrl}</p>
                    <hr style="border: 0; border-top: 1px solid #26262F; margin: 20px 0;" />
                    <p style="font-size: 13px; color: #E76F51; font-weight: 500;">Note: This password reset link will expire in 15 minutes.</p>
                    <p style="font-size: 13px; color: #888888; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email. Your password will remain secure.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666666;">
                    &copy; ${new Date().getFullYear()} SkillUp. All rights reserved.
                </div>
            </div>
        `;

        try {
            const emailResult = await sendEmail({
                to: user.email,
                subject: "SkillUp Password Reset",
                html
            });

            if (!emailResult.success) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save();

                return res.status(500).json({
                    success: false,
                    message: "Unable to send password reset email. Please try again later."
                });
            }
        } catch (emailErr) {
            console.error("Failed to send password reset email");
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: "Unable to send password reset email. Please try again later."
            });
        }

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent."
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};



// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public

const resetPassword = async (req, res) => {

    try {

        const { token } = req.params;
        const { password } = req.body;

        if (!password) {

            return res.status(400).json({
                success: false,
                message: "Password is required"
            });

        }

        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });

        }

        // Hash incoming URL token using SHA-256
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user by valid unexpired token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {

            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });

        }

        // Hash new password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};



// @desc    Change password (authenticated user)
// @route   POST /api/auth/change-password
// @access  Private

const changePassword = async (req, res) => {

    try {

        // Identity comes ONLY from the JWT
        const userId = req.user.id;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        // Consistent with registration rule (User schema minlength 6)
        if (
            typeof newPassword !== "string" ||
            newPassword.length < 6
        ) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Prevent no-op re-use of identical password
        const sameAsNew = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (sameAsNew) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from the current password"
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        // Real account/security event -> notify the user.
        await createNotification({
            user: userId,
            type: "account",
            title: "Password Changed",
            message: "Your SkillUp password was changed successfully.",
            relatedId: userId,
            relatedType: "account",
            eventKey: `password_changed:${userId}:${Date.now()}`,
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {

        console.error("Change Password Error");

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};


module.exports = {

    registerUser,

    loginUser,

    forgotPassword,

    resetPassword,

    changePassword

};