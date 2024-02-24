import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createFile } from "./actions";
import { User } from "@supabase/supabase-js";
import { db } from "@/db/db";
import { File, files } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { App } from "./App";

async function getFiles(user: User): Promise<File[]> {
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

  return <App files={files} createFile={createFile} />;
}
