"use server";

import { db } from "@/db/db";
import { files } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFile() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("User not found");
  }

  await db.insert(files).values({
    ownerId: data.user.id,
    name: "New File",
  });

  revalidatePath("/dashboard");
}

export async function getFiles() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("User not found");
  }

  return await db.select().from(files);
}