import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const authUsers = pgTable("auth.users", {
  id: uuid("id").primaryKey(),
  email: varchar("email"),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});
