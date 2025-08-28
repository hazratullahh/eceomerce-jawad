// validations/product.js
import { z } from "zod";

export const productSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English product name is required."),
    ar: z.string().optional(),
  }),
  price: z.number().positive("Price must be positive."),
  originalPrice: z
    .number()
    .min(0, "Original price cannot be negative.")
    .optional(),
  discountPercentage: z
    .number()
    .min(0)
    .max(100, "Discount must be between 0 and 100.")
    .optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative."),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        public_id: z.string().min(1),
      })
    )
    .min(1, "At least one image is required."),
  saleText: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  category: z.string().min(1, "Category is required."),
  description: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  sizes: z.array(z.string()),
  sku: z.string().optional(),
  materials: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  careInstructions: z.array(
    z.object({
      en: z.string().min(1, "English care instruction is required."),
      ar: z.string().optional(),
    })
  ),
  dimensions: z.array(
    z.object({
      size: z.string().min(1, "Size is required."),
      en: z.string().min(1, "English dimension value is required."),
      ar: z.string().optional(),
    })
  ),
  details: z.array(
    z.object({
      en: z.string().min(1, "English detail is required."),
      ar: z.string().optional(),
    })
  ),
});
