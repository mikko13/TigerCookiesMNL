import React, { useState, useRef, useEffect } from "react";
import Logo from "../images/logo.png";

export default function LoginHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const adminContacts = [
    { name: "Aaron Bagain", role: "Main Administrator", email: "bags@gmail.com", phone: "+63 912 345 6789" },
    { name: "Kenn Mocorro", role: "Customer Support", email: "kenn@gmail.com", phone: "+63 917 123 4567" },
    { name: "Ralph De Guzman", role: "Technical Support", email: "rk@gmail.com", phone: "+63 918 765 4321" }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="z-50 flex items-center w-full px-4 sm:px-8 min-h-[80px] bg-white tracking-wide sticky top-0 shadow-lg font-[sans-serif] border-b-2 border-yellow-300">
      <div className="relative w-full">
        <div className="max-w-screen-xl w-full mx-auto flex items-center gap-6 md:gap-20">
          <div className="flex items-center">
            <img
              src={Logo}
              alt="TigerCookies MNL"
              className="w-16 md:w-20 transition-all hover:scale-105 duration-300"
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center hidden md:flex">
            <h1 className="text-2xl font-bold text-yellow-600 tracking-wider drop-shadow-sm">
              Welcome to{" "}
              <span className="text-yellow-500">TigerCookies MNL</span>
            </h1>
          </div>
          
          <div className="flex ml-auto z-50">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 flex items-center transition-all text-base rounded-lg px-5 py-2 font-semibold shadow-md hover:shadow-xl duration-300 hover:-translate-y-1"
              >
                Contact Admin
                <svg 
                  className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-50">
                  <div className="py-2">
                    <h3 className="px-4 py-2 bg-yellow-100 text-yellow-800 font-bold">Admin Contacts</h3>
                    
                    {adminContacts.map((admin, index) => (
                      <div key={index} className="px-4 py-3 hover:bg-gray-50 border-b last:border-b-0">
                        <p className="font-semibold text-gray-800">{admin.name}</p>
                        <p className="text-sm text-gray-600">{admin.role}</p>
                        <div className="mt-2 flex flex-col gap-1">
                          <a href={`mailto:${admin.email}`} className="text-sm text-blue-600 hover:underline flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            {admin.email}
                          </a>
                          <a href={`tel:${admin.phone.replace(/\s+/g, '')}`} className="text-sm text-blue-600 hover:underline flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            {admin.phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}