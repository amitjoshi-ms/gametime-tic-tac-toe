# Data Model: 3D Visual Board Design

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: January 22, 2026

## Overview

This feature introduces no new data entities. The "data model" for this CSS-only feature consists of CSS Custom Properties (CSS Variables) that control the 3D visual appearance.

## CSS Custom Properties

### 3D Effect Properties

| Property | Default Value | Description |
|----------|---------------|-------------|
| `--board-perspective` | `clamp(400px, 50vw, 800px)` | Perspective distance for 3D depth |
| `--board-rotate-x` | `8deg` | X-axis rotation for board tilt |
| `--cell-depth` | `4px` | Z-axis translation for cell elevation |
| `--cell-hover-depth` | `8px` | Z-axis translation on hover |
| `--transition-3d` | `150ms ease-out` | Transition timing for 3D effects |

### Shadow Properties

| Property | Default Value (Dark Theme) | Description |
|----------|---------------------------|-------------|
| `--shadow-3d-color` | `rgba(0, 0, 0, 0.4)` | Primary shadow color for depth |
| `--shadow-3d-highlight` | `rgba(255, 255, 255, 0.05)` | Subtle highlight for top edges |
| `--shadow-cell-base` | `0 2px 4px var(--shadow-3d-color)` | Base cell shadow |
| `--shadow-cell-elevated` | `0 4px 12px var(--shadow-3d-color)` | Elevated cell shadow |

### Responsive Overrides

| Breakpoint | Property Changes |
|------------|------------------|
| `max-width: 480px` | `--board-perspective: 300px`, `--board-rotate-x: 5deg` |
| `max-width: 320px` | `--board-rotate-x: 3deg` |

## State Mapping

### Cell States → CSS Classes

| State | Class | 3D Visual Effect |
|-------|-------|-----------------|
| Empty (default) | `.cell` | Base elevation with shadow |
| Empty + Hover | `.cell:hover` | Increased elevation + enhanced shadow |
| Empty + Focus | `.cell:focus-visible` | Focus ring + slight elevation |
| Occupied | `.cell--occupied` | Static elevation, no hover lift |
| Disabled | `.cell--disabled` | Reduced opacity, no interaction |
| Win Highlight | `.cell--winner` | Special glow effect |

### Board States → CSS Classes

| State | Class | 3D Visual Effect |
|-------|-------|-----------------|
| Active play | `.board` | Full 3D perspective |
| Computer thinking | `.board--thinking` | Slightly dimmed, no interaction |
| Remote waiting | `.board--waiting` | Slightly dimmed, no interaction |
| Demo mode | `.board--demo` | Full 3D perspective, no interaction |

## Reduced Motion State

When `prefers-reduced-motion: reduce` is active:

| Property | Reduced Value |
|----------|---------------|
| `--transition-3d` | `0ms` (instant) |
| Cell hover transform | `none` (no lift) |
| Cell focus transform | Static (no animation) |

**Note**: Static 3D appearance (perspective, shadows) is preserved. Only motion/animation is removed.

## Theme Compatibility

### Dark Theme (Default)

```css
:root {
  --shadow-3d-color: rgba(0, 0, 0, 0.4);
  --shadow-3d-highlight: rgba(255, 255, 255, 0.05);
}
```

### Light Theme (Future)

```css
@media (prefers-color-scheme: light) {
  :root {
    --shadow-3d-color: rgba(0, 0, 0, 0.15);
    --shadow-3d-highlight: rgba(255, 255, 255, 0.3);
  }
}
```

## Graceful Degradation

```css
@supports not (transform-style: preserve-3d) {
  .board {
    perspective: none;
    transform: none;
  }
  .cell {
    transform: none;
    box-shadow: var(--shadow-cell-base); /* Shadow-only depth */
  }
}
```

Browsers without 3D transform support display the existing flat board with subtle shadows for depth hint.

## Validation Rules

1. `--board-perspective` MUST be positive (0 or negative breaks effect)
2. `--board-rotate-x` SHOULD be between 3deg and 15deg to avoid disorientation
3. `--cell-hover-depth` MUST be greater than `--cell-depth` for lift effect
4. Shadow opacity SHOULD be 0.1-0.5 for subtle realism

## No Data Persistence

This feature modifies visual presentation only. No localStorage, sessionStorage, or server-side data changes required.
