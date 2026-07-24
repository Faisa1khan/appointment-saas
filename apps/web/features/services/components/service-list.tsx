"use client"

import { useTranslations } from "next-intl"
import { ServiceRow } from "./service-row"

import { type Service } from "../repository"

interface ServiceListProps {
  services: Service[]
  currency: string
  onEdit: (service: Service) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

export function ServiceList({
  services,
  currency,
  onEdit,
  onArchive,
  onRestore,
  onMoveUp,
  onMoveDown
}: ServiceListProps) {
  const t = useTranslations("services")

  if (services.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md border-dashed text-muted-foreground">
        No services found.
      </div>
    )
  }

  return (
    <div className="border rounded-md divide-y bg-card">
      {services.map((service, index) => (
        <ServiceRow
          key={service.id}
          service={service}
          currency={currency}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          onMoveUp={() => onMoveUp(index)}
          onMoveDown={() => onMoveDown(index)}
          isFirst={index === 0}
          isLast={index === services.length - 1}
        />
      ))}
    </div>
  )
}
