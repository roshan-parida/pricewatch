"use client";

import { getProductById, getSimilarProduct } from "@/lib/actions";
import { Product } from "@/types";
import { Icon } from "@iconify/react/dist/iconify.js";
import { formatNumber } from "@/lib/utils";
import { PriceInfoCard } from "@/components/PriceInfoCard";
import { ProductCard } from "@/components/ProductCard";
import { Modal } from "@/components/Modal";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

type Props = {
    params: { id: string };
};

const ProductDetails = ({ params: { id } }: Props) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);

                const fetchedProduct = await getProductById(id);
                const fetchedSimilarProducts = await getSimilarProduct(id);

                if (!fetchedProduct) {
                    redirect("/");
                }

                setProduct(fetchedProduct);
                setSimilarProducts(fetchedSimilarProducts || []);
            } catch (error) {
                console.error("Failed to load product details:", error);
                redirect("/");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="product-skeleton flex flex-col gap-6">
                <div className="skeleton skeleton-title h-8 w-3/4 bg-gray-300 rounded-md"></div>
                <div className="skeleton skeleton-price h-6 w-1/4 bg-gray-300 rounded-md"></div>
                <div className="skeleton skeleton-image h-64 w-96 bg-gray-300 rounded-md fade-in"></div>
                <div className="skeleton skeleton-description h-4 w-full bg-gray-300 rounded-md"></div>
                <div className="skeleton skeleton-reviews h-5 w-1/2 bg-gray-300 rounded-md"></div>
                <div className="skeleton skeleton-similar-products h-10 w-full bg-gray-300 rounded-md"></div>
            </div>
        );
    }

    if (!product) {
        return <p className="text-center">Product not found.</p>;
    }

    return (
        <div className="product-container">
            <div className="flex gap-28 xl:flex-row flex-col">
                <div className="product-image">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="m-auto w-96 p-4 border border-[#CDDBFF] rounded-[17px] fade-in"
                        loading="lazy"
                    />
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
                        <div className="flex flex-col gap-3">
                            <p className="text-[28px] text-secondary font-bold">
                                {product.title}
                            </p>

                            <Link
                                href={product.url}
                                target="_blank"
                                className="flex items-center justify-center w-32 h-10 gap-2 px-4 py-2 rounded-full bg-secondary-button text-white hover:scale-105 transition duration-200"
                            >
                                <Icon
                                    icon="ant-design:amazon-circle-filled"
                                    className="size-8 text-black"
                                />
                                <span className="font-semibold text-black">
                                    Amazon
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="product-info">
                        <div className="flex flex-col gap-2">
                            <p className="text-[34px] text-secondary font-bold">
                                {product.currency}{" "}
                                {formatNumber(product.currentPrice)}
                            </p>

                            <p className="text-[21px] text-black opacity-50 line-through">
                                {product.currency}{" "}
                                {formatNumber(product.originalPrice)}
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <div
                                className="product-stars"
                                aria-label={`Rating: ${product.stars} stars`}
                            >
                                <Icon
                                    icon="solar:star-outline"
                                    className="w-5 h-5 text-secondary-high"
                                />
                                <p className="text-base font-semibold text-secondary-high">
                                    {product.stars}
                                </p>
                            </div>

                            <div
                                className="product-reviews"
                                aria-label={`Reviews count: ${product.reviewsCount}`}
                            >
                                <Icon
                                    icon="solar:document-text-outline"
                                    className="w-5 h-5 text-secondary-high"
                                />
                                <p className="text-base font-semibold text-secondary-high">
                                    {formatNumber(product.reviewsCount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="my-7 flex flex-col gap-5">
                        <div className="flex gap-5 flex-wrap">
                            <PriceInfoCard
                                title="Current Price"
                                iconSrc="solar:tag-bold"
                                value={`${product.currency} ${formatNumber(
                                    product.currentPrice
                                )}`}
                                borderColor="border-gray-400"
                                iconColor="text-blue-700"
                            />
                            <PriceInfoCard
                                title="Average Price"
                                iconSrc="solar:chart-2-bold"
                                value={`${product.currency} ${formatNumber(
                                    product.averagePrice
                                )}`}
                                borderColor="border-gray-400"
                                iconColor="text-fuchsia-700"
                            />
                            <PriceInfoCard
                                title="Highest Price"
                                iconSrc="solar:graph-up-bold"
                                value={`${product.currency} ${formatNumber(
                                    product.highestPrice
                                )}`}
                                borderColor="border-gray-400"
                                iconColor="text-red-700"
                            />
                            <PriceInfoCard
                                title="Lowest Price"
                                iconSrc="solar:graph-down-bold"
                                value={`${product.currency} ${formatNumber(
                                    product.lowestPrice
                                )}`}
                                borderColor="border-gray-400"
                                iconColor="text-green-700"
                            />
                        </div>
                    </div>

                    <Modal productId={id} />
                </div>
            </div>

            {similarProducts && similarProducts.length > 0 && (
                <div className="similar-products-section py-14">
                    <p className="section-text">Similar Products</p>
                    <div className="similar-products mt-7 w-full">
                        {similarProducts.map((product) => (
                            <ProductCard
                                key={String(product._id)}
                                product={product}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
