import { z } from 'zod'

export const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const createClosureSchema = z.object({
  date: z.string().regex(dateRegex, "Invalid date format. Expected YYYY-MM-DD"),
  reason: z.string().max(100, "Reason must be less than 100 characters").nullable().optional(),
})

export type CreateClosureInput = z.infer<typeof createClosureSchema>
