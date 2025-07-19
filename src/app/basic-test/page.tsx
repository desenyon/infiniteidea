"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"

export default function BasicTestPage() {
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold">Basic Test</h1>
      <p className="text-muted-foreground mt-2">
        Testing basic UI components.
      </p>
      <div className="mt-4 space-x-2">
        <Button>Default Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="gradient">Gradient Button</Button>
      </div>
    </Container>
  )
}