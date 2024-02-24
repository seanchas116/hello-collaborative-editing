import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createFile } from "./actions";
import { User } from "@supabase/supabase-js";
import { db } from "@/db/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getFiles(user: User) {
  return await db.select().from(files).where(eq(files.ownerId, user.id));
}

export default async function DashboardPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  const files = await getFiles(data.user);

  return (
    <div>
      <h1>Dashboard</h1>
      <form action={createFile}>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Create File
        </button>
      </form>
      <ul>
        {files.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}
