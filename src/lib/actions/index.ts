"use server";

import { revalidatePath } from "next/cache";
import { scrapeAmazonProduct } from "../scraper";
import { connectToDB } from "../scraper/mongoose";
import {
	getAveragePrice,
	getHighestPrice,
	getLowestPrice,
	normalizeUrl,
} from "../utils";
import Product from "../models/product";

export async function scrapeAndStoreProduct(productUrl: string) {
	if (!productUrl) return;

	try {
		connectToDB();

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
			const updatedPriceHistory: any = [
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
			scrapedProduct,
			{ upsert: true, new: true },
		);

		revalidatePath(`/products/${newProduct._id}`);
	} catch (error: any) {
		throw new Error(`Failed to create/update product: ${error.message}`);
	}
}

export async function getProductById(productId: string) {
	try {
		connectToDB();

		const product = await Product.findOne({ _id: productId });

		if (!product) return null;

		return product;
	} catch (error) {
		console.log(error);
	}
}

export async function getAllProduct() {
	try {
		connectToDB();

		const products = await Product.find();

		return products;
	} catch (error) {
		console.log(error);
	}
}

export async function getSimilarProduct(productId: string) {
	try {
		connectToDB();

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
