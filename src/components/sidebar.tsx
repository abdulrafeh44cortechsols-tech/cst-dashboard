// "use client";

// import Link from "next/link";
// import {
//   Home,
//   FileText,
//   ImageIcon,
//   Users,
//   Settings,
//   PlusCircle,
//   BookOpen,
//   Briefcase,
//   LayoutTemplate,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarSeparator,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import Image from "next/image";

// const navigationItems = [
//   {
//     title: "Dashboard",
//     href: "/dashboard",
//     icon: Home,
//   },
//   {
//     title: "Blogs",
//     href: "/dashboard/blogs",
//     icon: BookOpen,
//     // badge: 7,
//   },
//   {
//     title: "Pages",
//     href: "/dashboard/pages",
//     icon: FileText,
//   },
//   {
//     title: "Services",
//     href: "/dashboard/services",
//     icon: Briefcase,
//     // badge: 4,
//   },
//   {
//     title: "Media",
//     href: "/dashboard/media",
//     icon: ImageIcon,
//   },

//   {
//     title: "Editors",
//     href: "/dashboard/editors",
//     icon: Users,
//   },
//   {
//     title: "Templates",
//     href: "/dashboard/template",
//     icon: LayoutTemplate,
//   },
//   {
//     title: "Settings",
//     href: "/dashboard/settings",
//     icon: Settings,
//     disabled: true, // Disable the Settings item
//   },
// ];

// export function LeftSidebar() {
//   return (
//     <Sidebar collapsible="icon">
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <Link href="/dashboard">
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  
//                   <Image
//                   src='/cortechsols_logo.png'
//                   alt="logo"
//                   width={30}
//                   height={30}
//                   />
                
//                 </div>
//                 <div className="flex flex-col gap-0.5 leading-none">
//                   <span className="font-semibold">Dashboard</span>
//                   <span className="text-xs text-muted-foreground">v1.0.0</span>
//                 </div>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {navigationItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <Link href={item.href} prefetch={item.title==="Blogs"}
//                     className={item.disabled ? "pointer-events-none opacity-50" : ""}
//                     >
//                       <item.icon className="h-4 w-4" />
//                       <span>{item.title}</span>
//                       {/* {item.badge && (
//                         <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
//                           {item.badge}
//                         </Badge>
//                       )} */}
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//         <SidebarSeparator />
//         <SidebarGroup>
//           <SidebarGroupLabel>Actions</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                   <Link href="/dashboard/seo">
//                     <PlusCircle className="h-4 w-4" />
//                     <span>SEO Management</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarRail />
//     </Sidebar>
//   );
// }




"use client";

import Link from "next/link";
import {
  Home,
  FileText,
  ImageIcon,
  Users,
  Settings,
  Package2,
  PlusCircle,
  MessageSquare,
  BookOpen,
  Briefcase,
  LayoutTemplate,
  User,
  LogOut,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
    // badge: 7,
  },
  {
    title: "Posts",
    href: "/dashboard/posts",
    icon: FileText,
    // badge: 12,
  },
  {
    title: "Pages",
    href: "/dashboard/pages",
    icon: FileText,
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Briefcase,
    // badge: 4,
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
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function LeftSidebar() {
  const { user, logout } = useAuth();
  
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
      title: "Pages",
      href: "/dashboard/pages",
      icon: FileText,
    },
    {
      title: "Services",
      href: "/dashboard/services",
      icon: Briefcase,
    },
    {
      title: "Media",
      href: "/dashboard/media",
      icon: ImageIcon,
    },
    // Only show editors menu for admin users
    ...(user?.userType === 'admin' ? [{
      title: "Editors",
      href: "/dashboard/editors",
      icon: Users,
    }] : []),
    {
      title: "Templates",
      href: "/dashboard/template",
      icon: LayoutTemplate,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      disabled: true, // Disable the Settings item
    },
  ];
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src='/cortechsols_logo.png'
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
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/seo">
                    <PlusCircle className="h-4 w-4" />
                    <span>SEO Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
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
                <SidebarMenuButton onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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