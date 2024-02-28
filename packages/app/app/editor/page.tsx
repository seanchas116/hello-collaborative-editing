import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { db } from "@/db/db";
import { File, files, stripeSubscriptions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { EditorApp } from "./EditorApp";

async function getFiles(user: User): Promise<File[]> {
  return await db
    .select()
    .from(files)
    .where(eq(files.ownerId, user.id))
    .orderBy(desc(files.createdAt));
}

async function isPremiumUser(user: User): Promise<boolean> {
  const subscriptions = await db
    .select()
    .from(stripeSubscriptions)
    .where(
      and(
        eq(stripeSubscriptions.userId, user.id),
        eq(stripeSubscriptions.status, "active")
      )
    );

  return subscriptions.length > 0;
}

export default async function EditorPage({
  searchParams,
}: {
  searchParams: {
    file?: string;
  };
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  const files = await getFiles(data.user);
  const isPremium = await isPremiumUser(data.user);

  return (
    <EditorApp
      user={data.user}
      fileID={searchParams.file}
      isPremium={isPremium}
      files={files}
    />
  );
}
