"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import { z } from "zod";
import TableHeader from "@/app/components/user/TableHeader";
import SearchBar from "@/app/components/user/SearchBar";
import UserTable from "@/app/components/user/UserTable";
import UserFormModal from "@/app/components/user/UserFormModal";
import DeleteConfirmationModal from "@/app/components/user/DeleteConfirmationModal";
import FeedbackMessage from "@/app/components/user/FeedbackMessage";

// Zod schemas for client-side validation
const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")), // Allows empty string for password on edit
  role: z.enum(["USER", "ADMIN"], { message: "Invalid role selected" }),
});

// Set app element for react-modal
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("__next") || document.body);
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: users,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        throw new Error(
          errorData.message || `Failed to fetch users: ${res.statusText}`
        );
      }
      return res.json();
    },
  });

  const createMutation = ({ mutationFn, onSuccessMessage, onErrorMessage }) =>
    useMutation({
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setIsModalOpen(false);
        setCurrentUser(null);
        setFormData({ name: "", email: "", password: "", role: "USER" });
        setFormErrors({});
        setFeedbackMessage({ type: "success", text: onSuccessMessage });
        setTimeout(() => setFeedbackMessage(null), 3000);
      },
      onError: (err) => {
        console.error("Mutation error:", err);
        setFeedbackMessage({
          type: "error",
          text: err.message || onErrorMessage,
        });
        setTimeout(() => setFeedbackMessage(null), 5000);
      },
    });

  const addUserMutation = createMutation({
    mutationFn: async (newUser) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add user");
      }
      return res.json();
    },
    onSuccessMessage: "User added successfully!",
    onErrorMessage: "Error adding user.",
  });

  const updateUserMutation = createMutation({
    mutationFn: async ({ id, updatedUser }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccessMessage: "User updated successfully!",
    onErrorMessage: "Error updating user.",
  });

  const deleteUserMutation = createMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      return null;
    },
    onSuccessMessage: "User deleted successfully!",
    onErrorMessage: "Error deleting user.",
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
    router.push("/login");
  };

  const openAddModal = () => {
    setCurrentUser(null);
    setFormData({ name: "", email: "", password: "", role: "USER" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setFormData({ name: "", email: "", password: "", role: "USER" });
    setFormErrors({});
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
    try {
      const validatedData = userFormSchema.parse(formData);
      setFormErrors({});
      if (currentUser) {
        const updatePayload = {
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
        };
        if (validatedData.password)
          updatePayload.password = validatedData.password;
        updateUserMutation.mutate({
          id: currentUser._id,
          updatedUser: updatePayload,
        });
      } else {
        addUserMutation.mutate(validatedData);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = {};
        err.errors.forEach((e) => (errors[e.path[0]] = e.message));
        setFormErrors(errors);
      } else {
        console.error("Form submission error:", err);
        setFeedbackMessage({
          type: "error",
          text: "An unexpected error occurred during form submission.",
        });
        setTimeout(() => setFeedbackMessage(null), 5000);
      }
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-900 text-white min-h-screen">
      <FeedbackMessage
        feedbackMessage={feedbackMessage}
        setFeedbackMessage={setFeedbackMessage}
      />
      <TableHeader onAddUser={openAddModal} onLogout={handleLogout} />
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isFetching={isFetching}
        debouncedSearchTerm={debouncedSearchTerm}
      />
      <UserTable
        users={users}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        deleteUserMutation={deleteUserMutation}
      />
      <UserFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentUser={currentUser}
        formData={formData}
        formErrors={formErrors}
        handleFormChange={handleFormChange}
        handleFormSubmit={handleFormSubmit}
        addUserMutation={addUserMutation}
        updateUserMutation={updateUserMutation}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.name || ""}
      />
    </div>
  );
}
