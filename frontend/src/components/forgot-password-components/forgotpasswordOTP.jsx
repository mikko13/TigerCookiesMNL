import React from "react";
import FpOtpHeader from "./fpotp_header";
import FpOtpBody from "./fpotp_body";
import FpOtpFooter from "./fpotp_footer";

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
