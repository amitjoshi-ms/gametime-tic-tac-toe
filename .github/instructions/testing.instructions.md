---
description: 'Testing standards for unit and E2E tests'
applyTo: 'tests/**/*.ts, **/*.test.ts, **/*.spec.ts'
---

# Testing Standards

## Test Organization

### Unit Tests (Vitest)

Location: `tests/unit/*.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { functionUnderTest } from '../../src/module';
import type { SomeType } from '../../src/game/types';
```

### E2E Tests (Playwright)

Location: `tests/e2e/*.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
```

## Test Structure

### Describe Blocks for Grouping

```typescript
describe('checkWin', () => {
  describe('when board is empty', () => {
    it('should return false for X', () => {
      // Test implementation
    });
  });

  describe('when X has winning line', () => {
    it('should detect horizontal win', () => {
      // Test implementation
    });
  });
});
```

### Descriptive Test Names

**Pattern:** Always use "should" prefix to describe expected behavior.

```typescript
// ✅ Good: Describes expected behavior with "should" prefix
it('should detect X wins in top row', () => { /* ... */ });
it('should alternate turns between X and O', () => { /* ... */ });
it('should prevent moves on occupied cells', () => { /* ... */ });

// ✅ Also good: Template literals with "should" prefix (useful for table-driven tests)
const scenarios = [
  { name: 'detect X wins in top row' },
  { name: 'detect O wins diagonally' },
];

scenarios.forEach(({ name }) => {
  it(`should ${name}`, () => { /* ... */ });
});

const edgeCases = [
  'a full board with no winner',
  'a move after the game is over',
];

edgeCases.forEach((edgeCase) => {
  it(`should handle ${edgeCase}`, () => { /* ... */ });
});
// ❌ Bad: Vague or implementation-focused
it('test checkWin', () => { /* ... */ });
it('returns true', () => { /* ... */ });
it('works correctly', () => { /* ... */ });
```

## Unit Test Patterns

### Arrange-Act-Assert

```typescript
it('should detect X wins in top row', () => {
  // Arrange
  const board: CellValue[] = ['X', 'X', 'X', null, 'O', 'O', null, null, null];

  // Act
  const result = checkWin(board, 'X');

  // Assert
  expect(result).toBe(true);
});
```

### Test Edge Cases

```typescript
describe('makeMove', () => {
  it('should return unchanged state when game is over', () => {
    const wonState: GameState = {
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      currentPlayer: 'O',
      status: 'x-wins',
      playerNames: { X: 'Player 1', O: 'Player 2' },
    };

    const result = makeMove(wonState, 5);
    
    expect(result).toBe(wonState); // Exact same object reference returned (no new state object created)
  });

  it('should return unchanged state for occupied cell', () => {
    // Test implementation
  });
});
```

### Table-Driven Tests

```typescript
type DetermineStatusTestCase = {
  name: string;
  board: CellValue[];
  lastPlayer: 'X' | 'O';
  expected: 'x-wins' | 'o-wins';
};

describe('determineStatus', () => {
  const testCases: DetermineStatusTestCase[] = [
    {
      name: 'X horizontal win',
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      lastPlayer: 'X',
      expected: 'x-wins',
    },
    {
      name: 'O vertical win',
      board: ['O', 'X', 'X', 'O', null, null, 'O', null, null],
      lastPlayer: 'O',
      expected: 'o-wins',
    },
  ];

  testCases.forEach(({ name, board, lastPlayer, expected }) => {
    it(`should detect ${name}`, () => {
      expect(determineStatus(board, lastPlayer)).toBe(expected);
    });
  });
});
```

## E2E Test Patterns

### Page Setup with beforeEach

```typescript
test.describe('Tic-Tac-Toe Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display empty board initially', async ({ page }) => {
    // Test implementation
  });
});
```

### Use Accessible Locators

```typescript
// ✅ Good: Uses role-based and text locators
const newGameButton = page.getByRole('button', { name: /new game/i });
const status = page.getByText(/turn/i);
const cells = page.locator('.cell');

// ❌ Avoid: Fragile selectors
const button = page.locator('#btn-new-game');
const status = page.locator('div.status > span.text');
```

### Test User Journeys

```typescript
test('should complete a full game with X winning', async ({ page }) => {
  const cells = page.locator('.cell');

  // X wins with top row
  await cells.nth(0).click(); // X
  await cells.nth(3).click(); // O
  await cells.nth(1).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(2).click(); // X wins

  await expect(page.locator('.status')).toContainText(/wins/i);
});
```

### Use Test Steps for Complex Flows

```typescript
test('should handle complete game flow', async ({ page }) => {
  await test.step('Play initial moves', async () => {
    await page.locator('.cell').nth(0).click();
    await page.locator('.cell').nth(4).click();
  });

  await test.step('Verify game state', async () => {
    await expect(page.locator('.status')).toContainText("X's Turn");
  });
});
```

## What NOT to Do

- ❌ Write tests that depend on implementation details
- ❌ Test private functions directly—test through public API
- ❌ Leave `console.log` in tests
- ❌ Use `any` types in test code
- ❌ Write flaky tests that depend on timing
- ❌ Skip writing tests for edge cases

## Running Tests in CI Mode

When running E2E tests from scripts or terminal sessions, use CI mode to prevent Playwright from waiting for user input on failures:

```powershell
# PowerShell - Set CI environment variable
$env:CI='true'; npx playwright test

# Or run specific test file
$env:CI='true'; npx playwright test demo.spec.ts
```

```bash
# Bash/Linux/macOS
CI=true npx playwright test
```

**Why CI mode?** By default, Playwright may pause on test failure to show the error and wait for Ctrl+C. Setting `CI=true` ensures tests run non-interactively and exit automatically.
