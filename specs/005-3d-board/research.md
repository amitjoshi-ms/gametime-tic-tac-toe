# Research: 3D Visual Board Design

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: January 22, 2026

## Research Topics

### 1. CSS 3D Transform Approach

**Question**: Which CSS 3D transform techniques work best for a game board?

**Decision**: Use `perspective()` on container with `transform-style: preserve-3d` and subtle `rotateX()` for depth illusion.

**Rationale**:
- `perspective()` creates natural depth perception without distorting click targets
- `transform-style: preserve-3d` allows cells to maintain their own 3D space
- Subtle rotation (5-15 degrees) provides depth without disorientation
- CSS transforms are GPU-accelerated for 60fps performance

**Alternatives Considered**:
- **WebGL/Three.js**: Rejected - adds significant bundle size (~100KB+), violates minimal dependencies principle
- **CSS perspective on each cell**: Rejected - inconsistent depth effect, each cell has its own vanishing point
- **Box-shadow only (no transforms)**: Rejected - less convincing 3D effect, but will be used *in addition* to transforms

### 2. Click/Tap Accuracy with 3D Transforms

**Question**: Do CSS 3D transforms affect click target accuracy?

**Decision**: CSS 3D transforms do NOT affect pointer event hit testing. Click coordinates are calculated in 2D screen space after transform.

**Rationale**:
- Browsers calculate hit testing based on the transformed visual position
- `pointer-events` work correctly on transformed elements
- MDN and browser specifications confirm this behavior
- Existing games (CSS 3D chess boards, card games) validate this approach

**Verification Required**: E2E tests will confirm all 9 cells receive clicks accurately.

### 3. Reduced Motion Preference

**Question**: How to respect `prefers-reduced-motion` for accessibility?

**Decision**: Use CSS media query `@media (prefers-reduced-motion: reduce)` to disable hover animations and transitions while preserving static 3D appearance.

**Rationale**:
- Native browser support with no JavaScript required
- Static 3D depth (perspective, shadows) is acceptable - only motion is reduced
- Transitions/animations set to `none` or instant
- Focus states remain visible for accessibility

**Implementation**:
```css
@media (prefers-reduced-motion: reduce) {
  .cell {
    transition: none;
  }
  .cell:hover {
    transform: none; /* Remove lift animation */
  }
}
```

### 4. Theme Compatibility (Light/Dark)

**Question**: How do 3D effects adapt between light and dark themes?

**Decision**: Use CSS custom properties for shadow colors that adapt per theme.

**Rationale**:
- Existing codebase uses CSS custom properties for theming
- Dark theme: lighter/subtle shadows with slight transparency
- Light theme: darker shadows with more opacity
- Inset shadows can simulate recessed cells

**Implementation Pattern**:
```css
:root {
  --shadow-3d: rgba(0, 0, 0, 0.3);
  --shadow-3d-highlight: rgba(255, 255, 255, 0.1);
}

/* Light theme override (if added) */
@media (prefers-color-scheme: light) {
  :root {
    --shadow-3d: rgba(0, 0, 0, 0.15);
    --shadow-3d-highlight: rgba(255, 255, 255, 0.5);
  }
}
```

### 5. Browser Compatibility

**Question**: Which browsers support required CSS 3D features?

**Decision**: All target browsers (Chrome, Firefox, Safari, Edge) fully support CSS 3D transforms.

**Browser Support** (caniuse.com data):
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| `perspective` | ✅ 36+ | ✅ 16+ | ✅ 9+ | ✅ 12+ |
| `transform-style: preserve-3d` | ✅ 36+ | ✅ 16+ | ✅ 9+ | ✅ 12+ |
| `translateZ()` | ✅ 36+ | ✅ 16+ | ✅ 9+ | ✅ 12+ |
| `box-shadow` | ✅ 10+ | ✅ 4+ | ✅ 5.1+ | ✅ 12+ |

**Fallback Strategy**: 
- Use `@supports (transform-style: preserve-3d)` for graceful degradation
- Fallback is existing flat 2D board - fully functional

### 6. Performance Optimization

**Question**: How to ensure 60fps animation performance?

**Decision**: Use `will-change` and GPU-accelerated properties only.

**Best Practices**:
- Only animate `transform` and `opacity` (GPU-accelerated)
- Use `will-change: transform` on hover-able cells
- Avoid animating `box-shadow` (causes repaints) - keep shadows static
- Use `transform: translateZ(0)` to promote elements to GPU layer

**Implementation**:
```css
.cell {
  will-change: transform;
  transform: translateZ(0); /* GPU layer promotion */
}

.cell:hover {
  transform: translateZ(10px); /* Only transform changes - GPU accelerated */
}
```

### 7. Responsive 3D Perspective

**Question**: How should perspective scale across viewport sizes?

**Decision**: Use viewport-relative perspective value and reduce effect on small screens.

**Rationale**:
- Fixed perspective (e.g., 800px) looks too extreme on mobile
- Viewport-relative perspective adapts naturally
- Very small screens get flatter perspective to maintain usability

**Implementation**:
```css
.board {
  perspective: clamp(400px, 50vw, 800px);
}

@media (max-width: 480px) {
  .board {
    perspective: 300px; /* Reduced for mobile */
    transform: rotateX(5deg); /* Subtler angle */
  }
}
```

## Summary of Decisions

| Topic | Decision | Impact |
|-------|----------|--------|
| Transform approach | `perspective()` + `preserve-3d` + subtle `rotateX()` | Core 3D effect |
| Click accuracy | Transforms don't affect hit testing | No code changes needed |
| Reduced motion | CSS media query disables animations | Accessibility compliance |
| Theme support | CSS custom properties for shadow colors | Works with existing theming |
| Browser support | Full support in all targets | No polyfills needed |
| Performance | GPU-accelerated transforms only | 60fps guaranteed |
| Responsive | Viewport-relative perspective | Mobile-friendly |

## Open Questions

None - all research topics resolved.

## Next Steps

Proceed to Phase 1: Design & Contracts
- Create `data-model.md` with CSS custom property definitions
- Create `quickstart.md` with implementation guide
- No API contracts needed (CSS-only feature)
