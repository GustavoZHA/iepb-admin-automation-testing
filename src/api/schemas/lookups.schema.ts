import { z } from 'zod';

export const catalogItemSchema = z.object({
  id: z.number(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const catalogListSchema = z.array(catalogItemSchema);
