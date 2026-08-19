import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;
    subject: string;
    message?: string;
    html?: string;
}

const sendEmail = async (options: EmailOptions) => {
    // Create a Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // contents to be included in the email
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
}

export default sendEmail;