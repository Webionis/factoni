import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-h-dvh flex-1 flex-col">
        {title ? (
          <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <h1 className="text-lg font-semibold">{title}</h1>
          </header>
        ) : null}
        <main className="flex-1 px-4 py-6 pb-24 md:px-6 md:pb-6">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
