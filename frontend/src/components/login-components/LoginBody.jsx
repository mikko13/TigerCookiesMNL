import React from "react";
import LoginForm from "./LoginForm";
import LoginSidePic from "./LoginSidePic";
import Background from "../images/background.png";

export default function LoginBody() {
  return (
    <main
      className="font-[sans-serif]"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mt-1 md:mt-[-70px] min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-6 max-w-6xl w-full">
          <LoginForm />
          <LoginSidePic />
        </div>
      </div>
    </main>
  );
}
