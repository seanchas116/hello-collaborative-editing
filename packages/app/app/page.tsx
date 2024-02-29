import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SignInButton } from "./SignInButton";
import { toDetailedUser } from "@/models/entities/detailed-user";

async function LaunchButton() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return user ? (
    <Link
      href="/editor"
      className="p-3 pr-6 bg-blue-500 hover:bg-blue-600 rounded-3xl gap-2.5 flex text-white text-base font-semibold"
    >
      <img
        src={toDetailedUser(user).picture}
        className="w-6 h-6 rounded-full"
      />
      Launch Editor
    </Link>
  ) : (
    <SignInButton className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-3xl gap-2.5 flex text-white text-base font-semibold" />
  );
}

export default function Home() {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="flex-col items-center gap-16 flex">
        <div className="flex-col items-center gap-12 flex">
          <div className="text-center text-gray-900 text-5xl font-bold leading-[4rem]">
            Collaborative
            <br />
            Note Taking App Example
          </div>
          <div className="items-center gap-3 flex text-base font-medium text-gray-600">
            <div>Next.js</div>
            <div className="w-2 h-2 bg-gray-200 rounded" />
            <div>Supabase</div>
            <div className="w-2 h-2 bg-gray-200 rounded" />
            <div>Cloudflare Durable Objects</div>
            <div className="w-2 h-2 bg-gray-200 rounded" />
            <div>Y.js</div>
            <div className="w-2 h-2 bg-gray-200 rounded" />
            <div>Tiptap</div>
          </div>
        </div>
        <div className="gap-4 flex">
          <LaunchButton />
          <a
            href="https://github.com/seanchas116/hello-collaborative-editing"
            target="_blank"
            className="px-6 py-3 hover:bg-gray-100 rounded-3xl gap-2.5 flex text-gray-900 text-base font-semibold"
          >
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
