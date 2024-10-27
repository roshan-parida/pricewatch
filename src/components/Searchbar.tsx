"use client";

import { FormEvent, useState } from "react";
import { scrapeAndStoreProduct } from "@/lib/actions";

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

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const isValidLink = isValidAmazonProductURL(searchPrompt);

		if (!isValidLink) {
			return alert('Please provide a valid "sharable" amazon link.');
		}

		try {
			setIsLoading(true);

			const product = await scrapeAndStoreProduct(searchPrompt);
		} catch (error) {
			console.log(error);
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
			/>

			<button
				type="submit"
				className="searchbar-btn"
				disabled={searchPrompt === ""}
			>
				{isLoading ? "searching..." : "Search"}
			</button>
		</form>
	);
};
