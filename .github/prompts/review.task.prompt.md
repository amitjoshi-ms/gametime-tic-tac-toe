---
description: Code review and pre-commit validation for this project
mode: agent
instructions:
  - typescript.instructions.md
  - testing.instructions.md
  - security.instructions.md
  - performance.instructions.md
  - game-logic.instructions.md
  - ui.instructions.md
  - tooling.instructions.md
---

# Code Review

Review current changes for quality, security, and commit readiness.

## Step 1: Get Changes

```bash
git diff --stat                # Overview of changed files
git diff                       # Unstaged changes
git diff --cached              # Staged changes
```

## Step 2: Run Quality Gates

```bash
npm run typecheck              # TypeScript compilation
npm run lint                   # ESLint
npm test                       # Unit tests
npm run test:e2e               # E2E tests (if UI changed)
npm run build                  # Build succeeds
```

## Step 3: Review Checklist

### Code Quality
- [ ] No `any` types (use `unknown` + narrowing)
- [ ] Pure functions in `src/game/` (no DOM, no side effects)
- [ ] Immutable state transitions (new objects, no mutation)
- [ ] JSDoc on exported functions
- [ ] No `console.log` in production code

### Testing
- [ ] New logic has unit tests in `tests/unit/`
- [ ] UI changes have E2E tests in `tests/e2e/`
- [ ] Tests use descriptive names
- [ ] Edge cases covered

### Security
- [ ] No hardcoded secrets
- [ ] User input validated/sanitized
- [ ] DOM manipulation uses safe patterns (no innerHTML with user data)
- [ ] localStorage only for non-sensitive data

### Performance
- [ ] DOM updates batched where possible
- [ ] No unnecessary re-renders
- [ ] Event listeners properly managed

### Branch Compliance
- [ ] On feature branch (not `main` or `release`)
- [ ] Branch name follows convention (`feature-`, `fix-`, etc.)

## Step 4: Output Format

### Summary

| Category | Status | Issues |
|----------|--------|--------|
| TypeScript | ✅/❌ | - |
| Testing | ✅/❌ | - |
| Security | ✅/❌ | - |
| Performance | ✅/❌ | - |

### Findings

For each issue:
- **Severity**: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low
- **File**: `path/to/file.ts:line`
- **Issue**: Description
- **Fix**: Recommended solution

### Verdict

**✅ READY TO COMMIT** | **⚠️ MINOR ISSUES** | **❌ NEEDS FIXES**
