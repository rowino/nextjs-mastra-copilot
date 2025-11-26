import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import type { ColumnDef, WidgetConfig, AutomationConfig } from "./types";

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    twoFactorEnabled: integer("twoFactorEnabled", { mode: "boolean" }),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull()
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }),
	updatedAt: integer("updatedAt", { mode: "timestamp" })
});

export const twoFactor = sqliteTable("twoFactor", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull().references(() => user.id),
	secret: text("secret"),
	backupCodes: text("backupCodes"),
});

export const passkey = sqliteTable("passkey", {
	id: text("id").primaryKey(),
	name: text("name"),
	publicKey: text("publicKey").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	credentialID: text("credentialID").notNull(),
	counter: integer("counter").notNull(),
	deviceType: text("deviceType").notNull(),
	backedUp: integer("backedUp", { mode: "boolean" }).notNull(),
	transports: text("transports"),
	aaguid: text("aaguid"),
	createdAt: integer("createdAt", { mode: "timestamp" }),
});

export const organization = sqliteTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	metadata: text("metadata"),
});

export const member = sqliteTable("member", {
	id: text("id").primaryKey(),
	organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	role: text("role").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const dataset = sqliteTable("dataset", {
	id: text("id").primaryKey(),
	orgId: text("orgId").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	tableName: text("tableName").notNull(),
	schema: text("schema", { mode: "json" }).$type<ColumnDef[]>().notNull(),
	sampleData: text("sampleData", { mode: "json" }),
	createdById: text("createdById").notNull().references(() => user.id),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("dataset_org_id_idx").on(table.orgId),
]);

export const dashboard = sqliteTable("dashboard", {
	id: text("id").primaryKey(),
	orgId: text("orgId").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	createdById: text("createdById").notNull().references(() => user.id),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("dashboard_org_id_idx").on(table.orgId),
]);

export const widget = sqliteTable("widget", {
	id: text("id").primaryKey(),
	dashboardId: text("dashboardId").notNull().references(() => dashboard.id, { onDelete: "cascade" }),
	orgId: text("orgId").notNull(),
	datasetId: text("datasetId").references(() => dataset.id),
	title: text("title").notNull(),
	type: text("type", { enum: ["chart", "metric", "table"] }).notNull(),
	config: text("config", { mode: "json" }).$type<WidgetConfig>().notNull(),
	position: integer("position").notNull(),
	createdById: text("createdById").notNull().references(() => user.id),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("widget_dashboard_id_idx").on(table.dashboardId),
	index("widget_org_id_idx").on(table.orgId),
]);

export const automation = sqliteTable("automation", {
	id: text("id").primaryKey(),
	orgId: text("orgId").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	type: text("type", { enum: ["threshold_alert", "scheduled_report"] }).notNull(),
	config: text("config", { mode: "json" }).$type<AutomationConfig>().notNull(),
	enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
	createdById: text("createdById").notNull().references(() => user.id),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("automation_org_id_idx").on(table.orgId),
]);

export const automationRun = sqliteTable("automationRun", {
	id: text("id").primaryKey(),
	automationId: text("automationId").notNull().references(() => automation.id, { onDelete: "cascade" }),
	orgId: text("orgId").notNull(),
	status: text("status", { enum: ["success", "failed", "pending"] }).notNull(),
	result: text("result", { mode: "json" }),
	error: text("error"),
	executedAt: integer("executedAt", { mode: "timestamp" }).notNull(),
});
