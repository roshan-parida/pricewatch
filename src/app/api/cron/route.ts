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

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BATCH_SIZE = 10;

export async function GET() {
    try {
        await connectToDB();

        const products: ProductType[] = await Product.find({});
        if (products.length === 0) {
            return NextResponse.json({ message: "No products to update." });
        }

        const batches = Math.ceil(products.length / BATCH_SIZE);
        const updatedProducts = [];

        for (let i = 0; i < batches; i++) {
            const batch = products.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

            const batchUpdates = await Promise.all(
                batch.map(async (currentProduct) => {
                    try {
                        const scrapedProduct = await scrapeAmazonProduct(
                            currentProduct.url
                        );
                        if (!scrapedProduct) {
                            console.warn(
                                `Failed to scrape product at URL: ${currentProduct.url}`
                            );
                            return null;
                        }

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

                        const updatedProduct = await Product.findOneAndUpdate(
                            { url: currentProduct.url },
                            updatedProductData,
                            { new: true }
                        );

                        const emailNotifType = getEmailNotifType(
                            scrapedProduct,
                            currentProduct
                        );
                        if (emailNotifType && updatedProduct?.users?.length) {
                            const productInfo = {
                                title: updatedProduct.title,
                                url: updatedProduct.url,
                            };

                            const emailContent: EmailContent =
                                await generateEmailBody(
                                    productInfo,
                                    emailNotifType
                                );
                            const userEmails = updatedProduct.users.map(
                                (user: User) => user.email
                            );

                            await sendEmail(emailContent, userEmails);
                        }

                        return updatedProduct;
                    } catch (err) {
                        console.error(
                            `Error processing product ${currentProduct.url}: ${
                                err instanceof Error ? err.message : err
                            }`
                        );
                        return null;
                    }
                })
            );

            updatedProducts.push(...batchUpdates.filter(Boolean));
        }

        return NextResponse.json({
            message: "Products updated",
            data: updatedProducts,
        });
    } catch (error: unknown) {
        console.error(
            `Error in cron GET: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
        return NextResponse.json(
            {
                message: `Error updating products: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            },
            { status: 500 }
        );
    }
}
