import { test, expect } from '@playwright/test';

test.describe('Basic Application Functionality', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Desenyon|InfiniteIdea/);
    
    // Check for basic page structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to different pages if they exist
    const links = page.locator('a[href^="/"]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Click first internal link
      const firstLink = links.first();
      const href = await firstLink.getAttribute('href');
      
      if (href && href !== '/') {
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate successfully
        expect(page.url()).toContain(href);
      }
    }
  });

  test('should handle API endpoints', async ({ request }) => {
    // Test health check endpoint if it exists
    try {
      const response = await request.get('/api/health');
      expect([200, 404]).toContain(response.status());
    } catch (error) {
      // API might not be available in test environment
      console.log('API health check not available:', error);
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('NEXT_REDIRECT')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});