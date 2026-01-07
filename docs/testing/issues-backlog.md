# Test Issues Backlog

> **Created:** 2026-01-04
> **Updated:** 2026-01-04
> **Task:** 002-review-and-improve-playwright-test-suite
> **Status:** Active

---

## Executive Summary

This document provides a prioritised backlog of all issues identified during the Playwright test suite review and execution. Issues are categorised by type and severity, with clear remediation steps for each.

| Category | Count | Impact |
|----------|-------|--------|
| Missing TestIDs | 6 | 40 failing tests |
| Application Bugs | 2 | 2 failing tests |
| Flaky Tests | 2 | Intermittent failures |
| Coverage Gaps | 8 | Untested features |
| Infrastructure | 3 | Maintenance debt |

**Total Issues:** 21

---

## Issue Severity Guide

| Severity | Definition | SLA |
|----------|------------|-----|
| 🔴 Critical | Blocks major functionality testing | Fix within 1 sprint |
| 🟠 High | Causes multiple test failures | Fix within 2 sprints |
| 🟡 Medium | Causes single test failure or gap | Fix within 3 sprints |
| 🟢 Low | Nice-to-have improvement | Backlog |

---

## Category 1: Missing TestID Attributes

These issues are the primary cause of test failures (40 of 39 failing tests, plus auth overlap). Each requires adding `data-testid` attributes to React components.

### TESTID-001: TaskDetailModal missing testId
| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Tests Affected** | 13 |
| **Component** | `src/components/projects/TaskDetailModal.tsx` |
| **Required Change** | Add `data-testid="task-detail-modal"` to root element |
| **Effort** | Low (1 line) |
| **Priority** | 1 |

**Failing Tests:**
- `tasks.spec.ts`: should open task detail modal when clicking on task
- `tasks.spec.ts`: should edit task title in modal
- `tasks.spec.ts`: should close task modal with X button
- `tasks.spec.ts`: should close task modal with Escape key
- `tasks.spec.ts`: should enable labels section from sidebar
- `tasks.spec.ts`: should enable checklist section from sidebar
- `tasks.spec.ts`: should archive task from sidebar
- `tasks.spec.ts`: should copy/duplicate task from sidebar
- `tasks.spec.ts`: should set task priority
- `tasks.spec.ts`: should set task due date
- `tasks.spec.ts`: should enable and use attachments section
- `tasks.spec.ts`: should enable and use links section
- `tasks.spec.ts`: should add checklist item to task

**Remediation:**
```tsx
// In TaskDetailModal.tsx, add to root element:
<div data-testid="task-detail-modal" className={...}>
```

---

### TESTID-002: CommandPalette missing testId
| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Tests Affected** | 17 |
| **Component** | `src/components/search/CommandPalette.tsx` |
| **Required Change** | Add `data-testid="command-palette"` to root element |
| **Effort** | Low (1 line) |
| **Priority** | 2 |

**Failing Tests:**
- `command-palette.spec.ts`: All 17 tests fail with same error

**Remediation:**
```tsx
// In CommandPalette.tsx, add to root element:
<div data-testid="command-palette" className={...}>
```

---

### TESTID-003: Registration form missing testIds
| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Tests Affected** | 10 |
| **Component** | `src/app/(auth)/register/page.tsx` |
| **Required Change** | Add multiple `data-testid` attributes |
| **Effort** | Low (5 lines) |
| **Priority** | 3 |

**Required TestIDs:**
- `register-form` - Form container
- `register-email` - Email input
- `register-password` - Password input
- `register-confirm-password` - Confirm password input
- `register-submit` - Submit button

**Failing Tests:**
- `registration.spec.ts`: All 10 tests fail with same error

**Remediation:**
```tsx
// In register/page.tsx:
<form data-testid="register-form">
  <input data-testid="register-email" />
  <input data-testid="register-password" />
  <input data-testid="register-confirm-password" />
  <button data-testid="register-submit" />
</form>
```

---

