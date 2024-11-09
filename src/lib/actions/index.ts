"use server";

import { revalidatePath } from "next/cache";
import { scrapeAmazonProduct } from "../scraper";
import { connectToDB } from "../mongoose";
import { generateEmailBody, sendEmail } from "../nodemailer";
import {
    getAveragePrice,
    getHighestPrice,
    getLowestPrice,
    normalizeUrl,
} from "../utils";
import { User, NotificationType } from "@/types";
import Product from "../models/product";

export async function scrapeAndStoreProduct(productUrl: string) {
    if (!productUrl) return;

    try {
        await connectToDB();

        const normalizedUrl = normalizeUrl(productUrl);
        const scrapedProduct = await scrapeAmazonProduct(normalizedUrl);

        if (!scrapedProduct) return;
        let product = scrapedProduct;

        const existingProduct = await Product.findOne({
            $or: [
                { url: { $regex: new RegExp(normalizedUrl, "i") } },
                { title: scrapedProduct.title },
            ],
        });

        if (existingProduct) {
            const updatedPriceHistory = [
                ...existingProduct.priceHistory,
                { price: scrapedProduct.currentPrice },
            ];

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            };
        }

        const newProduct = await Product.findOneAndUpdate(
            { url: { $regex: new RegExp(normalizedUrl, "i") } },
            product,
            { upsert: true, new: true }
        );

        revalidatePath(`/products/${newProduct._id}`);
    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`);
    }
}

export async function getProductById(productId: string) {
    try {
        await connectToDB();

        const product = await Product.findOne({ _id: productId });

        if (!product) return null;

        return product;
    } catch (error) {
        console.log(error);
    }
}

export async function getAllProduct() {
    try {
        await connectToDB();

        const products = await Product.find();

        const formattedProducts = products.map((product) => ({
            ...product.toObject(),
            _id: product._id.toString(),
        }));

        return formattedProducts;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getSimilarProduct(productId: string) {
    try {
        await connectToDB();

        const currentProduct = await Product.findById(productId);

        if (!currentProduct) return;

        const query: any = {
            _id: { $ne: productId },
        };

        if (currentProduct.category) {
            query.category = currentProduct.category;
        }

        const similarProducts = await Product.find(query).limit(3);

        return similarProducts;
    } catch (error) {
        console.log(error);
    }
}

export async function addUserEmailToProduct(
    productId: string,
    userEmail: string
) {
    try {
        const product = await Product.findById(productId);

        if (!product) return;

        const userExists = product.users.some(
            (user: User) => user.email === userEmail
        );

        if (!userExists) {
            product.users.push({ email: userEmail });

            await product.save();

            const emailContent = await generateEmailBody(
                product,
                "WELCOME" as NotificationType
            );

            await sendEmail(emailContent, [userEmail]);
        }
    } catch (error) {
        console.log(error);
    }
}
