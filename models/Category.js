import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, "English category name is required."],
        trim: true,
      },
      ar: {
        type: String,
        required: [true, "Arabic category name is required."],
        trim: true,
      },
    },
    description: {
      en: { type: String, required: false },
      ar: { type: String, required: false },
    },
    image: {
      url: {
        type: String,
        required: [true, "Category image URL is required."],
      },
      public_id: {
        type: String,
        required: [true, "Category image public ID is required."],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || model("Category", categorySchema);

export default Category;
