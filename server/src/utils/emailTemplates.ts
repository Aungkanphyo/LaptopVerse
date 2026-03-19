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