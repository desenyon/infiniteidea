import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock consistent data for visual tests
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/ai/orchestrate')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            blueprint: {
              id: 'visual-test-blueprint',
              productPlan: {
                targetAudience: 'Visual test audience',
                coreFeatures: ['Feature A', 'Feature B', 'Feature C'],
                differentiators: ['Unique approach', 'Better UX'],
                monetization: { strategy: 'SaaS', pricing: '$29/month' },
                gtmStrategy: 'Content marketing'
              },
              techStack: {
                frontend: [{ name: 'Next.js', reasoning: 'Modern React framework' }],
                backend: [{ name: 'Node.js', reasoning: 'JavaScript ecosystem' }],
                database: [{ name: 'PostgreSQL', reasoning: 'Reliable database' }]
              },
              aiWorkflow: {
                nodes: [
                  { id: '1', type: 'input', label: 'Input', position: { x: 0, y: 0 } },
                  { id: '2', type: 'process', label: 'Process', position: { x: 200, y: 0 } },
                  { id: '3', type: 'output', label: 'Output', position: { x: 400, y: 0 } }
                ],
                edges: [
                  { id: 'e1-2', source: '1', target: '2' },
                  { id: 'e2-3', source: '2', target: '3' }
                ]
              },
              roadmap: {
                phases: [
                  { name: 'MVP', duration: '2 months', tasks: ['Core features', 'Basic UI'] },
                  { name: 'Beta', duration: '1 month', tasks: ['Testing', 'Feedback'] }
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

  test('should match homepage layout', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements that might cause flakiness
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .animate-pulse,
        .animate-spin {
          visibility: hidden !important;
        }
      `
    });
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Take viewport screenshot
    await expect(page).toHaveScreenshot('homepage-viewport.png', {
      animations: 'disabled'
    });
  });

  test('should match idea input form', async ({ page }) => {
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    await expect(ideaInput).toBeVisible();
    
    // Test empty state
    await expect(page.locator('form, [data-testid="idea-form"]').first()).toHaveScreenshot('idea-form-empty.png');
    
    // Test with content
    await ideaInput.fill('A social media platform for pet owners to share photos and connect with veterinarians.');
    await expect(page.locator('form, [data-testid="idea-form"]').first()).toHaveScreenshot('idea-form-filled.png');
    
    // Test validation state
    await ideaInput.fill('short');
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    await submitButton.click();
    
    // Wait for validation message
    await page.waitForTimeout(500);
    await expect(page.locator('form, [data-testid="idea-form"]').first()).toHaveScreenshot('idea-form-validation.png');
  });

  test('should match blueprint display sections', async ({ page }) => {
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    await ideaInput.fill('Visual test idea for blueprint display');
    
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    await submitButton.click();
    
    // Wait for blueprint to load
    await expect(page.locator('text=Blueprint')).toBeVisible({ timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    // Test Product Plan section
    await page.locator('text=Product Plan').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="product-plan"], .product-plan').first()).toHaveScreenshot('product-plan-section.png');
    
    // Test Tech Stack section
    await page.locator('text=Tech Stack').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="tech-stack"], .tech-stack').first()).toHaveScreenshot('tech-stack-section.png');
    
    // Test AI Workflow section
    await page.locator('text=AI Workflow').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="ai-workflow"], .ai-workflow').first()).toHaveScreenshot('ai-workflow-section.png');
    
    // Test Roadmap section
    await page.locator('text=Roadmap').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="roadmap"], .roadmap').first()).toHaveScreenshot('roadmap-section.png');
    
    // Test Financial Model section
    await page.locator('text=Financial').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="financial-model"], .financial-model').first()).toHaveScreenshot('financial-model-section.png');
  });

  test('should match loading states', async ({ page }) => {
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    await ideaInput.fill('Loading state visual test');
    
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    await submitButton.click();
    
    // Capture loading state
    await expect(page.locator('text=Processing')).toBeVisible();
    await expect(page.locator('[data-testid="loading"], .loading-container').first()).toHaveScreenshot('loading-state.png');
    
    // Capture progress indicators
    const progressIndicator = page.locator('[data-testid="progress"], .progress-bar').first();
    if (await progressIndicator.isVisible()) {
      await expect(progressIndicator).toHaveScreenshot('progress-indicator.png');
    }
  });

  test('should match responsive layouts', async ({ page }) => {
    // Desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('layout-desktop.png');
    
    // Tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('layout-tablet.png');
    
    // Mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('layout-mobile.png');
  });

  test('should match dark/light theme variations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test light theme (default)
    await expect(page).toHaveScreenshot('theme-light.png');
    
    // Switch to dark theme if available
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("Dark"), button:has-text("Theme")').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('theme-dark.png');
    }
  });

  test('should match error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    await ideaInput.fill('Error state visual test');
    
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    await submitButton.click();
    
    // Wait for error message
    await expect(page.locator('text=Error, text=Failed, text=Something went wrong')).toBeVisible();
    await expect(page.locator('[data-testid="error"], .error-container').first()).toHaveScreenshot('error-state.png');
  });

  test('should match navigation components', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test main navigation
    const navigation = page.locator('nav, header').first();
    await expect(navigation).toHaveScreenshot('navigation-main.png');
    
    // Test mobile navigation if available
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="mobile-menu"], .mobile-nav').first()).toHaveScreenshot('navigation-mobile.png');
    }
  });

  test('should match form components', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Test sign-in form if it exists
    const signInForm = page.locator('form').first();
    if (await signInForm.isVisible()) {
      await expect(signInForm).toHaveScreenshot('signin-form.png');
      
      // Test form with validation errors
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(500);
      await expect(signInForm).toHaveScreenshot('signin-form-validation.png');
    }
  });

  test('should match button states', async ({ page }) => {
    await page.goto('/');
    
    // Create a test page with different button states
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="padding: 20px; display: flex; flex-direction: column; gap: 10px;">
          <button class="btn-primary">Primary Button</button>
          <button class="btn-secondary">Secondary Button</button>
          <button class="btn-primary" disabled>Disabled Button</button>
          <button class="btn-primary loading">Loading Button</button>
          <button class="btn-danger">Danger Button</button>
        </div>
      `;
      document.body.appendChild(container);
    });
    
    await expect(page.locator('div').last()).toHaveScreenshot('button-states.png');
  });
});

test.describe('Component-Specific Visual Tests', () => {
  test('should match workflow diagram visualization', async ({ page }) => {
    await page.goto('/workflow-test');
    
    // If workflow test page exists
    const workflowDiagram = page.locator('[data-testid="workflow-diagram"], .workflow-diagram').first();
    if (await workflowDiagram.isVisible()) {
      await expect(workflowDiagram).toHaveScreenshot('workflow-diagram.png');
    }
  });

  test('should match project cards layout', async ({ page }) => {
    await page.goto('/projects');
    
    const projectsContainer = page.locator('[data-testid="projects-grid"], .projects-container').first();
    if (await projectsContainer.isVisible()) {
      await expect(projectsContainer).toHaveScreenshot('projects-grid.png');
    }
  });

  test('should match modal dialogs', async ({ page }) => {
    await page.goto('/');
    
    // Try to trigger a modal
    const modalTrigger = page.locator('button:has-text("Export"), button:has-text("Share")').first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      
      const modal = page.locator('[role="dialog"], .modal').first();
      if (await modal.isVisible()) {
        await expect(modal).toHaveScreenshot('modal-dialog.png');
      }
    }
  });
});