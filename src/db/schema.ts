import { pgTable, text, timestamp, uuid, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  websiteUrl: text("website_url"),
  industry: text("industry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  subdomain: text("subdomain").notNull().unique(),
  published: boolean("published").default(false).notNull(),
  generatedHtml: text("generated_html"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  message: text("message"),
  source: text("source"), // web, phone, chat
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  planTier: text("plan_tier").notNull(), // starter, growth, pro
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
  sites: many(sites),
  leads: many(leads),
  subscriptions: many(subscriptions),
}));

export const sitesRelations = relations(sites, ({ one }) => ({
  business: one(businesses, {
    fields: [sites.businessId],
    references: [businesses.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  business: one(businesses, {
    fields: [leads.businessId],
    references: [businesses.id],
  }),
}));

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  sessionId: text("session_id").notNull(),
  messages: text("messages").notNull().default("[]"), // JSON array of {role, content}
  status: text("status").notNull().default("active"), // active, qualified, abandoned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  type: text("type").notNull(), // email, sms
  recipient: text("recipient").notNull(),
  status: text("status").notNull(), // sent, failed
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  business: one(businesses, {
    fields: [subscriptions.businessId],
    references: [businesses.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  business: one(businesses, {
    fields: [notifications.businessId],
    references: [businesses.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  business: one(businesses, {
    fields: [conversations.businessId],
    references: [businesses.id],
  }),
}));
