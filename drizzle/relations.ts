import { relations } from "drizzle-orm/relations";
import { businesses, leads, users, sites, subscriptions } from "./schema";

export const leadsRelations = relations(leads, ({one}) => ({
	business: one(businesses, {
		fields: [leads.businessId],
		references: [businesses.id]
	}),
}));

export const businessesRelations = relations(businesses, ({one, many}) => ({
	leads: many(leads),
	user: one(users, {
		fields: [businesses.userId],
		references: [users.id]
	}),
	sites: many(sites),
	subscriptions: many(subscriptions),
}));

export const usersRelations = relations(users, ({many}) => ({
	businesses: many(businesses),
}));

export const sitesRelations = relations(sites, ({one}) => ({
	business: one(businesses, {
		fields: [sites.businessId],
		references: [businesses.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	business: one(businesses, {
		fields: [subscriptions.businessId],
		references: [businesses.id]
	}),
}));