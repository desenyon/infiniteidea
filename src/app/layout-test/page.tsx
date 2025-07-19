"use client"

import React from "react"
import { PageLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Grid } from "@/components/ui/grid"
import { AnimatedDiv, StaggeredList } from "@/components/ui/animations"
import { Plus, Download, Share } from "lucide-react"

export default function LayoutTestPage() {
  return (
    <PageLayout
      title="Layout Test Page"
      description="Testing the main application layout with header, sidebar, and responsive navigation"
      actions={
        <>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="gradient" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <AnimatedDiv variant="fadeInUp">
          <Card variant="gradient" className="p-8 text-center">
            <CardContent className="space-y-4">
              <h2 className="text-3xl font-bold">Welcome to Desenyon</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform your ideas into production-ready development blueprints with AI-powered 
                architecture, financial modeling, and seamless integration with coding tools.
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <Button variant="gradient" size="lg">
                  Start Building
                </Button>
                <Button variant="outline" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  View Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedDiv>

        {/* Feature Cards */}
        <div className="space-y-6">
          <AnimatedDiv variant="fadeInUp" delay={0.1}>
            <h3 className="text-2xl font-semibold">Key Features</h3>
          </AnimatedDiv>
          
          <StaggeredList>
            <Grid cols={3} gap="lg">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">AI-Powered Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Transform simple ideas into comprehensive development blueprints using 
                    advanced AI prompt engineering and orchestration.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Technical Architecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get detailed tech stack recommendations, deployment strategies, 
                    and scaling guidelines tailored to your project needs.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Financial Modeling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive cost analysis, revenue projections, and business 
                    metrics to support your funding and planning decisions.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Workflow Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Interactive AI workflow diagrams with customizable modules 
                    for authentication, payments, UI components, and more.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Development Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Prioritized task lists with realistic timelines, dependency 
                    mapping, and development hour estimates.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Code Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    One-click launch into AI coding environments with optimized 
                    prompts and project context pre-loaded.
                  </p>
                </CardContent>
              </Card>
            </Grid>
          </StaggeredList>
        </div>

        {/* Stats Section */}
        <AnimatedDiv variant="fadeInUp" delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle>Layout Features Demonstrated</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid cols={4} gap="lg">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <div className="text-sm font-medium">Responsive Header</div>
                  <div className="text-xs text-muted-foreground">
                    With mobile navigation
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <div className="text-sm font-medium">Collapsible Sidebar</div>
                  <div className="text-xs text-muted-foreground">
                    With navigation items
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <div className="text-sm font-medium">Theme Support</div>
                  <div className="text-xs text-muted-foreground">
                    Light/dark mode ready
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <div className="text-sm font-medium">Smooth Animations</div>
                  <div className="text-xs text-muted-foreground">
                    Premium feel transitions
                  </div>
                </div>
              </Grid>
            </CardContent>
          </Card>
        </AnimatedDiv>
      </div>
    </PageLayout>
  )
}