export function extractPrice(...elements: any) {
    for (const element of elements) {
        const priceText = element.text().trim();

        if (priceText) {
            const cleanedPrice = priceText.replace(/[^\d.]/g, "");

            if (cleanedPrice && !isNaN(parseFloat(cleanedPrice))) {
                return cleanedPrice;
            }
        }
    }

    console.warn("No valid price found in provided elements.");
    return "";
}

export function extractCurrency(element: any) {
    const currencyText = element.text().trim().slice(0, 1);
    return currencyText ? currencyText : "";
}
