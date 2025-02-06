import React from "react";
import FpOtpHeader from "./fpOtp_header";
import FpOtpBody from "./fpOtp_body";

export default function ForgotPasswordOtp() {
  return (
    <div className="flex flex-col min-h-screen">
      <FpOtpHeader />

        <FpOtpBody />

    </div>
  );
}
