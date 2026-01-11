# Submit PR for Review

Create a pull request and squash merge via GitHub (remote only - never merge locally).

## Important

- **NEVER** use local `git merge` commands to merge into `main` or `release`
- **ALWAYS** use GitHub Pull Requests for merging
- Squash merges are enforced at the repository level
- The pre-commit hook blocks local commits to `main` and `release`

## Instructions

### Step 1: Create Pull Request (if not exists)
1. **Check current branch** - Identify the feature branch name (must NOT be `main` or `release`)
2. **Push branch to remote** - Ensure all commits are pushed: `git push -u origin <branch-name>`
3. **Determine target branch** - Feature branches target `main`, release merges target `release`
4. **Create PR via GitHub API** - Create a pull request with:
   - Clear, descriptive title summarizing the changes
   - Body describing what changed and why
   - Link to any related issues
5. **Request Copilot review** - Automatically request GitHub Copilot code review for the PR

### Step 2: Validate PR (before merge)
6. **Verify CI status** - Confirm all CI checks have passed
7. **Check Copilot review** - Review and address any Copilot feedback
8. **Check approval status** - Ensure the PR has been approved by reviewers (if required)
9. **Review changes** - Summarize the key changes in the PR

### Step 3: Squash Merge via GitHub (when ready)
10. **Verify target branch** - Confirm the PR targets the correct branch:
    - Feature PRs should target `main` (for beta testing)
    - Release PRs should merge `main` into `release` (for production)
11. **Squash merge via GitHub API** - Use `gh pr merge --squash` or GitHub MCP tools:
    - Uses the PR title as the commit title
    - Includes PR number reference (e.g., `(#123)`)
    - Summarizes all changes in the commit body
12. **Delete feature branch** (optional) - Clean up after merge: `git branch -d <branch-name>`

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
