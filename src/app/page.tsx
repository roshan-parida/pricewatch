"use client";

import { useState, useEffect } from "react";
import { getAllProduct } from "@/lib/actions";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Searchbar } from "@/components/Searchbar";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";

const Home = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const products = await getAllProduct();
                setAllProducts(products);
            } catch (error: any) {
                console.error("Failed to fetch products:", error);
                setError("Unable to load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="px-6 md:px-20 py-24">
                <div className="flex max-xl:flex-col gap-16">
                    <div className="flex flex-col justify-center">
                        <p className="small-text flex items-center">
                            Smart Shopping Starts Here:
                            <Icon
                                icon="bx:right-arrow-alt"
                                width={16}
                                height={16}
                            />
                        </p>

                        <h1 className="head-text">
                            Unleash the power of{" "}
                            <span className="text-primary">PriceWatch</span>
                        </h1>

                        <p className="mt-6 text-lg">
                            Powerful, self-serve product and growth analytics to
                            help you convert, engage, and retain more.
                        </p>

                        <Searchbar />
                    </div>

                    <HeroCarousel />
                </div>
            </section>

            {/* Trending Products Section */}
            <section className="trending-section py-12 px-6 md:px-20">
                <h2 className="section-text mb-8">Trending Products</h2>

                {/* Loading State */}
                {loading && (
                    <div className="w-full flex justify-center items-center py-12">
                        <div className="spinner">Loading...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="w-full text-center py-12">
                        <p className="text-red-500 font-semibold">{error}</p>
                    </div>
                )}

                {/* Display Products if not loading or error */}
                {!loading && !error && allProducts?.length > 0 && (
                    <div className="flex flex-wrap gap-8">
                        {allProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                {/* No Products Found */}
                {!loading && !error && allProducts?.length === 0 && (
                    <div className="w-full text-center py-12">
                        <p>No products available at the moment.</p>
                    </div>
                )}
            </section>
        </>
    );
};

export default Home;
