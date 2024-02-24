import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createFile } from "./actions";
import { User } from "@supabase/supabase-js";
import { db } from "@/db/db";
import { files } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Icon } from "@/components/Icon";
import { compareAsc, format } from "date-fns";
import Tiptap from "@/components/Tiptap";

async function getFiles(user: User) {
  return await db
    .select()
    .from(files)
    .where(eq(files.ownerId, user.id))
    .orderBy(desc(files.createdAt));
}

export default async function DashboardPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  const files = await getFiles(data.user);

  return (
    <main className="flex">
      <nav className="w-[256px] bg-gray-50 h-screen flex flex-col text-sm">
        <div className="bg-gray-100 rounded-full h-10 px-4 flex items-center gap-2 text-gray-400 m-3">
          <Icon icon="material-symbols:search" />
          Filter
        </div>
        <div className="flex-1 min-h-0 overflow-y-scroll">
          <div className="px-3 flex flex-col">
            {files.map((file) => (
              <button
                key={file.id}
                className="flex flex-col items-start text-left gap-2 px-2 py-4 relative"
              >
                <h2 className="font-medium text-gray-900">{file.name}</h2>
                <time className="text-xs text-gray-400">
                  {format(file.createdAt!, "yyyy/MM/dd")}
                </time>
                <div className="absolute left-2 bottom-0 right-2 h-px bg-gray-100" />
              </button>
            ))}
          </div>
        </div>
        <form className="contents" action={createFile}>
          <button className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-full flex items-center gap-2 m-3 mb-0">
            <Icon icon="icon-park-outline:write" />
            Add Note
          </button>
        </form>
        <div className="items-center flex gap-2 p-2 m-3">
          <img
            className="w-8 h-8 rounded-2xl"
            src="https://via.placeholder.com/32x32"
          />
          <div className="text-gray-900 text-sm">Jane Doe</div>
        </div>
      </nav>
      <div className="flex-1 p-16">
        <div className="max-w-4xl mx-auto">
          <Tiptap />
        </div>
      </div>
    </main>
  );
}
