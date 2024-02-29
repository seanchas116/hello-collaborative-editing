import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/db";
import { files } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { EditorWrap } from "./editor-wrap";
import { toDetailedUser } from "@/models/entities/detailed-user";
import { ExtendedFile } from "./editor-state";
import { canAccess } from "@/models/entities/file";

export default async function EditorPage({
  params: { id: fileID },
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  const file = await db.query.files.findFirst({
    where: eq(files.id, fileID),
    with: {
      permissions: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
  if (!file || !canAccess(file, data.user)) {
    redirect("/editor");
  }

  return (
    <EditorWrap
      user={toDetailedUser(data.user)}
      fileInfo={file as ExtendedFile}
    />
  );
}
