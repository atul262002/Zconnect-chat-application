"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token; // Assuming the server returns a 'token' property
        // const username=data.loggedinUser 
        console.log(token)
        if (token) {
          localStorage.setItem('token', token.token);
          
          
         const  value = localStorage.getItem("token") ;
         console.log("value",value);

          // Login successful, perform any necessary actions
          console.log("Login successful");
  
          // Redirect to the desired page after login
          router.push(`/`);
        } else {
          setError("Invalid response from the server");
        }
      } else {
        const error = await response.json();
        setError(error.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred during login");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="md:w-1/2 flex justify-center items-center px-4 py-8 md:px-0">
        <div className="bg-white p-8 rounded-lg shadow-md w-full md:w-3/4 lg:w-1/2">
          <h1 className="text-3xl font-bold mb-6 text-blue-600">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-400 p-2 w-full rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-bold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="border border-gray-400 p-2 w-full rounded-md"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Login
            </button>
          </form>
          <div className="mt-4 flex flex-col md:flex-row justify-between">
            <Link
              href="/auth/forgetpass"
              className="text-blue-600 hover:underline mb-2 md:mb-0"
            >
              Forget Password?
            </Link>
            <p className="text-gray-700">
              Don't have an account?{" "}
              <Link
                href="/api/auth/register"
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="md:w-1/2 flex items-center justify-center ">
        <Image
          src="/login-image.png"
          alt="Login Photo"
          width={500}
          height={500}
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}