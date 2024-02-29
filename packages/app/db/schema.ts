import {
  customType,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "./supabase-schema";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { customJsonb } from "./custom-jsonb";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  ownerId: uuid("ownerId").references(() => authUsers.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const filesRelations = relations(files, ({ many, one }) => ({
  permissions: many(permissions),
  owner: one(authUsers, {
    fields: [files.ownerId],
    references: [authUsers.id],
  }),
}));

export const permissions = pgTable(
  "permissions",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => authUsers.id, {
        onDelete: "cascade",
      }),
    fileId: uuid("fileId")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.fileId] }),
    };
  }
);

export const permissionsRelations = relations(permissions, ({ one }) => ({
  file: one(files, {
    fields: [permissions.fileId],
    references: [files.id],
  }),
  user: one(authUsers, {
    fields: [permissions.userId],
    references: [authUsers.id],
  }),
}));

export const stripeCustomers = pgTable("stripe_customers", {
  userId: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  customerId: text("customerId").notNull(),
});

export const stripeSubscriptionStatus = pgEnum("stripe_subscription_status", [
  "trialing",
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
  "paused",
]);

export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: text("id").primaryKey(),
  userId: uuid("userId")
    .references(() => authUsers.id)
    .notNull(),
  status: stripeSubscriptionStatus("status").notNull(),
  priceId: text("priceId").notNull(),
  quantity: integer("quantity").notNull().default(1),
  metadata: customJsonb("metadata").notNull(),
  data: customJsonb("data").notNull(),
});

export type File = InferSelectModel<typeof files>;
export type Permission = InferSelectModel<typeof permissions>;
export type StripeCustomer = InferSelectModel<typeof stripeCustomers>;
export type StripeSubscription = InferSelectModel<typeof stripeSubscriptions>;
export type StripeSubscriptionInsert = InferInsertModel<
  typeof stripeSubscriptions
>;
