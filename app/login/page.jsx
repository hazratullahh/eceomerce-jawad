"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaArrowRight,
  FaExclamationCircle,
} from "react-icons/fa";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    try {
      loginSchema.parse({ email, password });

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        let errorMessage = "An unexpected error occurred during login.";
        if (result.error === "CredentialsSignin") {
          errorMessage =
            "Invalid email or password. Please check your credentials.";
        } else if (result.error === "OAuthAccountNotLinked") {
          errorMessage =
            "This email is registered with another sign-in method.";
        } else if (result.error === "MissingCredentials") {
          errorMessage = "Please enter both email and password.";
        } else {
          errorMessage = result.error;
        }
        toast.error(errorMessage);
        console.error("NextAuth Login Error:", result.error);
      } else {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = {};
        err.errors.forEach((e) => {
          errors[e.path[0]] = e.message;
        });
        setFormErrors(errors);
        toast.error("Please correct the errors in the form.");
        console.warn("Client-side validation errors:", errors);
      } else {
        toast.error(
          "Failed to connect to the server. Please check your internet connection or try again later."
        );
        console.error("Unexpected Error during login:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-black p-4 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-15">
        <div className="absolute top-10 left-20 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-teal-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col p-0 sm:p-10 md:flex-row items-stretch rounded-2xl shadow-xl shadow-blue-950/60 w-full max-w-sm md:max-w-3xl lg:max-w-4xl bg-gray-900/95 border border-blue-700/30 overflow-hidden animate-slide-up backdrop-blur-sm">
        {/* Image Section */}
        <div className="hidden md:flex md:w-2/5 rounded-2xl justify-center items-center p-6 bg-gradient-to-br from-blue-900 to-gray-900 border-r border-blue-700/40 relative overflow-hidden">
          <Image
            src="/login.png"
            alt="Secure Login Illustration"
            width={280}
            height={280}
            className="object-contain rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-500 ease-out hover:scale-110 hover:rotate-2"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-50"></div>
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/90 px-4">
            <h2 className="text-lg font-semibold mb-1 tracking-wide">
              Secure Access
            </h2>
            <p className="text-sm font-light">
              Unlock your personalized experience.
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text leading-tight drop-shadow-md animate-glow">
              Welcome Back
            </h1>
            <p className="text-gray-300 mt-2 text-base font-light">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="group">
              <label
                htmlFor="email"
                className=" text-gray-200 text-xs font-semibold mb-1.5 flex items-center gap-1.5"
              >
                <FaEnvelope className="text-blue-400 group-hover:text-blue-300 transition-colors text-sm" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full py-3 pl-5 pr-5 rounded-xl bg-gray-800/70 text-white border ${
                    formErrors.email
                      ? "border-red-600 ring-red-600/40"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500/40"
                  } focus:ring-2 transition-all duration-300 placeholder-gray-400 text-base shadow-inner-custom hover:bg-gray-800/90 focus:bg-gray-800/90 hover:shadow-md hover:shadow-blue-500/20`}
                  placeholder="e.g., jane.doe@example.com"
                  aria-invalid={formErrors.email ? "true" : "false"}
                  aria-describedby={
                    formErrors.email ? "email-error" : undefined
                  }
                  autoComplete="email"
                  disabled={isLoading}
                />
                {formErrors.email && (
                  <div className="flex items-center mt-1.5 ml-0.5 text-red-400 text-xs animate-fade-in">
                    <FaExclamationCircle className="mr-1 text-[10px]" />
                    <p id="email-error">{formErrors.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label
                htmlFor="password"
                className=" text-gray-200 text-xs font-semibold mb-1.5 flex items-center gap-1.5"
              >
                <FaLock className="text-blue-400 group-hover:text-blue-300 transition-colors text-sm" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full py-3 pl-5 pr-12 rounded-xl bg-gray-800/70 text-white border ${
                    formErrors.password
                      ? "border-red-600 ring-red-600/40"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500/40"
                  } focus:ring-2 transition-all duration-300 placeholder-gray-400 text-base shadow-inner-custom hover:bg-gray-800/90 focus:bg-gray-800/90 hover:shadow-md hover:shadow-blue-500/20`}
                  placeholder="••••••••"
                  aria-invalid={formErrors.password ? "true" : "false"}
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200 text-base"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {formErrors.password && (
                  <div className="flex items-center mt-1.5 ml-0.5 text-red-400 text-xs animate-fade-in">
                    <FaExclamationCircle className="mr-1 text-[10px]" />
                    <p id="password-error">{formErrors.password}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                className="group cursor-pointer relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/50 hover:shadow-xl hover:shadow-blue-700/60 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 focus:ring-offset-gray-900 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none text-base overflow-hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 text-lg" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1 text-lg" />
                  </>
                )}
                {!isLoading && (
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
