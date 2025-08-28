// lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import dbConnect from "./dbConnect"; // Adjust path based on your setup
import User from "../models/User"; // Adjust path based on your setup
import bcrypt from "bcryptjs";

// Lazy client promise to avoid connecting during build
const lazyClientPromise = {
  then: (resolve, reject) => {
    dbConnect()
      .then((conn) => resolve(conn.connection.getClient()))
      .catch(reject);
  },
};

// This object holds all your NextAuth.js configuration
export const authOptions = {
  adapter: MongoDBAdapter(lazyClientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect(); // Ensure connection

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await User.findOne({ email: String(credentials.email) });

        if (
          !user ||
          !user.password ||
          !(await bcrypt.compare(String(credentials.password), user.password))
        ) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};
