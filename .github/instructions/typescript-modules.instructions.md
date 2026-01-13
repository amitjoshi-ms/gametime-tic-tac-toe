---
description: TypeScript module system and import conventions
applyTo: '**/*.ts'
---

# TypeScript Module System

## ES Modules Only

**Never use CommonJS**—this project uses pure ES modules:

```typescript
// ✅ Use ES module syntax
import { GameState } from './types';
export function resetGame(): GameState { /* ... */ }

// ❌ Never use CommonJS
const { GameState } = require('./types');
module.exports = { resetGame };
```

## Import Organization

Group and order imports for consistency:

```typescript
// ✅ Group and order imports
// 1. Type-only imports
import type { GameState, Player } from './types';

// 2. Value imports from same module
import { resetGame, makeMove } from './state';

// 3. Side-effect imports (rare)
import './styles.css';
```

## Module Structure

### Export Patterns

```typescript
// ✅ Named exports (preferred)
export function resetGame(): GameState { /* ... */ }
export function makeMove(state: GameState, index: number): GameState { /* ... */ }

// ✅ Type-only exports
export type { GameState, Player };

// ⚠️ Default exports (use sparingly)
export default function App() { /* ... */ }
```

### Import Patterns

```typescript
// ✅ Import only what you need
import { resetGame } from './state';

// ⚠️ Avoid namespace imports unless necessary
import * as GameState from './state'; // Only if many exports needed

// ✅ Type-only imports for types
import type { GameState } from './types';
```

## Path Aliases

When configured in `tsconfig.json`:

```typescript
// ✅ Use path aliases for cleaner imports
import { GameState } from '@/game/types';
import { renderBoard } from '@/ui/board';

// ❌ Avoid deep relative paths
import { GameState } from '../../../game/types';
```

## Circular Dependencies

Avoid circular imports—they cause runtime errors:

```typescript
// ❌ Circular dependency
// file1.ts
import { funcB } from './file2';
export function funcA() { return funcB(); }

// file2.ts
import { funcA } from './file1';
export function funcB() { return funcA(); }

// ✅ Extract shared code to a third module
// shared.ts
export function sharedLogic() { /* ... */ }

// file1.ts
import { sharedLogic } from './shared';
export function funcA() { return sharedLogic(); }

// file2.ts
import { sharedLogic } from './shared';
export function funcB() { return sharedLogic(); }
```

## Module Side Effects

Minimize side effects in modules:

```typescript
// ❌ Module-level side effects
console.log('Module loaded'); // Runs on import
const config = fetchConfig(); // Side effect!

export function getConfig() { return config; }

// ✅ Lazy initialization
let config: Config | null = null;

export function getConfig(): Config {
  if (!config) {
    config = fetchConfig();
  }
  return config;
}
```
