"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaCamera,
  FaTimes,
  FaTrash,
  FaInfoCircle,
  FaImage,
  FaWrench,
} from "react-icons/fa";
import Image from "next/image";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCloudinaryUpload } from "@/app/hooks/use-cloudinary-upload";

// Define the Zod schema for form validation
const formSchema = z.object({
  name: z.object({
    en: z.string().trim().min(1, "English name is required"),
    ar: z.string().trim().optional(),
  }),
  price: z.number().min(0, "Price must be a positive number"),
  originalPrice: z
    .number()
    .min(0, "Original price must be a positive number")
    .optional(),
  discountPercentage: z
    .number()
    .min(0, "Discount percentage must be a positive number")
    .optional(),
  quantity: z.number().min(0, "Quantity must be a positive number"),
  images: z
    .array(z.object({ url: z.string(), public_id: z.string() }))
    .min(1, "At least one image is required"),
  saleText: z.object({
    en: z.string().trim().optional(),
    ar: z.string().trim().optional(),
  }),
  category: z.string().trim().min(1, "Category is required"),
  description: z.object({
    en: z.string().trim().optional(),
    ar: z.string().trim().optional(),
  }),
  sizes: z.array(z.string().trim().min(1, "Size is required")).default([]),
  sku: z.string().trim().optional(),
  materials: z.object({
    en: z.string().trim().optional(),
    ar: z.string().trim().optional(),
  }),
  careInstructions: z
    .array(
      z.object({
        en: z.string().trim().min(1, "English instruction is required"),
        ar: z.string().trim().optional(),
      })
    )
    .default([]),
  dimensions: z
    .array(
      z.object({
        size: z.string().trim().min(1, "Size is required"),
        en: z.string().trim().optional(),
        ar: z.string().trim().optional(),
      })
    )
    .default([]),
  details: z
    .array(
      z.object({
        en: z.string().trim().min(1, "English detail is required"),
        ar: z.string().trim().optional(),
      })
    )
    .default([]),
});

