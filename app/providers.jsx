// app/providers.jsx
"use client";

import { useEffect, useState } from "react"; // <--- Import useState
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { SessionProvider } from "next-auth/react";
import Modal from "react-modal";

const queryClient = new QueryClient();

export function Providers({ children }) {
  const [isMounted, setIsMounted] = useState(false); // State to track if component is mounted

  useEffect(() => {
    // This ensures the setAppElement call only happens client-side
    if (typeof window !== "undefined") {
      // Small delay to ensure the DOM is fully ready
      // Or, ideally, check for the element directly
      const rootElement = document.getElementById("__next");
      if (rootElement) {
        Modal.setAppElement(rootElement);
        setIsMounted(true); // Indicate that react-modal is configured
      } else {
        // Fallback or retry logic if __next isn't immediately found
        // This is a common pattern for react-modal in Next.js
        console.warn(
          "react-modal: Root element #__next not found immediately. Retrying..."
        );
        const retry = setTimeout(() => {
          const recheckRoot = document.getElementById("__next");
          if (recheckRoot) {
            Modal.setAppElement(recheckRoot);
            setIsMounted(true);
          } else {
            console.error(
              "react-modal: Root element #__next still not found after retry. Modals may not function correctly."
            );
          }
        }, 100); // Try after 100ms
        return () => clearTimeout(retry); // Cleanup timeout
      }
    }
  }, []); // Empty dependency array ensures it runs only once after initial render

  // Optionally, you could conditionally render children or the app
  // only after react-modal is confirmed to be set, but often not necessary
  // if the rest of your app doesn't rely on it being ready immediately.
  // if (!isMounted) return null; // Or a loading spinner if appropriate

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
      </QueryClientProvider>
    </SessionProvider>
  );
}
