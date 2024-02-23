import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { authUsers } from "./supabase-schema";

export const files = pgTable("files", {
  id: uuid("id").primaryKey(),
  name: varchar("name"),
  ownerId: uuid("ownerId").references(() => authUsers.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const permissionTypeEnum = pgEnum("permission_type", ["read", "write"]);

export const permissions = pgTable("permissions", {
  userId: uuid("userId").references(() => authUsers.id, {
    onDelete: "cascade",
  }),
  fileId: uuid("fileId").references(() => files.id, { onDelete: "cascade" }),
  type: permissionTypeEnum("type"),
});
