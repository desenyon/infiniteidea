import { test, expect } from '@playwright/test';

test.describe('Blueprint Generation Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock AI services for consistent performance testing
    await page.route('**/api/ai/**', async (route) => {
      // Simulate realistic API response times
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          blueprint: {
            id: `perf-test-${Date.now()}`,
            productPlan: {
              targetAudience: 'Performance test audience',
              coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
              differentiators: ['Differentiator 1', 'Differentiator 2'],
              monetization: { strategy: 'SaaS', pricing: '$29/month' }
            },
            techStack: {
              frontend: [{ name: 'Next.js', reasoning: 'Performance testing' }],
              backend: [{ name: 'Node.js', reasoning: 'Performance testing' }],
              database: [{ name: 'PostgreSQL', reasoning: 'Performance testing' }]
            },
            aiWorkflow: {
              nodes: Array.from({ length: 10 }, (_, i) => ({
                id: `node-${i}`,
                type: 'process',
                label: `Process ${i}`,
                position: { x: i * 100, y: 0 }
              })),
              edges: Array.from({ length: 9 }, (_, i) => ({
                id: `edge-${i}`,
                source: `node-${i}`,
                target: `node-${i + 1}`
              }))
            },
            roadmap: {
              phases: Array.from({ length: 5 }, (_, i) => ({
                name: `Phase ${i + 1}`,
                duration: `${i + 1} months`,
                tasks: [`Task ${i + 1}.1`, `Task ${i + 1}.2`]
              }))
            },
            financialModel: {
              costs: { infrastructure: 500, team: 15000, tools: 200 },
              revenue: { monthly: 5000, yearly: 60000 },
              metrics: { cac: 50, ltv: 500 }
            }
          }
        })
      });
    });
  });

  test('should generate blueprint within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Fill in idea
    const ideaInput = page.locator('textarea').first();
    await ideaInput.fill('A comprehensive e-commerce platform with AI-powered recommendations, real-time inventory management, and integrated payment processing.');
    
    // Start generation
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    await submitButton.click();
    
    // Wait for completion
    await expect(page.locator('text=Blueprint')).toBeVisible({ timeout: 60000 });
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    // Should complete within 60 seconds
    expect(generationTime).toBeLessThan(60000);
    
    console.log(`Blueprint generation completed in ${generationTime}ms`);
  });

  test('should handle multiple concurrent requests', async ({ browser }) => {
    const concurrentRequests = 5;
    const contexts = await Promise.all(
      Array.from({ length: concurrentRequests }, () => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    const startTime = Date.now();
    
    // Start all requests simultaneously
    const promises = pages.map(async (page, index) => {
      await page.goto('/');
      
      const ideaInput = page.locator('textarea').first();
      await ideaInput.fill(`Concurrent test idea ${index + 1}: A mobile app for ${index + 1} specific use case.`);
      
      const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
      await submitButton.click();
      
      await expect(page.locator('text=Blueprint')).toBeVisible({ timeout: 90000 });
      
      return Date.now();
    });
    
    const completionTimes = await Promise.all(promises);
    const totalTime = Math.max(...completionTimes) - startTime;
    
    // All requests should complete within 90 seconds
    expect(totalTime).toBeLessThan(90000);
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
    
    console.log(`${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
  });

  test('should maintain UI responsiveness during generation', async ({ page }) => {
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    await ideaInput.fill('Performance test idea for UI responsiveness');
    
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    await submitButton.click();
    
    // Test UI interactions during generation
    await expect(page.locator('text=Processing')).toBeVisible();
    
    // Should be able to interact with other UI elements
    const navigationLinks = page.locator('nav a, header a').first();
    if (await navigationLinks.isVisible()) {
      const clickStart = Date.now();
      await navigationLinks.click();
      const clickEnd = Date.now();
      
      // Click should respond within 100ms
      expect(clickEnd - clickStart).toBeLessThan(100);
    }
    
    // Should be able to scroll
    await page.evaluate(() => window.scrollTo(0, 100));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
  });

  test('should handle large blueprint data efficiently', async ({ page }) => {
    // Mock large blueprint response
    await page.route('**/api/ai/**', async (route) => {
      const largeBlueprint = {
        success: true,
        blueprint: {
          id: 'large-blueprint-test',
          productPlan: {
            targetAudience: 'Large scale test audience',
            coreFeatures: Array.from({ length: 50 }, (_, i) => `Feature ${i + 1}`),
            differentiators: Array.from({ length: 20 }, (_, i) => `Differentiator ${i + 1}`),
            monetization: { strategy: 'Enterprise', pricing: '$299/month' }
          },
          techStack: {
            frontend: Array.from({ length: 10 }, (_, i) => ({
              name: `Frontend Tech ${i + 1}`,
              reasoning: `Reasoning for frontend tech ${i + 1}`
            })),
            backend: Array.from({ length: 10 }, (_, i) => ({
              name: `Backend Tech ${i + 1}`,
              reasoning: `Reasoning for backend tech ${i + 1}`
            })),
            database: Array.from({ length: 5 }, (_, i) => ({
              name: `Database ${i + 1}`,
              reasoning: `Reasoning for database ${i + 1}`
            }))
          },
          aiWorkflow: {
            nodes: Array.from({ length: 100 }, (_, i) => ({
              id: `node-${i}`,
              type: 'process',
              label: `Process Node ${i}`,
              position: { x: (i % 10) * 150, y: Math.floor(i / 10) * 100 }
            })),
            edges: Array.from({ length: 99 }, (_, i) => ({
              id: `edge-${i}`,
              source: `node-${i}`,
              target: `node-${i + 1}`
            }))
          },
          roadmap: {
            phases: Array.from({ length: 20 }, (_, i) => ({
              name: `Phase ${i + 1}`,
              duration: `${i + 1} weeks`,
              tasks: Array.from({ length: 10 }, (_, j) => `Task ${i + 1}.${j + 1}`)
            }))
          }
        }
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeBlueprint)
      });
    });
    
    await page.goto('/');
    
    const ideaInput = page.locator('textarea').first();
    await ideaInput.fill('Large blueprint performance test');
    
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    
    const startTime = Date.now();
    await submitButton.click();
    
    // Wait for blueprint to render
    await expect(page.locator('text=Blueprint')).toBeVisible({ timeout: 30000 });
    
    const renderTime = Date.now() - startTime;
    
    // Should render large blueprint within 30 seconds
    expect(renderTime).toBeLessThan(30000);
    
    // Test scrolling performance with large content
    const scrollStart = Date.now();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    const scrollEnd = Date.now();
    
    // Scrolling should be smooth (under 100ms)
    expect(scrollEnd - scrollStart).toBeLessThan(100);
    
    console.log(`Large blueprint rendered in ${renderTime}ms, scrolled in ${scrollEnd - scrollStart}ms`);
  });

  test('should optimize memory usage during generation', async ({ page }) => {
    await page.goto('/');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    const ideaInput = page.locator('textarea').first();
    await ideaInput.fill('Memory optimization test idea');
    
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    await submitButton.click();
    
    await expect(page.locator('text=Blueprint')).toBeVisible({ timeout: 60000 });
    
    // Get memory usage after generation
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      // Memory increase should be reasonable (under 50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);
      
      console.log(`Memory usage increased by ${memoryIncreaseMB.toFixed(2)}MB`);
    }
  });
});

test.describe('API Performance Tests', () => {
  test('should handle API rate limiting gracefully', async ({ request }) => {
    const requests = Array.from({ length: 20 }, (_, i) => 
      request.post('/api/ai/orchestrate', {
        data: {
          idea: `Rate limit test idea ${i + 1}`
        }
      })
    );
    
    const responses = await Promise.allSettled(requests);
    
    // Some requests should succeed, some might be rate limited
    const successful = responses.filter(r => r.status === 'fulfilled' && (r.value as any).status() === 200);
    const rateLimited = responses.filter(r => r.status === 'fulfilled' && (r.value as any).status() === 429);
    
    expect(successful.length + rateLimited.length).toBe(20);
    
    if (rateLimited.length > 0) {
      console.log(`${rateLimited.length} requests were rate limited out of 20`);
    }
  });

  test('should maintain consistent response times', async ({ request }) => {
    const responseTimes: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      
      const response = await request.post('/api/ideas/process', {
        data: {
          idea: `Consistency test idea ${i + 1}: A mobile app for specific use case ${i + 1}.`
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      responseTimes.push(responseTime);
      
      expect(response.status()).toBe(200);
    }
    
    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    const minTime = Math.min(...responseTimes);
    
    // Response times should be consistent (max shouldn't be more than 3x average)
    expect(maxTime).toBeLessThan(averageTime * 3);
    
    console.log(`Response times - Avg: ${averageTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
  });
});