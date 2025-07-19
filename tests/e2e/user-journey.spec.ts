import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock AI service responses to avoid external API calls
    await page.route('**/api/ai/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/orchestrate')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            blueprint: {
              id: 'test-blueprint-1',
              productPlan: {
                targetAudience: 'Tech-savvy entrepreneurs',
                coreFeatures: ['AI-powered analysis', 'Real-time collaboration'],
                differentiators: ['Unique AI approach', 'Seamless integration'],
                monetization: { strategy: 'SaaS', pricing: '$29/month' },
                gtmStrategy: 'Content marketing and partnerships'
              },
              techStack: {
                frontend: [{ name: 'Next.js', reasoning: 'Modern React framework' }],
                backend: [{ name: 'Node.js', reasoning: 'JavaScript ecosystem' }],
                database: [{ name: 'PostgreSQL', reasoning: 'Reliable relational DB' }],
                aiServices: [{ name: 'OpenAI GPT-4', reasoning: 'Best-in-class LLM' }]
              },
              aiWorkflow: {
                nodes: [
                  { id: '1', type: 'input', label: 'User Input', position: { x: 0, y: 0 } },
                  { id: '2', type: 'process', label: 'AI Processing', position: { x: 200, y: 0 } },
                  { id: '3', type: 'output', label: 'Blueprint Output', position: { x: 400, y: 0 } }
                ],
                edges: [
                  { id: 'e1-2', source: '1', target: '2' },
                  { id: 'e2-3', source: '2', target: '3' }
                ]
              },
              roadmap: {
                phases: [
                  { name: 'MVP Development', duration: '2-3 months', tasks: ['Core features', 'Basic UI'] },
                  { name: 'Beta Launch', duration: '1 month', tasks: ['User testing', 'Bug fixes'] }
                ]
              },
              financialModel: {
                costs: { infrastructure: 500, team: 15000, tools: 200 },
                revenue: { monthly: 5000, yearly: 60000 },
                metrics: { cac: 50, ltv: 500 }
              }
            }
          })
        });
      }
    });
  });

  test('should complete full idea-to-blueprint journey', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Verify home page loads
    await expect(page).toHaveTitle(/Desenyon/);
    
    // Find and fill the idea input
    const ideaInput = page.locator('textarea[placeholder*="idea"], textarea[placeholder*="Describe"]').first();
    await expect(ideaInput).toBeVisible();
    
    const testIdea = 'A social media platform for pet owners to share photos, connect with local veterinarians, and find pet-friendly places in their area.';
    await ideaInput.fill(testIdea);
    
    // Submit the idea
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Submit")').first();
    await submitButton.click();
    
    // Wait for processing to complete (with timeout)
    await expect(page.locator('text=Processing', { timeout: 5000 })).toBeVisible();
    
    // Wait for blueprint to be generated
    await expect(page.locator('text=Blueprint', { timeout: 30000 })).toBeVisible();
    
    // Verify blueprint sections are displayed
    await expect(page.locator('text=Product Plan')).toBeVisible();
    await expect(page.locator('text=Tech Stack')).toBeVisible();
    await expect(page.locator('text=AI Workflow')).toBeVisible();
    await expect(page.locator('text=Roadmap')).toBeVisible();
    await expect(page.locator('text=Financial Model')).toBeVisible();
    
    // Test navigation between blueprint sections
    await page.locator('text=Tech Stack').click();
    await expect(page.locator('text=Next.js')).toBeVisible();
    
    await page.locator('text=Financial Model').click();
    await expect(page.locator('text=$29')).toBeVisible();
    
    // Test export functionality
    const exportButton = page.locator('button:has-text("Export")').first();
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await expect(page.locator('text=PDF, text=Markdown')).toBeVisible();
    }
    
    // Test sharing functionality
    const shareButton = page.locator('button:has-text("Share")').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await expect(page.locator('text=Share Link, text=Shareable')).toBeVisible();
    }
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('/');
    
    // Try to access protected features
    const signInButton = page.locator('button:has-text("Sign In"), a:has-text("Sign In")').first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
      
      // Should navigate to sign in page
      await expect(page).toHaveURL(/signin/);
      
      // Verify sign in form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    }
  });

  test('should handle project management', async ({ page }) => {
    await page.goto('/projects');
    
    // Should show projects page or redirect to auth
    const isProjectsPage = await page.locator('text=Projects, text=My Projects').isVisible();
    const isAuthPage = await page.locator('text=Sign In').isVisible();
    
    expect(isProjectsPage || isAuthPage).toBeTruthy();
    
    if (isProjectsPage) {
      // Test project creation
      const createButton = page.locator('button:has-text("Create"), button:has-text("New Project")').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await expect(page.locator('text=New Project, text=Create Project')).toBeVisible();
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    if (await ideaInput.isVisible()) {
      await ideaInput.fill('Test idea for error handling');
      
      const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
      await submitButton.click();
      
      // Should show error message
      await expect(page.locator('text=Error, text=Failed, text=Something went wrong')).toBeVisible();
    }
  });

  test('should validate input requirements', async ({ page }) => {
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    if (await ideaInput.isVisible()) {
      // Try to submit empty input
      const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
      await submitButton.click();
      
      // Should show validation error
      await expect(page.locator('text=required, text=Please enter, text=minimum')).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('/');
    
    // Verify mobile layout
    await expect(page.locator('textarea')).toBeVisible();
    
    // Test mobile navigation
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    }
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    
    await page.goto('/');
    
    // Verify tablet layout
    await expect(page.locator('textarea')).toBeVisible();
    
    // Test touch interactions
    const ideaInput = page.locator('textarea').first();
    await ideaInput.tap();
    await expect(ideaInput).toBeFocused();
  });
});