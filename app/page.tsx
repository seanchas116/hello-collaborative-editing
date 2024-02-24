import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col gap-8 text-center items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            Hello Collaborative Editing
          </h1>
          <p>
            Collaborative editor app example using Next.js, Supabase, Cloudflare
            Durable Objects and Yjs.
          </p>
        </div>
        <Link
          className="bg-gray-800 text-white py-2 px-4 rounded"
          href="/login"
        >
          Start Editing
        </Link>
      </div>
    </main>
  );
}
