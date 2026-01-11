```prompt
---
description: Comprehensive code review for best practices, security, and SDLC compliance
---

## Code Review

Perform a comprehensive review of current code changes covering code quality, security, and pre-commit readiness.

---

## Part 1: Best Practices Review

### Code Quality
- Clean code principles (readability, simplicity, DRY)
- Proper naming conventions
- Appropriate comments and documentation
- Code organization and structure

### Maintainability
- Single responsibility principle
- Loose coupling and high cohesion
- Testability of the code
- Error handling patterns

### Performance
- Obvious performance anti-patterns
- Unnecessary computations or memory allocations
- Efficient data structures usage

### TypeScript/JavaScript Best Practices
- Proper type annotations
- Avoiding `any` types where possible
- Null/undefined handling
- Async/await patterns

### Testing
- Test coverage for new functionality
- Test quality and assertions
- Edge cases consideration

---

## Part 2: Security Review (Secure SDLC)

### Input Validation & Sanitization
- User input validation
- Data sanitization before processing
- Injection prevention (XSS, SQL, command injection)

### Authentication & Authorization
- Proper authentication checks
- Authorization boundary enforcement
- Session and credential handling

### Data Protection
- Sensitive data exposure
- Proper encryption usage
- PII handling compliance

### Secure Coding Practices
- No hardcoded secrets or credentials
- Secure random number generation
- Safe deserialization
- No sensitive data in error messages or logs

### Dependency Security
- Known vulnerable dependencies
- Supply chain considerations

### Client-Side Security
- DOM-based vulnerabilities
- Content Security Policy considerations
- Secure cookie handling and CORS configuration

### OWASP Top 10 Alignment
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Data Integrity Failures
9. Security Logging Failures
10. Server-Side Request Forgery

---

## Part 3: Pre-Commit Checklist

### Code Quality Gates
- [ ] No linting errors
- [ ] No TypeScript compilation errors
- [ ] All tests pass
- [ ] No console.log or debug statements
- [ ] No commented-out code blocks
- [ ] No TODO/FIXME without issue reference

### Security Gates
- [ ] No hardcoded credentials or secrets
- [ ] No sensitive data in logs
- [ ] Input validation present for user data
- [ ] No obvious injection vulnerabilities

### Documentation
- [ ] Public APIs have JSDoc comments
- [ ] Complex logic has explanatory comments
- [ ] README updated if needed

---

## Instructions

1. Get the current git diff (staged or unstaged changes)
2. Analyze each file against all criteria above
3. Categorize findings by severity and type
4. Provide specific, actionable feedback with line references
5. Include code examples for recommended fixes

---

## Output Format

### Summary Table

| Category | Status | Findings |
|----------|--------|----------|
| Best Practices | ✅/⚠️/❌ | Count |
| Security | ✅/⚠️/❌ | Count |
| Pre-Commit Gates | ✅/⚠️/❌ | Count |

### Findings

For each finding:
- **Severity**: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | ℹ️ Info
- **Category**: Best Practice | Security | Gate
- **Location**: File and line reference
- **Description**: Clear explanation
- **Recommendation**: Specific fix with code example if applicable

### Verdict

**✅ READY TO COMMIT** | **⚠️ MINOR ISSUES** | **❌ NEEDS ATTENTION**

Priority items to address (if any).

```
