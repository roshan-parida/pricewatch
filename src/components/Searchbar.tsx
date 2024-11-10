"use client";

import { FormEvent, useState } from "react";
import { scrapeAndStoreProduct } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Product } from "@/types";

const isValidAmazonProductURL = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        if (hostname.includes("amazon")) {
            return true;
        }
    } catch (error) {
        return false;
    }

    return false;
};

export const Searchbar = () => {
    const [searchPrompt, setSearchPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const isValidLink = isValidAmazonProductURL(searchPrompt);

        if (!isValidLink) {
            setError('Please provide a valid "shareable" Amazon product link.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const product = (await scrapeAndStoreProduct(
                searchPrompt
            )) as Product | null;

            if (product && product._id) {
                router.push(`/products/${product._id}`);
            } else {
                setError("Product not found.");
            }
        } catch (error) {
            console.log(error);
            setError(
                "An error occurred while searching for the product. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Enter product link"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                className="searchbar-input"
                disabled={isLoading}
                aria-describedby="search-error"
            />

            <button
                type="submit"
                className="searchbar-btn"
                disabled={searchPrompt === "" || isLoading}
            >
                {isLoading ? "Searching..." : "Search"}
            </button>

            {error && (
                <p id="search-error" className="text-red-600 text-sm mt-2">
                    {error}
                </p>
            )}
        </form>
    );
};
