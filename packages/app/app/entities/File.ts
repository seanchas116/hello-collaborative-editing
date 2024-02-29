import { File, Permission } from "@/db/schema";
import { User } from "@supabase/supabase-js";

export function canAccess(
  file: File & { permissions: Permission[] },
  user: User
) {
  return (
    file.ownerId === user.id ||
    file.permissions.some((permission) => permission.userId === user.id)
  );
}
