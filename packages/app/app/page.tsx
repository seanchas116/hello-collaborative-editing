import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="flex-col items-center gap-16 flex">
        <div className="flex-col items-center gap-12 flex">
          <div className="text-center text-gray-900 text-5xl font-medium leading-[4rem]">
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
          <Link
            href="/login"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-3xl gap-2.5 flex text-white text-base font-medium"
          >
            Launch App
          </Link>
          <a
            href="https://github.com/seanchas116/hello-collaborative-editing"
            target="_blank"
            className="px-6 py-3 rounded-3xl gap-2.5 flex text-gray-900 text-base font-medium"
          >
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}