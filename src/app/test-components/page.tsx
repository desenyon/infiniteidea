"use client"

import { useState } from "react"
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  useModal,
  Badge,
  Progress,
  MultiStepProgress,
  Separator,
  SeparatorWithText,
  Tooltip,
  LoadingSpinner,
  LoadingDots,
  LoadingBar,
  LoadingSkeleton,
  LoadingOverlay,
  Container,
  Grid,
  Flex,
  AnimatedDiv,
  StaggeredList,
  GradientText,
  FloatingElement,
} from "@/components/ui"

export default function TestComponentsPage() {
  const [inputValue, setInputValue] = useState("")
  const [textareaValue, setTextareaValue] = useState("")
  const [loadingProgress, setLoadingProgress] = useState(45)
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, openModal, closeModal } = useModal()
  const [badges, setBadges] = useState(["React", "TypeScript", "Next.js"])

  const handleStartLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 3000)
  }

  const removeBadge = (index: number) => {
    setBadges(badges.filter((_, i) => i !== index))
  }

  const steps = [
    { label: "Setup", completed: true },
    { label: "Design", completed: true },
    { label: "Development", completed: false, current: true },
    { label: "Testing", completed: false },
    { label: "Deploy", completed: false },
  ]

  return (
    <Container size="xl" className="py-8">
      <div className="space-y-12">
        {/* Header */}
        <AnimatedDiv variant="fadeInUp" className="text-center">
          <GradientText gradient="primary" className="text-4xl font-bold mb-4">
            UI Component Library
          </GradientText>
          <p className="text-muted-foreground text-lg">
            Complete component library with gradient animations and premium transitions
          </p>
        </AnimatedDiv>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <StaggeredList className="space-y-4">
              <Flex gap="md" wrap="wrap">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="gradient">Gradient</Button>
                <Button variant="gradient-secondary">Gradient Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </Flex>
              
              <Flex gap="md" wrap="wrap">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </Flex>
              
              <Flex gap="md" wrap="wrap">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </Flex>
            </StaggeredList>
          </CardContent>
        </Card>

        {/* Form Controls Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={2} gap="lg">
              <div className="space-y-4">
                <Input
                  label="Default Input"
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  label="Error State"
                  placeholder="Error input"
                  error="This field is required"
                  variant="error"
                />
                <Input
                  label="Success State"
                  placeholder="Success input"
                  variant="success"
                  helperText="Looks good!"
                />
                <Textarea
                  label="Idea Description"
                  placeholder="Describe your startup idea..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  maxLength={500}
                  showCount
                  helperText="Be as detailed as possible"
                />
              </div>
              
              <div className="space-y-4">
                <Input size="sm" placeholder="Small input" />
                <Input size="default" placeholder="Default input" />
                <Input size="lg" placeholder="Large input" />
                <Textarea size="sm" placeholder="Small textarea" />
                <Textarea size="lg" placeholder="Large textarea" />
              </div>
            </Grid>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Badge Variants</h4>
                <Flex gap="sm" wrap="wrap">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="gradient">Gradient</Badge>
                  <Badge variant="gradient-secondary">Gradient Secondary</Badge>
                </Flex>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Removable Badges</h4>
                <Flex gap="sm" wrap="wrap">
                  {badges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      removable
                      onRemove={() => removeBadge(index)}
                    >
                      {badge}
                    </Badge>
                  ))}
                </Flex>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Basic Progress</h4>
                <Progress value={loadingProgress} showLabel label="Project Progress" />
                <div className="mt-2 space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => setLoadingProgress(Math.max(0, loadingProgress - 10))}
                  >
                    -10%
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setLoadingProgress(Math.min(100, loadingProgress + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Gradient Progress</h4>
                <Progress value={75} gradient showLabel label="AI Generation" />
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Multi-Step Progress</h4>
                <MultiStepProgress steps={steps} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Separators Section */}
        <Card>
          <CardHeader>
            <CardTitle>Separators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p>Content above separator</p>
                <Separator className="my-4" />
                <p>Content below separator</p>
              </div>
              
              <div>
                <p>Content above gradient separator</p>
                <Separator variant="gradient" className="my-4" />
                <p>Content below gradient separator</p>
              </div>
              
              <div>
                <p>Content above dashed separator</p>
                <Separator variant="dashed" className="my-4" />
                <p>Content below dashed separator</p>
              </div>
              
              <SeparatorWithText>
                OR
              </SeparatorWithText>
              
              <div className="flex items-center space-x-4">
                <p>Left content</p>
                <Separator orientation="vertical" className="h-8" />
                <p>Right content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tooltips Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Flex gap="lg" wrap="wrap">
                <Tooltip content="This is a top tooltip" side="top">
                  <Button variant="outline">Top Tooltip</Button>
                </Tooltip>
                
                <Tooltip content="This is a right tooltip" side="right">
                  <Button variant="outline">Right Tooltip</Button>
                </Tooltip>
                
                <Tooltip content="This is a bottom tooltip" side="bottom">
                  <Button variant="outline">Bottom Tooltip</Button>
                </Tooltip>
                
                <Tooltip content="This is a left tooltip" side="left">
                  <Button variant="outline">Left Tooltip</Button>
                </Tooltip>
              </Flex>
              
              <Tooltip 
                content={
                  <div className="space-y-1">
                    <p className="font-medium">Rich Tooltip</p>
                    <p className="text-xs">This tooltip contains multiple lines and rich content.</p>
                  </div>
                }
                side="top"
              >
                <Button variant="gradient">Rich Tooltip</Button>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <Grid cols={3} gap="lg">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is a default card with standard styling.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This card has elevated shadow effects.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This card uses gradient background.
                </p>
              </CardContent>
            </Card>
          </Grid>
        </div>

        {/* Loading Components */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={2} gap="lg">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Loading Spinners</h4>
                  <Flex gap="md" align="center">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </Flex>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Loading Dots</h4>
                  <LoadingDots />
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Loading Bar</h4>
                  <LoadingBar progress={loadingProgress} showPercentage />
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Loading Skeleton</h4>
                  <LoadingSkeleton lines={3} />
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Loading Overlay</h4>
                  <LoadingOverlay isLoading={isLoading} message="Processing...">
                    <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                      <Button onClick={handleStartLoading}>Start Loading</Button>
                    </div>
                  </LoadingOverlay>
                </div>
              </div>
            </Grid>
          </CardContent>
        </Card>

        {/* Animation Components */}
        <Card>
          <CardHeader>
            <CardTitle>Animations</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={2} gap="lg">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Gradient Text</h4>
                  <div className="space-y-2">
                    <GradientText gradient="primary" className="text-xl font-bold">
                      Primary Gradient
                    </GradientText>
                    <GradientText gradient="secondary" className="text-xl font-bold">
                      Secondary Gradient
                    </GradientText>
                    <GradientText gradient="accent" className="text-xl font-bold">
                      Accent Gradient
                    </GradientText>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Staggered List</h4>
                  <StaggeredList className="space-y-2">
                    <div className="p-3 bg-muted rounded">Item 1</div>
                    <div className="p-3 bg-muted rounded">Item 2</div>
                    <div className="p-3 bg-muted rounded">Item 3</div>
                    <div className="p-3 bg-muted rounded">Item 4</div>
                  </StaggeredList>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Floating Element</h4>
                  <FloatingElement intensity="medium">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full" />
                  </FloatingElement>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Animated Divs</h4>
                  <div className="space-y-2">
                    <AnimatedDiv variant="slideInLeft" delay={0}>
                      <div className="p-3 bg-muted rounded">Slide In Left</div>
                    </AnimatedDiv>
                    <AnimatedDiv variant="slideInRight" delay={0.1}>
                      <div className="p-3 bg-muted rounded">Slide In Right</div>
                    </AnimatedDiv>
                    <AnimatedDiv variant="scaleIn" delay={0.2}>
                      <div className="p-3 bg-muted rounded">Scale In</div>
                    </AnimatedDiv>
                  </div>
                </div>
              </div>
            </Grid>
          </CardContent>
        </Card>

        {/* Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={openModal}>Open Modal</Button>
            
            <Modal
              isOpen={isOpen}
              onClose={closeModal}
              title="Test Modal"
              description="This is a test modal with gradient animations"
            >
              <div className="space-y-4">
                <p>This modal demonstrates smooth animations and backdrop blur.</p>
                <Separator />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button variant="gradient" onClick={closeModal}>
                    Confirm
                  </Button>
                </div>
              </div>
            </Modal>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}