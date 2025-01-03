import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        currency: { type: String, required: true },
        currentPrice: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        priceHistory: [
            {
                price: { type: Number, required: true },
                date: { type: Date, default: Date.now },
            },
        ],
        lowestPrice: { type: Number },
        highestPrice: { type: Number },
        averagePrice: { type: Number },
        discountRate: { type: Number },
        category: { type: String },
        stars: { type: Number },
        reviewsCount: { type: Number },
        isOutOfStock: { type: Boolean, default: false },
        users: [{ email: { type: String, required: true } }],
    },
    { timestamps: true }
);

productSchema.path("priceHistory").default(() => []);
productSchema.path("users").default(() => []);

const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
