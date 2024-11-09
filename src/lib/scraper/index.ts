import axios from "axios";
import * as cheerio from "cheerio";
import { Product } from "@/types";

export async function scrapeAmazonProduct(
    url: string
): Promise<Product | null> {
    if (!url) return null;

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
            },
        });

        const $ = cheerio.load(response.data);

        const title = $("#productTitle").text().trim();
        const currency = $(".a-price-symbol").text()?.trim().slice(0, 1) || "$";

        const currentPriceText = $(".a-price .a-price-whole")
            .first()
            .text()
            .trim()
            .replace(/[^0-9]/g, "");
        const currentPrice = currentPriceText ? Number(currentPriceText) : 0;

        const originalPriceText = $(".basisPrice .a-offscreen")
            .first()
            .text()
            .trim()
            .replace(/[^0-9]/g, "");
        const originalPrice = originalPriceText
            ? Number(originalPriceText)
            : currentPrice;

        const discountRateText = $(".reinventPriceSavingsPercentageMargin")
            .first()
            .text()
            .trim()
            .replace(/[-%]/g, "");
        const discountRate = discountRateText ? Number(discountRateText) : 0;

        const outOfStock =
            $("#availability span").text().trim().toLowerCase() ===
            "currently unavailable";

        const images =
            $("#imgblkFront").attr("data-a-dynamic-image") ||
            $("#landingImage").attr("data-a-dynamic-image") ||
            "{}";
        const imageUrls = Object.keys(JSON.parse(images));
        const image = imageUrls[0] || "";

        const category =
            $("a.a-link-normal.a-color-tertiary").first().text().trim() ||
            "Not Found";

        const starsText = $("span.a-size-base .a-color-base").text().trim();
        const stars = parseFloat(starsText.split(" ")[0]) || 0;

        const reviewsCountText = $("#acrCustomerReviewText")
            .text()
            .trim()
            .split(" ")[0]
            .replace(/[^0-9]/g, "");
        const reviewsCount = reviewsCountText ? Number(reviewsCountText) : 0;

        const data: Product = {
            url,
            title,
            currency,
            image,
            currentPrice,
            originalPrice,
            discountRate,
            priceHistory: [],
            category,
            stars,
            reviewsCount,
            isOutOfStock: outOfStock,
            lowestPrice: currentPrice,
            highestPrice: originalPrice,
            averagePrice: currentPrice,
        };

        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                `Failed to scrape product at ${url}: ${error.message}`
            );
        } else {
            console.error(`An unknown error occurred during scraping.`);
        }
        return null;
    }
}
