import { test, expect } from '@playwright/test';

test.describe('Sound Royale Game Flow', () => {
  test('should track genre calling behavior', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Enter username and start game
    await page.fill('input[placeholder="Enter your username"]', 'TestPlayer');
    await page.click('button:has-text("Start Game")');
    
    // Wait for game to load
    await expect(page.locator('text=Waiting for Players to Ready Up')).toBeVisible();
    
    // Track genre calls using console logs
    const genreCalls: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Genre Called') || msg.text().includes('🎵')) {
        genreCalls.push(msg.text());
        console.log('GENRE CALL DETECTED:', msg.text());
      }
    });
    
    // Click ready for Player 1
    await page.click('button:has-text("Mark Ready")');
    
    // Wait for auto-ready simulation and genre calling
    await page.waitForTimeout(3000);
    
    // Check if we moved to production phase
    await expect(page.locator('text=Production Phase')).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-game-state.png', fullPage: true });
    
    // Check how many genres were called
    console.log('Total genre calls detected:', genreCalls.length);
    console.log('Genre calls:', genreCalls);
    
    // Look for called genres in the UI
    const calledGenres = await page.locator('.text-yellow-400').allTextContents();
    console.log('Called genres in UI:', calledGenres);
    
    // Verify only one genre should be active
    const currentGenreElements = await page.locator('h2:has(svg.lucide-sparkles)').count();
    console.log('Number of current genre displays:', currentGenreElements);
    
    expect(currentGenreElements).toBe(1);
  });

  test('should show timer countdown in production phase', async ({ page }) => {
    await page.goto('/');
    
    // Enter username and start game
    await page.fill('input[placeholder="Enter your username"]', 'TestPlayer');
    await page.click('button:has-text("Start Game")');
    
    // Get to production phase
    await page.click('button:has-text("Mark Ready")');
    await page.waitForTimeout(3000);
    
    // Check timer is visible and counting down
    const timerElement = page.locator('div:has(svg.lucide-timer) span');
    await expect(timerElement).toBeVisible();
    
    const initialTime = await timerElement.textContent();
    console.log('Initial timer:', initialTime);
    
    // Wait a few seconds and check timer decreased
    await page.waitForTimeout(3000);
    const laterTime = await timerElement.textContent();
    console.log('Timer after 3s:', laterTime);
    
    // Convert times to seconds for comparison
    const parseTime = (timeStr: string | null) => {
      if (!timeStr) return 0;
      const [min, sec] = timeStr.split(':').map(Number);
      return min * 60 + sec;
    };
    
    const initialSeconds = parseTime(initialTime);
    const laterSeconds = parseTime(laterTime);
    
    expect(laterSeconds).toBeLessThan(initialSeconds);
    console.log(`Timer decreased from ${initialSeconds}s to ${laterSeconds}s`);
  });
});
