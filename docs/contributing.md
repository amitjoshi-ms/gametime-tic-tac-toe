# Contributing Guide

Thank you for your interest in contributing to Gametime Tic-Tac-Toe! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

### 1. Fork and Clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/<your-username>/gametime-tic-tac-toe.git
cd gametime-tic-tac-toe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Git Hooks

```bash
git config core.hooksPath .githooks
```

This prevents accidental commits to protected branches.

### 4. Verify Setup

```bash
npm test            # Unit tests
npm run lint        # Linting
npm run typecheck   # Type checking
```

## Branching Strategy

### Protected Branches

| Branch | Purpose | Direct Commits |
|--------|---------|----------------|
| `main` | Preview/Beta | ❌ No |
| `release` | Production | ❌ No |

### Creating Feature Branches

**Always create branches from an updated `main`:**

```bash
# Update main
git checkout main
git fetch origin
git pull origin main

# Create feature branch
git checkout -b feature-my-feature
```

### Branch Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature-` | New features | `feature-add-sound-effects` |
| `fix-` | Bug fixes | `fix-win-detection-bug` |
| `docs-` | Documentation | `docs-api-reference` |
| `refactor-` | Code refactoring | `refactor-state-management` |
| `test-` | Test additions | `test-edge-cases` |

## Making Changes

### 1. Write Tests First (TDD Encouraged)

```bash
npm run test:watch
```

Write failing tests, then implement the feature.

### 2. Follow Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Run `npm run lint` to check
- **Prettier**: Run `npm run format` to format

### 3. Keep Commits Focused

Each commit should represent a single logical change.

**Good commit messages:**
```
Add win detection for diagonal lines
Fix turn indicator not updating after draw
Update API documentation for state module
```

**Bad commit messages:**
```
Fixed stuff
WIP
Updates
```

### 4. Ensure All Checks Pass

Before pushing:

```bash
npm test          # All unit tests pass
npm run lint      # No linting errors
npm run typecheck # No type errors
npm run test:e2e  # E2E tests pass (optional but recommended)
```

## Pull Request Process

### 1. Push Your Branch

```bash
git push origin feature-my-feature
```

### 2. Create Pull Request

- Go to GitHub and create a PR against `main`
- Use a descriptive title
- Fill out the PR template

### 3. PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed the code
- [ ] Commented complex logic
- [ ] Updated documentation if needed
```

### 4. Address Review Feedback

- Respond to all comments
- Push additional commits as needed
- Request re-review when ready

### 5. Merge

- PRs are squash-merged to keep history clean
- Feature branch is automatically deleted after merge

## Code Standards

### TypeScript

```typescript
// ✅ Good: Explicit types, clear naming
function calculateWinner(board: CellValue[]): Player | null {
  // Implementation
}

// ❌ Bad: Implicit any, unclear naming
function calc(b) {
  // Implementation
}
```

### Pure Functions

Keep game logic pure (no side effects):

```typescript
// ✅ Good: Pure function
function checkWin(board: CellValue[], player: Player): boolean {
  return WINNING_LINES.some(([a, b, c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
}

// ❌ Bad: Side effect (modifies external state)
function checkWin(board: CellValue[], player: Player): boolean {
  lastCheckedPlayer = player; // Side effect!
  return /* ... */;
}
```

### Immutable State Updates

```typescript
// ✅ Good: Create new object
function makeMove(state: GameState, index: number): GameState {
  const newBoard = [...state.board];
  newBoard[index] = state.currentPlayer;
  return { ...state, board: newBoard };
}

// ❌ Bad: Mutate existing object
function makeMove(state: GameState, index: number): GameState {
  state.board[index] = state.currentPlayer; // Mutation!
  return state;
}
```

### Documentation

Document exported functions:

```typescript
/**
 * Checks if the given player has won the game.
 *
 * @param board - Current board state (9 elements)
 * @param player - Player to check ('X' or 'O')
 * @returns true if player has 3 marks in a row
 *
 * @example
 * const board = ['X', 'X', 'X', null, null, null, null, null, null];
 * checkWin(board, 'X'); // true
 */
export function checkWin(board: CellValue[], player: Player): boolean {
  // Implementation
}
```

## Testing Guidelines

### Unit Tests

Test pure functions thoroughly:

```typescript
describe('checkWin', () => {
  // Test all winning combinations
  it.each([
    [[0, 1, 2], 'top row'],
    [[3, 4, 5], 'middle row'],
    [[6, 7, 8], 'bottom row'],
    [[0, 3, 6], 'left column'],
    [[1, 4, 7], 'middle column'],
    [[2, 5, 8], 'right column'],
    [[0, 4, 8], 'diagonal'],
    [[2, 4, 6], 'anti-diagonal'],
  ])('detects win for %s', (indices, _name) => {
    const board = Array(9).fill(null);
    indices.forEach(i => board[i] = 'X');
    expect(checkWin(board, 'X')).toBe(true);
  });

  // Test edge cases
  it('returns false for empty board', () => {
    const board = Array(9).fill(null);
    expect(checkWin(board, 'X')).toBe(false);
  });
});
```

### E2E Tests

Test user flows:

```typescript
test('complete game flow', async ({ page }) => {
  await page.goto('/');

  // Play a game to X winning
  await page.click('[data-index="0"]'); // X
  await page.click('[data-index="3"]'); // O
  await page.click('[data-index="1"]'); // X
  await page.click('[data-index="4"]'); // O
  await page.click('[data-index="2"]'); // X wins

  // Verify win message
  await expect(page.locator('.status')).toContainText('Wins');
});
```

## Adding New Features

### Feature Development Workflow

1. **Discuss first**: Open an issue to discuss the feature
2. **Get approval**: Wait for maintainer feedback
3. **Create branch**: `feature-my-feature`
4. **Write spec**: Add acceptance criteria
5. **Write tests**: TDD approach
6. **Implement**: Code the feature
7. **Document**: Update docs if needed
8. **PR**: Submit for review

### Checklist for New Features

- [ ] Added/updated types in `game/types.ts`
- [ ] Implemented logic in `game/logic.ts`
- [ ] Updated state management in `game/state.ts`
- [ ] Updated UI components in `ui/`
- [ ] Added unit tests
- [ ] Added E2E tests
- [ ] Updated documentation
- [ ] Tested on mobile/tablet/desktop
- [ ] Verified accessibility

## Reporting Issues

### Bug Reports

Include:

1. **Description**: What happened vs. what you expected
2. **Steps to reproduce**: Exact steps to trigger the bug
3. **Environment**: Browser, OS, screen size
4. **Screenshots/Videos**: If applicable
5. **Console errors**: Any JavaScript errors

### Feature Requests

Include:

1. **Problem**: What problem does this solve?
2. **Solution**: How would this feature work?
3. **Alternatives**: Other solutions considered
4. **User impact**: Who benefits and how?

## Questions?

- Check existing [issues](https://github.com/amitjoshi-ms/gametime-tic-tac-toe/issues) first
- Open a new issue with the `question` label
- Be specific about what you need help with

---

Thank you for contributing! 🎉
