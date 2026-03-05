import { Building2, PhoneOff, Zap, Users, Settings, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { CALLOUTS } from "@/lib/data";
import type { ViewId } from "@/lib/types";

const navItems: { id: ViewId; label: string; icon: typeof Building2; url: string }[] = [
  { id: "sites", label: "Sites", icon: Building2, url: "/" },
  { id: "callouts", label: "Call-Outs", icon: PhoneOff, url: "/callouts" },
  { id: "cascade", label: "Live Sim", icon: Zap, url: "/simulation" },
  { id: "pool", label: "Guard Pool", icon: Users, url: "/guards" },
];

interface AppSidebarProps {
  managerName: string;
}

export function AppSidebar({ managerName }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const unresolvedCount = CALLOUTS.filter((c) => !c.resolved).length;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-foreground">IronWatch</p>
              <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
                Rapid Response
              </p>
            </div>
          )}
        </div>

        {/* Client info */}
        {!collapsed && (
          <div className="mx-4 mb-4 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Client
            </p>
            <p className="text-sm font-semibold text-foreground">Dittmar Company</p>
            <p className="text-xs text-muted-foreground">24 sites · Arlington, VA</p>
          </div>
        )}

        {/* Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="relative text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                      {item.id === "callouts" && unresolvedCount > 0 && (
                        <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                          {unresolvedCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        )}
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {managerName[0]}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{managerName}</p>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
