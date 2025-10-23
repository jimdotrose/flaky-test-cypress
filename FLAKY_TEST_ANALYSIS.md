# Flaky Test Analysis Report

## Summary

This repository contains **intentionally flaky tests** with a primary race condition in `cypress/e2e/app.cy.js` caused by random API delays that exceed Cypress default timeouts.

## Identified Flaky Tests

### 1. Sign Up Test - "Adds person to course" (cypress/e2e/app.cy.js:2-20)

**Flakiness Probability**: ~50% failure rate

#### Root Causes

##### PRIMARY ISSUE: Race Condition with API Save Operation

**Location**: `cypress/e2e/app.cy.js:16`
```javascript
cy.get('input[value="Saved!"]').should('be.visible')
```

**Problem**:
- The API client (`src/api/client.js:12-19`) has a random delay of **3500-4500ms** for the `savePeople()` operation
- Cypress default command timeout is **4000ms**
- When the random delay is > 4000ms, Cypress times out before "Saved!" appears
- This creates a race condition with approximately **50% failure rate**

**Evidence**:
```javascript
// src/api/client.js:12-19
savePeople: function(people) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      localStorage.people = JSON.stringify(people);
      return resolve({success: true});
    }, between(3500, 4500)); // Random delay exceeds Cypress timeout
  });
}

function between (min, max) {
  return Math.random() * (max - min) + min
}
```

##### SECONDARY ISSUE: Timing Race on List Update

**Location**: `cypress/e2e/app.cy.js:19`
```javascript
cy.get('li').should('contain', 'Some Name - some@email.com - core - git-it')
```

**Problem**:
- This assertion runs immediately after checking for "Saved!" button
- The list is updated when the save promise resolves (after 3500-4500ms)
- If the "Saved!" check barely passes (e.g., at 3999ms), the list might not be updated yet
- No explicit wait for the list to contain the new person

##### TERTIARY ISSUE: Initial Load Race

**Location**: Component mount time (`src/api/client.js:2-10`)

**Problem**:
- `loadPeople()` has a random delay of **0-1000ms**
- The form might not be fully interactive when the test starts
- Less likely to cause failures but still a race condition

```javascript
// src/api/client.js:2-10
loadPeople: function() {
  return {
    then: function(cb) {
      setTimeout(() => {
        cb(JSON.parse(localStorage.people || '[]'));
      }, Math.random() * 1000); // Random initial load delay
    }
  };
}
```

## Test Anti-Patterns Identified

### 1. Unnecessary .click() Before .type()
**Lines**: 6, 8
```javascript
cy.get('input[name="name"]').click().type('Some Name')
cy.get('input[name="email"]').click().type('some@email.com')
```

**Issue**: The `.click()` is unnecessary and can introduce timing issues. Cypress `.type()` automatically focuses the element.

### 2. No Explicit Waits for Async Operations
The test doesn't use:
- `cy.intercept()` to stub/wait for API calls
- Explicit timeout increases for long operations
- Assertions on intermediate states (e.g., "Saving..." state)

### 3. No Retry Configuration
**File**: `cypress.config.js`

The Cypress config has no retry configuration. Adding retries would mask the flakiness but not fix the root cause.

## Recommendations

### Quick Fixes (Treat Symptoms)

1. **Increase Cypress Default Timeout**
   ```javascript
   // cypress.config.js
   module.exports = defineConfig({
     e2e: {
       baseUrl: 'http://localhost:3000',
       supportFile: false,
       fixturesFolder: false,
       defaultCommandTimeout: 6000, // Increase from 4000ms to 6000ms
     },
   })
   ```

2. **Add Test Retries** (masks flakiness)
   ```javascript
   // cypress.config.js
   module.exports = defineConfig({
     e2e: {
       retries: {
         runMode: 2,
         openMode: 0
       }
     }
   })
   ```

### Proper Fixes (Address Root Cause)

1. **Stub API Calls** (Best Practice)
   ```javascript
   describe('Sign Up', () => {
     beforeEach(() => {
       // Stub the slow API calls
       cy.intercept('POST', '/api/people', {
         statusCode: 200,
         body: { success: true },
         delay: 100 // Controlled delay
       }).as('savePeople')

       cy.intercept('GET', '/api/people', {
         statusCode: 200,
         body: []
       }).as('loadPeople')
     })

     it('Adds person to course', () => {
       cy.visit('/')
       cy.wait('@loadPeople')

       cy.get('input[name="name"]').type('Some Name')
       cy.get('input[name="email"]').type('some@email.com')
       cy.get('select[name="department"]').select('core')
       cy.get('select[name="course"]').select('git-it')
       cy.get('input[type="submit"]').click()

       cy.wait('@savePeople')
       cy.get('input[value="Saved!"]').should('be.visible')
       cy.get('li').should('contain', 'Some Name - some@email.com - core - git-it')
     })
   })
   ```

2. **Use Explicit Waits**
   ```javascript
   // Wait for the "Saved!" state with increased timeout
   cy.get('input[value="Saved!"]', { timeout: 10000 }).should('be.visible')
   ```

3. **Fix Application Code** (if possible)
   - Remove random delays from `src/api/client.js`
   - Use consistent, fast responses in test environments
   - Add environment-based delay configuration

## Impact Assessment

- **Current State**: Test will fail ~50% of the time due to race condition
- **Affected Test**: `cypress/e2e/app.cy.js` - "Adds person to course"
- **Severity**: HIGH - Makes CI/CD unreliable
- **Effort to Fix**: LOW - Can be fixed with API stubbing in ~15 minutes

## Next Steps

1. Implement API stubbing using `cy.intercept()`
2. Add explicit waits for async operations
3. Remove unnecessary `.click()` calls before `.type()`
4. Consider adding Cypress retry configuration as a safety net
5. Update CI/CD configuration to actually run tests
