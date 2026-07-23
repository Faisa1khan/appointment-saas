import * as React from "react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <span className="bg-primary text-primary-foreground rounded-md p-1">A</span>
          Arrivo
        </Link>
      </div>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
