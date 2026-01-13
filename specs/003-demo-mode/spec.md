# Feature Specification: Demo Mode

**Feature Branch**: `003-demo-mode`  
**Created**: January 11, 2026  
**Status**: Draft  
**Input**: User description: "Add a demo feature where Computer plays against Computer with 2-second move delays, 15-second display after completion, auto-restart, and stop option"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Demo Mode (Priority: P1)

As a user, I want to start a demo mode where the computer plays against itself so I can watch the game being played automatically without needing a second player.

**Why this priority**: This is the core functionality that enables the demo feature. Without the ability to start demo mode, no other demo features matter.

**Independent Test**: Can be fully tested by clicking a "Start Demo" button and observing two computer players alternating turns automatically. Delivers entertainment value and showcases the game without user interaction.

**Acceptance Scenarios**:

1. **Given** the user is on the game screen, **When** they click "Start Demo", **Then** the game board resets and computer X begins playing automatically
2. **Given** demo mode is starting, **When** the first move is made, **Then** it occurs after a 2-second delay to appear natural
3. **Given** demo mode is active with computer X having moved, **When** it becomes computer O's turn, **Then** computer O makes its move after a 2-second delay

---

### User Story 2 - Stop Demo Mode (Priority: P1)

As a user, I want to stop the demo at any time so I can take control and play the game myself or exit the demo experience.

**Why this priority**: Equal priority to starting demo because users must have control to exit. A demo that cannot be stopped creates a poor user experience.

**Independent Test**: Can be fully tested by starting a demo, then clicking "Stop Demo" during play. The game should immediately halt computer moves and return to normal game mode.

**Acceptance Scenarios**:

1. **Given** demo mode is active, **When** the user clicks "Stop Demo", **Then** the computer players stop making moves immediately
2. **Given** demo mode is stopped, **When** the demo ends, **Then** the current game state is preserved on the board
3. **Given** demo mode is stopped, **When** the user looks at available controls, **Then** they can start a new game or begin another demo

---

### User Story 3 - Auto-Restart After Game Completion (Priority: P2)

As a user watching the demo, I want completed games to automatically restart after a brief display period so the demo continues indefinitely without my intervention.

**Why this priority**: Enhances the demo experience for passive viewing (e.g., kiosk displays, attract mode) but the demo is still useful without auto-restart.

**Independent Test**: Can be tested by letting a demo game complete (win or draw), observing the result displayed for 15 seconds, then watching a new game automatically begin.

**Acceptance Scenarios**:

1. **Given** demo mode is active and a game ends (win or draw), **When** the game completes, **Then** the final result is displayed clearly
2. **Given** the game result is being displayed in demo mode, **When** 15 seconds elapse, **Then** a new game automatically starts with computer X moving first
3. **Given** the result is being displayed, **When** the user clicks "Stop Demo" during the 15-second wait, **Then** the auto-restart is cancelled and demo mode ends

---

### User Story 4 - Natural Move Timing (Priority: P2)

As a user watching the demo, I want computer moves to have a 2-second delay so the gameplay feels natural and watchable rather than instant.

**Why this priority**: Important for user experience but the demo technically works without delays (just less pleasant to watch).

**Independent Test**: Can be tested by starting demo and using a stopwatch to verify each move takes approximately 2 seconds from the previous move.

**Acceptance Scenarios**:

1. **Given** demo mode is active and a move was just made, **When** the next computer needs to move, **Then** the move occurs after a 2-second delay (not instantly)
2. **Given** the 2-second delay is in progress, **When** the user stops the demo, **Then** the pending move is cancelled immediately
3. **Given** demo mode auto-restarts a new game, **When** the first move is made, **Then** it also follows the 2-second delay pattern

---

### User Story 5 - Custom Computer Names (Priority: P3)

As a user, I want to set custom names for both computer players in demo mode so I can personalize the viewing experience.

**Why this priority**: Nice-to-have feature that adds personalization but doesn't affect core demo functionality.

**Independent Test**: Can be tested by entering custom names for Computer X and Computer O before starting demo, then observing the names displayed during gameplay.

**Acceptance Scenarios**:

1. **Given** demo mode is not active, **When** the user edits the player name fields, **Then** both names can be customized for demo mode
2. **Given** custom names are set and demo starts, **When** a player makes a move, **Then** the status shows the custom name (e.g., "HAL's turn" instead of "Computer X's turn")
3. **Given** demo mode ends, **When** returning to normal play, **Then** player names revert to appropriate defaults or saved preferences

---

### Edge Cases

- What happens if user clicks "Stop Demo" during the 2-second delay before a move? The pending move should be cancelled.
- What happens if user clicks "Stop Demo" during the 15-second result display? Auto-restart should be cancelled and the final game state preserved.
- What happens if user tries to click a cell during demo mode? Cell clicks should be ignored while demo is active.
- What happens if demo mode is started while a game is in progress? The current game should be reset and demo should start fresh.
- What happens if the browser tab loses focus during demo? Demo should continue running in the background.
- What happens if a computer name is empty? Default names should be used ("Computer X", "Computer O").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a single "Demo" button that toggles demo mode on/off
- **FR-002**: Button MUST show "Start Demo" when demo is inactive, "Stop Demo" when active
- **FR-003**: System MUST have computer X play first when demo mode starts
- **FR-004**: System MUST alternate between computer X and computer O automatically
- **FR-005**: System MUST delay each computer move by 2 seconds before executing
- **FR-006**: System MUST display the game result (winner or draw) when a demo game completes
- **FR-007**: System MUST wait 15 seconds after game completion before starting a new demo game
- **FR-008**: System MUST reset the board when a new demo game starts
- **FR-009**: System MUST ignore user clicks on the game board while demo mode is active
- **FR-010**: System MUST cancel any pending moves when demo mode is stopped
- **FR-011**: System MUST cancel auto-restart countdown when demo mode is stopped
- **FR-012**: System MUST preserve the current board state when demo is stopped
- **FR-013**: System MUST indicate visually that demo mode is active
- **FR-014**: System MUST allow users to set custom names for both computer players before starting demo
- **FR-015**: System MUST use existing player name inputs for demo computer names
- **FR-016**: System MUST NOT add external dependencies for demo mode functionality

### Key Entities

- **DemoState**: Represents whether demo mode is active, idle, or in result-display phase
- **DemoTimer**: Manages the 2-second move delay and 15-second restart countdown

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start demo mode with a single click
- **SC-002**: Users can stop demo mode with a single click at any point
- **SC-003**: Each computer move occurs exactly 2 seconds after the previous move completes
- **SC-004**: New demo games start exactly 15 seconds after the previous game ends
- **SC-005**: Demo mode runs continuously without user intervention until explicitly stopped
- **SC-006**: 100% of user clicks on cells are ignored during active demo mode
- **SC-007**: Demo mode is clearly distinguishable from normal gameplay through visual indicators

## Assumptions

- The existing computer opponent logic from the `computer.ts` module will be reused for both X and O players in demo mode
- The 2-second delay is from when a move completes to when the next move is made (not including processing time)
- The 15-second display period starts immediately when a game result is determined
- Demo mode button(s) will be positioned near existing game controls for consistency
- No sound effects are required for demo mode (silent operation)
