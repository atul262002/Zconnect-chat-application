"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">
          User successfully registered
        </h1>
        <p className="mb-4 text-gray-700">
          Check your email to verify your account.
        </p>
        <p className="mb-6 text-gray-700">
          You cannot log in to the application until your account is verified.
        </p>
        <Link
          href="/api/auth/login"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          Click here to log in
        </Link>
      </div>
    </div>
  );
}