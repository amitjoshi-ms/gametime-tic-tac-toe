---
description: Deploy latest changes from main to production via release workflow
mode: agent
---

# Release to Production

Deploy the latest changes from `main` branch to production by triggering the release workflow.

## Instructions

Execute these steps in order:

### 1. Set up error handling to guarantee branch re-lock

Before starting, set up a trap to ensure the branch is always re-locked, even if steps fail:

```bash
# Function to lock the branch (safe to call even if already locked)
lock_branch() {
  echo "Re-locking release branch..."
  gh api repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection -X PUT \
    -H "Accept: application/vnd.github+json" \
    -f "required_status_checks=null" \
    -F "enforce_admins=true" \
    -f "required_pull_request_reviews=null" \
    -f "restrictions=null" \
    -F "lock_branch=true" \
    -F "allow_force_pushes=false" \
    -F "allow_deletions=false"
}

# Set up trap to always re-lock on exit (success, failure, or interruption)
trap lock_branch EXIT
```

### 2. Unlock the release branch

```bash
gh api repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks=null" \
  # Temporarily disable admin enforcement to allow release workflow / admin push
  -F "enforce_admins=false" \
  -f "required_pull_request_reviews=null" \
  -f "restrictions=null" \
  -F "lock_branch=false" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false"
```

### 3. Trigger the release workflow

```bash
gh workflow run release-to-production.yml -f confirm=release
```

### 4. Wait for workflow completion

Automatically wait for the workflow to complete:

```bash
# Get the latest run ID
RUN_ID=$(gh run list --workflow=release-to-production.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Check if a run ID was found before attempting to watch
if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo "Error: No workflow run found. The workflow may not have been triggered yet."
  echo "Wait a few seconds and try checking manually with: gh run list --workflow=release-to-production.yml"
  exit 1
fi

# Watch the workflow run
gh run watch "$RUN_ID"
```

If the workflow fails, check logs:

```bash
# Get the latest run ID
RUN_ID=$(gh run list --workflow=release-to-production.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Check if a run ID was found
if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo "Error: No workflow run found."
  exit 1
fi

# View the failed logs
gh run view "$RUN_ID" --log-failed
```

### 5. Verify deployment

After successful workflow completion, check production at: https://gametime-tic-tac-toe.pages.dev

**Note:** The branch will automatically re-lock when the shell session exits, thanks to the trap handler set up in step 1.

## Notes

- All changes in `main` should already be reviewed and tested
- The release branch is locked by default to prevent direct changes
- Only this workflow (via the prompt) can update the release branch
- Production URL: `gametime-tic-tac-toe.pages.dev`