### TESTID-004: Additional CommandPalette testIds needed
| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Tests Affected** | 17 (after TESTID-002 fix) |
| **Component** | `src/components/search/CommandPalette.tsx` |
| **Required Change** | Add nested testIds for interactions |
| **Effort** | Low (5 lines) |
| **Priority** | 4 |

**Required TestIDs (for full test coverage):**
- `command-palette-input` - Search input field
- `command-palette-result` - Individual result items
- `command-palette-backdrop` - Backdrop for click-outside

---

### TESTID-005: KeyboardShortcutsPanel testIds needed
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Tests Affected** | 4 (subset of command-palette tests) |
| **Component** | `src/components/search/KeyboardShortcutsPanel.tsx` |
| **Required Change** | Add `data-testid="keyboard-shortcuts-panel"` |
| **Effort** | Low (1 line) |
| **Priority** | 5 |

---

### TESTID-006: Standardise testId naming convention
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Tests Affected** | N/A (preventive) |
| **Component** | All components |
| **Required Change** | Document and enforce naming convention |
| **Effort** | Medium |
| **Priority** | 10 |

**Suggested Convention:**
- Format: `{component}-{element}` (e.g., `task-modal-title`)
- Use kebab-case
- Add testIds to all interactive elements
- Document required testIds in component templates

---

## Category 2: Application Bugs

Issues found in application code during testing that cause unexpected behaviour.

### BUG-001: Sign-out button does not redirect to login
| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Tests Affected** | 1 |
| **Test File** | `auth.spec.ts` |
| **Component** | Sign-out button/handler |
| **Expected** | Redirect to `/login` after sign-out |
| **Actual** | Remains on `/dashboard/settings` |
| **Priority** | 6 |

**Error Message:**
```
Error: expect(page).toHaveURL(expected) failed
Expected pattern: /\/login/
Received string:  "http://localhost:3000/dashboard/settings"
```

**Investigation Steps:**
1. Check sign-out button's onClick handler
2. Verify Supabase `signOut()` call completes
3. Check router redirect after auth state change
4. Verify auth state listener clears cookies/storage

**Potential Fix:**
```tsx
// Ensure redirect after signOut completes
await supabase.auth.signOut()
router.push('/login')
```

---

### BUG-002: Auth state not clearing on logout (potential)
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Tests Affected** | 0 (observed behaviour) |
| **Component** | Auth context/provider |
| **Expected** | Auth cookies/storage cleared |
| **Actual** | May persist causing stale auth |
| **Priority** | 8 |

**Related to BUG-001.** If sign-out doesn't properly clear auth state, subsequent login attempts may behave unexpectedly.

**Investigation:**
- Check `e2e/.auth/user.json` handling
- Verify storage state cleared on logout
- Check for race conditions in auth flow

---

## Category 3: Flaky Tests

Tests that pass inconsistently due to timing, network, or state issues.

### FLAKY-001: idea-slider.spec.ts beforeEach timeout
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Tests Affected** | Up to 18 (when hook fails) |
| **Test File** | `idea-slider.spec.ts` |
| **Frequency** | ~5% of runs |
| **Cause** | Network latency to Supabase |
| **Priority** | 7 |

**Error Message:**
```
Test timeout of 30000ms exceeded during beforeEach hook
```

**Root Cause:**
The `beforeEach` hook creates test data by submitting a new idea. Network latency to Supabase can cause this operation to exceed the 30-second timeout.

**Remediation Options:**
1. Increase hook timeout to 45000ms
2. Add retry logic with exponential backoff
3. Use pre-seeded test data instead of creating per-test
4. Add `test.slow()` annotation for data-creation tests

**Suggested Fix:**
```typescript
test.beforeEach(async ({ page }) => {
  test.setTimeout(45000) // Increase timeout
  // ... existing setup code
})
```

---

### FLAKY-002: Drag-and-drop tests timing sensitivity
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Tests Affected** | 1 |
| **Test File** | `tasks.spec.ts` |
| **Frequency** | ~2% of runs |
| **Cause** | Animation timing |
| **Priority** | 11 |

**Root Cause:**
Drag-and-drop operations in the task board may fail if animations haven't completed before assertions run.

