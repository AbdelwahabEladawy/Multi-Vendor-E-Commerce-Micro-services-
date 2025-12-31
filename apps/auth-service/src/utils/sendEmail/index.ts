import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
})


const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        "apps",
        "auth-service",
        "src",
        "utils",
        "EmailTemplates",
        `${templateName}.ejs`
    )
    return ejs.renderFile(templatePath, data);

}



export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data);

        await transporter.sendMail({
            from: `<${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return true;


 
 
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}