// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css"; // Your global Tailwind CSS
import { Providers } from "./providers"; // Import your providers
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard",
  description: "Manzoorify e-commerce admin dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
