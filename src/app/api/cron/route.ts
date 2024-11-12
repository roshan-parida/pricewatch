import { NextResponse } from "next/server";
import {
    getLowestPrice,
    getHighestPrice,
    getAveragePrice,
    getEmailNotifType,
} from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;
const MAX_PRODUCTS_PER_BATCH = 5;

export async function GET(request: Request) {
    try {
        await connectToDB();
        const products = await Product.find({});
        if (!products || products.length === 0)
            throw new Error("No products fetched");

        const updatedProducts: any[] = [];

        for (let i = 0; i < products.length; i += MAX_PRODUCTS_PER_BATCH) {
            const productBatch = products.slice(i, i + MAX_PRODUCTS_PER_BATCH);

            const batchResults = await Promise.allSettled(
                productBatch.map(async (currentProduct) => {
                    try {
                        const scrapedProduct = await scrapeAmazonProduct(
                            currentProduct.url
                        );
                        if (!scrapedProduct) return null;

                        const updatedPriceHistory = [
                            ...currentProduct.priceHistory,
                            { price: scrapedProduct.currentPrice },
                        ];

                        const productUpdate = {
                            ...scrapedProduct,
                            priceHistory: updatedPriceHistory,
                            lowestPrice: getLowestPrice(updatedPriceHistory),
                            highestPrice: getHighestPrice(updatedPriceHistory),
                            averagePrice: getAveragePrice(updatedPriceHistory),
                        };

                        const updatedProduct = await Product.findOneAndUpdate(
                            { url: scrapedProduct.url },
                            productUpdate,
                            { new: true }
                        );

                        const emailNotifType = getEmailNotifType(
                            scrapedProduct,
                            currentProduct
                        );
                        if (emailNotifType && updatedProduct.users.length > 0) {
                            const emailContent = await generateEmailBody(
                                {
                                    title: updatedProduct.title,
                                    url: updatedProduct.url,
                                },
                                emailNotifType
                            );
                            const userEmails = updatedProduct.users.map(
                                (user: any) => user.email
                            );
                            await sendEmail(emailContent, userEmails);
                        }

                        return updatedProduct;
                    } catch (productError) {
                        console.error(
                            `Product processing error: ${productError}`
                        );
                        return null;
                    }
                })
            );

            updatedProducts.push(
                ...batchResults
                    .filter((result) => result.status === "fulfilled")
                    .map(
                        (result) =>
                            (result as PromiseFulfilledResult<any>).value
                    )
            );
        }

        return NextResponse.json({ message: "Ok", data: updatedProducts });
    } catch (error) {
        console.error(`Function error: ${error}`);
        return NextResponse.json(
            {
                error: "Failed to process products",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
