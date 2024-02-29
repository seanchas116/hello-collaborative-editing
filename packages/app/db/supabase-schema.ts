import { relations } from "drizzle-orm";
import { pgSchema, uuid, varchar } from "drizzle-orm/pg-core";
import { files, permissions } from "./schema";
import { customJsonb } from "./custom-jsonb";

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email"),
  user_metadata: customJsonb("raw_user_meta_data"),
});

export const authUsersRelations = relations(authUsers, ({ many }) => ({
  permissions: many(permissions),
  files: many(files),
}));
