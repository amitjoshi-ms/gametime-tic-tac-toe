---
description: Deploy latest changes from main to production via release workflow
mode: agent
---

# Release to Production

Deploy the latest changes from `main` branch to production by triggering the release workflow.

## Instructions

Execute these steps in order:

### 1. Unlock the release branch

```bash
gh api repos/{owner}/{repo}/branches/release/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks=null" \
  -F "enforce_admins=false" \
  -f "required_pull_request_reviews=null" \
  -f "restrictions=null" \
  -F "lock_branch=false" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false"
```

### 2. Trigger the release workflow

```bash
gh workflow run release-to-production.yml -f confirm=release
```

### 3. Poll for workflow completion

Wait a few seconds, then check status:

```bash
gh run list --workflow=release-to-production.yml --limit 1
```

Repeat until status shows `✓` (success) or `X` (failure). If failed, check logs:

```bash
gh run view <run-id> --log-failed
```

### 4. Lock the release branch

Regardless of success or failure, always re-lock:

```bash
gh api repos/{owner}/{repo}/branches/release/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks=null" \
  -F "enforce_admins=true" \
  -f "required_pull_request_reviews=null" \
  -f "restrictions=null" \
  -F "lock_branch=true" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false"
```

### 5. Verify deployment

After successful workflow completion, check production at: https://gametime-tic-tac-toe.pages.dev

## Notes

- All changes in `main` should already be reviewed and tested
- The release branch is locked by default to prevent direct changes
- Only this workflow (via the prompt) can update the release branch
- Production URL: `gametime-tic-tac-toe.pages.dev`
