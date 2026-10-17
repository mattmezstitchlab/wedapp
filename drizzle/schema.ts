import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const weddingEvents = mysqlTable("wedding_events", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  location: varchar("location", { length: 240 }),
  budgetCents: int("budgetCents").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const eventMembers = mysqlTable("event_members", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["couple", "planner", "vendor"]).default("couple").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const moments = mysqlTable("moments", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  timeLabel: varchar("timeLabel", { length: 20 }).notNull(),
  subtitle: varchar("subtitle", { length: 180 }),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["À rechercher", "À contacter", "Devis demandé", "Option", "Réservé", "Payé"]).default("À rechercher").notNull(),
  priceCents: int("priceCents").default(0).notNull(),
  availability: varchar("availability", { length: 240 }),
  contactName: varchar("contactName", { length: 160 }),
  contactPhone: varchar("contactPhone", { length: 40 }),
  notes: text("notes"),
  photoUrl: text("photoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description"),
  priceCents: int("priceCents").default(0).notNull(),
  sharedPackageKey: varchar("sharedPackageKey", { length: 120 }),
});

export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  momentId: int("momentId").notNull(),
  vendorId: int("vendorId").notNull(),
  serviceId: int("serviceId"),
  responsibility: varchar("responsibility", { length: 240 }),
  startTime: varchar("startTime", { length: 20 }),
  endTime: varchar("endTime", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const needs = mysqlTable("needs", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  isReady: int("isReady").default(0).notNull(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  detail: text("detail"),
  dueLabel: varchar("dueLabel", { length: 80 }),
  category: varchar("category", { length: 80 }),
  done: int("done").default(0).notNull(),
  urgent: int("urgent").default(0).notNull(),
});

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  vendorId: int("vendorId").notNull(),
  amountCents: int("amountCents").default(0).notNull(),
  status: varchar("status", { length: 80 }),
  documentId: int("documentId"),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  vendorId: int("vendorId").notNull(),
  amountCents: int("amountCents").default(0).notNull(),
  kind: mysqlEnum("kind", ["deposit", "balance", "other"]).default("deposit").notNull(),
  paidAt: timestamp("paidAt"),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  vendorId: int("vendorId"),
  name: varchar("name", { length: 240 }).notNull(),
  storageKey: text("storageKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  actorId: int("actorId"),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  payload: text("payload"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const workspaceSnapshots = mysqlTable("workspace_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().unique(),
  payload: text("payload").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
