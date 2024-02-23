import {
  pgSchema,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email"),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});
