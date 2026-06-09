"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface UnreadNotificationsContextValue {
  unreadCount: number;
  clearUnreadCount: () => void;
  decrementUnreadCount: () => void;
}

const UnreadNotificationsContext =
  createContext<UnreadNotificationsContextValue | null>(null);

interface UnreadNotificationsProviderProps {
  initialCount: number;
  children: React.ReactNode;
}

export function UnreadNotificationsProvider({
  initialCount,
  children,
}: UnreadNotificationsProviderProps) {
  const [unreadCount, setUnreadCount] = useState(initialCount);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((current) => Math.max(0, current - 1));
  }, []);

  const value = useMemo(
    () => ({
      unreadCount,
      clearUnreadCount,
      decrementUnreadCount,
    }),
    [unreadCount, clearUnreadCount, decrementUnreadCount],
  );

  return (
    <UnreadNotificationsContext.Provider value={value}>
      {children}
    </UnreadNotificationsContext.Provider>
  );
}

export function useUnreadNotifications(): UnreadNotificationsContextValue {
  const ctx = useContext(UnreadNotificationsContext);
  if (!ctx) {
    throw new Error(
      "useUnreadNotifications doit être utilisé dans UnreadNotificationsProvider",
    );
  }
  return ctx;
}
