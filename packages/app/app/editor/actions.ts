"use server";

import { db } from "@/db/db";
import { files } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

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

export async function generateCollaborativeAuthToken() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("User not found");
  }

  const secret = process.env.CF_WORKER_JWT_SECRET;
  if (!secret) {
    throw new Error("No secret found");
  }

  const token = jwt.sign(
    {
      sub: data.user.id,
      // 1 hour
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    secret
  );

  return token;
}
