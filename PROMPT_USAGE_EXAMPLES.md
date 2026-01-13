# Prompt Usage Examples

This document provides practical examples of how to use the prompt files in `.github/prompts/` with GitHub Copilot Chat.

## Task Prompts

### `start.task.prompt.md`

**Purpose:** Set up a new feature branch and understand the task before making changes.

**Usage:**
```
@workspace /start I need to add a score tracking feature to the game
```

**What it does:**
1. Creates a properly named feature branch (e.g., `feature-score-tracking`)
2. Ensures you're synced with `main`
3. Guides you through understanding the task structure
4. Verifies TypeScript, linting, and tests are passing
5. References instruction files: `typescript`, `game-logic`, `testing`, `ui`

---

### `review.task.prompt.md`

**Purpose:** Comprehensive code review before committing changes.

**Usage:**
```
@workspace /review
```

**What it does:**
1. Reviews all current changes (staged and unstaged)
2. Runs quality gates (typecheck, lint, tests)
3. Checks against 7 instruction files:
   - TypeScript standards
   - Testing requirements
   - Security best practices
   - Performance guidelines
   - Game logic patterns
   - UI conventions
   - Tooling configuration
4. Provides severity-rated findings and recommendations

**Example output:**
```
| Category | Status | Issues |
|----------|--------|--------|
| TypeScript | ✅ | - |
| Testing | ❌ | Missing E2E test for new UI component |
| Security | ✅ | - |

Verdict: ⚠️ MINOR ISSUES
```

---

### `sync.repo.prompt.md`

**Purpose:** Sync local repository with remote and clean up stale branches.

**Usage:**
```
@workspace /sync
```

**Standard sync (safe):**
- Fetches latest from remote
- Prunes deleted remote-tracking branches
- Removes local branches whose remotes are gone
- Runs garbage collection

**Aggressive cleanup:**
```
@workspace /sync aggressive
```
- All standard sync actions
- **⚠️ WARNING**: Also removes ALL untracked and ignored files
- Shows preview before destructive actions
- Requires explicit user confirmation

**References:** `ai-config.instructions.md` for workflow standards

---

### `submit.task.prompt.md`

**Purpose:** Create pull request and manage merge via GitHub.

**Usage:**
```
@workspace /submit
```

**What it does:**
1. Pushes current branch to remote
2. Creates PR with descriptive title and body
3. Requests Copilot code review
4. Validates CI status
5. Squash merges when ready (never local merge)
6. Cleans up local branch after merge

**References:** `typescript-types`, `typescript-modules`, `typescript-patterns`, `testing`, `security`, `ai-config` instruction files

**Important notes:**
- Never merges locally—always via GitHub PR
- Squash merges are enforced at repository level
- Pre-commit hooks block direct commits to `main` or `release`

---

### `release.latest.prompt.md`

**Purpose:** Deploy latest changes from `main` to production.

**Usage:**
```
@workspace /release
```

**What it does:**
1. Verifies GitHub CLI is authenticated
2. Temporarily unlocks `release` branch
3. Triggers `release-to-production.yml` workflow
4. Monitors workflow completion
5. **ALWAYS** re-locks `release` branch (even if workflow fails)
6. Verifies deployment at production URL

**References:** `ai-config.instructions.md` for release workflow standards

**⚠️ Critical:** Always re-locks the release branch, regardless of success/failure

---

## Speckit Prompts (Agent Delegation)

These prompts delegate to specialized custom agents for specification-driven development workflows.

### `speckit.specify.prompt.md`

**Purpose:** Create feature specification from natural language description.

**Usage:**
```
@workspace /speckit.specify Add user authentication with OAuth2 support
```

**What it does:**
1. Generates short branch name (e.g., `1-user-auth`)
2. Creates feature branch and spec directory
3. Writes detailed specification in `specs/1-user-auth/spec.md`
4. Validates spec quality
5. Identifies clarification questions (max 3)

