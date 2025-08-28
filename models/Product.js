import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: false },
    discountPercentage: { type: Number, required: false },
    quantity: { type: Number, required: true },
    images: [{ url: String, public_id: String }],
    saleText: {
      en: { type: String, required: false },
      ar: { type: String, required: false },
    },
    category: { type: String, required: true },
    description: {
      en: { type: String, required: false },
      ar: { type: String, required: false },
    },
    sizes: [{ type: String }],
    sku: { type: String, required: false },
    materials: {
      en: { type: String, required: false },
      ar: { type: String, required: false },
    },
    careInstructions: [
      {
        en: { type: String, required: true },
        ar: { type: String, required: true },
      },
    ],
    dimensions: [
      {
        size: { type: String, required: false },
        en: { type: String, required: false },
        ar: { type: String, required: false },
      },
    ],
    details: [
      {
        en: { type: String, required: true },
        ar: { type: String, required: true },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
