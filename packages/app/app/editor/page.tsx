import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { db } from "@/db/db";
import { File, files } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { EditorApp } from "./EditorApp";
import { getSubscriptionForUser } from "@/usecases/stripe-subscriptions/get";

async function getFiles(user: User): Promise<File[]> {
  return await db
    .select()
    .from(files)
    .where(eq(files.ownerId, user.id))
    .orderBy(desc(files.createdAt));
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
  const subscription = await getSubscriptionForUser(data.user.id);

  return (
    <EditorApp
      user={data.user}
      fileID={searchParams.file}
      isPremium={subscription?.status === "active"}
      seatCount={subscription?.quantity || 0}
      files={files}
    />
  );
}
