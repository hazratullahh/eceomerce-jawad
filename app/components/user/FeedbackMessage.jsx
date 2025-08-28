import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function FeedbackMessage({
  feedbackMessage,
  setFeedbackMessage,
}) {
  if (!feedbackMessage) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-[1000] p-4 rounded-lg shadow-xl flex items-center transition-all duration-300 transform
      ${feedbackMessage.type === "success" ? "bg-green-600" : "bg-red-600"}
      ${
        feedbackMessage
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      {feedbackMessage.type === "success" ? (
        <FaCheckCircle className="text-white text-xl mr-3" />
      ) : (
        <FaExclamationTriangle className="text-white text-xl mr-3" />
      )}
      <span className="text-white font-medium">{feedbackMessage.text}</span>
      <button
        onClick={() => setFeedbackMessage(null)}
        className="ml-4 cursor-pointer  text-white hover:text-gray-200"
      >
        <FaTimes />
      </button>
    </div>
  );
}
