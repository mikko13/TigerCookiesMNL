import React from "react";
import LoginHeader from "./login-header";
import LoginBody from "./login-body";
import LoginFooter from "./login-footer";

export default function loginPage() {
  return (
    <div>
      <LoginHeader />
      <LoginBody />
      <LoginFooter />
    </div>
  );
}