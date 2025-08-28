import { useState } from "react";
import axios from "axios";

export const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImages = async (files) => {
    setIsUploading(true);
    setError(null);
    try {
      const uploadPromises = files.map(async (file) => {
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });

        const base64File = await toBase64(file);
        const response = await axios.post("/api/upload-image", {
          file: base64File,
        });

        return response.data;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setIsUploading(false);
      return uploadedImages;
    } catch (err) {
      console.error("Image upload failed:", err);
      setError(
        err.response?.data?.message || "Image upload failed. Please try again."
      );
      setIsUploading(false);
      return null;
    }
  };

  return { uploadImages, isUploading, error };
};
