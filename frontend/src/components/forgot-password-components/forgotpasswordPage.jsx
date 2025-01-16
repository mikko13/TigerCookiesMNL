import React from "react";
import FPHeader from "./fpHeader";
import FPBody from "./fpBody";
import FPFooter from "./fpFooter";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <FPHeader />

      <div className="flex-grow mt-40">
        <FPBody />
      </div>

      <FPFooter />
    </div>
  );
}