**Remediation:**
```typescript
// Add wait after drag operation
await dragHandle.dragTo(targetColumn)
await page.waitForTimeout(100) // Allow animation to complete
await expect(taskCard).toBeVisible()
```

---

## Category 4: Coverage Gaps

Areas of the application without adequate test coverage.

### GAP-001: Forgot Password flow
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Page** | `/forgot-password` |
| **Current Tests** | 0 |
| **Suggested Tests** | 3-5 |
| **Priority** | 12 |

**Suggested Test Cases:**
- Form displays correctly
- Email validation works
- Success message appears after submission
- Error handling for non-existent email
- Navigation back to login

---

### GAP-002: Time Audit feature
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Page** | `/dashboard/time-audit` |
| **Current Tests** | 0 |
| **Suggested Tests** | 3-4 |
| **Priority** | 15 |

**Suggested Test Cases:**
- Page loads correctly
- Time entries display
- Add new time entry
- Filter time entries by date

---

### GAP-003: Public Share pages
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Page** | `/share/[slug]` |
| **Current Tests** | 0 |
| **Suggested Tests** | 2-3 |
| **Priority** | 16 |

**Suggested Test Cases:**
- Shared page loads for valid slug
- Read-only view displays correctly
- Invalid slug shows error

---

### GAP-004: Landing page
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Page** | `/` |
| **Current Tests** | 0 |
| **Suggested Tests** | 2-3 |
| **Priority** | 17 |

**Suggested Test Cases:**
- Page renders correctly
- Navigation to login works
- CTA buttons function

---

### GAP-005: Voice capture feature
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Component** | `VoiceRecorderButton` |
| **Current Tests** | 0 |
| **Suggested Tests** | 3-4 |
| **Priority** | 13 |

**Note:** Voice capture tests require browser API mocking (MediaRecorder).

**Suggested Test Cases:**
- Button displays recording state
- Permission request handling
- Transcription appears after recording

---

### GAP-006: AI Analysis section
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Component** | `AIAnalysisSection` |
| **Current Tests** | 0 |
| **Suggested Tests** | 2-3 |
| **Priority** | 18 |

**Suggested Test Cases:**
- Analysis section displays
- Trigger analysis button works
- Results render correctly

---

### GAP-007: RICE Score panel
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Component** | `RiceScorePanel` |
| **Current Tests** | 0 |
| **Suggested Tests** | 2-3 |
| **Priority** | 19 |

**Suggested Test Cases:**
- Panel displays current score
- Sliders adjust values
- Score updates on change

---

### GAP-008: Saved Views feature
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Component** | `SavedViewsDropdown` |
| **Current Tests** | 0 |
| **Suggested Tests** | 3-4 |
| **Priority** | 20 |

**Suggested Test Cases:**
- Dropdown displays saved views
- Create new view
- Apply saved view
- Delete view

---

## Category 5: Infrastructure Improvements

Technical debt and improvements to test infrastructure.

### INFRA-001: Test data cleanup
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Impact** | Database accumulates test data |
| **Current State** | 131+ test tasks in Backlog column |
| **Priority** | 9 |

**Problem:**
Each test run creates persistent data (tasks, ideas) that accumulates in the database. This can cause:
- Slow test performance
- False positives/negatives from stale data
- Database bloat

**Remediation Options:**
1. Add `afterEach`/`afterAll` hooks to delete test data
2. Use unique prefixes for test data (e.g., `__test__${Date.now()}`)
3. Run tests against a separate test database
4. Add cleanup script to CI pipeline

**Suggested Implementation:**
```typescript
test.afterEach(async ({ page }) => {
  // Delete test data created during test
  const testTaskIds = await getTestTaskIds()
  for (const id of testTaskIds) {
    await deleteTask(id)
  }
})
```

---

### INFRA-002: Increase parallel workers
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Current** | 1 worker (sequential) |
| **Suggested** | 2 workers |
| **Impact** | Reduce execution time by ~40% |
| **Priority** | 14 |

**Current Execution Time:** ~23.6 minutes

**Expected After Fix:** ~14 minutes (with 2 workers)

