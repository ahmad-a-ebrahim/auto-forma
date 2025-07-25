"use client";
import React from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarNavItem } from '@/types/nav-types';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface DashboardNavProps {
  items: SidebarNavItem[];
}

const DashboardNav = ({ items }: DashboardNavProps) => {
  const path = usePathname();

  if (!items?.length) return null;

  return (
    <nav className='flex flex-col gap-2'>
      {items.map((item, index) => {
          const Icon = Icons[item?.icon || "list"];
          const isActive = path === item.href;

          return item.href && (
            <Link key={index} href={item.disabled ? "/" : item.href}>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={isActive ? "default" : "ghost"}
                    >
                      <Icon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className={cn(isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          );
      })}
    </nav>
  )
}

export default DashboardNav
