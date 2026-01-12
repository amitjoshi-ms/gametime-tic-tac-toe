---
description: Deploy latest changes from main to production via release workflow
mode: agent
---

# Release to Production

Deploy the latest changes from `main` branch to production by triggering the release workflow.

## Repository Info

- **Repository:** `amitjoshi-ms/gametime-tic-tac-toe`
- **Production URL:** https://gametime-tic-tac-toe.pages.dev

## Instructions

Execute these steps in order. Each step includes both **PowerShell** and **bash** commands.

> **⚠️ Critical:** If any step fails after unlocking the branch, immediately skip to Step 6 to re-lock it before troubleshooting.

---

### Step 1: Verify Prerequisites

Verify GitHub CLI is installed and authenticated:

**PowerShell:**
```powershell
gh auth status
```

**bash:**
```bash
gh auth status
```

If not authenticated, run `gh auth login` first.

---

### Step 2: Check Current Branch Protection (Optional)

Verify the release branch is currently locked:

**PowerShell:**
```powershell
gh api "repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection" --jq '{lock_branch: .lock_branch.enabled, enforce_admins: .enforce_admins.enabled}'
```

**bash:**
```bash
gh api "repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection" --jq '{lock_branch: .lock_branch.enabled, enforce_admins: .enforce_admins.enabled}'
```

Expected: `{"lock_branch":true,"enforce_admins":true}`

---

### Step 3: Unlock the Release Branch

Temporarily unlock to allow the release workflow to push:

**PowerShell:**
```powershell
'{"required_status_checks":null,"enforce_admins":false,"required_pull_request_reviews":null,"restrictions":null,"lock_branch":false,"allow_force_pushes":false,"allow_deletions":false}' | gh api "repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection" -X PUT -H "Accept: application/vnd.github+json" --input -
```

**bash:**
```bash
echo '{"required_status_checks":null,"enforce_admins":false,"required_pull_request_reviews":null,"restrictions":null,"lock_branch":false,"allow_force_pushes":false,"allow_deletions":false}' | gh api "repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection" -X PUT -H "Accept: application/vnd.github+json" --input -
```

Verify response shows `"lock_branch": {"enabled": false}`.

---

### Step 4: Trigger the Release Workflow

**PowerShell:**
```powershell
gh workflow run release-to-production.yml -f confirm=release
Write-Host "Waiting for workflow to register..."
Start-Sleep -Seconds 3
```

**bash:**
```bash
gh workflow run release-to-production.yml -f confirm=release
echo "Waiting for workflow to register..."
sleep 3
```

---

### Step 5: Wait for Workflow Completion

Check the workflow status:

**PowerShell:**
```powershell
$run_id = (gh run list --workflow=release-to-production.yml --limit 1 --json databaseId --jq '.[0].databaseId')
Write-Host "Watching workflow run $run_id..."
gh run watch $run_id
```

**bash:**
```bash
run_id=$(gh run list --workflow=release-to-production.yml --limit 1 --json databaseId --jq '.[0].databaseId')
echo "Watching workflow run $run_id..."
gh run watch "$run_id"
```

**Alternative:** Check status without watching:

**PowerShell/bash:**
```bash
gh run list --workflow=release-to-production.yml --limit 1 --json status,conclusion,databaseId,displayTitle
```

Wait until `"status": "completed"` and `"conclusion": "success"`.

**If workflow fails**, inspect logs:
```bash
gh run view RUN_ID --log-failed
```

---

### Step 6: Re-lock the Release Branch

**⚠️ Always run this step** after the workflow completes (success or failure):

**PowerShell:**
```powershell
'{"required_status_checks":null,"enforce_admins":true,"required_pull_request_reviews":null,"restrictions":null,"lock_branch":true,"allow_force_pushes":false,"allow_deletions":false}' | gh api "repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection" -X PUT -H "Accept: application/vnd.github+json" --input -
```

**bash:**
```bash
echo '{"required_status_checks":null,"enforce_admins":true,"required_pull_request_reviews":null,"restrictions":null,"lock_branch":true,"allow_force_pushes":false,"allow_deletions":false}' | gh api "repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection" -X PUT -H "Accept: application/vnd.github+json" --input -
```

Verify the branch is locked:

```bash
gh api "repos/amitjoshi-ms/gametime-tic-tac-toe/branches/release/protection" --jq '{lock_branch: .lock_branch.enabled, enforce_admins: .enforce_admins.enabled}'
```

Expected: `{"lock_branch":true,"enforce_admins":true}`

---

### Step 7: Verify Deployment

After successful workflow completion, verify the production deployment at: https://gametime-tic-tac-toe.pages.dev

**Checklist:**
- [ ] Site loads successfully (no 4xx/5xx errors)
- [ ] UI renders correctly (no console errors)
- [ ] Released changes are visible
- [ ] Basic gameplay works (start game, make moves, check status)

---

## Quick Reference

| Step | Action | Critical |
|------|--------|----------|
| 1 | Verify `gh` auth | ✓ |
| 2 | Check branch status | Optional |
| 3 | Unlock branch | ✓ |
| 4 | Trigger workflow | ✓ |
| 5 | Wait for completion | ✓ |
| 6 | Re-lock branch | ✓ **Always** |
| 7 | Verify deployment | ✓ |

## Notes

- All changes in `main` should already be reviewed and tested
- The release branch is locked by default to prevent direct changes
- Only this workflow can update the release branch
- **Always re-lock the branch**, even if the workflow fails

## Error Handling

| Issue | Action |
|-------|--------|
| Workflow not found | Wait 5-10 seconds, retry `gh run list` |
| Workflow failed | Run `gh run view RUN_ID --log-failed`, then re-lock branch |
| API rate limit | Wait a few minutes, retry |
| Network error | Verify branch protection status, manually re-lock if needed |
| Branch left unlocked | Immediately run Step 6 to re-lock |
