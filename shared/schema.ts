import { pgTable, text, serial, integer, boolean, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Office address schema
export const officeAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Education schema
export const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  graduationYear: z.string(),
});

// Certification schema
export const certificationSchema = z.object({
  name: z.string(),
  organization: z.string(),
  year: z.string().optional(),
});

// Office hours schema
export const officeHoursSchema = z.record(z.string());

// Provider table schema
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  specialty: text("specialty").notNull(),
  profileImage: text("profile_image"),
  facilityName: text("facility_name").notNull(),
  distance: real("distance"),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  nextAvailable: text("next_available"),
  insurances: text("insurances").array(),
  isInNetwork: boolean("is_in_network").default(true),
  hasVirtualVisits: boolean("has_virtual_visits").default(false),
  languages: text("languages").array(),
  about: text("about").notNull(),
  education: json("education").notNull(), // array of education objects
  certifications: json("certifications").notNull(), // array of certification objects
  officeAddress: json("office_address").notNull(), // address object
  officePhone: text("office_phone").notNull(),
  officeHours: json("office_hours").notNull(), // object with day keys and hour strings
  acceptingNewPatients: boolean("accepting_new_patients").default(true),
  isSpanishSpeaking: boolean("is_spanish_speaking").default(false),
});

// Specialty table schema
export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Insurance plan table schema
export const insurancePlans = pgTable("insurance_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Create insert schemas
export const insertProviderSchema = createInsertSchema(providers, {
  insurances: z.array(z.string()),
  languages: z.array(z.string()),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  officeAddress: officeAddressSchema,
  officeHours: officeHoursSchema,
}).omit({ id: true });

export const insertSpecialtySchema = createInsertSchema(specialties).omit({ id: true });
export const insertInsurancePlanSchema = createInsertSchema(insurancePlans).omit({ id: true });

// Create types
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;

export type InsurancePlan = typeof insurancePlans.$inferSelect;
export type InsertInsurancePlan = z.infer<typeof insertInsurancePlanSchema>;

// Filter schema for provider search
export const providerFilterSchema = z.object({
  searchQuery: z.string().optional(),
  specialty: z.string().optional(),
  zipCode: z.string().optional(),
  radius: z.string().optional(),
  insurance: z.string().optional(),
  availability: z.object({
    today: z.boolean().default(false),
    thisWeek: z.boolean().default(false),
    weekends: z.boolean().default(false),
  }).optional(),
  additional: z.object({
    acceptingNewPatients: z.boolean().default(false),
    virtualVisits: z.boolean().default(false),
    spanishSpeaking: z.boolean().default(false),
  }).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sort: z.enum(["relevance", "distance", "availability", "rating"]).default("relevance"),
});

export type ProviderFilter = z.infer<typeof providerFilterSchema>;
