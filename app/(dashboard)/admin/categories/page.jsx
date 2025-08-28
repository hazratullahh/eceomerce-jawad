"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPlus, FaCamera, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { useCloudinaryUpload } from "@/app/hooks/use-cloudinary-upload";
import { z } from "zod";
import CategoryTable from "@/app/components/category/CategoryTable";

// Define the Zod schema for form validation
const categorySchema = z.object({
  name: z.object({
    en: z.string().trim().min(1, "English category name is required"),
    ar: z.string().trim().optional(),
  }),
  description: z.object({
    en: z.string().trim().optional(),
    ar: z.string().trim().optional(),
  }),
  image: z
    .any()
    .refine(
      (file) => file instanceof File || (file && file.url && file.public_id),
      "An image is required"
    )
    .refine(
      (file) =>
        !file || !(file instanceof File) || file.size <= 5 * 1024 * 1024,
      "Image must be less than 5MB"
    )
    .refine(
      (file) =>
        !file || !(file instanceof File) || file.type.startsWith("image/"),
      "File must be an image"
    ),
});

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const { uploadImages, isUploading } = useCloudinaryUpload();
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lang, setLang] = useState("en");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
      image: null,
    },
  });

  const watchedImage = watch("image");

  useEffect(() => {
    if (watchedImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(watchedImage);
    } else if (watchedImage && watchedImage.url) {
      setImagePreview(watchedImage.url);
    } else {
      setImagePreview(null);
    }
  }, [watchedImage]);

  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axios.get("/api/categories").then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (categoryData) => axios.post("/api/categories", categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category added successfully!");
      resetForm();
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message;
      let detailedError = message;
      if (err.response?.data?.errors) {
        detailedError = err.response.data.errors
          .map((issue) => issue.message)
          .join("\n");
      }
      toast.error(`Failed to add category: ${detailedError}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedCategory) =>
      axios.put(`/api/categories/${updatedCategory._id}`, updatedCategory),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category updated successfully!");
      resetForm();
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message;
      let detailedError = message;
      if (err.response?.data?.errors) {
        detailedError = err.response.data.errors
          .map((issue) => issue.message)
          .join("\n");
      }
      toast.error(`Failed to update category: ${detailedError}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId) => axios.delete(`/api/categories/${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category deleted successfully!");
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message;
      toast.error(`Failed to delete category: ${message}`);
    },
  });

  const resetForm = () => {
    reset();
    setImagePreview(null);
    setIsEditing(false);
    setEditCategoryId(null);
    setLang("en");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (data) => {
    try {
      let uploadedImage = data.image;
      if (data.image instanceof File) {
        const uploadedImages = await uploadImages([data.image]);
        if (uploadedImages && uploadedImages.length > 0) {
          uploadedImage = uploadedImages[0];
        } else {
          throw new Error("Image upload failed");
        }
      }

      const categoryData = {
        name: {
          en: data.name.en,
          ar: data.name.ar || "",
        },
        description: {
          en: data.description.en || "",
          ar: data.description.ar || "",
        },
        image: uploadedImage,
      };

      if (isEditing) {
        updateMutation.mutate({ ...categoryData, _id: editCategoryId });
      } else {
        createMutation.mutate(categoryData);
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload image. Please try again.");
    }
  };

  const handleInvalidSubmit = (errors) => {
    toast.error("Please fill in all required fields correctly.");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
    }
  };

  const handleRemoveImage = () => {
    setValue("image", null, { shouldValidate: true });
  };

  const handleEditCategory = (category) => {
    setIsEditing(true);
    setEditCategoryId(category._id);
    setValue("name", category.name || { en: "", ar: "" });
    setValue("description", category.description || { en: "", ar: "" });
    setValue("image", category.image || null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteCategory = (categoryId) => {
    deleteMutation.mutate(categoryId);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
          <FaPlus className="text-blue-500" /> Manage Categories
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-300">English</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={lang === "ar"}
              onChange={() => setLang(lang === "en" ? "ar" : "en")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-gray-300">Arabic</span>
        </div>
      </div>

      <div
        ref={formRef}
        className="bg-gray-800 rounded-2xl p-8 mb-8 shadow-xl animate-fade-in"
      >
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">
          {isEditing ? "Edit Category" : "Add New Category"} (
          {lang.toUpperCase()})
        </h2>
        <form
          onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category Name * ({lang.toUpperCase()})
              </label>
              <Controller
                control={control}
                name={`name.${lang}`}
                key={`name-${lang}`}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder={`e.g., ${
                      lang === "en" ? "Dresses" : "فساتين"
                    }`}
                    className={`w-full bg-gray-700 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-colors ${
                      errors.name?.[lang] ? "border-red-500" : "border-gray-600"
                    }`}
                    aria-invalid={errors.name?.[lang] ? "true" : "false"}
                  />
                )}
              />
              {errors.name?.[lang] && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.name[lang].message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Description ({lang.toUpperCase()})
              </label>
              <Controller
                control={control}
                name={`description.${lang}`}
                key={`description-${lang}`}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder={`e.g., ${
                      lang === "en"
                        ? "All styles of elegant dresses"
                        : "جميع أنماط الفساتين الأنيقة"
                    }`}
                    rows="4"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-colors"
                  />
                )}
              />
              {errors.description?.[lang] && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.description[lang].message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Image *
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  aria-label="Upload image"
                >
                  <FaCamera size={16} /> Upload Image
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Supports JPG, PNG, WEBP up to 5MB
              </p>
              {errors.image && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.image.message}
                </p>
              )}
            </div>
            {imagePreview && (
              <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-600 shadow-md">
                <Image
                  src={imagePreview}
                  alt="Category Image Preview"
                  fill={true}
                  style={{ objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                isUploading
              }
              className="w-full sm:w-1/2 flex justify-center items-center gap-2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md font-semibold"
            >
              {isUploading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <FaPlus size={14} />
              )}
              {isEditing
                ? isUploading
                  ? "Uploading..."
                  : "Update Category"
                : isUploading
                ? "Uploading..."
                : "Add Category"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-1/2 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors shadow-md font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
          {(createMutation.isPending ||
            updateMutation.isPending ||
            isUploading) && (
            <p className="text-center text-blue-400 mt-4">
              {isEditing ? "Updating category..." : "Adding category..."}
            </p>
          )}
        </form>
      </div>

      <CategoryTable
        categories={categories}
        handleEditCategory={handleEditCategory}
        handleDeleteCategory={handleDeleteCategory}
        isLoading={isLoading}
        isError={isError}
        error={error}
        deleteMutation={deleteMutation}
        lang={lang}
      />
    </div>
  );
}
