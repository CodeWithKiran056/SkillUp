const nodemailer = require("nodemailer");

/**
 * Reusable email sender utility using Nodemailer.
 * Reads SMTP credentials dynamically from environment variables.
 *
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body content
 * @returns {Promise<Object>} Result object with status and details
 */
const sendEmail = async ({ to, subject, html }) => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        FROM_EMAIL
    } = process.env;

    // Verify SMTP configuration is present
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.warn(
            "[Email Service] SMTP configuration is missing in environment variables. Email was not dispatched."
        );
        return {
            success: false,
            message: "SMTP configuration missing"
        };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        const mailOptions = {
            from: FROM_EMAIL || `"SkillUp" <${SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error(
            "[Email Service] Failed to send email:",
            error.message
        );
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = sendEmail;

