import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Home, Settings, LayoutDashboard, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  isCollapsed: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: "Projects",
      href: "/projects",
      icon: Home,
      isActive: (pathname: string) =>
        pathname === "/projects" || pathname.startsWith("/projects/"),
    },
    {
      label: "Templates",
      href: "/templates",
      icon: LayoutDashboard,
      isActive: (pathname: string) =>
        pathname === "/templates" || pathname.startsWith("/templates/"),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      isActive: (pathname: string) =>
        pathname === "/settings" || pathname.startsWith("/settings/"),
    },
  ];

  return (
    <div className="space-y-4 overflow-hidden mb-auto">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          asChild
          className={cn(
            "w-full justify-start hover:text-main hover:bg-gray-200 flex items-center text-lg font-normal",
            isCollapsed && "lg:justify-center lg:p-2",
            item.isActive(pathname) && "text-main bg-gray-200"
          )}
        >
          <Link href={item.href}>
            <item.icon className="h-[22px] w-[22px]" />
            {/* DESKTOP STYLES */}
            {!isCollapsed && (
              <span className="ml-3 hidden lg:inline">{item.label}</span>
            )}
            {/* MOBILE STYLES */}
            <span className="ml-3 lg:hidden">{item.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
