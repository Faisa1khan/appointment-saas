export type Service = {
  id: string
  organizationId: string
  name: string
  description?: string | null
  durationMinutes: number
  price: number
  currency: string
  color?: string | null
  categoryId?: string | null
  isActive: boolean
  displayOrder: number
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
