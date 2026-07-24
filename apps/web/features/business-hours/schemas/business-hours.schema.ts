import { z } from 'zod'

export const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/

export const dayBusinessHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isClosed: z.boolean(),
  openTime: z.string().regex(timeRegex, "Invalid time format").nullable().optional(),
  closeTime: z.string().regex(timeRegex, "Invalid time format").nullable().optional(),
}).superRefine((data, ctx) => {
  if (!data.isClosed) {
    if (!data.openTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Opening time is required when open",
        path: ['openTime']
      })
    }
    if (!data.closeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Closing time is required when open",
        path: ['closeTime']
      })
    }
    if (data.openTime && data.closeTime) {
      if (data.closeTime <= data.openTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Closing time must be after opening time",
          path: ['closeTime']
        })
      }
    }
  }
})

export const updateBusinessHoursSchema = z.object({
  hours: z.array(dayBusinessHourSchema)
    .length(7, "Must provide exactly 7 days of the week")
    .refine((hours) => {
      const days = new Set(hours.map(h => h.dayOfWeek))
      return days.size === 7
    }, "Must provide exactly one entry for each day of the week"),
})

export type UpdateBusinessHoursInput = z.infer<typeof updateBusinessHoursSchema>
export type DayBusinessHourInput = z.infer<typeof dayBusinessHourSchema>
