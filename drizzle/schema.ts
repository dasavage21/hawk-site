import { pgTable, foreignKey, uuid, text, timestamp, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const leads = pgTable("leads", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	name: text().notNull(),
	email: text(),
	phone: text(),
	message: text(),
	source: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "leads_business_id_businesses_id_fk"
		}),
]);

export const businesses = pgTable("businesses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	phone: text(),
	address: text(),
	websiteUrl: text("website_url"),
	industry: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "businesses_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	name: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const sites = pgTable("sites", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	subdomain: text().notNull(),
	published: boolean().default(false).notNull(),
	generatedHtml: text("generated_html"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "sites_business_id_businesses_id_fk"
		}),
	unique("sites_subdomain_unique").on(table.subdomain),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	stripeSubscriptionId: text("stripe_subscription_id").notNull(),
	planTier: text("plan_tier").notNull(),
	status: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "subscriptions_business_id_businesses_id_fk"
		}),
]);
