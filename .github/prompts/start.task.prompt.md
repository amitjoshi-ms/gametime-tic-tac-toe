````prompt
# Start New Work

Sync main branch with remote and create a feature branch before starting any new work.

## Instructions

### Step 0: Verify Git Hooks

1. **Check git hooks are configured**:
   ```bash
   git config core.hooksPath
   ```
   - Should return `.githooks`
   - If empty or different, run: `git config core.hooksPath .githooks`

### Step 1: Sync Main Branch

1. **Stash any uncommitted changes** (if needed):
   ```bash
   git stash
   ```

2. **Switch to main branch**:
   ```bash
   git checkout main
   ```

3. **Fetch latest from remote**:
   ```bash
   git fetch origin
   ```

4. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

5. **Verify main is up to date**:
   ```bash
   git log --oneline -3
   ```

### Step 2: Create Feature Branch

6. **Create and switch to feature branch**:
   ```bash
   git checkout -b feature-<name>
   ```
   - Replace `<name>` with a descriptive name (e.g., `feature-add-score-tracking`)
   - Use kebab-case for branch names
   - Prefix with: `feature-`, `fix-`, `docs-`, `refactor-`, or `chore-`

7. **Verify you're on the new branch**:
   ```bash
   git branch --show-current
   ```

8. **Restore stashed changes** (if applicable):
   ```bash
   git stash pop
   ```

### Step 3: Ready to Work

9. **Confirm setup** - Display:
   - Current branch name
   - Latest commit on main (to confirm sync)
   - Working directory status

## Branch Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature-` | New features | `feature-multiplayer-mode` |
| `fix-` | Bug fixes | `fix-win-detection-edge-case` |
| `docs-` | Documentation | `docs-api-reference` |
| `refactor-` | Code refactoring | `refactor-game-state` |
| `chore-` | Maintenance tasks | `chore-update-dependencies` |

## Variables

- `$BRANCH_NAME` - The name for the new feature branch (optional, will prompt if not provided)

## Example Usage

```
# Start work on a new feature
Start new work on feature-add-undo-move

# Just sync main without creating a branch
Sync main branch to latest

# Start work (will prompt for branch name)
Start new work
```

````
