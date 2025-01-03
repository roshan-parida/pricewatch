export type PriceHistoryItem = {
    price: number;
};

export type User = {
    email: string;
};

export type Product = {
    _id?: string;
    url: string;
    title: string;
    image: string;
    currency: string;
    currentPrice: number;
    originalPrice: number;
    priceHistory: PriceHistoryItem[];
    highestPrice: number;
    lowestPrice: number;
    averagePrice: number;
    discountRate: number;
    category: string;
    reviewsCount: number;
    stars: number;
    isOutOfStock: Boolean;
    users?: User[];
};

export type NotificationType =
    | "WELCOME"
    | "CHANGE OF STOCK"
    | "LOWEST PRICE"
    | "THRESHOLD_MET";

export type EmailContent = {
    subject: string;
    body: string;
};

export type EmailProductInfo = {
    title: string;
    url: string;
    image: string;
};
