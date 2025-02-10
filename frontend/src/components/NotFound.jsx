import React from "react";
import { Link } from "react-router-dom";
import PageNotFound from "./images/PageNotFound.svg";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-[#FFF8E1]">
      <img
        src={PageNotFound}
        alt="Page Not Found"
        className="w-2/2 md:w-1/4 mb-6"
      />

      <h1 className="text-3xl md:text-5xl font-bold text-yellow-500">
        404 - Page Not Found 🍪
      </h1>
      
      <p className="mt-2 text-gray-700 text-sm md:text-base">
        Oops! Looks like this page crumbled like a cookie. <br />
        Maybe it got dunked in some milk? 🥛
      </p>

    </div>
  );
}
