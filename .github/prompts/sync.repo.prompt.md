---
description: Sync local Git repository with remote, cleanup stale branches, and optimize storage
mode: agent
---

# Sync and Clean Local Repository

Sync the local Git repository with the remote, clean up stale branches, and optimize storage.

## Modes

- **Standard sync** (default): Fetch, prune remote-deleted branches, garbage collect
- **Aggressive cleanup**: Only when the user explicitly asks for "aggressive" cleanup - also removes all untracked and ignored files

> **Important:** Only run aggressive cleanup commands (`git clean -fdx`) when the user explicitly requests "aggressive cleanup". The standard sync should never delete untracked files.

## Instructions

Run the following commands in sequence. Use PowerShell commands when available, otherwise fallback to sh/bash.

1. **Fetch all remotes and prune deleted remote-tracking branches:**
   
   **PowerShell:**
   ```powershell
   git fetch --all --prune
   ```
   
   **sh/bash:**
   ```bash
   git fetch --all --prune
   ```

2. **Delete local branches whose remote-tracking branch has been deleted:**
   
   **PowerShell:**
   ```powershell
   git branch -vv | Where-Object { $_ -match '\[origin/.*: gone\]' } | ForEach-Object { ($_ -split '\s+')[1] } | ForEach-Object { git branch -D $_ }
   ```
   
   **sh/bash:**
   ```bash
   if git branch -vv | grep -q ': gone]'; then
     git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -D
   fi
   ```

3. **Garbage collect and optimize the repository:**
   
   **PowerShell:**
   ```powershell
   git gc --prune=now
   ```
   
   **sh/bash:**
   ```bash
   git gc --prune=now
   ```

4. **Display remaining branches:**
   
   **PowerShell:**
   ```powershell
   git branch -a
   ```
   
   **sh/bash:**
   ```bash
   git branch -a
   ```

## One-liner

**PowerShell:**
```powershell
git fetch --all --prune; git branch -vv | Where-Object { $_ -match '\[origin/.*: gone\]' } | ForEach-Object { ($_ -split '\s+')[1] } | ForEach-Object { git branch -D $_ }; git gc --prune=now; git branch -a
```

**sh/bash:**
```bash
git fetch --all --prune && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -D && git gc --prune=now && git branch -a
```

## Aggressive Cleanup

When requested, also remove all untracked and ignored files to restore the repository to a pristine state.

> ⚠️ **Warning:** This will permanently delete uncommitted work, untracked files, build artifacts, and anything in `.gitignore`. Always review and confirm before proceeding!

### Step-by-Step Process

1. **Show uncommitted changes that will be lost:**
   
   **PowerShell:**
   ```powershell
   git status
   git diff
   git diff --staged
   ```
   
   **sh/bash:**
   ```bash
   git status
   git diff
   git diff --staged
   ```

2. **Preview untracked/ignored files that will be deleted (dry run):**
   
   **PowerShell:**
   ```powershell
   git clean -fdxn
   ```
   
   **sh/bash:**
   ```bash
   git clean -fdxn
   ```

3. **Ask for user confirmation:**
   - Review the output from steps 1 and 2
   - Confirm with the user: "The above files and changes will be permanently deleted. Do you want to proceed with cleanup?"
   - **Only proceed if user explicitly confirms (e.g., responds with "yes", "confirm", or "proceed")**

4. **After confirmation, remove all untracked and ignored files:**
   
   **PowerShell:**
   ```powershell
   git clean -fdx
   ```
   
   **sh/bash:**
   ```bash
   git clean -fdx
   ```

> **Note:** Never run `git clean -fdx` without first showing the preview and getting explicit user approval.

### Aggressive Cleanup One-liner

**PowerShell:**
```powershell
git fetch --all --prune; git branch -vv | Where-Object { $_ -match '\[origin/.*: gone\]' } | ForEach-Object { ($_ -split '\s+')[1] } | ForEach-Object { git branch -D $_ }; git clean -fdx; git gc --prune=now --aggressive; git branch -a
```

**sh/bash:**
```bash
git fetch --all --prune && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -D && git clean -fdx && git gc --prune=now --aggressive && git branch -a
```

## What This Does

| Step | Purpose |
|------|---------|
| `fetch --all --prune` | Downloads latest from all remotes, removes stale remote-tracking refs |
| Delete gone branches | Removes local branches that no longer exist on remote |
| `clean -fdx` | **(Aggressive)** Removes untracked files (`-f`), directories (`-d`), and ignored files (`-x`) |
| `gc --prune=now` | Cleans up unnecessary files and optimizes the local repository |
| `gc --prune=now --aggressive` | **(Aggressive)** More thorough optimization (slower, used only in aggressive cleanup mode) |
| `branch -a` | Shows all remaining local and remote branches |

````