**Delegates to:** `speckit.specify` custom agent

---

### `speckit.plan.prompt.md`

**Purpose:** Generate technical implementation plan from specification.

**Usage:**
```
@workspace /speckit.plan
```

**What it does:**
1. Loads feature spec and constitution
2. Creates implementation plan with phases
3. Generates research tasks for unknowns
4. Creates data models and API contracts
5. Updates agent context files

**Delegates to:** `speckit.plan` custom agent

---

### Other Speckit Prompts

| Prompt | Purpose | Usage |
|--------|---------|-------|
| `/speckit.tasks` | Break plan into actionable tasks | After planning phase |
| `/speckit.implement` | Execute tasks from tasks.md | When ready to code |
| `/speckit.clarify` | Resolve spec ambiguities | When spec has unclear areas |
| `/speckit.checklist` | Generate domain-specific checklist | For validation workflows |
| `/speckit.analyze` | Analyze spec/plan consistency | Quality assurance |
| `/speckit.constitution` | Create/update project principles | Initial setup or updates |
| `/speckit.taskstoissues` | Convert tasks to GitHub issues | Project management |

All speckit prompts delegate to corresponding custom agents defined in `.github/agents/`.

---

## Best Practices

### When to Use Each Prompt

**Starting new work:**
1. `@workspace /start [description]` - Set up branch and understand task
2. Make changes...
3. `@workspace /review` - Check changes before committing

**Submitting work:**
1. `@workspace /review` - Final check
2. `@workspace /submit` - Create PR and merge

**Repository maintenance:**
- `@workspace /sync` - Weekly or before starting new work
- `@workspace /sync aggressive` - When repository is cluttered (rare)

**Release to production:**
1. Ensure `main` is tested and ready
2. `@workspace /release` - Deploy to production

**Spec-driven development:**
1. `@workspace /speckit.specify [feature]` - Create specification
2. `@workspace /speckit.clarify` - If needed
3. `@workspace /speckit.plan` - Generate technical plan
4. `@workspace /speckit.tasks` - Break into tasks
5. `@workspace /speckit.implement` - Execute implementation

### Instruction File References

Prompts automatically load relevant instruction files:

**All TypeScript code changes:**
- `typescript-types.instructions.md` - Type system, naming conventions
- `typescript-modules.instructions.md` - Module system, imports/exports
- `typescript-patterns.instructions.md` - Functions, immutability, error handling
- `testing.instructions.md` - Unit and E2E test standards

**Game logic:**
- `game-logic.instructions.md` - Pure functions, state management

**UI work:**
- `ui.instructions.md` - DOM manipulation, accessibility

**Security-sensitive:**
- `security.instructions.md` - XSS prevention, validation

**Performance-critical:**
- `performance.instructions.md` - Optimization patterns

**Config changes:**
- `tooling.instructions.md` - Build and tool configuration

**Workflow operations:**
- `ai-config.instructions.md` - Prompt and agent standards

---

## Troubleshooting

### Prompt not found
```
Error: No prompt matching /start
```
**Solution:** Ensure you're using `@workspace` prefix:
```
@workspace /start [description]
```

### Instruction file reference error
```
Error: Cannot find instruction file
```
**Solution:** Run validation script:
```bash
.github/scripts/validate-prompts.sh
```

### Speckit agent not responding
**Possible causes:**
1. Agent not properly configured in `.github/agents/`
2. Missing required context files

**Solution:** Check agent definition exists:
```bash
ls .github/agents/speckit.*.agent.md
```

---

## Related Documentation

- **[PROMPT_REVIEW_SUMMARY.md](PROMPT_REVIEW_SUMMARY.md)** - Comprehensive review of all prompts
- **[.github/instructions/ai-config.instructions.md](.github/instructions/ai-config.instructions.md)** - Standards for AI configuration files
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Main development guidelines
- **[AGENTS.md](AGENTS.md)** - Quick reference for AI coding agents

---

**Last Updated:** 2026-01-12
