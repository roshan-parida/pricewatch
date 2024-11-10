import { formatNumber } from "@/lib/utils";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface Props {
    product: Product;
}

export const ProductCard = ({ product }: Props) => {
    return (
        <Link
            href={`/products/${product._id}`}
            className="product-card fade-in border gray p-4 shadow-md hover:shadow-lg transition-all"
        >
            <div className="product-card_img-container">
                <Image
                    src={product.image}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="product-card_img object-contain"
                    sizes="(max-width: 640px) 200px, 200px"
                />
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="product-title text-ellipsis overflow-hidden whitespace-nowrap">
                    {product.title.length > 20
                        ? product.title.substring(0, 20) + "..."
                        : product.title}
                </h3>

                <div className="flex justify-between">
                    <p className="text-black opacity-50 text-lg capitalize">
                        {product.category}
                    </p>

                    <p className="text-black text-lg font-semibold">
                        <span>{product.currency}</span>
                        <span>{formatNumber(product.currentPrice)}</span>
                    </p>
                </div>
            </div>
        </Link>
    );
};
