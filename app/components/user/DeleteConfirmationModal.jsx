import { FaTimes } from "react-icons/fa";
import Modal from "react-modal";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Confirm Delete User"
      className="modal-content relative bg-gray-800 p-6 rounded-2xl shadow-3xl w-[30vw] max-w-full mx-auto my-12 border border-gray-700 overflow-y-auto"
      overlayClassName="modal-overlay fixed inset-0 flex items-center justify-center bg-black/50 z-[10000]"
    >
      <button
        onClick={onClose}
        className="absolute top-4 cursor-pointer  right-4 text-gray-400 hover:text-white bg-gray-700/60 hover:bg-gray-600/80 rounded-full p-2 transition-all duration-200 text-lg flex items-center justify-center border border-gray-600"
        title="Close"
      >
        <FaTimes />
      </button>
      <h2 className="text-2xl font-bold text-red-400 mb-6 text-center border-b border-gray-700 pb-3">
        Confirm Deletion
      </h2>
      <p className="text-gray-300 text-center mb-6">
        Are you sure you want to delete {userName}? This action cannot be
        undone.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onClose}
          className="bg-gray-600 cursor-pointer  hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 transform hover:scale-105"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 cursor-pointer  hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
