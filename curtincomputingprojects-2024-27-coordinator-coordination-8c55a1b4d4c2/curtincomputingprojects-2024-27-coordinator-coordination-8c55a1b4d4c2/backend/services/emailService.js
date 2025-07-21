const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text content
 * @param {string} options.html - Email HTML content (optional)
 * @returns {Promise} - Sending result
 */
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

/**
 * Send notification email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Notification message
 * @returns {Promise} - Sending result
 */
const sendNotificationEmail = async (to, subject, message) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${subject}</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                <p style="color: #666; line-height: 1.6;">${message}</p>
            </div>
            <div style="margin-top: 20px; color: #999; font-size: 12px;">
                <p>This is an automated message, please do not reply directly.</p>
            </div>
        </div>
    `;

    return sendEmail({
        to,
        subject,
        text: message,
        html
    });
};

module.exports = {
    sendEmail,
    sendNotificationEmail
}; 