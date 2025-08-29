import transporter from "../../config/mail.config";

export async function sendConfirmationEmail(toEmail: string, productName: string, code: string) { 
    const mailOptions = {
        from:`"CodeDrop -Buy Gift Codes " <${process.env.MAIL_USER}> `,
        to: toEmail,
        subject:`Your Gift Card for ${productName} - Here's Your Gift Code!`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0056b3; text-align: center;">🎉 Your Gift Card from CodeDrop! 🎉</h2>
                    <p>Hello,</p>
                    <p>Thank you for your purchase! We're excited to present you with your gift card for <strong>${productName}</strong>.</p>
                    <p>Here is your unique code. Please keep it safe and do not share it with others:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #0056b3; margin: 20px 0; text-align: center;">
                        <h3 style="color: #0056b3; margin: 0;">Your Code:</h3>
                        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #d9534f; margin: 10px 0;">${code}</p>
                    </div>
                    <p>We hope you enjoy your gift! If you have any questions, feel free to contact us.</p>
                    <p>Best regards,<br>The CodeDrop Team</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; font-size: 12px; color: #777;">Please do not reply to this email.</p>
                </div>
            </div>
        `
    };
     try {
        await transporter.sendMail(mailOptions); //use transporter from config to send mail
        console.log(`Confirmation email sent to ${toEmail} for ${productName}`);
    } catch (error: any) {
        console.error(`Error sending confirmation email to ${toEmail}:`, error);
        throw new Error('Error while sending confirmation mail');
    }
}