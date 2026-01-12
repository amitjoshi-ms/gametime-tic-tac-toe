---
description: Deploy latest changes from main to production via release workflow
mode: agent
---

# Release to Production

Deploy the latest changes from `main` branch to production by triggering the release workflow.

## Instructions

Execute these steps in order:

### 1. Verify prerequisites

Before starting, verify that the GitHub CLI is installed and authenticated:

```bash
# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) is not installed."
  echo "Please install it from: https://cli.github.com/"
  exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
  echo "Error: Not authenticated with GitHub CLI."
  echo "Please run: gh auth login"
  exit 1
fi

echo "✓ GitHub CLI is installed and authenticated"
```

### 2. Set up error handling to guarantee branch re-lock

Before starting, set up a trap to ensure the branch is always re-locked, even if steps fail.

**⚠️ Important: Run in a subshell or script file**

The trap handler below runs on shell EXIT. If you run these commands in an interactive shell, the trap will only fire when you exit the shell entirely, not when the release steps complete. To ensure proper cleanup:

**Option A (Recommended): Run in a subshell**
```bash
(
  # Repository identifier
  REPO="amitjoshi-ms/gametime-tic-tac-toe"

  # Function to lock the branch (safe to call even if already locked)
  lock_branch() {
    echo "Re-locking release branch..."
    gh api "repos/$REPO/branches/release/protection" -X PUT \
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

  # ... rest of the steps go here in the subshell ...
)
```

**Option B: Explicit cleanup at the end**

If you prefer to run commands directly in your interactive shell, skip the trap setup and instead **explicitly call the lock function after step 5** (or immediately if any step fails):

```bash
# Reminder: Do NOT rely on `set -e` here; handle errors explicitly.
# If any step fails, call lock_branch before exiting to ensure the branch is re-locked.

# Repository identifier
REPO="amitjoshi-ms/gametime-tic-tac-toe"

# Function to lock the branch (safe to call even if already locked)
lock_branch() {
  echo "Re-locking release branch..."
  gh api "repos/$REPO/branches/release/protection" -X PUT \
    -H "Accept: application/vnd.github+json" \
    -f "required_status_checks=null" \
    -F "enforce_admins=true" \
    -f "required_pull_request_reviews=null" \
    -f "restrictions=null" \
    -F "lock_branch=true" \
    -F "allow_force_pushes=false" \
    -F "allow_deletions=false"
}

# Note: Call lock_branch explicitly after step 5 or if any step fails
```

**Important:** If the trap handler fails (e.g., due to network issues or API failures), the branch may remain unlocked. In such cases, manually verify and re-lock the branch using the command in step 8.

### 3. Check current branch protection status (optional)

Before unlocking, you can verify the current branch protection state:

```bash
gh api "repos/$REPO/branches/release/protection" --jq '{lock_branch: .lock_branch.enabled, enforce_admins: .enforce_admins.enabled}'
```

### 4. Unlock the release branch

```bash
# Temporarily disable admin enforcement to allow release workflow / admin push
gh api "repos/$REPO/branches/release/protection" -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks=null" \
  -F "enforce_admins=false" \
  -f "required_pull_request_reviews=null" \
  -f "restrictions=null" \
  -F "lock_branch=false" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false"
```

### 5. Trigger the release workflow

```bash
gh workflow run release-to-production.yml -f confirm=release

# Give GitHub API time to register the workflow trigger
echo "Waiting for workflow to be registered..."
sleep 3
```

### 6. Wait for workflow completion

Automatically wait for the workflow to complete:

```bash
# Wait for the workflow run to appear and get the latest run ID
max_attempts=5
sleep_seconds=5

attempt=1
while [ "$attempt" -le "$max_attempts" ]; do
  run_id=$(gh run list --workflow=release-to-production.yml --limit 1 --json databaseId --jq '.[0].databaseId')

  if [ -n "$run_id" ] && [ "$run_id" != "null" ]; then
    break
  fi

  echo "Workflow run not found yet (attempt $attempt/$max_attempts). Waiting ${sleep_seconds}s..."
  attempt=$((attempt + 1))
  sleep "$sleep_seconds"
done

# Check if a run ID was found before attempting to watch
if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
  echo "Error: No workflow run found after waiting $((max_attempts * sleep_seconds)) seconds."
  echo "The workflow may not have been triggered yet or may be delayed."
  echo "Try checking manually with: gh run list --workflow=release-to-production.yml"
  echo "If you are using Option B (explicit cleanup), the branch will NOT be re-locked automatically in this error case."
  echo "Manually re-lock the branch before retrying the deployment."
  exit 1
fi

# Watch the workflow run, and handle failures explicitly
gh run watch "$run_id"
status=$?
if [ "$status" -ne 0 ]; then
  echo "Error: Failed to watch workflow run $run_id (exit status: $status)."
  echo "The workflow may have failed or encountered an error."
  echo "You can inspect the run manually with: gh run view \"$run_id\" --log-failed"
  exit "$status"
fi
```

**If using Option B (explicit cleanup):** After the workflow completes successfully, immediately re-lock the branch:

```bash
lock_branch
```

If the workflow fails, check logs:

You can inspect the run manually with:

```bash
# List recent runs for the release workflow
gh run list --workflow=release-to-production.yml --limit 5

# Then inspect a specific run (replace RUN_ID with the actual run ID from the list above)
gh run view RUN_ID --log-failed  # inspect a specific run
```

### 7. Verify deployment

After successful workflow completion, check production at: https://gametime-tic-tac-toe.pages.dev

**Note:** 
- If using **Option A** (subshell with trap), the branch will automatically re-lock when the subshell exits.
- If using **Option B** (explicit cleanup), ensure you called `lock_branch` after step 5.

### 8. Manual re-lock (if needed)

If you encounter errors or the trap handler fails to re-lock the branch automatically, manually re-lock it:

```bash
gh api repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks=null" \
  -F "enforce_admins=true" \
  -f "required_pull_request_reviews=null" \
  -f "restrictions=null" \
  -F "lock_branch=true" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false"
```

Then verify the branch is locked:

```bash
gh api repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection --jq '{lock_branch: .lock_branch.enabled, enforce_admins: .enforce_admins.enabled}'
```

Expected output:
```json
{
  "lock_branch": true,
  "enforce_admins": true
}
```

## Notes

- All changes in `main` should already be reviewed and tested
- The release branch is locked by default to prevent direct changes
- Only this workflow (via the prompt) can update the release branch
- Production URL: `gametime-tic-tac-toe.pages.dev`

### Error Handling

- **Trap handler failures:** If the trap handler fails to re-lock the branch (e.g., due to network issues or GitHub API failures), you must manually verify the branch protection status using the verification command shown in section 3 and manually re-lock using the command shown in section 8 (Manual re-lock)
- **Network issues:** If you lose network connectivity during the process, the trap may not execute. Always verify branch protection status after errors
- **API rate limits:** GitHub API calls may fail due to rate limiting. Wait a few minutes and retry the manual re-lock command
