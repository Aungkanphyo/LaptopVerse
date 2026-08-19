export const getOTPVerificationTemplate = (userName: string, otpCode: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; rounded-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Verify Your Email Address ✉️</h2>
        <p>Hi <b>${userName}</b>,</p>
        <p>Thank you for signing up with <strong>LaptopVerse</strong>! Please use the following 6-digit Verification Code to complete your registration:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #2563eb;">
                ${otpCode}
            </span>
        </div>

        <p style="font-size: 0.9em; color: #666;">This OTP code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="text-align: center; font-size: 0.8em; color: #888;">&copy; ${new Date().getFullYear()} LaptopVerse Inc. All rights reserved.</p>
    </div>
`;

export const getRefundApprovalTemplate = (userName: string, orderId: string, amount: number) => `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Refund Approved! 🛒</h2>
        <p>Hi ${userName},</p>
        <p>Good news! Your refund request for Order <b>#${orderId}</b> has been approved.</p>
        <p><b>Refund Amount:</b> ${amount.toLocaleString()} MMK</p>
        <p>The amount will be credited back to your original payment method within 3-5 business days.</p>
        <p>Thank you for shopping with LaptopVerse!</p>
    </div>
`;

export const getRefundRejectionTemplate = (userName: string, orderId: string, reason: string) => `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #d9534f;">Refund Request Update</h2>
        <p>Hi ${userName},</p>
        <p>We reviewed your refund request for Order <b>#${orderId}</b>.</p>
        <p>Unfortunately, we cannot process your refund at this time due to the following reason:</p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #d9534f;">
            "${reason}"
        </blockquote>
        <p>If you have any questions, please reply to this email or contact our support team.</p>
        <p>Best regards,<br/>LaptopVerse Team</p>
    </div>
`;