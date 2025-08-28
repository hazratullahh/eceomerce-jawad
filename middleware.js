import { NextResponse } from "next/server";

export default function middleware(req) {
  const { nextUrl } = req;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  // Log request details
  const origin = req.headers.get("origin") || "unknown";
  console.log(
    `[Middleware] Path: ${nextUrl.pathname}, Method: ${req.method}, Origin: ${origin}`
  );

  // Skip middleware for NextAuth routes
  if (isAuthRoute) {
    console.log("[Middleware] Skipping NextAuth route");
    return NextResponse.next();
  }

  // Handle CORS for other API routes
  if (isApiRoute) {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://manzoorify-ecommerce.vercel.app",
      process.env.NEXTAUTH_URL, // Include NEXTAUTH_URL dynamically
    ].filter(Boolean);
    const allowedOrigin = allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0];

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    console.log(
      `[Middleware] CORS headers set: Access-Control-Allow-Origin=${allowedOrigin}`
    );

    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      console.log("[Middleware] Handling OPTIONS request");
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }

    return response;
  }

  // Allow non-API routes to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
