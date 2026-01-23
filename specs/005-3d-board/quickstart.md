# Quickstart: 3D Visual Board Design

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: January 22, 2026

## Implementation Overview

This feature transforms the flat 2D game board into a 3D visual board using pure CSS. No new dependencies or significant TypeScript changes are required.

## Prerequisites

- Feature branch: `005-3d-board`
- Development server: `npm run dev`
- Browser DevTools open for real-time CSS testing

## Step-by-Step Implementation

### Phase 1: Add CSS Custom Properties

Add 3D-related custom properties to `:root` in `src/styles/main.css`:

```css
:root {
  /* Existing properties... */
  
  /* 3D Effect Properties */
  --board-perspective: clamp(400px, 50vw, 800px);
  --board-rotate-x: 8deg;
  --cell-depth: 4px;
  --cell-hover-depth: 8px;
  --transition-3d: 150ms ease-out;
  
  /* 3D Shadow Properties */
  --shadow-3d-color: rgba(0, 0, 0, 0.4);
  --shadow-3d-highlight: rgba(255, 255, 255, 0.05);
}
```

### Phase 2: Update Board Styles

Modify the `.board` class to add 3D perspective:

```css
.board {
  /* Existing styles... */
  
  /* 3D Transform */
  perspective: var(--board-perspective);
  transform-style: preserve-3d;
  transform: rotateX(var(--board-rotate-x));
}
```

### Phase 3: Update Cell Styles

Enhance `.cell` with 3D depth and shadows:

```css
.cell {
  /* Existing styles... */
  
  /* 3D Positioning */
  transform: translateZ(var(--cell-depth));
  box-shadow: 0 2px 4px var(--shadow-3d-color);
  will-change: transform;
  
  /* 3D Transitions */
  transition: 
    background-color var(--transition-fast),
    transform var(--transition-3d),
    box-shadow var(--transition-3d);
}

.cell:hover:not(.cell--occupied):not(.cell--disabled) {
  transform: translateZ(var(--cell-hover-depth));
  box-shadow: 0 4px 12px var(--shadow-3d-color);
}
```

### Phase 4: Add Reduced Motion Support

Add media query for accessibility:

```css
@media (prefers-reduced-motion: reduce) {
  .cell {
    transition: background-color var(--transition-fast);
  }
  
  .cell:hover:not(.cell--occupied):not(.cell--disabled) {
    transform: translateZ(var(--cell-depth)); /* No lift */
    box-shadow: 0 2px 4px var(--shadow-3d-color); /* No shadow change */
  }
}
```

### Phase 5: Add Responsive Adjustments

Add mobile-friendly perspective:

```css
@media (max-width: 480px) {
  :root {
    --board-perspective: 300px;
    --board-rotate-x: 5deg;
  }
}

@media (max-width: 320px) {
  :root {
    --board-rotate-x: 3deg;
  }
}
```

### Phase 6: Add Graceful Degradation

Add fallback for older browsers:

```css
@supports not (transform-style: preserve-3d) {
  .board {
    perspective: none;
    transform: none;
  }
  
  .cell {
    transform: none;
    /* Shadow-only depth hint */
    box-shadow: 0 2px 4px var(--shadow-3d-color);
  }
}
```

## Testing Checklist

### Visual Testing
- [ ] Board displays with visible 3D tilt
- [ ] Cells appear raised with shadows
- [ ] Hover causes cells to "lift" towards viewer
- [ ] Symbols (X, O) display correctly on 3D surface

### Interaction Testing  
- [ ] All 9 cells are clickable
- [ ] Click accuracy is not affected by 3D transform
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Focus states are visible

### Accessibility Testing
- [ ] Enable "Reduce motion" in OS settings
- [ ] Verify hover animations are disabled
- [ ] Verify static 3D appearance is preserved

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Responsive Testing
- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile landscape (640px)
- [ ] Mobile portrait (375px)
- [ ] Small mobile (320px)

## Common Issues & Solutions

### Issue: Cells look distorted
**Solution**: Reduce `--board-rotate-x` value (try 5deg instead of 8deg)

### Issue: Hover animation is jerky
**Solution**: Ensure `will-change: transform` is set on `.cell`

### Issue: Shadows look too strong/weak
**Solution**: Adjust `--shadow-3d-color` opacity (0.2-0.5 range)

### Issue: Mobile looks too tilted
**Solution**: Responsive media queries reduce `--board-rotate-x` on small screens

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/styles/main.css` | MODIFY | Add 3D CSS properties and styles |
| `tests/e2e/board3d.spec.ts` | ADD | E2E tests for 3D visual effects |

## Dependencies

None. Pure CSS implementation using native browser features.

## Rollback Plan

To revert 3D effects, remove the following from `main.css`:
1. 3D custom properties from `:root`
2. 3D styles from `.board` class
3. 3D styles from `.cell` class
4. Reduced motion media query additions
5. Responsive 3D adjustments
6. `@supports` fallback block

The board will return to its original flat 2D appearance.
