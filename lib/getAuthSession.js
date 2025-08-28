// lib/getAuthSession.js
import { getServerSession } from "next-auth";
import { authOptions } from "./auth"; // Ensure this path correctly points to your lib/auth.js

export async function getAuthSession() {
  // In the App Router's route.js context, getServerSession automatically
  // infers the request context without needing to pass req/res explicitly.
  return getServerSession(authOptions);
}
