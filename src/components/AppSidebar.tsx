import { Home, Upload, LayoutDashboard, MessageSquare, Users, LogOut, User, Briefcase, CreditCard, Sparkles, CalendarDays, Building2, Search, FileText, ClipboardList } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const candidateNavItems = [
  { title: "Home", url: "/", icon: Home, authRequired: false },
  { title: "Job Board", url: "/jobs", icon: Search, authRequired: false },
  { title: "My Applications", url: "/applications", icon: ClipboardList, authRequired: true },
  { title: "Upload Resume", url: "/upload", icon: Upload, authRequired: true },
  { title: "My Dashboard", url: "/dashboard", icon: LayoutDashboard, authRequired: true },
  { title: "AI Coach", url: "/chatbot", icon: MessageSquare, authRequired: false },
];

const hiringNavItems = [
  { title: "Home", url: "/", icon: Home, authRequired: false },
  { title: "Company Dashboard", url: "/hiring/overview", icon: Building2, authRequired: true },
  { title: "My Jobs", url: "/hiring/jobs", icon: Briefcase, authRequired: true },
  { title: "AI Coach", url: "/chatbot", icon: MessageSquare, authRequired: false },
];

const commonNavItems = [
  { title: "Pricing", url: "/pricing", icon: CreditCard, authRequired: false },
  { title: "Users", url: "/users", icon: Users, authRequired: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [userMode, setUserMode] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setAvatarUrl(null);
        setUserMode(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, user_mode")
      .eq("id", userId)
      .single();
    
    if (data) {
      setAvatarUrl(data.avatar_url);
      setUserMode(data.user_mode);
    }
  };

  const navItems = userMode === "hiring" ? hiringNavItems : candidateNavItems;

  // Wire realtime notifications
  useRealtimeNotifications(user?.id, userMode);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvatarUrl(null);
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.authRequired && !user) {
      e.preventDefault();
      navigate("/auth");
      toast({
        title: "Sign in required",
        description: "Please sign in to access this feature.",
      });
    }
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">AI</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-foreground">ResumeAI</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            {userMode === "hiring" ? "Hiring Mode" : "Job Seeker"}
            {userMode && !isCollapsed && (
              <Badge variant="secondary" className="text-xs">
                {userMode === "hiring" ? "HR" : "Candidate"}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
              const isActive = location.pathname === item.url || 
                  (item.url === "/hiring/jobs" && location.pathname.startsWith("/hiring")) ||
                  (item.url === "/hiring/overview" && location.pathname === "/hiring/overview");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        onClick={(e) => handleNavClick(item, e)}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonNavItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        onClick={(e) => handleNavClick(item, e)}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {user && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Switch Mode"
                  >
                    <Link to="/mode-selection" className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4" />
                      <span>Switch Mode</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {user ? (
          <div className="space-y-3">
            <Link
              to="/profile"
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors ${
                location.pathname === "/profile" ? "bg-muted" : ""
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">View profile</p>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        ) : (
          <Button
            asChild
            variant="default"
            size={isCollapsed ? "icon" : "sm"}
            className="w-full gradient-primary"
          >
            <Link to="/auth">
              {isCollapsed ? (
                <User className="h-4 w-4" />
              ) : (
                <>Sign In</>
              )}
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
