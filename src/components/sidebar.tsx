"use client";

import Link from "next/link";
import {
  Home,
  FileText,
  ImageIcon,
  Users,
  Settings,
  PlusCircle,
  BookOpen,
  Briefcase,
  LayoutTemplate,
  User,
  LogOut,
  FolderGit2,
  Tag,
  Building2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function LeftSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [activeOption, setActiveOption] = useState("Dashboard");

  // Define routes accessible to editors
  const editorAllowedRoutes = ["Dashboard", "Blogs", "Services", "Projects"];

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Blogs",
      href: "/dashboard/blogs",
      icon: BookOpen,
    },
    {
      title: "Services",
      href: "/dashboard/services",
      icon: Briefcase,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: FolderGit2,
    },
    {
      title: "Industries",
      href: "/dashboard/industries",
      icon: Building2,
    },
    // Admin-only routes
    ...(user?.userType === "admin"
      ? [
          {
            title: "Tags",
            href: "/dashboard/tags",
            icon: Tag,
          },
          {
            title: "Pages",
            href: "/dashboard/pages",
            icon: FileText,
            disabled: true,
          },
          {
            title: "Media",
            href: "/dashboard/media",
            icon: ImageIcon,
          },
          {
            title: "Editors",
            href: "/dashboard/editors",
            icon: Users,
            disabled: true,
          },
          {
            title: "Templates",
            href: "/dashboard/template",
            icon: LayoutTemplate,
            disabled: true,
          },
          {
            title: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
          },
        ]
      : []),
  ];

  // Function to determine active option based on current pathname
  const getActiveOptionFromPath = (path: string) => {
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/dashboard/blogs")) return "Blogs";
    if (path.startsWith("/dashboard/services")) return "Services";
    if (path.startsWith("/dashboard/projects")) return "Projects";
    if (path.startsWith("/dashboard/industries")) return "Industries";
    if (path.startsWith("/dashboard/tags")) return "Tags";
    if (path.startsWith("/dashboard/pages")) return "Pages";
    if (path.startsWith("/dashboard/media")) return "Media";
    if (path.startsWith("/dashboard/editors")) return "Editors";
    if (path.startsWith("/dashboard/template")) return "Templates";
    if (path.startsWith("/dashboard/settings")) return "Settings";
    if (path.startsWith("/dashboard/seo")) return "SEO Management";
    return "Dashboard"; // Default fallback
  };

  // Update active option when pathname changes
  useEffect(() => {
    const currentActive = getActiveOptionFromPath(pathname);
    setActiveOption(currentActive);
  }, [pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/cortechsols_logo.png"
                    alt="logo"
                    width={30}
                    height={30}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Dashboard</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive =
                  activeOption === item.title ||
                  (item.href === "/dashboard" && pathname === "/dashboard") ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.disabled ? (
                      <SidebarMenuButton
                        disabled
                        className="cursor-not-allowed opacity-50"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        onClick={() => setActiveOption(item.title)}
                        className="active:bg-teal-500 active:text-white hover:bg-teal-500 hover:text-white"
                      >
                        <Link
                          href={item.href}
                          className={
                            isActive
                              ? "bg-teal-500 text-primary-foreground"
                              : ""
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        {/* Actions section - Admin only */}
        {user?.userType === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    disabled
                    onClick={(e) => e.preventDefault()}
                    className="opacity-50"
                  >
                    <div>
                      <PlusCircle className="h-4 w-4" />
                      <span>SEO Management</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    onClick={() => setActiveOption("SEO Management")}
                    className="active:bg-teal-500 active:text-white hover:bg-teal-500 hover:text-white"
                  >
                    <Link 
                      href="/dashboard/seo"
                      className={pathname.startsWith("/dashboard/seo") ? "bg-teal-500 text-primary-foreground" : ""}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>SEO Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem> */}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Info and Logout */}
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 px-3 py-2">
                  <User className="h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.email || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.userType || "Unknown"}
                    </p>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