**Requirements Before Enabling:**
1. Fix all testId issues first
2. Ensure tests don't share state
3. Verify no test order dependencies

**Configuration Change:**
```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 1 : 2,
  // ...
})
```

---

### INFRA-003: Add visual regression testing
| Field | Value |
|-------|-------|
| **Severity** | 🟢 Low |
| **Current** | No visual tests |
| **Impact** | Catch UI regressions |
| **Priority** | 21 |

**Suggested Implementation:**
- Use Playwright's built-in screenshot comparison
- Add baseline screenshots for key pages
- Run visual tests in CI

**Example:**
```typescript
test('dashboard visual', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveScreenshot('dashboard.png')
})
```

---

## Priority Summary

### Sprint 1 (Critical - Fix 40 tests)
| ID | Issue | Tests Fixed |
|----|-------|-------------|
| TESTID-001 | TaskDetailModal testId | 13 |
| TESTID-002 | CommandPalette testId | 17 |
| TESTID-003 | Registration form testIds | 10 |

### Sprint 2 (High - Complete test infrastructure)
| ID | Issue | Impact |
|----|-------|--------|
| TESTID-004 | Additional CommandPalette testIds | Full coverage |
| BUG-001 | Sign-out redirect | 1 test fixed |
| FLAKY-001 | idea-slider timeout | Stability |
| INFRA-001 | Test data cleanup | Maintainability |

### Sprint 3 (Medium - Expand coverage)
| ID | Issue | Impact |
|----|-------|--------|
| TESTID-005 | KeyboardShortcutsPanel | 4 tests |
| BUG-002 | Auth state investigation | Stability |
| GAP-001 | Forgot Password tests | Coverage |
| GAP-005 | Voice capture tests | Coverage |
| INFRA-002 | Parallel workers | Performance |

### Backlog (Low priority)
| ID | Issue | Impact |
|----|-------|--------|
| TESTID-006 | TestId naming convention | Standards |
| FLAKY-002 | Drag-drop timing | Stability |
| GAP-002-004 | Low priority page tests | Coverage |
| GAP-006-008 | Feature tests | Coverage |
| INFRA-003 | Visual regression | Quality |

---

## Metrics Tracking

### Current State (2026-01-04)
| Metric | Value |
|--------|-------|
| Total Tests | 117 |
| Passing | 78 (67%) |
| Failing | 39 (33%) |
| Coverage | 75% of pages |

### Target After Sprint 1
| Metric | Value |
|--------|-------|
| Total Tests | 117 |
| Passing | 115+ (98%) |
| Failing | 2 (2%) |
| Coverage | 75% of pages |

### Target After Sprint 2
| Metric | Value |
|--------|-------|
| Total Tests | 117 |
| Passing | 117 (100%) |
| Failing | 0 (0%) |
| Coverage | 75% of pages |

### Target After Sprint 3
| Metric | Value |
|--------|-------|
| Total Tests | 125+ |
| Passing | 125+ (100%) |
| Failing | 0 (0%) |
| Coverage | 85% of pages |

---

## Appendix: Quick Reference

### Files Requiring TestID Changes
```
src/components/projects/TaskDetailModal.tsx    - TESTID-001
src/components/search/CommandPalette.tsx       - TESTID-002, TESTID-004
src/app/(auth)/register/page.tsx               - TESTID-003
src/components/search/KeyboardShortcutsPanel.tsx - TESTID-005
```

### Test Files by Status
```
✅ Passing (42 tests):
   - settings.spec.ts (21)
   - matrix.spec.ts (21)

⚠️ Partially Passing (35 tests):
   - dashboard.spec.ts (5/5)
   - ideas.spec.ts (8/8)
   - idea-slider.spec.ts (17/18)
   - auth.spec.ts (4/5)
   - tasks.spec.ts (1/14)

❌ Failing (40 tests):
   - command-palette.spec.ts (0/17)
   - registration.spec.ts (0/10)
   - tasks.spec.ts modal tests (0/13)
```

---

*Document created as part of Task 002: Review and Improve Playwright Test Suite*
