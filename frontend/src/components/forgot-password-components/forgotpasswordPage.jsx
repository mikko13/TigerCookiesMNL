import React from "react";
import FPHeader from "./fpheader";
import FPBody from "./fpbody";
import FPFooter from "./fpfooter";

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
