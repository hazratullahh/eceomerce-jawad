"use client";

import React, { useState } from "react";
import {
  FaTimes,
  FaSpinner,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Modal from "react-modal";

export default function UserFormModal({
  isOpen,
  onClose,
  currentUser,
  formData,
  formErrors,
  handleFormChange,
  handleFormSubmit,
  addUserMutation,
  updateUserMutation,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={currentUser ? "Edit User" : "Add New User"}
      className="modal-content relative bg-gray-800 p-8 rounded-2xl shadow-3xl w-[85vw] md:w-[40vw] max-w-full mx-auto my-12 border border-gray-700 overflow-y-auto"
      overlayClassName="modal-overlay fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]"
    >
      <button
        onClick={onClose}
        className="absolute top-4 cursor-pointer right-4 text-gray-400 hover:text-white bg-gray-700/60 hover:bg-gray-600/80 rounded-full p-2 transition-all duration-200 text-lg flex items-center justify-center border border-gray-600"
        title="Close"
      >
        <FaTimes />
      </button>
      <h2 className="text-3xl font-bold text-blue-400 mb-8 text-center border-b border-gray-700 pb-4">
        {currentUser ? "Edit User" : "Add New User"}
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-gray-200 text-sm font-semibold mb-2"
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            className={`w-full py-3 px-4 rounded-lg bg-gray-700/70 text-white border ${
              formErrors.name ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-all duration-200 placeholder-gray-400`}
            placeholder="Enter user's full name"
            aria-invalid={formErrors.name ? "true" : "false"}
            aria-describedby={formErrors.name ? "name-error" : undefined}
          />
          {formErrors.name && (
            <p id="name-error" className="text-red-400 text-sm mt-1">
              {formErrors.name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-gray-200 text-sm font-semibold mb-2"
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            className={`w-full py-3 px-4 rounded-lg bg-gray-700/70 text-white border ${
              formErrors.email ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-all duration-200 placeholder-gray-400`}
            placeholder="user@example.com"
            aria-invalid={formErrors.email ? "true" : "false"}
            aria-describedby={formErrors.email ? "email-error" : undefined}
            autoComplete="off"
          />
          {formErrors.email && (
            <p id="email-error" className="text-red-400 text-sm mt-1">
              {formErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="text-gray-200 text-sm font-semibold mb-2 flex items-center"
          >
            Password:
            {currentUser && (
              <span className="ml-2 text-gray-400 text-xs flex items-center">
                <FaInfoCircle className="mr-1" /> Leave blank to keep current
                password
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              className={`w-full py-3 px-4 rounded-lg bg-gray-700/70 text-white border ${
                formErrors.password ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-all duration-200 placeholder-gray-400`}
              placeholder={
                currentUser
                  ? "Leave blank or enter new password"
                  : "Enter a password"
              }
              required={!currentUser}
              aria-invalid={formErrors.password ? "true" : "false"}
              aria-describedby={
                currentUser
                  ? "password-info"
                  : formErrors.password
                  ? "password-error"
                  : undefined
              }
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.password && (
            <p id="password-error" className="text-red-400 text-sm mt-1">
              {formErrors.password}
            </p>
          )}
          {currentUser && !formErrors.password && (
            <p id="password-info" className="text-gray-400 text-xs mt-1">
              Only fill this if you want to change the password.
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-gray-200 text-sm font-semibold mb-2"
          >
            Role:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleFormChange}
            className={`w-full py-3 px-4 rounded-lg bg-gray-700/70 text-white border ${
              formErrors.role ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-all duration-200`}
            aria-invalid={formErrors.role ? "true" : "false"}
            aria-describedby={formErrors.role ? "role-error" : undefined}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          {formErrors.role && (
            <p id="role-error" className="text-red-400 text-sm mt-1">
              {formErrors.role}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 cursor-pointer hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            disabled={addUserMutation.isPending || updateUserMutation.isPending}
          >
            {addUserMutation.isPending || updateUserMutation.isPending ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : currentUser ? (
              "Update User"
            ) : (
              "Add User"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
