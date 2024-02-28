import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/db";
import { files } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { EditorWrap } from "./EditorWrap";

export default async function EditorPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.ownerId, data.user.id), eq(files.id, id)));

  if (!file) {
    redirect("/editor");
  }

  return <EditorWrap user={data.user} fileInfo={file} />;
}
