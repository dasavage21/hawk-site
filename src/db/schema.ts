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

export const keywordRankings = pgTable("keyword_rankings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  keyword: text("keyword").notNull(),
  position: integer("position"),
  previousPosition: integer("previous_position"),
  searchVolume: integer("search_volume"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const adCampaigns = pgTable("ad_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  platform: text("platform").notNull(), // google, facebook, etc.
  name: text("name").notNull(),
  budget: integer("budget").notNull(), // in cents
  status: text("status").notNull().default("active"), // active, paused, ended
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adVariations = pgTable("ad_variations", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => adCampaigns.id).notNull(),
  copy: text("copy").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adPerformance = pgTable("ad_performance", {
  id: uuid("id").primaryKey().defaultRandom(),
  variationId: uuid("variation_id").references(() => adVariations.id).notNull(),
  date: timestamp("date").notNull(),
  clicks: integer("clicks").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  spend: integer("spend").notNull().default(0), // in cents
});

export const lsaProfiles = pgTable("lsa_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  licenseNumber: text("license_number"),
  insuranceCarrier: text("insurance_carrier"),
  insurancePolicyNumber: text("insurance_policy_number"),
  status: text("status").notNull().default("not_started"), // not_started, pending_verification, active, suspended
  googleLsaId: text("google_lsa_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  adCampaigns: many(adCampaigns),
  keywordRankings: many(keywordRankings),
  lsaProfile: one(lsaProfiles),
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

export const keywordRankingsRelations = relations(keywordRankings, ({ one }) => ({
  business: one(businesses, {
    fields: [keywordRankings.businessId],
    references: [businesses.id],
  }),
}));

export const adCampaignsRelations = relations(adCampaigns, ({ one, many }) => ({
  business: one(businesses, {
    fields: [adCampaigns.businessId],
    references: [businesses.id],
  }),
  variations: many(adVariations),
}));

export const adVariationsRelations = relations(adVariations, ({ one, many }) => ({
  campaign: one(adCampaigns, {
    fields: [adVariations.campaignId],
    references: [adCampaigns.id],
  }),
  performance: many(adPerformance),
}));

export const adPerformanceRelations = relations(adPerformance, ({ one }) => ({
  variation: one(adVariations, {
    fields: [adPerformance.variationId],
    references: [adVariations.id],
  }),
}));

export const lsaProfilesRelations = relations(lsaProfiles, ({ one }) => ({
  business: one(businesses, {
    fields: [lsaProfiles.businessId],
    references: [businesses.id],
  }),
}));
