"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Toaster } from "react-hot-toast";
import ProductForm from "@/app/components/product/ProductForm";
import ProductTable from "@/app/components/product/ProductTable";
import Modal from "@/app/components/Modal";
import { useConfirmModal } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const formRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [formData, setFormData] = useState(null);
  const [lang, setLang] = useState("en");
  const router = useRouter();
  const {
    isOpen: modalOpen,
    title,
    message,
    onConfirm: modalConfirm,
    openModal,
    closeModal,
  } = useConfirmModal();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axios.get("/api/categories").then((res) => res.data),
  });

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => axios.get("/api/products").then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => axios.delete(`/api/products/${productId}`),
    onMutate: async (productId) => {
      await queryClient.cancelQueries(["products"]);
      const previousProducts = queryClient.getQueryData(["products"]);
      queryClient.setQueryData(["products"], (old) =>
        old ? old.filter((product) => product._id !== productId) : []
      );
      return { previousProducts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product deleted successfully!");
      closeModal();
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(["products"], context.previousProducts);
      toast.error(
        `Failed to delete product: ${
          err.response?.data?.message || err.message
        }`
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setFormData(product);
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleViewProduct = (product) => {
    router.push(`/admin/products/${product._id}`);
  };

  const handleDeleteProduct = (productId) => {
    openModal(
      "Confirm Deletion",
      "Are you sure you want to delete this product?",
      () => deleteMutation.mutate(productId)
    );
  };

  const handleToggleForm = () => {
    setIsFormOpen(!isFormOpen);
    if (!isFormOpen) {
      setProductToEdit(null);
      setFormData(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Manage Products</h1>
        <div className="flex items-center gap-4">
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
          <button
            onClick={handleToggleForm}
            className={`flex items-center cursor-pointer gap-2 px-6 py-3 text-white rounded-lg shadow-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              isFormOpen
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-400"
                : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400"
            }`}
          >
            {isFormOpen ? (
              <>
                Close Form
                <FaChevronUp />
              </>
            ) : (
              <>
                <FaPlus />
                Add New Product
              </>
            )}
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div
          className="bg-gray-800 rounded-xl p-8 mb-8 shadow-xl transition-all duration-300 ease-in-out"
          ref={formRef}
        >
          <h2 className="text-2xl font-semibold text-gray-100 mb-6">
            {productToEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <ProductForm
            categories={categories}
            productToEdit={formData}
            setProductToEdit={setFormData}
            setIsFormOpen={setIsFormOpen}
            lang={lang}
            setLang={setLang}
          />
        </div>
      )}

      <ProductTable
        products={products}
        handleViewProduct={handleViewProduct}
        handleEditProduct={handleEditProduct}
        handleDeleteProduct={handleDeleteProduct}
        isLoading={isLoading}
        isError={isError}
        error={error}
        deleteMutation={deleteMutation}
        lang={lang}
        categories={categories}
      />
      <Modal
        isOpen={modalOpen}
        title={title}
        message={message}
        onClose={closeModal}
        onConfirm={modalConfirm}
      />
    </div>
  );
}
