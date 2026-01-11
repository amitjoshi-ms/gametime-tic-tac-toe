---
description: Sync local Git repository with remote, cleanup stale branches, and optimize storage
---

# Sync and Clean Local Repository

Sync the local Git repository with the remote, clean up stale branches, and optimize storage.

## Modes

- **Standard sync** (default): Fetch, prune remote-deleted branches, garbage collect
- **Aggressive cleanup**: Only when user explicitly asks for "aggressive" cleanup - also removes all untracked and ignored files

> **Important:** Only run aggressive cleanup commands (`git clean -fdx`) when the user explicitly requests "aggressive cleanup". The standard sync should never delete untracked files.

## Instructions

Run the following commands in sequence:

1. **Fetch all remotes and prune deleted remote-tracking branches:**
   ```powershell
   git fetch --all --prune
   ```

2. **Delete local branches whose remote tracking branch has been deleted:**
   ```powershell
   git branch -vv | Where-Object { $_ -match '\[origin/.*: gone\]' } | ForEach-Object { ($_ -split '\s+')[1] } | ForEach-Object { git branch -D $_ }
   ```

3. **Garbage collect and optimize the repository:**
   ```powershell
   git gc --prune=now --aggressive
   ```

4. **Display remaining branches:**
   ```powershell
   git branch -a
   ```

## One-liner (PowerShell)

```powershell
git fetch --all --prune; git branch -vv | Where-Object { $_ -match '\[origin/.*: gone\]' } | ForEach-Object { ($_ -split '\s+')[1] } | ForEach-Object { git branch -D $_ }; git gc --prune=now --aggressive; git branch -a
```

## Aggressive Cleanup

When requested, also remove all untracked and ignored files to restore the repository to a pristine state.

> ⚠️ **Warning:** This will permanently delete untracked files, build artifacts, and anything in `.gitignore`. Make sure you don't have uncommitted work you want to keep!

1. **Preview what will be deleted (dry run):**
   ```powershell
   git clean -fdxn
   ```

2. **Remove all untracked and ignored files:**
   ```powershell
   git clean -fdx
   ```

### Aggressive Cleanup One-liner (PowerShell)

```powershell
git fetch --all --prune; git branch -vv | Where-Object { $_ -match '\[origin/.*: gone\]' } | ForEach-Object { ($_ -split '\s+')[1] } | ForEach-Object { git branch -D $_ }; git clean -fdx; git gc --prune=now --aggressive; git branch -a
```

## What This Does

| Step | Purpose |
|------|---------|
| `fetch --all --prune` | Downloads latest from all remotes, removes stale remote-tracking refs |
| Delete gone branches | Removes local branches that no longer exist on remote |
| `clean -fdx` | **(Aggressive)** Removes untracked files (`-f`), directories (`-d`), and ignored files (`-x`) |
| `gc --prune=now --aggressive` | Cleans up unnecessary files and optimizes the local repository |
| `branch -a` | Shows all remaining local and remote branches |
