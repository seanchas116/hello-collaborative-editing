"use server";

import { db } from "@/db/db";
import { files } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

export async function createFile() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("User not found");
  }

  const [file] = await db
    .insert(files)
    .values({
      ownerId: data.user.id,
      name: "New File",
    })
    .returning();

  revalidatePath("/editor");
  redirect(`/editor?file=${file.id}`);
}

export async function generateCollaborativeAuthToken(fileID: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("User not found");
  }

  const secret = process.env.CF_WORKER_JWT_SECRET;
  if (!secret) {
    throw new Error("No secret found");
  }

  // check if the user has access to the file
  const [file] = await db.select().from(files).where(eq(files.id, fileID));
  if (!file || file.ownerId !== data.user.id) {
    throw new Error("User does not have access to the file");
  }

  const token = jwt.sign(
    {
      // 1 min
      exp: Math.floor(Date.now() / 1000) + 60,
      file_id: fileID,
    },
    secret
  );

  return token;
}
