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
				<div>
					<h2>Welcome to PriceWatch 🚀</h2>
					<p>You are now tracking <strong>${product.title}</strong>.</p>
					<p>Here's an example of how you'll receive updates:</p>
					<div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
						<h3>${product.title} is back in stock!</h3>
						<p>Don't miss out - <a href="${product.url}" target="_blank" rel="noopener noreferrer">buy it now</a>!</p>
						<img src="https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png" alt="Product Image" style="max-width: 100%;" />
					</div>
				</div>`;
            break;

        case Notification.CHANGE_OF_STOCK:
            subject = `${shortenedTitle} is now back in stock!`;
            body = `
				<div>
					<h4>Hey, <strong>${product.title}</strong> is now restocked!</h4>
					<p>See the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
				</div>`;
            break;

        case Notification.LOWEST_PRICE:
            subject = `Lowest Price Alert for ${shortenedTitle}`;
            body = `
				<div>
					<h4>Great news! ${product.title} has reached its lowest price ever!</h4>
					<p>Check it out <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
				</div>`;
            break;

        case Notification.THRESHOLD_MET:
            subject = `Discount Alert: ${shortenedTitle} at ${THRESHOLD_PERCENTAGE}% Off!`;
            body = `
				<div>
					<h4>Get ${product.title} with an amazing ${THRESHOLD_PERCENTAGE}% discount!</h4>
					<p>Find it <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
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
