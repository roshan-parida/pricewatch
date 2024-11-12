import axios from "axios";
import * as cheerio from "cheerio";

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; en-IN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; en-IN) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X; en-IN) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 10; SM-G975F; en-IN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; en-IN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchProductPage(url: string, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const userAgent = getRandomUserAgent();
        try {
            await new Promise((resolve) =>
                setTimeout(resolve, delay * Math.pow(2, attempt - 1))
            );

            return await axios.get(url, {
                headers: { "User-Agent": userAgent },
                timeout: 10000,
            });
        } catch (error) {
            console.error(
                `Attempt ${attempt} - Failed to fetch ${url}: ${
                    (error as Error).message
                }`
            );

            if (attempt === retries) {
                console.error(`Max retries reached for ${url}`);
                throw error;
            }
        }
    }
}

export async function scrapeAmazonProduct(url: string) {
    if (!url) return null;

    try {
        const response = await fetchProductPage(url);
        if (!response || !response.data)
            throw new Error("Failed to fetch product page data");

        const $ = cheerio.load(response.data);

        const title = $("#productTitle").text().trim() || "Unknown Title";

        const currency = $(".a-price-symbol").text().trim().slice(0, 1) || "$";
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

        const outOfStockText = $("#availability span")
            .text()
            .trim()
            .toLowerCase();
        const outOfStock =
            outOfStockText === "currently unavailable" ||
            outOfStockText === "out of stock";

        const imagesData =
            $("#imgblkFront").attr("data-a-dynamic-image") ||
            $("#landingImage").attr("data-a-dynamic-image") ||
            "{}";
        const imageUrls = Object.keys(JSON.parse(imagesData));
        const image = imageUrls[0] || "";

        const category =
            $("a.a-link-normal.a-color-tertiary").first().text().trim() || "";
        const starsText = $("span.a-size-base .a-color-base").text().trim();
        const stars = parseFloat(starsText.split(" ")[0]) || 0;
        const reviewsCountText = $("#acrCustomerReviewText")
            .text()
            .trim()
            .split(" ")[0]
            .replace(/[^0-9]/g, "");
        const reviewsCount = reviewsCountText ? Number(reviewsCountText) : 0;

        const data = {
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
        console.error(
            `Failed to scrape product at ${url}: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
        return null;
    }
}
