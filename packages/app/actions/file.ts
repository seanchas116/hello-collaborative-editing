"use server";

import { db } from "@/db/db";
import { File, files, permissions } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { User } from "@supabase/supabase-js";
import { authUsers } from "@/db/supabase-schema";
import { canAccess } from "@/models/entities/file";

async function authenticateUser(): Promise<User> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("User not found");
  }

  return data.user;
}

export async function createFile() {
  const user = await authenticateUser();

  const [file] = await db
    .insert(files)
    .values({
      ownerId: user.id,
      name: "New File",
    })
    .returning();

  revalidatePath("/editor");
  redirect(`/editor/${file.id}`);
}

export async function updateFile(
  fileID: string,
  values: { name: string }
): Promise<File> {
  const user = await authenticateUser();

  const results = await db
    .update(files)
    .set(values)
    .where(and(eq(files.ownerId, user.id), eq(files.id, fileID)))
    .returning();

  revalidatePath("/editor", "layout");

  return results[0];
}

export async function generateCollaborativeAuthToken(fileID: string) {
  const user = await authenticateUser();

  const secret = process.env.COLLABORATIVE_EDITING_JWT_SECRET;
  if (!secret) {
    throw new Error("No secret found");
  }

  const file = await db.query.files.findFirst({
    where: eq(files.id, fileID),
    with: {
      permissions: true,
    },
  });
  if (!file) {
    throw new Error("File not found");
  }

  if (!canAccess(file, user)) {
    throw new Error("File not found");
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

export async function inviteUser(fileID: string, email: string): Promise<void> {
  const user = await authenticateUser();

  // check if the user has access to the file
  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.ownerId, user.id), eq(files.id, fileID)));

  if (!file) {
    throw new Error("User does not have access to the file");
  }

  const invitedUser = (
    await db.select().from(authUsers).where(eq(authUsers.email, email))
  ).at(0);

  if (!invitedUser) {
    throw new Error("User not found");
  }

  await db
    .insert(permissions)
    .values({
      fileId: fileID,
      userId: invitedUser.id,
    })
    .onConflictDoNothing();

  revalidatePath("/editor", "layout");
}

export async function removeInvitedUser(
  fileID: string,
  userID: string
): Promise<void> {
  const user = await authenticateUser();

  // check if the user has access to the file
  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.ownerId, user.id), eq(files.id, fileID)));

  if (!file) {
    throw new Error("User does not have access to the file");
  }

  await db
    .delete(permissions)
    .where(and(eq(permissions.fileId, fileID), eq(permissions.userId, userID)));

  revalidatePath("/editor", "layout");
}
