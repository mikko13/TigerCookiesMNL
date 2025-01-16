import React from "react";
import FpOtpHeader from "./fpOtp_header";
import FpOtpBody from "./fpOtp_body";
import FpOtpFooter from "./fpOtp_footer";

export default function ForgotPasswordOtp() {
  return (
    <div className="flex flex-col min-h-screen">
      <FpOtpHeader />

      <div className="flex-grow mt-40">
        <FpOtpBody />
      </div>

      <FpOtpFooter />
    </div>
  );
}
