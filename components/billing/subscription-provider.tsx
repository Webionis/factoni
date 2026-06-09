"use client";

import { createContext, useContext } from "react";

import type { SubscriptionAccess } from "@/lib/billing/types";
import type { FeatureKey } from "@/lib/billing/types";

const SubscriptionContext = createContext<SubscriptionAccess | null>(null);

interface SubscriptionProviderProps {
  access: SubscriptionAccess;
  children: React.ReactNode;
}

export function SubscriptionProvider({
  access,
  children,
}: SubscriptionProviderProps) {
  return (
    <SubscriptionContext.Provider value={access}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionAccess(): SubscriptionAccess {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscriptionAccess doit être utilisé dans SubscriptionProvider");
  }
  return ctx;
}

export function useHasFeature(feature: FeatureKey): boolean {
  const access = useSubscriptionAccess();
  return access.features[feature];
}
