import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  integer, 
  timestamp, 
  boolean 
} from "drizzle-orm/pg-core";

// =====================
// USERS
// =====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  password: text("password").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }).unique(),
  idNumber: varchar("id_number", { length: 50 }),
  idType: varchar("id_type", { length: 50 }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// =====================
// APPS
// =====================
export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

// Tipos TypeScript
export type App = typeof apps.$inferSelect;
export type NewApp = typeof apps.$inferInsert;

// =====================
// APP ROLES
// (relación entre User y App)
// =====================
export const appRoles = pgTable("app_roles", {
  id: serial("id").primaryKey(),
  idUser: integer("id_user").notNull().references(() => users.id),
  idApp: integer("id_app").notNull().references(() => apps.id),
  role: varchar("role", { length: 50 }).notNull(),
});

// Tipos TypeScript
export type AppRole = typeof appRoles.$inferSelect;
export type NewAppRole = typeof appRoles.$inferInsert;

// =====================
// CREATE USER ATTEMPT
// =====================
export const createUserAttempt = pgTable("create_user_attempt", {
  id: serial("id").primaryKey(),
  ip: varchar("ip", { length: 50 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tipos TypeScript
export type CreateUserAttempt = typeof createUserAttempt.$inferSelect;
export type NewCreateUserAttempt = typeof createUserAttempt.$inferInsert;

// =====================
// PHONE VERIFICATION
// =====================
export const phoneVerification = pgTable("phone_verification", {
  ipId: integer("ip_id").primaryKey().references(() => createUserAttempt.id),
  code: varchar("code", { length: 10 }).notNull(),
  validUntil: timestamp("valid_until").notNull(),
  verified: boolean("verified").default(false),
  codesSentCount: integer("codes_sent_count").default(0),
  lastCodeSent: timestamp("last_code_sent"),
});

// Tipos TypeScript
export type PhoneVerification = typeof phoneVerification.$inferSelect;
export type NewPhoneVerification = typeof phoneVerification.$inferInsert;


// =====================
// PHONE VERIFICATION UPDATE
// =====================
export const phoneVerificationUpdate = pgTable("phone_verification_update", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id), // relación 1:1 con User

  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  validUntil: timestamp("valid_until").notNull(),
  verified: boolean("verified").default(false),
  codesSentCount: integer("codes_sent_count").default(0),
  lastCodeSent: timestamp("last_code_sent"),
});

// Tipos TypeScript
export type PhoneVerificationUpdate = typeof phoneVerificationUpdate.$inferSelect;
export type NewPhoneVerificationUpdate = typeof phoneVerificationUpdate.$inferInsert;

// =====================
// EMAIL VERIFICATION
// =====================
export const emailVerification = pgTable("email_verification", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id), // relación 1:1 con User

  code: varchar("code", { length: 10 }).notNull(),
  validUntil: timestamp("valid_until").notNull(),
  verified: boolean("verified").default(false),
  codesSentCount: integer("codes_sent_count").default(0),
  lastCodeSent: timestamp("last_code_sent"),
});

// Tipos TypeScript
export type EmailVerification = typeof emailVerification.$inferSelect;
export type NewEmailVerification = typeof emailVerification.$inferInsert;


// ===========================
// EMAIL VERIFICATION UPDATE
// ===========================
export const emailVerificationUpdate = pgTable("email_verification_update", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id), // relación 1:1 con User

  email: varchar("email", { length: 255 }).notNull(), // nuevo correo en actualización
  code: varchar("code", { length: 10 }).notNull(),
  validUntil: timestamp("valid_until").notNull(),
  verified: boolean("verified").default(false),
  codesSentCount: integer("codes_sent_count").default(0),
  lastCodeSent: timestamp("last_code_sent"),
});

// Tipos TypeScript
export type EmailVerificationUpdate = typeof emailVerificationUpdate.$inferSelect;
export type NewEmailVerificationUpdate = typeof emailVerificationUpdate.$inferInsert;