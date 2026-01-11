# Squash Merge PR

Review and squash merge a pull request after validation.

## Instructions

1. **Get PR details** - Fetch the pull request information including title, description, and changed files
2. **Verify CI status** - Confirm all CI checks have passed
3. **Check approval status** - Ensure the PR has been approved by reviewers
4. **Review changes** - Summarize the key changes in the PR
5. **Squash merge** - Merge using squash method with a clear commit message that:
   - Uses the PR title as the commit title
   - Includes PR number reference (e.g., `(#123)`)
   - Summarizes all changes in the commit body

## Variables

- `$PR_NUMBER` - The pull request number to merge
- `$REPO_OWNER` - Repository owner (default: infer from git remote)
- `$REPO_NAME` - Repository name (default: infer from git remote)

## Example Usage

```
Squash merge PR #42 after confirming all checks pass and it's approved.
```
