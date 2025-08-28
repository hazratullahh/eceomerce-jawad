"use client";

import Modal from "react-modal";
import Select from "react-select";
import { FaTimes, FaSpinner } from "react-icons/fa";

export default function CustomerModal({
  isModalOpen,
  onRequestClose,
  currentCustomer,
  formData,
  formErrors,
  onFormChange,
  onFormSubmit,
  potentialReferrers,
  isLoadingReferrers,
  addCustomerMutation,
  updateCustomerMutation,
  selectStyles,
}) {
  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={onRequestClose}
      contentLabel={currentCustomer ? "Edit Customer" : "Add New Customer"}
      className="modal-content relative bg-gray-800 p-8 rounded-2xl shadow-3xl w-[85vw] md:w-[60vw] max-w-full mx-auto my-12 border border-gray-700 backdrop-blur-md overflow-y-auto"
      overlayClassName="modal-overlay fixed inset-0 flex items-center justify-center bg-black/90 z-[9999]"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-4 cursor-pointer right-4 text-gray-400 hover:text-white bg-gray-700/60 hover:bg-gray-600/80 rounded-full p-2 transition-all duration-200 text-lg flex items-center justify-center border border-gray-600"
        title="Close"
      >
        <FaTimes />
      </button>
      <h2 className="text-3xl font-bold text-blue-400 mb-8 text-center border-b border-gray-700 pb-4">
        {currentCustomer ? "Edit Customer" : "Add New Customer"}
      </h2>
      <form
        onSubmit={(e) => {
          onFormSubmit(e);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              onChange={onFormChange}
              className={`w-full py-3 px-4 rounded-lg bg-gray-700/70 text-white border ${
                formErrors.name ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-all duration-200 placeholder-gray-400`}
              placeholder="Enter customer's full name"
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
              htmlFor="referrer"
              className="block text-gray-200 text-sm font-semibold mb-2"
            >
              Referrer:
            </label>
            <Select
              id="referrer"
              name="referrer"
              options={potentialReferrers || []}
              value={
                potentialReferrers?.find(
                  (option) => option.value === formData.referrer
                ) || null
              }
              onChange={(selectedOption) => {
                onFormChange({
                  target: {
                    name: "referrer",
                    value: selectedOption ? selectedOption.value : null,
                  },
                });
              }}
              isLoading={isLoadingReferrers}
              isClearable
              isSearchable
              placeholder="Select a referrer (optional)"
              styles={selectStyles}
              isDisabled={
                currentCustomer && formData.referrer === currentCustomer.id
              }
            />
            {formErrors.referrer && (
              <p id="referrer-error" className="text-red-400 text-sm mt-1">
                {formErrors.referrer}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="amountWillPay"
              className="block text-gray-200 text-sm font-semibold mb-2"
            >
              Amount Will Pay:
            </label>
            <input
              type="number"
              id="amountWillPay"
              name="amountWillPay"
              value={formData.amountWillPay}
              onChange={onFormChange}
              className={`w-full py-3 px-4 rounded-lg bg-gray-700/70 text-white border ${
                formErrors.amountWillPay ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-all duration-200 placeholder-gray-400`}
              placeholder="e.g., 700.00"
              step="0.01"
              // min="700"
              aria-invalid={formErrors.amountWillPay ? "true" : "false"}
              aria-describedby={
                formErrors.amountWillPay ? "amountWillPay-error" : undefined
              }
            />
            {formErrors.amountWillPay && (
              <p id="amountWillPay-error" className="text-red-400 text-sm mt-1">
                {formErrors.amountWillPay}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="paidAmount"
              className="block text-gray-200 text-sm font-semibold mb-2"
            >
              Paid Amount:
            </label>
            <input
              type="number"
              id="paidAmount"
              name="paidAmount"
              value={formData.paidAmount}
              onChange={onFormChange}
              className={`w-full py-3 px-4 rounded-lg bg-gray-700/70 text-white border ${
                formErrors.paidAmount ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-all duration-200 placeholder-gray-400`}
              placeholder="e.g., 700.00"
              step="0.01"
              // min="700"
              aria-invalid={formErrors.paidAmount ? "true" : "false"}
              aria-describedby={
                formErrors.paidAmount ? "paidAmount-error" : undefined
              }
            />
            {formErrors.paidAmount && (
              <p id="paidAmount-error" className="text-red-400 text-sm mt-1">
                {formErrors.paidAmount}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onRequestClose}
            className="bg-gray-600 cursor-pointer hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            disabled={
              addCustomerMutation.isPending || updateCustomerMutation.isPending
            }
          >
            {addCustomerMutation.isPending ||
            updateCustomerMutation.isPending ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : currentCustomer ? (
              "Update Customer"
            ) : (
              "Add Customer"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
