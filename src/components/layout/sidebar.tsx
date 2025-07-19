"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Sparkles, 
  FileText, 
  Layers, 
  DollarSign, 
  Code, 
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedDiv } from "@/components/ui/animations"
import { cn } from "@/lib/utils"

export interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Generate",
    href: "/generate",
    icon: Sparkles,
    badge: "New",
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FileText,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: Layers,
  },
  {
    title: "Financial Models",
    href: "/financial",
    icon: DollarSign,
  },
  {
    title: "Code Export",
    href: "/code-export",
    icon: Code,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/help",
    icon: HelpCircle,
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const pathname = usePathname()

  const NavLink: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => {
    const Icon = item.icon
    
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground relative",
          isActive && "bg-accent text-accent-foreground shadow-sm",
          isCollapsed && "justify-center px-2"
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon className={cn(
          "h-4 w-4 transition-all", 
          isCollapsed && "h-5 w-5",
          isActive && "text-primary"
        )} />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground font-medium">
                {item.badge}
              </span>
            )}
          </>
        )}
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.title}
            {item.badge && (
              <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Link>
    )
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r border-border bg-background/95 backdrop-blur transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!isCollapsed && (
          <AnimatedDiv variant="slideInLeft" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Desenyon</span>
          </AnimatedDiv>
        )}
        
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn("h-8 w-8", isCollapsed && "mx-auto")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <NavLink key={item.href} item={item} isActive={isActive} />
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-4 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <NavLink key={item.href} item={item} isActive={isActive} />
          )
        })}
      </div>

      {/* Upgrade Banner (when not collapsed) */}
      {!isCollapsed && (
        <div className="m-4 p-4 rounded-lg bg-gradient-accent border border-border">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Upgrade to Pro</h4>
            <p className="text-xs text-muted-foreground">
              Unlock unlimited projects and advanced features.
            </p>
            <Button size="sm" className="w-full" variant="gradient">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}