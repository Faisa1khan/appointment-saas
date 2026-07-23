import { z } from 'zod'

export const serviceCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name is too long"),
  color: z.enum(['blue', 'green', 'orange', 'purple', 'pink', 'red', 'yellow', 'gray']).optional().nullable(),
})

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional().nullable(),
  durationMinutes: z.number().int().positive("Duration must be greater than 0"),
  price: z.number().int().min(0, "Price cannot be negative"), // In minor units
  currency: z.string().length(3, "Currency must be 3 letters").default('USD'),
  color: z.enum(['blue', 'green', 'orange', 'purple', 'pink', 'red', 'yellow', 'gray']).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const serviceOrderSchema = z.array(z.object({
  id: z.string().uuid(),
  displayOrder: z.number().int(),
}))
