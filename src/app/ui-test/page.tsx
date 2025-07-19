"use client"

import React from "react"
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  GradientSpinner,
  PulsingDots,
  WaveLoading,
  CircularProgress,
  ShimmerCard,
  Container,
  Grid,
  Flex,
  Stack,
  Section,
  Columns,
  AspectRatio,
  Show,
  Hide,
  AnimatedDiv,
  StaggeredList,
  GradientText,
  FloatingElement,
} from "@/components/ui"

export default function UITestPage() {
  const { isOpen, openModal, closeModal } = useModal()
  const [progress, setProgress] = React.useState(45)
  const [isLoading, setIsLoading] = React.useState(false)

  const steps = [
    { label: "Setup", completed: true },
    { label: "Processing", completed: true, current: false },
    { label: "Analysis", completed: false, current: true },
    { label: "Complete", completed: false },
  ]

  const toggleLoading = () => {
    setIsLoading(!isLoading)
    setTimeout(() => setIsLoading(false), 3000)
  }

  return (
    <Container size="xl" className="py-8">
      <div className="space-y-12">
        {/* Header */}
        <Section padding="sm">
          <AnimatedDiv variant="fadeInUp">
            <div className="text-center space-y-4">
              <GradientText gradient="primary" className="text-4xl font-bold">
                UI Component Library Test
              </GradientText>
              <p className="text-muted-foreground text-lg">
                Testing all components with gradient animations and responsive design
              </p>
            </div>
          </AnimatedDiv>
        </Section>

        {/* Buttons Section */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles with gradient support</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack direction="responsive" spacing="md" align="center">
                <Button variant="default">Default</Button>
                <Button variant="gradient">Gradient Primary</Button>
                <Button variant="gradient-secondary">Gradient Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button loading>Loading</Button>
              </Stack>
            </CardContent>
          </Card>
        </Section>

        {/* Form Components */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input fields and form elements</CardDescription>
            </CardHeader>
            <CardContent>
              <Columns cols={2} gap="lg">
                <div className="space-y-4">
                  <Input 
                    label="Email" 
                    placeholder="Enter your email"
                    helperText="We'll never share your email"
                  />
                  <Input 
                    label="Password" 
                    type="password"
                    error="Password is required"
                  />
                </div>
                <div className="space-y-4">
                  <Textarea 
                    label="Message"
                    placeholder="Enter your message"
                    maxLength={200}
                    showCount
                    value="This is a test message"
                  />
                </div>
              </Columns>
            </CardContent>
          </Card>
        </Section>

        {/* Loading Components */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Loading Components</CardTitle>
              <CardDescription>Various loading states with gradient animations</CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={3} gap="lg">
                <div className="space-y-4 text-center">
                  <h4 className="font-medium">Spinners</h4>
                  <div className="flex justify-center space-x-4">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </div>
                  <div className="flex justify-center space-x-4">
                    <GradientSpinner size="sm" />
                    <GradientSpinner size="md" />
                    <GradientSpinner size="lg" />
                  </div>
                </div>
                
                <div className="space-y-4 text-center">
                  <h4 className="font-medium">Animated Dots</h4>
                  <LoadingDots />
                  <PulsingDots />
                  <WaveLoading />
                </div>
                
                <div className="space-y-4 text-center">
                  <h4 className="font-medium">Progress</h4>
                  <CircularProgress progress={progress} showPercentage />
                  <div className="space-y-2">
                    <LoadingBar progress={progress} showPercentage />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setProgress(Math.random() * 100)}
                    >
                      Random Progress
                    </Button>
                  </div>
                </div>
              </Grid>
            </CardContent>
          </Card>
        </Section>

        {/* Progress Components */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Progress Indicators</CardTitle>
              <CardDescription>Step-by-step progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Progress value={progress} showLabel gradient />
                <MultiStepProgress steps={steps} />
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Badges and Tags */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and tags</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex wrap="wrap" gap="md">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="gradient">Gradient</Badge>
                <Badge variant="gradient-secondary">Gradient Alt</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="default" removable onRemove={() => alert("Removed!")}>
                  Removable
                </Badge>
              </Flex>
            </CardContent>
          </Card>
        </Section>

        {/* Layout Components */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Layout Components</CardTitle>
              <CardDescription>Responsive layout utilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Responsive Visibility</h4>
                  <div className="space-y-2">
                    <Show above="md">
                      <Badge variant="success">Visible on desktop (md+)</Badge>
                    </Show>
                    <Hide above="md">
                      <Badge variant="warning">Hidden on desktop (md+)</Badge>
                    </Hide>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Aspect Ratios</h4>
                  <Grid cols={4} gap="md">
                    <AspectRatio ratio="square" className="bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <span className="text-sm">Square</span>
                    </AspectRatio>
                    <AspectRatio ratio="video" className="bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <span className="text-sm">Video</span>
                    </AspectRatio>
                    <AspectRatio ratio="wide" className="bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <span className="text-sm">Wide</span>
                    </AspectRatio>
                    <AspectRatio ratio="portrait" className="bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <span className="text-sm">Portrait</span>
                    </AspectRatio>
                  </Grid>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Animation Components */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Animations</CardTitle>
              <CardDescription>Smooth transitions and effects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <StaggeredList className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card variant="elevated" padding="sm">
                    <CardContent>
                      <FloatingElement intensity="subtle">
                        <div className="text-center">
                          <h4 className="font-medium">Subtle Float</h4>
                          <p className="text-sm text-muted-foreground">Gentle movement</p>
                        </div>
                      </FloatingElement>
                    </CardContent>
                  </Card>
                  
                  <Card variant="elevated" padding="sm">
                    <CardContent>
                      <FloatingElement intensity="medium">
                        <div className="text-center">
                          <h4 className="font-medium">Medium Float</h4>
                          <p className="text-sm text-muted-foreground">Moderate movement</p>
                        </div>
                      </FloatingElement>
                    </CardContent>
                  </Card>
                  
                  <Card variant="elevated" padding="sm">
                    <CardContent>
                      <FloatingElement intensity="strong">
                        <div className="text-center">
                          <h4 className="font-medium">Strong Float</h4>
                          <p className="text-sm text-muted-foreground">Dynamic movement</p>
                        </div>
                      </FloatingElement>
                    </CardContent>
                  </Card>
                </StaggeredList>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Skeleton Loading */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loading</CardTitle>
              <CardDescription>Content placeholders with shimmer effects</CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingOverlay isLoading={isLoading} message="Loading content...">
                <Grid cols={2} gap="lg">
                  <ShimmerCard lines={4} showAvatar />
                  <div className="space-y-4">
                    <LoadingSkeleton lines={3} />
                    <Button onClick={toggleLoading} variant="outline">
                      Toggle Loading Overlay
                    </Button>
                  </div>
                </Grid>
              </LoadingOverlay>
            </CardContent>
          </Card>
        </Section>

        {/* Modal and Tooltips */}
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Interactive Components</CardTitle>
              <CardDescription>Modals, tooltips, and separators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Button onClick={openModal} variant="gradient">
                    Open Modal
                  </Button>
                  
                  <Tooltip content="This is a helpful tooltip" side="top">
                    <Button variant="outline">Hover for Tooltip</Button>
                  </Tooltip>
                </div>
                
                <div className="space-y-4">
                  <Separator />
                  <SeparatorWithText>Or continue with</SeparatorWithText>
                  <Separator variant="gradient" />
                  <Separator variant="dashed" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Modal Component */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title="Test Modal"
          description="This is a test modal with gradient animations"
          size="md"
        >
          <div className="space-y-4">
            <p>This modal demonstrates the smooth animations and premium feel of the UI components.</p>
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
      </div>
    </Container>
  )
}