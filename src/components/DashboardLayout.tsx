import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";
import { Clock } from "lucide-react";

const VIEW_TITLES: Record<string, string> = {
  "/": "Sites",
  "/callouts": "Call-Outs",
  "/simulation": "Live Sim",
  "/guards": "Guard Pool",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  managerName: string;
}

export function DashboardLayout({ children, managerName }: DashboardLayoutProps) {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const title = VIEW_TITLES[location.pathname] || "Dashboard";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar managerName={managerName} />
        <div className="flex flex-1 flex-col">
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-semibold text-foreground">{title}</h1>
                <p className="text-[11px] text-muted-foreground">
                  Dittmar Company ·{" "}
                  {time.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-xs text-foreground">
                {time.toLocaleTimeString("en-US", { hour12: false })}
              </span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
