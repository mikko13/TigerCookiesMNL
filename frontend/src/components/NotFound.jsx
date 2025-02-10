import React from "react";
import { Link } from "react-router-dom";
import PageNotFound from "./images/PageNotFound.svg"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <img
        src={PageNotFound}
        alt="Page Not Found"
        className="w-2/2 md:w-1/4 mb-6"
        />
      
      <h1 className="text-2xl md:text-4xl font-bold text-red-500">404 - Page Not Found</h1>
      <p className="mt-2 text-gray-600 text-sm md:text-base">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      
      <Link
        to="/"
        className="mt-4 px-6 py-2 text-sm md:text-base bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
      >
        Go Back
      </Link>
    </div>
  );
}
