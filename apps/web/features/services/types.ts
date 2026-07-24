export type Service = {
  id: string
  organizationId: string
  categoryId?: string | null
  name: string
  slug: string
  description?: string | null
  durationMinutes: number
  price: number
  color?: string | null
  displayOrder: number
  isActive: boolean
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  organizationId: string
  name: string
  description?: string | null
  color?: string | null
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}
