import { z } from 'zod'

export const ServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .multipleOf(5, 'Duration must be a multiple of 5'),
  price: z
    .number()
    .int()
    .min(0, 'Price cannot be negative')
    .max(10_000_000, 'Price is too high'),
  color: z
    .enum(['blue', 'green', 'orange', 'purple', 'pink', 'red', 'yellow', 'gray'])
    .optional()
    .or(z.literal('')),
  categoryId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  bufferBeforeMinutes: z
    .number()
    .int()
    .min(0)
    .multipleOf(5, 'Buffer must be a multiple of 5')
    .default(0),
  bufferAfterMinutes: z
    .number()
    .int()
    .min(0)
    .multipleOf(5, 'Buffer must be a multiple of 5')
    .default(0),
})

export type ServiceFormData = z.infer<typeof ServiceSchema>

export const UpdateServiceOrderSchema = z.array(z.string().uuid())

export const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  color: z
    .enum(['blue', 'green', 'orange', 'purple', 'pink', 'red', 'yellow', 'gray'])
    .optional()
    .or(z.literal('')),
})

export type CategoryFormData = z.infer<typeof CategorySchema>

export const UpdateCategoryOrderSchema = z.array(z.string().uuid())
