import { connectToDB } from "@/lib/mongoose";
import { scrapeAmazonProduct } from "@/lib/scraper";
import {
    getAveragePrice,
    getEmailNotifType,
    getHighestPrice,
    getLowestPrice,
} from "@/lib/utils";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { NextResponse } from "next/server";
import Product from "@/lib/models/product";
import { Product as ProductType, User, EmailContent } from "@/types/index";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        await connectToDB();

        const products: ProductType[] = await Product.find({});

        if (products.length === 0) {
            return NextResponse.json({ message: "No products to update." });
        }

        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                // Scraping Product Data
                const scrapedProduct = await scrapeAmazonProduct(
                    currentProduct.url
                );
                if (!scrapedProduct) {
                    console.warn(
                        `Failed to scrape product at URL: ${currentProduct.url}`
                    );
                    return null;
                }

                // Updating Price History and Calculating Stats
                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scrapedProduct.currentPrice },
                ];

                const updatedProductData = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                };

                // Saving Updated Product to Database
                const updatedProduct = await Product.findOneAndUpdate(
                    { url: currentProduct.url },
                    updatedProductData,
                    { new: true } // Ensures we receive the updated document
                );

                // Sending Notifications if Necessary
                const emailNotifType = getEmailNotifType(
                    scrapedProduct,
                    currentProduct
                );
                if (emailNotifType && updatedProduct?.users?.length) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    };

                    const emailContent: EmailContent = await generateEmailBody(
                        productInfo,
                        emailNotifType
                    );
                    const userEmails = updatedProduct.users.map(
                        (user: User) => user.email
                    );

                    await sendEmail(emailContent, userEmails);
                }

                return updatedProduct;
            })
        );

        // Filter out any null results from products that couldn't be updated
        const successfullyUpdatedProducts = updatedProducts.filter(Boolean);

        return NextResponse.json({
            message: "Products updated",
            data: successfullyUpdatedProducts,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error in cron GET: ${error.message}`);
            return NextResponse.json(
                { message: `Error updating products: ${error.message}` },
                { status: 500 }
            );
        } else {
            console.error(`Unknown error occurred.`);
            return NextResponse.json(
                { message: "Unknown error occurred during product update." },
                { status: 500 }
            );
        }
    }
}
