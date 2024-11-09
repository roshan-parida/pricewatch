import { URL } from "url";
import { PriceHistoryItem, Product } from "@/types";

export enum NotificationType {
    WELCOME = "WELCOME",
    CHANGE_OF_STOCK = "CHANGE OF STOCK",
    LOWEST_PRICE = "LOWEST PRICE",
    THRESHOLD_MET = "THRESHOLD_MET",
}

const THRESHOLD_PERCENTAGE = 40;

export const getEmailNotifType = (
    scrapedProduct: Product,
    currentProduct: Product
): NotificationType | null => {
    const lowestPrice = getLowestPrice(currentProduct.priceHistory);

    if (scrapedProduct.currentPrice < lowestPrice) {
        return NotificationType.LOWEST_PRICE;
    }
    if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
        return NotificationType.CHANGE_OF_STOCK;
    }
    if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
        return NotificationType.THRESHOLD_MET;
    }

    return null;
};

export function getHighestPrice(priceList: PriceHistoryItem[]): number {
    return priceList.length > 0
        ? Math.max(...priceList.map((item) => item.price))
        : 0;
}

export function getLowestPrice(priceList: PriceHistoryItem[]): number {
    return priceList.length > 0
        ? Math.min(...priceList.map((item) => item.price))
        : 0;
}

export function getAveragePrice(priceList: PriceHistoryItem[]): number {
    const totalSum = priceList.reduce((acc, curr) => acc + curr.price, 0);
    return priceList.length > 0 ? totalSum / priceList.length : 0;
}

export const formatNumber = (num: number = 0): string => {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

export function normalizeUrl(url: string): string {
    try {
        const parsedUrl = new URL(url);
        const mainPath = parsedUrl.pathname.split("/").slice(0, 4).join("/");
        return `${parsedUrl.origin}${mainPath}`;
    } catch (error) {
        console.error(`Invalid URL: ${url}`);
        return url;
    }
}
