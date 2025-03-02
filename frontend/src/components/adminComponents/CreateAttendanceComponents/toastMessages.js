export const errorToast = (
  <div className="toast error">
    <div
      className="bg-red-500 text-white font-semibold tracking-wide flex items-center w-max max-w-sm p-4 rounded-md shadow-md"
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-[18px] shrink-0 fill-white inline mr-3"
        viewBox="0 0 32 32"
      >
        <path
          d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm6.36 20L21 22.36l-5-4.95-4.95 4.95L9.64 21l4.95-5-4.95-4.95 1.41-1.41L16 14.59l5-4.95 1.41 1.41-5 4.95z"
          data-original="#ea2d3f"
        />
      </svg>
      <span className="block sm:inline text-sm mr-3">
        Error Creating Attendance
      </span>
    </div>
  </div>
);

export const successToast = (
  <div className="toast success">
    <div
      className="bg-green-500 text-white font-semibold tracking-wide flex items-center w-max max-w-sm p-4 rounded-md shadow-md"
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-[18px] shrink-0 fill-white inline mr-3"
        viewBox="0 0 512 512"
      >
        <ellipse
          cx="256"
          cy="256"
          fill="#fff"
          data-original="#fff"
          rx="256"
          ry="255.832"
        />
        <path
          className="fill-green-500"
          d="m235.472 392.08-121.04-94.296 34.416-44.168 74.328 57.904 122.672-177.016 46.032 31.888z"
          data-original="#ffffff"
        />
      </svg>
      <span className="block sm:inline text-sm mr-3">Attendance Record Created Successfully!</span>
    </div>
  </div>
);