function ProductForm({
  categories,
  productToEdit,
  setProductToEdit,
  setIsFormOpen,
  lang = "en",
  setLang,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const { uploadImages, isUploading } = useCloudinaryUpload();
  const [selectedImagePreviews, setSelectedImagePreviews] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: { en: "", ar: "" },
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      quantity: 0,
      images: [],
      saleText: { en: "", ar: "" },
      category: "",
      description: { en: "", ar: "" },
      sizes: [],
      sku: "",
      materials: { en: "", ar: "" },
      careInstructions: [],
      dimensions: [],
      details: [],
    },
  });

  const {
    fields: sizesFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({ control, name: "sizes" });
  const {
    fields: careFields,
    append: appendCare,
    remove: removeCare,
  } = useFieldArray({ control, name: "careInstructions" });
  const {
    fields: detailsFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({ control, name: "details" });
  const {
    fields: dimensionsFields,
    append: appendDimension,
    remove: removeDimension,
  } = useFieldArray({ control, name: "dimensions" });

  useEffect(() => {
    if (productToEdit) {
      reset({
        ...productToEdit,
        name: productToEdit.name || { en: "", ar: "" },
        saleText: productToEdit.saleText || { en: "", ar: "" },
        description: productToEdit.description || { en: "", ar: "" },
        materials: productToEdit.materials || { en: "", ar: "" },
        sizes: productToEdit.sizes || [],
        careInstructions: productToEdit.careInstructions || [],
        details: productToEdit.details || [],
        dimensions: productToEdit.dimensions || [],
        images: productToEdit.images || [],
        category: productToEdit.category || "", // Now stores _id
      });
      setCurrentImages(productToEdit.images || []);
      setSelectedImagePreviews([]);
    } else {
      reset();
      setCurrentImages([]);
      setSelectedImagePreviews([]);
      setValue("name.ar", "");
      setValue("careInstructions", []);
      setValue("details", []);
    }
  }, [productToEdit, reset, setValue]);

  useEffect(() => {
    const dummyImages = selectedImagePreviews.map(() => ({
      url: "dummy",
      public_id: "dummy",
    }));
    setValue("images", [...currentImages, ...dummyImages], {
      shouldValidate: true,
    });
  }, [currentImages, selectedImagePreviews, setValue]);

  const handleError = (err, action) => {
    const message = err.response?.data?.message || err.message;
    let detailedError = message;
    if (err.response?.data?.errors) {
      detailedError = err.response.data.errors
        .map((issue) => issue.message)
        .join("\n");
    }
    toast.error(`Failed to ${action} product: ${detailedError}`);
  };

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log("Sending product data:", data); // Log for debugging
      return axios.post("/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product added successfully!");
      resetForm();
    },
    onError: (err) => handleError(err, "add"),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      console.log("Sending updated product data:", data); // Log for debugging
      return axios.put(`/api/products/${productToEdit?._id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["product", productToEdit?._id]);
      toast.success("Product updated successfully!");
      resetForm();
    },
    onError: (err) => handleError(err, "update"),
  });

  const resetForm = () => {
    reset();
    setSelectedImagePreviews([]);
    setCurrentImages([]);
    setProductToEdit(null);
    setIsFormOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (data) => {
    let finalImages = [...currentImages];

    if (selectedImagePreviews.length > 0) {
      const newUploadedImages = await uploadImages(
        selectedImagePreviews.map((p) => p.file)
      );
      if (!newUploadedImages) {
        toast.error("Image upload failed. Please try again.");
        return;
      }
      finalImages = [...finalImages, ...newUploadedImages];
    }

    if (finalImages.length === 0) {
      toast.error("At least one image is required.");
      return;
    }

    const dataToSend = {
      ...data,
      images: finalImages,
      name: {
        en: data.name.en,
        ar: data.name.ar || "",
      },
      careInstructions: data.careInstructions.map((item) => ({
        en: item.en,
        ar: item.ar || "",
      })),
      details: data.details.map((item) => ({
        en: item.en,
        ar: item.ar || "",
      })),
    };

    if (productToEdit) {
      updateMutation.mutate(dataToSend);
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleInvalidSubmit = (errors) => {
    toast.error("Please fill in all required fields correctly.");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setSelectedImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingImage = (publicId) => {
    const updatedImages = currentImages.filter(
      (img) => img.public_id !== publicId
    );
    setCurrentImages(updatedImages);
  };

  const handleRemovePreview = (url) => {
    setSelectedImagePreviews((prev) => prev.filter((p) => p.url !== url));
  };

  const isFormSubmitting =
    createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
      className="space-y-10 bg-gray-900 p-8 rounded-2xl shadow-xl"
    >
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <FaInfoCircle className="text-blue-500" /> General Information (
          {lang.toUpperCase()})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Name *
            </label>
            <Controller
              control={control}
              name={`name.${lang}`}
              key={`name-${lang}`}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                    errors.name?.[lang] ? "border-red-500" : "border-gray-700"
                  }`}
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
              Category *
            </label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                    errors.category ? "border-red-500" : "border-gray-700"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name[lang]}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.category && (
              <p className="text-red-400 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              SKU
            </label>
            <input
              {...register("sku")}
              className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                errors.sku ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.sku && (
              <p className="text-red-400 text-xs mt-1">{errors.sku.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                errors.price ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.price && (
              <p className="text-red-400 text-xs mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Original Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("originalPrice", { valueAsNumber: true })}
              className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                errors.originalPrice ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.originalPrice && (
              <p className="text-red-400 text-xs mt-1">
                {errors.originalPrice.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              {...register("discountPercentage", { valueAsNumber: true })}
              className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                errors.discountPercentage ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.discountPercentage && (
              <p className="text-red-400 text-xs mt-1">
                {errors.discountPercentage.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                errors.quantity ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.quantity && (
              <p className="text-red-400 text-xs mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Materials
            </label>
            <Controller
              control={control}
              name={`materials.${lang}`}
              key={`materials-${lang}`}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                    errors.materials?.[lang]
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                />
              )}
            />
            {errors.materials?.[lang] && (
              <p className="text-red-400 text-xs mt-1">
                {errors.materials[lang].message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Sale Text
            </label>
            <Controller
              control={control}
              name={`saleText.${lang}`}
              key={`saleText-${lang}`}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                    errors.saleText?.[lang]
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                />
              )}
            />
            {errors.saleText?.[lang] && (
              <p className="text-red-400 text-xs mt-1">
                {errors.saleText[lang].message}
              </p>
            )}
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <Controller
              control={control}
              name={`description.${lang}`}
              key={`description-${lang}`}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows="4"
                  className={`w-full bg-gray-800 text-white border rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${
                    errors.description?.[lang]
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
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
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <FaImage className="text-blue-500" /> Media
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Product Images *
          </label>
          <div className="flex items-center space-x-4 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <FaCamera size={16} /> Upload Images
            </button>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
            <p className="text-sm text-gray-400">
              Supports JPG, PNG, WEBP up to 5MB per file
            </p>
          </div>
          {errors.images && (
            <p className="text-red-400 text-xs mt-1">{errors.images.message}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {currentImages.map((img) => (
              <div
                key={img.public_id}
                className="relative aspect-square rounded-lg overflow-hidden group border border-gray-700"
              >
                <Image
                  src={img.url}
                  alt="Existing Product Image"
                  fill={true}
                  style={{ objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(img.public_id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Image"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
            {selectedImagePreviews.map((preview) => (
              <div
                key={preview.url}
                className="relative aspect-square rounded-lg overflow-hidden group border border-gray-700 animate-pulse"
              >
                <Image
                  src={preview.url}
                  alt="New Image Preview"
                  fill={true}
                  style={{ objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePreview(preview.url)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Preview"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
          {isUploading && (
            <p className="text-blue-400 text-center mt-4 text-sm">
              Uploading {selectedImagePreviews.length} image(s)... Please wait.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <FaWrench className="text-blue-500" /> Specifications & Details (
          {lang.toUpperCase()})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
            <h4 className="font-semibold text-gray-100 mb-4">Sizes</h4>
            {sizesFields.map((field, index) => (
              <div key={field.id} className="flex gap-3 mb-3 items-center">
                <div className="flex-1">
                  <input
                    {...register(`sizes.${index}`)}
                    className={`w-full bg-gray-700 text-white border rounded-md p-3 text-sm ${
                      errors.sizes?.[index]
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  {errors.sizes?.[index] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.sizes[index].message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2"
                  title="Remove Size"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendSize("")}
              className="mt-4 w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-700 text-blue-400 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaPlus size={12} /> Add Size
            </button>
            {errors.sizes && !errors.sizes[0] && (
              <p className="text-red-400 text-xs mt-1">
                {errors.sizes.message}
              </p>
            )}
          </div>
          <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
            <h4 className="font-semibold text-gray-100 mb-4">
              Care Instructions
            </h4>
            {careFields.map((field, index) => (
              <div key={field.id} className="flex gap-3 mb-3 items-center">
                <div className="flex-1">
                  <Controller
                    control={control}
                    name={`careInstructions.${index}.${lang}`}
                    key={`careInstructions-${index}-${lang}`}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`w-full bg-gray-700 text-white border rounded-md p-3 text-sm ${
                          errors.careInstructions?.[index]?.[lang]
                            ? "border-red-500"
                            : "border-gray-600"
                        }`}
                      />
                    )}
                  />
                  {errors.careInstructions?.[index]?.[lang] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.careInstructions[index][lang].message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeCare(index)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2"
                  title="Remove Instruction"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendCare({ en: "", ar: "" })}
              className="mt-4 w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-700 text-blue-400 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaPlus size={12} /> Add Instruction
            </button>
            {errors.careInstructions && !errors.careInstructions[0] && (
              <p className="text-red-400 text-xs mt-1">
                {errors.careInstructions.message}
              </p>
            )}
          </div>
          <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
            <h4 className="font-semibold text-gray-100 mb-4">
              Product Details
            </h4>
            {detailsFields.map((field, index) => (
              <div key={field.id} className="flex gap-3 mb-3 items-center">
                <div className="flex-1">
                  <Controller
                    control={control}
                    name={`details.${index}.${lang}`}
                    key={`details-${index}-${lang}`}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`w-full bg-gray-700 text-white border rounded-md p-3 text-sm ${
                          errors.details?.[index]?.[lang]
                            ? "border-red-500"
                            : "border-gray-600"
                        }`}
                      />
                    )}
                  />
                  {errors.details?.[index]?.[lang] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.details[index][lang].message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeDetail(index)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2"
                  title="Remove Detail"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendDetail({ en: "", ar: "" })}
              className="mt-4 w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-700 text-blue-400 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaPlus size={12} /> Add Detail
            </button>
            {errors.details && !errors.details[0] && (
              <p className="text-red-400 text-xs mt-1">
                {errors.details.message}
              </p>
            )}
          </div>
          <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 md:col-span-2 lg:col-span-3">
            <h4 className="font-semibold text-gray-100 mb-2">Dimensions</h4>
            <p className="text-sm text-gray-400 mb-4">
              Add size-specific dimensions (e.g., "M" and "Length: 54in").
            </p>
            {dimensionsFields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col md:flex-row gap-4 mb-4"
              >
                <div className="flex-1">
                  <input
                    {...register(`dimensions.${index}.size`)}
                    className={`w-full bg-gray-700 text-white border rounded-md p-3 text-sm ${
                      errors.dimensions?.[index]?.size
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  {errors.dimensions?.[index]?.size && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.dimensions[index].size.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Controller
                    control={control}
                    name={`dimensions.${index}.${lang}`}
                    key={`dimensions-${index}-${lang}`}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`w-full bg-gray-700 text-white border rounded-md p-3 text-sm ${
                          errors.dimensions?.[index]?.[lang]
                            ? "border-red-500"
                            : "border-gray-600"
                        }`}
                      />
                    )}
                  />
                  {errors.dimensions?.[index]?.[lang] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.dimensions[index][lang].message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeDimension(index)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2 md:self-center"
                  title="Remove Dimension"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendDimension({ size: "", en: "", ar: "" })}
              className="mt-4 w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-700 text-blue-400 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaPlus size={12} /> Add Dimension
            </button>
            {errors.dimensions && !errors.dimensions[0] && (
              <p className="text-red-400 text-xs mt-1">
                {errors.dimensions.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 pt-6">
        <button
          type="button"
          onClick={resetForm}
          className="w-full md:w-auto bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
        >
          {productToEdit ? "Cancel" : "Reset"}
        </button>
        <button
          type="submit"
          disabled={isFormSubmitting}
          className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed shadow-lg font-semibold"
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
            <FaPlus />
          )}
          {productToEdit
            ? isUploading
              ? "Uploading..."
              : "Update Product"
            : isUploading
            ? "Uploading..."
            : "Add Product"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
