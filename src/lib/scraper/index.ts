import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazonProduct(url: string) {
	if (!url) return;

	try {
		const response = await axios.get(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
			},
		});

		const $ = cheerio.load(response.data);

		const title = $("#productTitle").text().trim();

		const currency = $(".a-price-symbol").text()?.trim().slice(0, 1);
		const currentPrice = $(".a-price .a-price-whole")
			.first()
			.text()
			.trim()
			.replace(/[^0-9]/g, "");
		const originalPrice = $(".basisPrice .a-offscreen")
			.first()
			.text()
			.trim()
			.replace(/[^0-9]/g, "");
		const discountRate = $(".reinventPriceSavingsPercentageMargin")
			.first()
			.text()
			.trim()
			.replace(/[-%]/g, "");

		const outOfStock =
			$("#availability span").text().trim().toLowerCase() ===
			"currently unavailable";

		const images =
			$("#imgblkFront").attr("data-a-dynamic-image") ||
			$("#landingImage").attr("data-a-dynamic-image") ||
			"{}";
		const imageUrls = Object.keys(JSON.parse(images));

		const category = $("a.a-link-normal.a-color-tertiary")
			.first()
			.text()
			.trim();

		const stars = $("span.a-size-base .a-color-base")
			.text()
			.trim()
			.split(" ")[0];
		const reviewsCount = $("#acrCustomerReviewText")
			.text()
			.trim()
			.split(" ")[0]
			.replace(/[^0-9]/g, "");

		const data = {
			url,
			currency,
			image: imageUrls[0],
			title,
			currentPrice: Number(currentPrice),
			originalPrice: Number(originalPrice) || Number(currentPrice),
			discountRate: Number(discountRate),
			priceHistory: [],
			category: category || "Not Found",
			stars: Number(stars),
			reviewsCount: Number(reviewsCount),
			isOutOfStock: outOfStock,
			lowestPrice: Number(currentPrice),
			highestPrice: Number(originalPrice) || Number(currentPrice),
			averagePrice: Number(currentPrice),
		};

		return data;
	} catch (error: any) {
		console.error(`Failed to scrape product: ${error.message}`);
	}
}
