import { getProductById, getSimilarProduct } from "@/lib/actions";
import { Product } from "@/types";
import { Icon } from "@iconify/react/dist/iconify.js";
import { formatNumber } from "@/lib/utils";
import { PriceInfoCard } from "@/components/PriceInfoCard";
import { ProductCard } from "@/components/ProductCard";
import { Modal } from "@/components/Modal";
import { redirect } from "next/navigation";
import Link from "next/link";

type Props = {
	params: { id: string };
};

const ProductDetails = async ({ params: { id } }: Props) => {
	const product: Product = await getProductById(id);

	if (!product) redirect("/");

	const similarProducts = await getSimilarProduct(id);

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

					<div className="my-7 flex flex-col gap-5">
						<div className="flex gap-5 flex-wrap">
							<PriceInfoCard
								title="Current Price"
								iconSrc="solar:tag-bold"
								value={`${product.currency} ${formatNumber(
									product.currentPrice,
								)}`}
								borderColor="border-gray-400"
								iconColor="text-blue-700"
							/>
							<PriceInfoCard
								title="Average Price"
								iconSrc="solar:chart-2-bold"
								value={`${product.currency} ${formatNumber(
									product.averagePrice,
								)}`}
								borderColor="border-gray-400"
								iconColor="text-fuchsia-700"
							/>
							<PriceInfoCard
								title="Highest Price"
								iconSrc="solar:graph-up-bold"
								value={`${product.currency} ${formatNumber(
									product.highestPrice,
								)}`}
								borderColor="border-gray-400"
								iconColor="text-red-700"
							/>
							<PriceInfoCard
								title="Lowest Price"
								iconSrc="solar:graph-down-bold"
								value={`${product.currency} ${formatNumber(
									product.lowestPrice,
								)}`}
								borderColor="border-gray-400"
								iconColor="text-green-700"
							/>
						</div>
					</div>

					<Modal productId={id} />
				</div>
			</div>

			<div className="flex flex-col gap-16 border-2 border-red-500 border-dashed">
				<div className="flex flex-col gap-5">
					<h3 className="text-2xl text-secondary font-semibold">
						Product Description
					</h3>

					<div className="flex flex-col gap-4">
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
						Odio corporis impedit quidem iure? Ex nobis fugiat ea.
						Ullam unde numquam alias praesentium magnam minus amet
						doloribus voluptatibus, corporis perspiciatis est.
					</div>
				</div>

				<button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
					<Icon icon="solar:bag-smile-outline" className="w-6 h-6" />

					<Link href="/" className="text-base">
						Buy Now
					</Link>
				</button>
			</div>

			{similarProducts && similarProducts.length > 0 && (
				<div className="py-14 flex flex-col gap-2 w-full">
					<p className="section-text">Similar Products</p>

					<div className="flex flex-wrap gap-10 mt-7 w-full">
						{similarProducts.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductDetails;
