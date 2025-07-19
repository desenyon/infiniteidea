"use client"

import React from "react"
import { Header } from "@/components/layout/header"
import { Container } from "@/components/ui/container"

export default function SimpleLayoutTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Container className="py-8">
        <h1 className="text-2xl font-bold">Simple Layout Test</h1>
        <p className="text-muted-foreground mt-2">
          Testing the header component in isolation.
        </p>
      </Container>
    </div>
  )
}