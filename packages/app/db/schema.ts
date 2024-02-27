import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "./supabase-schema";
import { InferSelectModel } from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
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

export const stripeCustomers = pgTable("stripe_customers", {
  userId: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  customerId: text("customerId"),
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
  userId: uuid("userId").references(() => authUsers.id),
  status: stripeSubscriptionStatus("status"),
  priceId: text("priceId"),
  metadata: jsonb("metadata"),
  data: jsonb("data"),
});

export type File = InferSelectModel<typeof files>;
export type Permission = InferSelectModel<typeof permissions>;
export type PermissionType = (typeof permissionTypeEnum.enumValues)[number];
