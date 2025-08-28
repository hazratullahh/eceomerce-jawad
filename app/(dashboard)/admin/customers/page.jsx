"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import { z } from "zod";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

import SearchBar from "@/app/components/customers/SearchBar";
import CustomerTable from "@/app/components/customers/CustomerTable";
import CustomerModal from "@/app/components/customers/CustomerModal";
import TableHeader from "@/app/components/customers/TableHeader";

const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amountWillPay: z.preprocess(
    (val) => Number(val),
    z.number().min(700, "Amount to pay must be at least $700")
  ),
  paidAmount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().optional()
  ),
  referrer: z.string().optional().nullable(),
});

if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("__next") || document.body);
}

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    amountWillPay: "",
    paidAmount: "",
    referrer: null,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const {
    data: customers,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["customers", debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }
      const res = await fetch(`/api/customers?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        throw new Error(
          errorData.message || `Failed to fetch customers: ${res.statusText}`
        );
      }
      return res.json();
    },
  });

  const {
    data: potentialReferrers,
    isLoading: isLoadingReferrers,
    isError: isErrorReferrers,
  } = useQuery({
    queryKey: ["potentialReferrers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        throw new Error("Failed to fetch potential referrers");
      }
      const data = await res.json();
      return data.map((customer) => ({
        value: customer.id,
        label: customer.name,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = ({ mutationFn, onSuccessMessage, onErrorMessage }) =>
    useMutation({
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        setIsModalOpen(false);
        setCurrentCustomer(null);
        setFormData({
          name: "",
          amountWillPay: "",
          paidAmount: "",
          referrer: null,
        });
        setFormErrors({});
        setFeedbackMessage({ type: "success", text: onSuccessMessage });
        setTimeout(() => setFeedbackMessage(null), 3000);
      },
      onError: (err) => {
        console.error("Mutation error:", err);
        let errorMessage = onErrorMessage;
        if (err.message) {
          errorMessage = err.message;
        }
        setFeedbackMessage({
          type: "error",
          text: errorMessage,
        });
        setTimeout(() => setFeedbackMessage(null), 5000);
      },
    });

  const addCustomerMutation = createMutation({
    mutationFn: async (newCustomer) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add customer");
      }
      return res.json();
    },
    onSuccessMessage: "Customer added successfully!",
    onErrorMessage: "Error adding customer.",
  });

  const updateCustomerMutation = createMutation({
    mutationFn: async ({ id, updatedCustomer }) => {
      if (!id) {
        throw new Error("Customer ID is missing for update!");
      }
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCustomer),
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        console.error("Backend error response:", errorData);
        throw new Error(
          errorData.message || `Failed to update customer: ${res.statusText}`
        );
      }
      return res.json();
    },
    onSuccessMessage: "Customer updated successfully!",
    onErrorMessage: "Error updating customer.",
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId) => {
      console.log("Attempting to delete customer ID:", customerId);
      if (!customerId) {
        throw new Error("Customer ID is missing for deletion!");
      }
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || "Failed to delete customer");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setFeedbackMessage({
        type: "success",
        text: data.message || "Customer deleted successfully!",
      });
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: (err) => {
      console.error("Delete Mutation error:", err);
      setFeedbackMessage({
        type: "error",
        text: err.message || "Error deleting customer.",
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
    router.push("/login");
  };

  const openAddModal = () => {
    setCurrentCustomer(null);
    setFormData({
      name: "",
      amountWillPay: "",
      paidAmount: "",
      referrer: null,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setFormData({
      name: customer.name || "",
      amountWillPay: customer.amountWillPay || "",
      paidAmount: customer.paidAmount || "",
      referrer: customer.referrer?.id || null,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
    setFormData({
      name: "",
      amountWillPay: "",
      paidAmount: "",
      referrer: null,
    });
    setFormErrors({});
  };

  const handleDeleteRequest = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (customerToDelete && customerToDelete.id) {
      deleteCustomerMutation.mutate(customerToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCustomerToDelete(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("Handling form submission with data:", formData);
    try {
      const processedFormData = {
        ...formData,
        amountWillPay:
          formData.amountWillPay === ""
            ? 0
            : parseFloat(formData.amountWillPay),
        paidAmount:
          formData.paidAmount === "" ? 0 : parseFloat(formData.paidAmount),
        referrer: formData.referrer || null,
      };

      const validatedData = customerFormSchema.parse(processedFormData);
      setFormErrors({});

      if (currentCustomer) {
        if (!currentCustomer.id) {
          throw new Error("Customer ID is missing for update!");
        }
        updateCustomerMutation.mutate({
          id: currentCustomer.id,
          updatedCustomer: validatedData,
        });
      } else {
        addCustomerMutation.mutate(validatedData);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log("Zod validation errors:", err.errors);
        const errors = {};
        err.errors.forEach((e) => {
          errors[e.path[0]] = e.message;
        });
        setFormErrors(errors);
      } else {
        console.error("Form submission error:", err);
        setFeedbackMessage({
          type: "error",
          text:
            err.message ||
            "An unexpected error occurred during form submission.",
        });
        setTimeout(() => setFeedbackMessage(null), 5000);
      }
    }
  };

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "rgba(55, 65, 81, 0.7)",
      borderColor: state.isFocused
        ? "#3B82F6"
        : formErrors.referrer
        ? "#EF4444"
        : "#4B5563",
      color: "white",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.7)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3B82F6" : "#4B5563",
      },
      padding: "0.25rem",
      minHeight: "48px",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    input: (provided) => ({
      ...provided,
      color: "white",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#374151",
      borderColor: "#4B5563",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      overflow: "hidden",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3B82F6"
        : state.isFocused
        ? "#4B5563"
        : "#374151",
      color: "white",
      "&:active": {
        backgroundColor: "#2563EB",
      },
      cursor: "pointer",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": {
        color: "#FFFFFF",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": {
        color: "#FFFFFF",
      },
    }),
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-900 text-white min-h-screen">
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-[1000] p-4 rounded-lg shadow-xl flex items-center transition-all duration-300 transform
          ${feedbackMessage.type === "success" ? "bg-green-600" : "bg-red-600"}
          ${
            feedbackMessage
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } `}
        >
          {feedbackMessage.type === "success" ? (
            <FaCheckCircle className="text-white text-xl mr-3" />
          ) : (
            <FaExclamationTriangle className="text-white text-xl mr-3" />
          )}
          <span className="text-white font-medium">{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="ml-4 cursor-pointer text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <TableHeader onAddCustomer={openAddModal} onLogout={handleLogout} />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isFetching={isFetching}
        debouncedSearchTerm={debouncedSearchTerm}
      />

      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error}
        onEdit={openEditModal}
        onDelete={handleDeleteRequest}
        deleteCustomerMutation={deleteCustomerMutation}
      />

      <CustomerModal
        isModalOpen={isModalOpen}
        onRequestClose={closeModal}
        currentCustomer={currentCustomer}
        formData={formData}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onFormSubmit={handleFormSubmit}
        potentialReferrers={potentialReferrers}
        isLoadingReferrers={isLoadingReferrers}
        addCustomerMutation={addCustomerMutation}
        updateCustomerMutation={updateCustomerMutation}
        selectStyles={selectStyles}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fade-in-overlay">
          <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm sm:max-w-md animate-scale-in">
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete customer "
              <span className="font-semibold text-white">
                {customerToDelete?.name}
              </span>
              "? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleteCustomerMutation.isPending}
                className="px-5 py-2 rounded-md cursor-pointer text-gray-200 border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteCustomerMutation.isPending}
                className="px-5 py-2 rounded-md cursor-pointer bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 flex items-center justify-center"
              >
                {deleteCustomerMutation.isPending ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
            <button
              onClick={cancelDelete}
              className="absolute top-3 cursor-pointer right-3 text-gray-400 hover:text-gray-200"
              title="Close"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
