"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "@/types/nav-types";
import { cn } from "@/lib/utils";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useIsMobile } from "@/components/hooks/use-mobile";

interface DashboardNavProps {
  items: SidebarNavItem[];
}

const DashboardNav = ({ items }: DashboardNavProps) => {
  const path = usePathname();
  const isMobile = useIsMobile();

  if (!items?.length) return null;

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item, index) => {
        const Icon = Icons[item?.icon || "list"];
        const isActive = path.startsWith(item.href as string);

        return (
          item.href && (
            <Link key={index} href={item.disabled ? "/" : item.href}>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      size={isMobile ? "icon" : "sm"}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(!isMobile && "w-full flex justify-start")}
                    >
                      <Icon />
                      {!isMobile && item.title}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className={cn(
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                      !isMobile && "hidden"
                    )}
                  >
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          )
        );
      })}
    </nav>
  );
};

export default DashboardNav;
