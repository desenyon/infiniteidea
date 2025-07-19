"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"

export interface MainLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showSidebar = true,
  className 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  // Close mobile sidebar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMobileSidebarOpen && !target.closest('[data-sidebar]') && !target.closest('[data-sidebar-trigger]')) {
        setIsMobileSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileSidebarOpen])

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar 
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebar}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {showSidebar && isMobileSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" />
            <div 
              className="fixed left-0 top-16 bottom-0 z-50 md:hidden"
              data-sidebar
            >
              <Sidebar 
                isCollapsed={false}
                onToggleCollapse={toggleMobileSidebar}
                className="h-full shadow-xl"
              />
            </div>
          </>
        )}
        
        <main className="flex-1 overflow-auto">
          {/* Mobile Sidebar Toggle */}
          {showSidebar && (
            <div className="md:hidden p-4 border-b border-border bg-background/95 backdrop-blur">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileSidebar}
                data-sidebar-trigger
                className="flex items-center gap-2"
              >
                <Menu className="h-4 w-4" />
                <span className="text-sm font-medium">Menu</span>
              </Button>
            </div>
          )}
          
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  showSidebar?: boolean
  className?: string
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  actions,
  showSidebar = true,
  className,
}) => {
  return (
    <MainLayout showSidebar={showSidebar} className={className}>
      <div className="flex flex-col h-full">
        {(title || description || actions) && (
          <div className="border-b border-border bg-background/95 backdrop-blur">
            <Container className="py-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {title && (
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center space-x-2">
                    {actions}
                  </div>
                )}
              </div>
            </Container>
          </div>
        )}
        
        <div className="flex-1 overflow-auto">
          <Container className="py-6">
            {children}
          </Container>
        </div>
      </div>
    </MainLayout>
  )
}