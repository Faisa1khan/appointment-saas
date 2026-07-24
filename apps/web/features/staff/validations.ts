import { z } from 'zod'

export const StaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  color: z.enum(['blue', 'green', 'orange', 'purple', 'pink', 'red', 'yellow', 'gray']).optional().nullable(),
  avatarUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal('')),
})

export type StaffFormData = z.infer<typeof StaffSchema>

export const UpdateStaffOrderSchema = z.array(z.string().uuid())
