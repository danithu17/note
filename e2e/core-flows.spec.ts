import { test, expect } from '@playwright/test';

test.describe('ScribbleNote Core User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the workspace to mount
    await expect(page.locator('header')).toBeVisible();
  });

  test('should load workspace and allow creating a new lecture note', async ({ page }) => {
    // Open sidebar if hidden
    const sidebarToggle = page.locator('button[title*="Toggle Notebook Sidebar"]');
    await sidebarToggle.click();

    // Click "New Note"
    const newNoteBtn = page.getByRole('button', { name: /New Note/i });
    await expect(newNoteBtn).toBeVisible();
    await newNoteBtn.click();

    // Check title input is visible
    const titleInput = page.locator('input[placeholder="Lecture Title..."]');
    await expect(titleInput).toBeVisible();
  });

  test('should support canvas freehand drawing and undo', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (box) {
      // Simulate drawing a stroke
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 200, box.y + 150);
      await page.mouse.move(box.x + 300, box.y + 200);
      await page.mouse.up();

      // Undo button should be active
      const undoBtn = page.locator('button[title*="Undo"]');
      await expect(undoBtn).toBeEnabled();
      await undoBtn.click();
    }
  });

  test('should open command palette with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+KeyK');
    const searchInput = page.locator('input[placeholder*="Type a command"]');
    await expect(searchInput).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();
  });
});
