import React from "react";
import { useParams } from "react-router-dom";

export default function ViewPhoto() {
  const { photo } = useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Employee Check-In/Out Photo</h1>
      <img
        src={`/employee-checkin-photos/${photo}`}
        alt="Employee Check-In/Out"
        className="max-w-full max-h-[600px] rounded-md shadow-md border"
      />
    </div>
  );
}
