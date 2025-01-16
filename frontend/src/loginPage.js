import React from "react";
import LoginHeader from "./components/login-components/login-header";
import LoginBody from "./components/login-components/login-body";
import LoginFooter from "./components/login-components/login-footer";

export default function login() {
  return (
    <div>
      <LoginHeader />
      <LoginBody />
      <LoginFooter />
    </div>
  );
}

