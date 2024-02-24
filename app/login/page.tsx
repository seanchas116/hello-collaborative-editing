import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="text-center flex flex-col items-center justify-center w-screen h-screen">
      <h1 className="text-xl font-bold mb-4">Sign In / Sign Up</h1>
      <form className="flex flex-col">
        <div className="flex flex-col mb-4">
          <label htmlFor="email">Email</label>
          <input
            className="px-4 py-2 border border-gray-200 rounded-lg mb-2"
            id="email"
            name="email"
            type="email"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            className="px-4 py-2 border border-gray-200 rounded-lg mb-2"
            id="password"
            name="password"
            type="password"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            formAction={login}
          >
            Log in
          </button>
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            formAction={signup}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
