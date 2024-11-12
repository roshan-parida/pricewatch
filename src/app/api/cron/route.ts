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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        await connectToDB();

        const products = await Product.find({});
        if (!products || products.length === 0)
            throw new Error("No products fetched");

        const MAX_PRODUCTS_PER_BATCH = 10;
        const updatedProducts = [];

        for (let i = 0; i < products.length; i += MAX_PRODUCTS_PER_BATCH) {
            const productBatch = products.slice(i, i + MAX_PRODUCTS_PER_BATCH);

            const updatedBatch = await Promise.all(
                productBatch.map(async (currentProduct) => {
                    try {
                        const scrapedProduct = await scrapeAmazonProduct(
                            currentProduct.url
                        );
                        if (!scrapedProduct)
                            throw new Error("Failed to scrape product");

                        const updatedPriceHistory = [
                            ...currentProduct.priceHistory,
                            { price: scrapedProduct.currentPrice },
                        ];

                        const product = {
                            ...scrapedProduct,
                            priceHistory: updatedPriceHistory,
                            lowestPrice: getLowestPrice(updatedPriceHistory),
                            highestPrice: getHighestPrice(updatedPriceHistory),
                            averagePrice: getAveragePrice(updatedPriceHistory),
                        };

                        const updatedProduct = await Product.findOneAndUpdate(
                            { url: product.url },
                            product,
                            { new: true }
                        );

                        if (!updatedProduct)
                            throw new Error("Failed to update product in DB");

                        const emailNotifType = getEmailNotifType(
                            scrapedProduct,
                            currentProduct
                        );
                        if (emailNotifType && updatedProduct.users.length > 0) {
                            const productInfo = {
                                title: updatedProduct.title,
                                url: updatedProduct.url,
                            };
                            const emailContent = await generateEmailBody(
                                productInfo,
                                emailNotifType
                            );
                            const userEmails = updatedProduct.users.map(
                                (user: any) => user.email
                            );

                            await sendEmail(emailContent, userEmails);
                        }

                        return updatedProduct;
                    } catch (productError) {
                        const errorMessage =
                            productError instanceof Error
                                ? productError.message
                                : "Unknown error";
                        console.error(
                            `Error processing product: ${currentProduct.url} - ${errorMessage}`
                        );
                        return null;
                    }
                })
            );

            updatedProducts.push(...updatedBatch.filter(Boolean));
        }

        const response = {
            message: "Ok",
            data:
                updatedProducts.length <= 100
                    ? updatedProducts
                    : `Processed ${updatedProducts.length} products`,
        };

        return NextResponse.json(response);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`Failed to get all products: ${errorMessage}`);
        return NextResponse.json(
            { error: "Failed to get products", message: errorMessage },
            { status: 500 }
        );
    }
}
