import React from "react";
import FpConfHeader from "./fpConf_header";
import FpConfBody from "./fpConf_body";
import FpConfFooter from "./fpConf_footer";

export default function ForgotPasswordConfirm() {
  return (
    <div className="flex flex-col min-h-screen">
      <FpConfHeader />

      <div className="flex-grow mt-40">
        <FpConfBody />
      </div>

      <FpConfFooter />
    </div>
  );
}
