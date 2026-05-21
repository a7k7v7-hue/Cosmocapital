import { z } from "zod";

export const objectsQuerySchema = z.object({
  type: z.enum(["RENT", "SALE"]).optional(),
  category: z
    .enum(["OFFICE", "RETAIL", "WAREHOUSE", "FREE_PURPOSE", "PRODUCTION"])
    .optional(),
  metro: z.string().optional(),
  areaMin: z.coerce.number().positive().optional(),
  areaMax: z.coerce.number().positive().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const createLeadSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое").max(100),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, "Некорректный номер телефона"),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  objectId: z.string().uuid().optional(),
  source: z.string().default("site"),
});

export type ObjectsQuery = z.infer<typeof objectsQuerySchema>;
export type CreateLead = z.infer<typeof createLeadSchema>;
