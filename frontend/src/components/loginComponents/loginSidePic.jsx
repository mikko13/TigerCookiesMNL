import React from "react";
import sidepic from "../images/login-sidepic.svg";

export default function LoginSidePic() {
  return (
    <div className="max-md:mt-8 hidden md:flex">
      <img
        src={sidepic}
        className="w-5/6 max-md:w-2/3 mx-auto block object-cover"
        alt="Login"
      />
    </div>
  );
}
