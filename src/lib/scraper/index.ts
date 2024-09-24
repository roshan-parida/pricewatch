import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice } from "../utils";

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

        const title = $("#productTitle").text().trim() || null;
        const currency = extractCurrency($(".a-price-symbol"));
        const currentPrice = extractPrice(
            $(".priceToPay span.a-price-whole"),
            $("a.size.base.a-color-price"),
            $(".a-button-selected .a-color-base"),
            $(".a-price.a-text-price")
        );
        const originalPrice = extractPrice(
            $("#priceblock_ourprice"),
            $(".a-price.a-text-price span.a-offscreen"),
            $("#listPrice"),
            $("#priceblock_dealprice"),
            $(".a-size-base.a-color-price")
        );
        const outOfStock =
            $("#availability span").text().trim().toLowerCase() ===
            "currently unavailable";

        const images =
            $("#imgblkFront").attr("data-a-dynamic-image") ||
            $("#landingImage").attr("data-a-dynamic-image") ||
            "{}";

        const imageUrls = Object.keys(JSON.parse(images));

        console.log({
            title,
            currency,
            currentPrice,
            originalPrice,
            outOfStock,
            imageUrls,
        });
    } catch (error: any) {
        console.error(`Failed to scrape product: ${error.message}`);
    }
}
