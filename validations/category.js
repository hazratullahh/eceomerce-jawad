import { z } from "zod";

export const categorySchema = z.object({
  name: z.object({
    en: z.string().min(1, "English category name is required.").trim(),
    ar: z.string().optional(),
  }),
  description: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  image: z
    .object({
      url: z.string().url("Invalid image URL."),
      public_id: z.string().min(1, "Image public ID is required."),
    })
    .optional(), // Keep image optional as per your original code
});
