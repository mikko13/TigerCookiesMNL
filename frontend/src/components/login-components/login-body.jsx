import sidepic from '../images/login-sidepic.svg';

export default function body() {
  return (
    <main className="font-[sans-serif]">
      <div className=" mt-1 md:mt-[-70px] min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-6 max-w-6xl w-full">
          <div className="border border-gray-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
            <form className="space-y-4">
              <div className="mb-8">
                <h3 className="text-gray-800 text-3xl font-bold">Sign in</h3>
                <p className="text-gray-500 text-sm mt-4 leading-relaxed">Sign in to your account</p>
              </div>

              <div>
                <label htmlFor="username" className="text-gray-800 text-sm mb-2 block">
                  User name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full text-sm text-gray-800 border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-gray-800 text-sm mb-2 block">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full text-sm text-gray-800 border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-800">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="text-yellow-400 hover:underline font-semibold">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full shadow-xl py-2.5 px-4 text-sm tracking-wide rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
              >
                Sign in
              </button>
            </form>
          </div>

          <div className="max-md:mt-8">
            <img src={sidepic} className="w-5/6 max-md:w-2/3 mx-auto block object-cover" alt="Login" />
          </div>
        </div>
      </div>
    </main>
  );
}
