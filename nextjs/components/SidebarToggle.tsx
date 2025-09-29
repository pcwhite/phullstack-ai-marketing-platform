import { cn } from "@/lib/utils";
import { ChevronRight, ChevronsLeft } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";

interface SidebarToggleProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

function SidebarToggle({ isCollapsed, toggleSidebar }: SidebarToggleProps) {
  return (
    <div
      className={cn(
        "hidden lg:flex border-t border-gray-200",
        isCollapsed ? "p-4 justify-center" : "p-4 justify-end"
      )}
    >
      <Button
        variant="ghost"
        onClick={toggleSidebar}
        className={cn(
          "text-gray-800 hover:text-main hover:bg-gray-200",
          isCollapsed && "self-center"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronsLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export default SidebarToggle;
