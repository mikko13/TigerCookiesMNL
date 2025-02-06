import React from "react";
import FPHeader from "./fpHeader";
import FPBody from "./fpBody";
import Background from "../images/background.png";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen ">
      <FPHeader />

      <div
        className="font-[sans-serif] min-h-screen"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <FPBody />
      </div>
    </div>
  );
}
