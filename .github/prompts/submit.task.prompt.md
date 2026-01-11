# Submit PR for Review

Create a pull request and optionally squash merge after validation.

## Instructions

### Step 1: Create Pull Request (if not exists)
1. **Check current branch** - Identify the feature branch name
2. **Determine target branch** - Feature branches target `main`, release merges target `release`
3. **Create PR** - Create a pull request with:
   - Clear, descriptive title summarizing the changes
   - Body describing what changed and why
   - Link to any related issues

### Step 2: Validate PR (before merge)
4. **Verify CI status** - Confirm all CI checks have passed
5. **Check approval status** - Ensure the PR has been approved by reviewers (if required)
6. **Review changes** - Summarize the key changes in the PR

### Step 3: Squash Merge (when ready)
7. **Verify target branch** - Confirm the PR targets the correct branch:
   - Feature PRs should target `main` (for beta testing)
   - Release PRs should merge `main` into `release` (for production)
8. **Squash merge** - Merge using squash method with a clear commit message that:
   - Uses the PR title as the commit title
   - Includes PR number reference (e.g., `(#123)`)
   - Summarizes all changes in the commit body

## Branch Strategy

| PR Type | Source | Target | Purpose |
|---------|--------|--------|---------|
| Feature | `feature-*`, `docs/*`, etc. | `main` | Merge features for beta testing |
| Release | `main` | `release` | Deploy to production |

## Variables

- `$PR_NUMBER` - The pull request number (if merging existing PR)
- `$REPO_OWNER` - Repository owner (default: infer from git remote)
- `$REPO_NAME` - Repository name (default: infer from git remote)

## Example Usage

```
# Create PR for current branch and merge when ready
Submit PR for the current branch to main.

# Just merge an existing PR
Squash merge PR #42 after confirming all checks pass.
```
