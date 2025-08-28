"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { PiCoatHangerLight, PiTagLight } from "react-icons/pi";
import { LuScaling, LuRuler } from "react-icons/lu";
import { TbTallymark1 } from "react-icons/tb";
import ProductForm from "@/app/components/product/ProductForm";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId;
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/${productId}`);
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axios.get("/api/categories").then((res) => res.data),
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-300">
        <p className="text-lg">Loading product details...</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">
        <p className="text-lg">Error: {error.message}</p>
      </div>
    );

  if (isEditing) {
    return (
      <div className="container mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-500 transition-colors"
          >
            <FaArrowLeft /> Back to View
          </button>
        </div>
        <ProductForm
          categories={categories}
          productToEdit={product}
          setProductToEdit={() => {}}
          setIsFormOpen={setIsEditing}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-500 transition-colors"
        >
          <FaArrowLeft /> Back to Products
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <FaEdit /> Edit
          </button>
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
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-100 border-b border-gray-700 pb-4">
          {product.name?.[lang] || "Product Details"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Gallery */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Images
            </h2>
            {product.images?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((img) => (
                  <div
                    key={img.public_id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-blue-400 transition-colors"
                  >
                    <Image
                      src={img.url}
                      alt="Product Image"
                      fill={true}
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-gray-700 rounded-lg">
                <p>No images available.</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Details
            </h2>
            <dl className="space-y-4">
              <div className="flex items-center gap-4">
                <PiTagLight className="text-blue-400 text-xl" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-400">Price</dt>
                  <dd className="text-white text-lg font-bold">
                    ${product.price?.toFixed(2) || "N/A"}
                    {product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <PiCoatHangerLight className="text-blue-400 text-xl" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-400">
                    Category
                  </dt>
                  <dd className="text-white capitalize">
                    {product.category || "N/A"}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <LuRuler className="text-blue-400 text-xl" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-400">SKU</dt>
                  <dd className="text-white">{product.sku || "N/A"}</dd>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <TbTallymark1 className="text-blue-400 text-xl" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-400">
                    Quantity
                  </dt>
                  <dd className="text-white">{product.quantity || 0}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Description & Other Details */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-gray-700 pt-8">
          {/* Description */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Description
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {product.description?.[lang] || "No description available."}
            </p>
          </div>

          {/* Sizes */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">Sizes</h2>
            {product.sizes?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full"
                  >
                    {size}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">N/A</p>
            )}
          </div>

          {/* Care Instructions */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Care Instructions
            </h2>
            {product.careInstructions?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                {product.careInstructions.map((instruction, index) => (
                  <li key={index}>{instruction[lang]}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">N/A</p>
            )}
          </div>

          {/* Dimensions */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Dimensions
            </h2>
            {product.dimensions?.length > 0 ? (
              <dl className="space-y-2 text-gray-300">
                {product.dimensions.map((dim) => (
                  <div
                    key={dim.size}
                    className="flex justify-between border-b border-gray-700 last:border-b-0 pb-1"
                  >
                    <dt className="font-medium">{dim.size}:</dt>
                    <dd className="text-right">{dim[lang]}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-gray-500 text-center">N/A</p>
            )}
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Additional Details
            </h2>
            {product.details?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail[lang]}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">N/A</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
