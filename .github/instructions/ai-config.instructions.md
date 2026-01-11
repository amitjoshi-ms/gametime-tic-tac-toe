---
applyTo: '**/*.md, .github/**/*.md, AGENTS.md, README.md'
---

# AI Configuration Files Standards

Standards for maintaining copilot-instructions, instruction files, prompts, and agents.

## File Structure

```
.github/
├── copilot-instructions.md      # Main guidelines (auto-loaded)
├── instructions/                # Topic-specific rules
│   └── *.instructions.md
├── prompts/                     # Reusable task prompts
│   └── *.prompt.md
└── agents/                      # Agent definitions
    └── *.agent.md

AGENTS.md                        # Quick reference (repo root)
```

## copilot-instructions.md

**Purpose:** Primary context for all AI interactions. Auto-loaded by GitHub Copilot.

**Structure:**
```markdown
# Project Name Guidelines

## Project Overview
Brief description, purpose, key constraints.

## Tech Stack
| Technology | Version | Purpose |
Table format for quick scanning.

## Project Structure
Directory tree with descriptions.

## Code Style & Conventions
Naming, formatting, patterns.

## Commands
npm scripts table.

## Testing Standards
Unit and E2E patterns.

## Architecture Patterns
Key design decisions.

## What NOT to Do
Explicit prohibitions.
```

**Rules:**
- Keep under 500 lines
- Use tables for structured data
- Include concrete examples
- Update `.github/copilot-instructions.md` when project structure changes

## Instruction Files (.instructions.md)

**Purpose:** Focused rules for specific file types or domains. Referenced via `applyTo` patterns.

**Naming:** `<topic>.instructions.md` (kebab-case)

**Structure:**
```markdown
# Topic Name

Brief purpose statement.

## Section 1
Rules with examples.

## Section 2
More rules.

## Anti-Patterns
What to avoid with examples.
```

**Rules:**
- One concern per file
- Keep under 200 lines
- Include code examples (✅ good, ❌ bad)
- Build on the high-level overview in `copilot-instructions.md` with detailed topic-specific guidance; avoid verbatim duplication of its content
- Use in prompts via `instructions:` frontmatter

**Current files:**
| File | Purpose | Applies To |
|------|---------|------------|
| typescript.instructions.md | Type system, naming | `**/*.ts` |
| testing.instructions.md | Unit/E2E patterns | `tests/**/*.ts` |
| game-logic.instructions.md | Pure functions | `src/game/**/*.ts` |
| ui.instructions.md | DOM manipulation | `src/ui/**/*.ts` |
| security.instructions.md | XSS, validation | `**/*.ts, **/*.html` |
| performance.instructions.md | Optimization | `**/*.ts, **/*.css` |
| tooling.instructions.md | Build configs | `*.config.*, *.json` |

## Prompt Files (.prompt.md)

**Purpose:** Reusable task templates invoked via Copilot Chat.

**Naming:** `<action>.<type>.prompt.md`
- Types: `task` (agent mode), `chat` (ask mode)
- Examples: `start.task.prompt.md`, `explain.chat.prompt.md`

**Structure:**
```markdown
---
description: One-line summary shown in picker
mode: agent | ask
instructions:
  - relevant.instructions.md
  - another.instructions.md
---

# Task Title

Brief description.

## Step 1: First Action
Instructions with commands.

## Step 2: Next Action
More instructions.

## User Request

{{input}}
```

**Rules:**
- Always include frontmatter
- Reference instructions, don't duplicate
- Use `{{input}}` for user context
- Keep steps actionable and ordered
- Include example commands in code blocks

## Agent Files (.agent.md)

**Purpose:** Specialized agent configurations for complex workflows.

**Naming:** `<role>.agent.md` (kebab-case)

**Structure:**
```markdown
---
description: Agent purpose
instructions:
  - relevant.instructions.md
---

# Agent Role

## Expertise
What this agent specializes in.

## Workflow
Steps the agent follows.

## Constraints
What the agent should NOT do.
```

**Rules:**
- One role per agent
- Clear expertise boundaries
- Reference shared instructions
- Define explicit constraints

## AGENTS.md (Root)

**Purpose:** Quick reference for AI coding agents. Complements copilot-instructions.md.

**Structure:**
```markdown
# AGENTS.md

## Quick Start
Essential commands.

## Repository Structure
Simplified tree.

## Architecture Rules
Key constraints table.

## Common Tasks
Step-by-step workflows.

## What to Avoid
Explicit prohibitions.
```

**Rules:**
- Keep under 200 lines
- Optimize for fast context loading
- Focus on actionable information
- No prose—use tables and lists

## When to Update

| Change | Update These Files |
|--------|-------------------|
| New npm script | copilot-instructions.md, AGENTS.md |
| New directory | copilot-instructions.md, AGENTS.md |
| New code pattern | Relevant instruction file |
| New workflow | Create/update prompt |
| Project conventions | copilot-instructions.md |

## Editing Best Practices

### Before Editing
1. Read the existing file completely
2. Identify the appropriate section for changes
3. Check for related content in other files to avoid duplication

### Writing Style
- **Be concise**: Use bullet points and tables over paragraphs
- **Be specific**: Include file paths, command examples, code snippets
- **Be consistent**: Match existing formatting and terminology
- **Use examples**: Show ✅ good and ❌ bad patterns

### Formatting Rules
```markdown
# H1 for file title only
## H2 for major sections
### H3 for subsections

| Tables | For | Structured Data |
|--------|-----|-----------------|

- Bullets for lists
- Code in `backticks`

```language
Code blocks with language hint
```
```

### Content Guidelines
- **copilot-instructions.md**: High-level overview, no deep implementation details
- **Instruction files**: Focused rules with code examples, one concern per file
- **Prompts**: Step-by-step workflows, reference instructions via frontmatter
- **AGENTS.md**: Quick reference only, tables and lists, no prose

### After Editing
1. Verify no duplication introduced
2. Check file stays within line limits (see Rules for each type)
3. Ensure cross-references are accurate

## Anti-Patterns

❌ **Duplicating content** across files
```markdown
# In both copilot-instructions.md AND typescript.instructions.md
Use strict TypeScript with no `any` types...
```

✅ **Reference instead**
```markdown
# In prompt frontmatter
instructions:
  - typescript.instructions.md
```

❌ **Vague instructions**
```markdown
Write good code.
```

✅ **Specific with examples**
```markdown
Use discriminated unions for state:
type Status = { kind: 'playing' } | { kind: 'won'; winner: Player }
```

❌ **Overly long files**
```markdown
# 1000-line copilot-instructions.md
```

✅ **Split into focused files**
```markdown
# copilot-instructions.md (300 lines) + 6 instruction files
```
