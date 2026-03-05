import {
  LayoutDashboard,
  PhoneOff,
  Users,
  Car,
  Bot,
  LogOut,
  Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
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
import type { ViewId } from "@/lib/types";

type NavItem = {
  id: ViewId;
  label: string;
  icon: typeof LayoutDashboard;
  url: string;
};

const pegasusItem: NavItem = {
  id: "pegasus",
  label: "Pegasus",
  icon: Bot,
  url: "/pegasus",
};

const operationsItems: NavItem[] = [
  { id: "sites", label: "Tonight's Board", icon: LayoutDashboard, url: "/" },
  { id: "callouts", label: "Call-Outs", icon: PhoneOff, url: "/callouts" },
  { id: "pool", label: "Guard Pool", icon: Users, url: "/guards" },
  { id: "rovers", label: "Rovers", icon: Car, url: "/rovers" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const collapsed = state === "collapsed";

  const displayName = user?.email?.split("@")[0] ?? "Manager";
  const initial = displayName[0]?.toUpperCase() ?? "M";

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
            <p className="text-sm font-semibold text-foreground">
              Dittmar Company
            </p>
            <p className="text-xs text-muted-foreground">
              24 sites · Arlington, VA
            </p>
          </div>
        )}

        {/* Pegasus section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Pegasus
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={pegasusItem.url}
                    end
                    className="relative text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                    activeClassName="bg-purple-500/15 text-purple-300 font-medium"
                  >
                    <pegasusItem.icon className="h-4 w-4" />
                    {!collapsed && (
                      <span className="flex items-center gap-2">
                        {pegasusItem.label}
                        <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-purple-400">
                          AI
                        </span>
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
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
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {initial}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
