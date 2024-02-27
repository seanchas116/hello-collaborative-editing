import {
  customType,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "./supabase-schema";
import { InferSelectModel } from "drizzle-orm";

// https://github.com/drizzle-team/drizzle-orm/issues/1511#issuecomment-1824687669
const customJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "jsonb";
    },
    // @ts-ignore
    toDriver(value: TData) {
      return value;
    },
  })(name);

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
  metadata: customJsonb("metadata").notNull(),
  data: customJsonb("data").notNull(),
});

export type File = InferSelectModel<typeof files>;
export type Permission = InferSelectModel<typeof permissions>;
export type PermissionType = (typeof permissionTypeEnum.enumValues)[number];
export type StripeCustomer = InferSelectModel<typeof stripeCustomers>;
export type StripeSubscription = InferSelectModel<typeof stripeSubscriptions>;
