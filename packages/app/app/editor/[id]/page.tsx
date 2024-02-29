import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db/db";
import { files } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { EditorWrap } from "./EditorWrap";
import { toDetailedUser } from "@/types/DetailedUser";
import { ExtendedFile } from "./EditorState";

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

  const file = await db.query.files.findFirst({
    where: and(eq(files.ownerId, data.user.id), eq(files.id, id)),
    with: {
      permissions: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!file) {
    redirect("/editor");
  }

  return (
    <EditorWrap
      user={toDetailedUser(data.user)}
      fileInfo={file as any as ExtendedFile}
    />
  );
}
