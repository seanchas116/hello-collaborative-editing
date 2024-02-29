import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { db } from "@/db/db";
import { File, files, permissions } from "@/db/schema";
import { desc, eq, inArray, or } from "drizzle-orm";
import { getSubscriptionForUser } from "@/usecases/stripe-subscriptions/get";
import { SideBar } from "./SideBar";
import { toDetailedUser } from "@/types/DetailedUser";

async function getFiles(user: User): Promise<File[]> {
  return await db
    .select()
    .from(files)
    .where(
      or(
        eq(files.ownerId, user.id),
        inArray(
          files.id,
          db
            .select({ fileId: permissions.fileId })
            .from(permissions)
            .where(eq(permissions.userId, user.id))
        )
      )
    )
    .orderBy(desc(files.createdAt));
}

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/");
  }

  const [files, subscription] = await Promise.all([
    getFiles(user),
    getSubscriptionForUser(user.id),
  ]);

  return (
    <main className="flex">
      <SideBar
        user={toDetailedUser(user)}
        isPremium={subscription?.status === "active"}
        seatCount={subscription?.quantity ?? 0}
        files={files}
      />
      <div className="flex-1">{children}</div>
    </main>
  );
}
