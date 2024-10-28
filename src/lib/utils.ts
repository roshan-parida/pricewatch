import { URL } from "url";
import { PriceHistoryItem, Product } from "@/types";

const Notification = {
	WELCOME: "WELCOME",
	CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
	LOWEST_PRICE: "LOWEST_PRICE",
	THRESHOLD_MET: "THRESHOLD_MET",
};

const THRESHOLD_PERCENTAGE = 40;

export const getEmailNotifType = (
	scrapedProduct: Product,
	currentProduct: Product,
) => {
	const lowestPrice = getLowestPrice(currentProduct.priceHistory);

	if (scrapedProduct.currentPrice < lowestPrice) {
		return Notification.LOWEST_PRICE as keyof typeof Notification;
	}
	if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
		return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
	}
	if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
		return Notification.THRESHOLD_MET as keyof typeof Notification;
	}

	return null;
};

export function getHighestPrice(priceList: PriceHistoryItem[]) {
	let highestPrice = priceList[0];

	for (let i = 0; i < priceList.length; i++) {
		if (priceList[i].price > highestPrice.price) {
			highestPrice = priceList[i];
		}
	}

	return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
	let lowestPrice = priceList[0];

	for (let i = 0; i < priceList.length; i++) {
		if (priceList[i].price < lowestPrice.price) {
			lowestPrice = priceList[i];
		}
	}

	return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
	const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
	const averagePrice = sumOfPrices / priceList.length || 0;

	return averagePrice;
}

export const formatNumber = (num: number = 0) => {
	return num.toLocaleString(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
};

export function normalizeUrl(url: string) {
	const parsedUrl = new URL(url);

	const mainPath = parsedUrl.pathname.split("/").slice(0, 4).join("/");

	return `${parsedUrl.origin}${mainPath}`;
}
