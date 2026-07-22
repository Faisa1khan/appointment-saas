"use client";

import "../sentry.client.config";
import React from "react";

export function SentryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
