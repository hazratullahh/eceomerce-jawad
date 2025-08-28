"use client";
import { useRouter } from "next/router";

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>Error: {error || "Unknown error occurred"}</p>
      <button onClick={() => router.push("/login")}>Back to Login</button>
    </div>
  );
}
