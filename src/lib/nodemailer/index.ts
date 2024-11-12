"use server";

import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { EmailContent, EmailProductInfo, NotificationType } from "@/types";

const Notification = {
    WELCOME: "WELCOME",
    CHANGE_OF_STOCK: "CHANGE OF STOCK",
    LOWEST_PRICE: "LOWEST PRICE",
    THRESHOLD_MET: "THRESHOLD_MET",
} as const;

const THRESHOLD_PERCENTAGE = 40;

export async function generateEmailBody(
    product: EmailProductInfo,
    type: NotificationType
): Promise<EmailContent> {
    const shortenedTitle =
        product.title.length > 20
            ? `${product.title.substring(0, 20)}...`
            : product.title;

    let subject = "";
    let body = "";

    switch (type) {
        case Notification.WELCOME:
            subject = `Welcome to Price Tracking for ${shortenedTitle}`;
            body = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #4CAF50;">Welcome to PriceWatch! 🚀</h2>
                    <p>Thank you for subscribing to PriceWatch! You're now tracking <strong>${product.title}</strong>.</p>
                    <p>Here's an <b><i>example</i></b> of what you can expect from us:</p>
                    <div style="border: 1px solid #eee; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                        <h3 style="color: #4CAF50;">${product.title} is back in stock!</h3>
                        <p>Don't miss out—<a href="${product.url}" target="_blank" rel="noopener noreferrer" style="color: #2196F3; text-decoration: none;">buy it now</a>!</p>
                        <img src="${product.image}" alt="Product Image" style="max-width: 100%; border-radius: 8px;" />
                    </div>
                </div>`;
            break;

        case Notification.CHANGE_OF_STOCK:
            subject = `${shortenedTitle} is back in stock!`;
            body = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h4 style="color: #4CAF50;">Great news! <strong>${product.title}</strong> is now back in stock!</h4>
                    <p>Click <a href="${product.url}" target="_blank" rel="noopener noreferrer" style="color: #2196F3; text-decoration: none;">here</a> to check it out.</p>
                </div>`;
            break;

        case Notification.LOWEST_PRICE:
            subject = `Lowest Price Alert for ${shortenedTitle}`;
            body = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h4 style="color: #FF5722;">Good news! <strong>${product.title}</strong> is now at its lowest price ever!</h4>
                    <p>Hurry up and grab it at the best price <a href="${product.url}" target="_blank" rel="noopener noreferrer" style="color: #2196F3; text-decoration: none;">here</a>.</p>
                </div>`;
            break;

        case Notification.THRESHOLD_MET:
            subject = `Discount Alert: ${shortenedTitle} at ${THRESHOLD_PERCENTAGE}% Off!`;
            body = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h4 style="color: #FF9800;">Great deal! Get <strong>${product.title}</strong> at ${THRESHOLD_PERCENTAGE}% off!</h4>
                    <p>Don't miss this offer—find it <a href="${product.url}" target="_blank" rel="noopener noreferrer" style="color: #2196F3; text-decoration: none;">here</a>.</p>
                </div>`;
            break;

        default:
            throw new Error("Invalid notification type.");
    }

    return { subject, body };
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.NEXT_NODEMAILER_EMAIL,
        pass: process.env.NEXT_NODEMAILER_PASS,
    },
    maxConnections: 1,
} as SMTPTransport.Options);

export const sendEmail = async (
    emailContent: EmailContent,
    sendTo: string[]
): Promise<void> => {
    if (
        !process.env.NEXT_NODEMAILER_EMAIL ||
        !process.env.NEXT_NODEMAILER_PASS
    ) {
        console.error(
            "SMTP credentials are not defined in environment variables."
        );
        return;
    }

    const mailOptions = {
        from: process.env.NEXT_NODEMAILER_EMAIL,
        to: sendTo.join(", "),
        html: emailContent.body,
        subject: emailContent.subject,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to send email: ${error.message}`);
        } else {
            console.error("Unknown error occurred during email sending.");
        }
    }
};
