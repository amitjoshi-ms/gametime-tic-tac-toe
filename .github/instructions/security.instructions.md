---
description: 'Security best practices for this SPA'
applyTo: '**/*.ts, **/*.html'
---

# Security Guidelines

## Overview

This is a client-side only SPA with no backend. Security focus areas:
- XSS prevention
- Safe localStorage usage
- Input validation
- Content Security Policy

## XSS Prevention

### Never Use `innerHTML` with User Data

```typescript
// ❌ Dangerous: XSS vulnerability
container.innerHTML = `<span>${userInput}</span>`;

// ✅ Safe: Use textContent for user data
const span = document.createElement('span');
// textContent treats userInput as plain text, preventing HTML interpretation and XSS
span.textContent = userInput;
container.appendChild(span);
```

### If HTML Rendering Is Required

**This project should NOT require HTML rendering** - use DOM APIs (`createElement`, `textContent`) for all UI.

If you find yourself needing to render HTML:

**Option 1: Reconsider the approach** - Can you achieve the same result with DOM APIs?

**Option 2: Manual sanitization** (zero-dependency approach):

```typescript
// Manual approach: escape HTML entities before displaying
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ⚠️ Avoid innerHTML even with escaping - use DOM APIs instead:
// container.innerHTML = `<span>${escapeHtml(userInput)}</span>`; // NOT recommended

// ✅ Better: Use DOM APIs with textContent
const span = document.createElement('span');
span.textContent = userInput; // No escaping needed - textContent is safe
container.appendChild(span);
```

**Option 3: Add a sanitizer library** - This would violate the zero-dependency principle and require architectural discussion. Consider DOMPurify only if absolutely necessary.

### Avoid `eval` and `Function` Constructor

```typescript
// ❌ Never do this
eval(userInput);
new Function(userInput)();
```

## localStorage Security

### Store Only Non-Sensitive Data

```typescript
// ✅ OK: User preferences, player names
localStorage.setItem('playerNames', JSON.stringify({ X: 'Alice', O: 'Bob' }));

// ❌ Never store
localStorage.setItem('apiKey', secret);
localStorage.setItem('password', password);
```

### Validate Data When Reading

```typescript
function loadPlayerNames(): PlayerNames {
  try {
    const stored = localStorage.getItem('playerNames');
    if (!stored) return defaultNames;
    
    const parsed = JSON.parse(stored);
    
    // Validate structure
    if (typeof parsed.X !== 'string' || typeof parsed.O !== 'string') {
      return defaultNames;
    }
    
    // Sanitize values (max length, no special chars if needed)
    return {
      X: parsed.X.slice(0, 20),
      O: parsed.O.slice(0, 20),
    };
  } catch {
    return defaultNames;
  }
}
```

## Input Validation

### Validate All User Inputs

```typescript
function handleNameChange(name: string, player: Player): void {
  // Validate length
  if (name.length > 20) {
    name = name.slice(0, 20);
  }
  
  // Validate content (optional: restrict characters)
  if (!/^[\w\s-]+$/.test(name)) {
    return; // Reject invalid characters
  }
  
  // Process valid input
  updatePlayerName(player, name);
}
```

### Validate Cell Index Bounds

```typescript
function handleCellClick(cellIndex: number): void {
  // Validate input is a valid cell index
  if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex > 8) {
    return;
  }
  
  // Process valid click
  makeMove(gameState, cellIndex);
}
```

## Content Security Policy

### Recommended CSP Headers (via Cloudflare)

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self';
  font-src 'self';
  object-src 'none';
  frame-ancestors 'none';
```

### No Inline Scripts

```html
<!-- ❌ Blocked by strict CSP -->
<button onclick="handleClick()">Click</button>
<script>const x = 1;</script>

<!-- ✅ Use external scripts and event listeners -->
<button id="my-button">Click</button>
<script type="module" src="/main.js"></script>
```

## Dependency Security

### Zero Runtime Dependencies

This project intentionally has **no runtime dependencies**:
- Reduces attack surface
- No supply chain vulnerabilities
- Smaller bundle size

### Dev Dependencies

- Keep dev dependencies updated: `npm outdated`
- Audit regularly: `npm audit`
- Review before adding new packages

## Error Handling

### Don't Expose Internal Details

```typescript
// ❌ Exposes implementation details
catch (error) {
  console.error('Game state update failed:', error.stack);
  showUser(error.message);
}

// ✅ Generic user message, detailed logging if needed
catch (error) {
  console.error('Operation failed:', error); // Dev console only
  showUser('Something went wrong. Please try again.');
}
```

## Third-Party Resources

### Subresource Integrity

If loading external resources:

```html
<script 
  src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous">
</script>
```

### Currently: No External Resources

This app loads no external scripts, styles, or fonts—all assets are self-hosted.
