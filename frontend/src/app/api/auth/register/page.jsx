"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    // profilePhoto: null,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0] ,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      try {
        // Make an API call to submit the form data
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Redirect to the success page
          router.push("/auth/success");
        } else {
          console.error("Registration failed");
        }
      } catch (error) {
        console.log("esme erro ")
        console.error("Error:", error);
      }
    } else {
      setErrors(errors);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = "Username is required";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    if (!formData.profilePhoto) {
      errors.profilePhoto = "Profile photo is required";
    }
    return errors;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:px-0">
        <h1 className="text-3xl text-blue-600 px-10 md:text-5xl font-bold text-center underline ">
          Welcome to the ZConnect chat application
        </h1>
      </div>
      <div className="flex-1 flex justify-center items-center px-4 py-8 md:px-0">
        <div className="bg-white p-8 rounded-lg shadow-md w-full md:w-3/4 lg:w-1/2">
          <h1 className="text-3xl font-bold mb-6 text-blue-600">ZConnect</h1>
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
              {errors.email && (
                <p className="text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-gray-700 font-bold mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="border border-gray-400 p-2 w-full rounded-md"
              />
              {errors.username && (
                <p className="text-red-500">{errors.username}</p>
              )}
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
              {errors.password && (
                <p className="text-red-500">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="profilePhoto"
                className="block text-gray-700 font-bold mb-2"
              >
                Profile Image
              </label>
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                onChange={handleChange}
                className="border border-gray-400 p-2 w-full rounded-md"
              />
              {errors.profilePhoto && (
                <p className="text-red-500">{errors.profilePhoto}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-gray-700">
            Have an account?{" "}
            <a href="/api/auth/login" className="text-blue-600 hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}