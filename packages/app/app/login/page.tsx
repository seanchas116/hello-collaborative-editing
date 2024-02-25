import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <div className="w-60 h-80 flex-col gap-12 flex">
        <div className="text-gray-900 text-2xl font-bold text-center">
          Welcome
        </div>
        <form className="flex-col gap-12 flex">
          <div className="flex-col gap-6 flex">
            <div className="flex-col gap-2 flex">
              <label htmlFor="email" className="text-gray-500 text-sm">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="px-4 h-10 bg-gray-50 rounded-2xl border border-gray-100"
              />
            </div>
            <div className="flex-col gap-2 flex">
              <label htmlFor="password" className="text-gray-500 text-sm">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="px-4 h-10 bg-gray-50 rounded-2xl border border-gray-100"
              />
            </div>
          </div>
          <div className="self-stretch gap-4 flex">
            <button
              formAction={login}
              className="h-10 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold text-white flex-1"
            >
              Sign In
            </button>
            <button
              formAction={signup}
              className="h-10 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold text-white flex-1"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
