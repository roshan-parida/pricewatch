import { getProductById } from "@/lib/actions";
import { Product } from "@/types";
import { Icon } from "@iconify/react/dist/iconify.js";
import { formatNumber } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

type Props = {
    params: { id: string };
};

const ProductDetails = async ({ params: { id } }: Props) => {
    const product: Product = await getProductById(id);

    if (!product) redirect("/");

    return (
        <div className="product-container">
            <div className="flex gap-28 xl:flex-row flex-col">
                <div className="product-image">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="m-auto w-96 p-4 border border-[#CDDBFF] rounded-[17px]"
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
                                className="text-base text-black opacity-50"
                            >
                                Visit Product
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="product-hearts">
                                <Icon
                                    icon="solar:star-outline"
                                    className="w-5 h-5 text-yellow-600"
                                />

                                <p className="text-base font-semibold text-yellow-600">
                                    {product.stars}
                                </p>
                            </div>

                            <div className="product-hearts">
                                <Icon
                                    icon="solar:document-text-outline"
                                    className="w-5 h-5 text-yellow-600"
                                />

                                <p className="text-base font-semibold text-yellow-600">
                                    {product.reviewsCount}
                                </p>
                            </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
