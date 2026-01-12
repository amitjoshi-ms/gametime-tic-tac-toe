# Research: Demo Mode

**Feature**: 003-demo-mode
**Date**: January 11, 2026
**Status**: Complete

## Research Tasks

### 1. Timer Management for Sequential Moves

**Question**: Best approach for managing 2-second move delays and 15-second restart countdown?

**Decision**: Use native `setTimeout`/`clearTimeout` with stored timer IDs

**Rationale**:
- Native browser API—zero dependencies
- Already used in existing `scheduleComputerMove` function
- Simple cancellation via `clearTimeout`
- No need for complex scheduling library

**Alternatives Considered**:
- `setInterval`: Rejected—moves aren't periodic, they're sequential one-shot delays
- External timer library: Rejected—violates minimal dependencies principle
- `requestAnimationFrame`: Rejected—designed for frame updates, not second-scale delays

### 2. State Management for Demo Mode

**Question**: How to track demo state (active, stopped, between-games)?

**Decision**: Extend existing `GameMode` type to include `'demo'` mode

**Rationale**:
- Fits existing pattern (`'human' | 'computer'`)
- Single source of truth in `GameState.gameMode`
- Simplifies conditional logic throughout codebase
- Demo-specific timers tracked in module-level variables (like existing `cancelPendingMove`)

**Alternatives Considered**:
- Separate `DemoState` object: Rejected—adds complexity, parallel state to sync
- Boolean `isDemo` flag: Rejected—less expressive than union type
- Separate demo module with internal state: Rejected—fragments state management

### 3. UI Button Approach

**Question**: Single toggle button or separate Start/Stop buttons?

**Decision**: Single toggle button that changes label based on state

**Rationale**:
- User requirement: "Have button to start and stop demo"
- Reduces UI clutter
- Clear state indication via button label
- Common UX pattern (Play/Pause)

**Implementation**: Add button to existing `controls.ts` module alongside "New Game" button

### 4. Computer Name Handling

**Question**: How to handle custom names for both computer players?

**Decision**: Reuse existing `PlayerNames` inputs and persistence

**Rationale**:
- User requirement: "Allow choosing naming for the two computers"
- Existing `playerNames.ts` UI already handles name editing
- Existing `savePlayerNames`/`loadPlayerNames` provides persistence
- Names display in status messages automatically

**Behavior**:
- When demo starts: Both players are computers, names come from current `PlayerNames`
- Default names: "Computer X" and "Computer O" (new constants)
- User can edit names before starting demo

### 5. Blocking User Input During Demo

**Question**: How to prevent cell clicks during demo mode?

**Decision**: Check `gameMode === 'demo'` at start of `handleCellClick`

**Rationale**:
- Minimal code change
- Single point of control
- No DOM manipulation needed (cells remain clickable but clicks ignored)

**Alternative Considered**:
- Add `disabled` attribute to cells: Rejected—more DOM manipulation, visual changes

### 6. Visual Indication of Demo Mode

**Question**: How to clearly show demo mode is active?

**Decision**: Multiple subtle indicators:
1. Button label shows "Stop Demo"
2. Status text includes "(Demo)" prefix
3. Optional: CSS class on game container for styling hooks

**Rationale**:
- Multiple affordances reinforce state
- Non-intrusive—doesn't obscure game
- CSS class enables future styling flexibility

## Technical Decisions Summary

| Decision | Choice | Dependency Impact |
|----------|--------|-------------------|
| Timer management | Native `setTimeout`/`clearTimeout` | None |
| State tracking | Extend `GameMode` union type | None |
| Button approach | Single toggle button | None |
| Name handling | Reuse existing `PlayerNames` | None |
| Input blocking | Guard in click handler | None |
| Visual indicator | Label + status text + CSS class | None |

**Total New Dependencies**: 0

## Open Questions

None—all NEEDS CLARIFICATION items resolved.
