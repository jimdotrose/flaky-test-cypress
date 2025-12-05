# CLAUDE.md - AI Assistant Guide

## Project Overview

**flaky-test-cypress** is an educational repository designed to teach developers how to identify and fix flaky Cypress tests. The project contains a React-based sign-up form application with intentionally introduced race conditions and timing issues across different challenge branches (level1-level9).

**Primary Purpose**: Educational tool for learning Cypress test stabilization techniques
**Original Author**: Gleb Bahmutov <gleb.bahmutov@gmail.com>
**License**: MIT
**Repository**: https://github.com/bahmutov/flaky-test-cypress

## Repository Structure

```
flaky-test-cypress/
├── .circleci/              # CI/CD configuration
│   └── config.yml          # CircleCI workflows for testing
├── cypress/                # Cypress E2E tests
│   └── e2e/
│       └── app.cy.js       # Main test file for sign-up form
├── public/                 # Static assets
│   ├── img/                # Images (loading.gif, etc.)
│   └── favicon.ico
├── src/                    # Application source code
│   ├── api/                # Mock API layer
│   │   ├── client.js       # Simulated backend with delays
│   │   ├── core.json       # Core courses data
│   │   └── electives.json  # Elective courses data
│   ├── semantic-ui/        # UI framework files
│   ├── 08-field-component-field.js  # Input field component
│   ├── 09-course-select.js          # Department/course selector
│   ├── 10-remote-persist.js         # Main form component
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   └── logo.svg
├── .nvmrc                  # Node version (20.11.1)
├── .prettierrc.json        # Code formatting rules
├── cypress.config.js       # Cypress configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite build configuration
└── README.md               # Project documentation
```

## Technology Stack

### Core Technologies
- **React**: 16.12.0 (legacy version, uses class components)
- **React DOM**: 16.12.0
- **Vite**: ^7.1.10 (modern build tool, replaced Create React App)
- **Node.js**: 20.11.1 (specified in .nvmrc)

### Testing
- **Cypress**: ^13.6.6 (E2E testing framework)
- **Base URL**: http://localhost:3000

### Development Tools
- **Prettier**: ^3.2.5 (code formatting)
- **Validator**: 5.1.0 (email validation)
- **PropTypes**: ^15.8.1 (runtime type checking)

### Build Configuration
- **Vite** with React plugin
- **Port**: 3000 (development server)
- **JSX Runtime**: Classic (for React 16 compatibility)
- **Build Output**: `build/` directory

## Key Application Components

### 1. Main Form Component (`10-remote-persist.js`)
The primary React component managing the sign-up form state and logic.

**Key Features**:
- Form state management (name, email, department, course)
- Field validation (required fields, email format)
- Async data persistence using localStorage
- Save status tracking (READY, SAVING, SUCCESS, ERROR)
- People list display

**Important State**:
```javascript
state = {
  fields: { name, email, course, department },
  fieldErrors: {},
  people: [],
  _loading: false,
  _saveStatus: 'READY'  // READY | SAVING | SUCCESS | ERROR
}
```

**Timing Characteristics**:
- Initial load: Random delay 0-1000ms (loading people from localStorage)
- Save operation: 3500-4500ms delay (simulated backend save)

### 2. Course Select Component (`09-course-select.js`)
Handles department selection and dynamic course loading.

**Behavior**:
- Two-step selection: department first, then course
- Courses load with 1000ms delay after department selection
- Shows loading spinner during course fetch
- Uses getDerivedStateFromProps (React 16 pattern)

**Departments**:
- `core`: NodeSchool Core courses
- `electives`: NodeSchool Electives

### 3. Field Component (`08-field-component-field.js`)
Reusable controlled input component with validation.

**Features**:
- Controlled input with state synchronization
- Real-time validation with error display
- PropTypes validation

### 4. Mock API Client (`api/client.js`)
Simulates backend API with intentional delays.

**Methods**:
- `loadPeople()`: Random 0-1000ms delay, reads from localStorage
- `savePeople()`: Random 3500-4500ms delay, writes to localStorage

## Development Workflows

### Initial Setup
```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm start

# Open application in browser
open http://localhost:3000
```

### Testing
```bash
# Run Cypress tests headlessly
npm test

# Open Cypress UI for interactive testing
npm test:open

# Run tests with browser visible
npm test:headed
```

### Build & Preview
```bash
# Build production bundle
npm build

# Preview production build
npm preview
```

### Code Formatting
The project uses Prettier with specific rules:
```json
{
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true
}
```

## Cypress Testing Configuration

### Configuration (`cypress.config.js`)
```javascript
{
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,      // No support file needed
    fixturesFolder: false    // No fixtures used
  }
}
```

### Test Structure (`cypress/e2e/app.cy.js`)
The main test validates the complete sign-up flow:

1. Visit homepage
2. Fill in name field
3. Fill in email field
4. Select department ("core")
5. Wait for courses to load (timeout: 5000ms)
6. Select course ("git-it")
7. Submit form
8. Verify "Saved!" message appears (timeout: 7000ms)
9. Verify person appears in the list

**Key Test Patterns**:
- Uses explicit timeouts for async operations
- Waits for options to load before selecting
- Verifies submit button state changes
- Checks list contains expected data format

## CI/CD Configuration

### CircleCI Workflows

**1. Main Workflow (`build-and-test`)**
- Runs on all branches
- Uses Node.js 20.19 with browsers
- Executes tests with JUnit reporting
- Stores test results, screenshots, and videos

**2. Level Testing Workflow (`test-level-branches`)**
- Runs only on specific level branches (level1-level9)
- Executes tests 5 times to detect flakiness
- Continues even if tests fail

**3. Nightly Workflow (`nightly-flake-detection`)**
- Scheduled daily at midnight
- Runs on main branch only
- Monitors for regression

**4. Recorded Tests Workflow (`recorded-tests`)**
- Optional Cypress Dashboard recording
- Requires `cypress-dashboard` context
- Supports parallel execution

### Key CI Commands
```bash
npm ci --force              # Install with legacy peer deps
npx wait-on http://localhost:3000  # Wait for server
npx cypress run --reporter junit   # Run with JUnit output
```

## Branch Structure & Challenge Levels

### Main Branch
The baseline application with working tests (no flakiness).

### Challenge Branches (level1-level9)
Each branch introduces specific flaky test scenarios:

- **level1**: Warm-up challenge with basic timing issues
- **level2**: Requires burning tests to prove flakiness
- **level3**: Fast tests that intermittently fail
- **level4**: App "loses" first few typed letters
- **level5**: Elements disappear before clicking
- **level6**: Slow app loading causes random failures
- **level7**: Data saving is too slow
- **level8**: iframe loading delays
- **level9**: Random popup on visit

**Important**: Solutions should ONLY modify test code, not application code.

### Working with Branches
```bash
# Switch to a challenge level
git checkout level1

# Install dependencies for that level
npm install

# Run tests multiple times to observe flakiness
npm test
```

## Key Conventions & Patterns

### React Patterns (Legacy)
- **Class Components**: All components use React class syntax (pre-hooks era)
- **PropTypes**: Used for runtime type checking
- **getDerivedStateFromProps**: Used for syncing props to state
- **Controlled Components**: All form inputs are controlled

### State Management
- **Local State**: All state managed within components (no Redux/Context)
- **Underscore Prefix**: Internal state variables prefixed with `_` (e.g., `_loading`, `_saveStatus`)
- **localStorage**: Used as mock database

### Naming Conventions
- **Components**: Numbered prefix indicating tutorial progression (08-, 09-, 10-)
- **Files**: Kebab-case for config, camelCase for components
- **Branches**: Lowercase with numbers (level1, level2, etc.)

### Code Style
- **No semicolons** (enforced by Prettier)
- **Single quotes** for strings
- **2-space indentation**
- **Trailing commas** in multiline structures

## Common Flakiness Patterns

### Timing Issues
The application intentionally includes several sources of flakiness:

1. **Random Load Delays**: 0-1000ms for initial data load
2. **Fixed Course Load**: 1000ms delay when fetching courses
3. **Variable Save Delay**: 3500-4500ms for form submission
4. **UI State Transitions**: Button states change based on async operations

### Testing Anti-Patterns to Avoid
- Fixed waits (cy.wait(milliseconds)) without reason
- Not waiting for async operations to complete
- Assuming immediate DOM updates
- Not handling loading states

### Recommended Test Patterns
- Use `cy.contains()` with timeout options
- Wait for specific element states before proceeding
- Use `.should()` assertions for retryability
- Leverage Cypress's built-in retry logic

## AI Assistant Guidelines

### When Analyzing Tests
1. **Identify Race Conditions**: Look for async operations (API calls, course loading, form saves)
2. **Check Timeouts**: Verify appropriate timeout values for operations
3. **Validate Assertions**: Ensure assertions check actual application state
4. **Review Selectors**: Confirm selectors target correct elements

### When Fixing Flaky Tests
1. **Preserve Application Code**: Only modify test files (`cypress/e2e/*.cy.js`)
2. **Use Cypress Best Practices**: Leverage built-in retry and wait mechanisms
3. **Add Explicit Waits**: Wait for loading indicators, specific states, or content
4. **Increase Timeouts**: Account for maximum expected delays (e.g., 5000ms for course load)
5. **Chain Commands**: Use Cypress command chaining for sequential operations

### When Adding Features
1. **Match Existing Patterns**: Use class components, PropTypes, getDerivedStateFromProps
2. **Simulate Delays**: Add realistic delays for async operations
3. **Handle Loading States**: Show loading indicators during async operations
4. **Maintain Test Coverage**: Update tests to cover new functionality

### Code Review Focus
1. **Timing**: Verify all timeouts account for worst-case delays
2. **State Management**: Check state updates trigger properly
3. **Error Handling**: Ensure errors display and tests handle failures
4. **Accessibility**: Verify elements have appropriate names/labels for testing

### Git Workflow
- **Feature Branches**: Use `claude/` prefix (e.g., `claude/fix-test-timing`)
- **Commit Messages**: Clear, descriptive messages focusing on "why"
- **Push Strategy**: Use `git push -u origin <branch-name>`
- **No Force Push**: Avoid force pushing to main/master

## Environment Requirements

### Node Version
**Required**: 20.11.1 (specified in .nvmrc)
```bash
# Use correct Node version
nvm use
# or
nvm install 20.11.1
nvm use 20.11.1
```

### Browser Requirements
CircleCI uses `cimg/node:20.19-browsers` which includes:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)

### System Dependencies
- npm or yarn
- Git
- Modern browser (for interactive testing)

## Troubleshooting Common Issues

### Installation Issues
```bash
# Use force flag for legacy peer dependencies
npm ci --force
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Cypress Not Verified
```bash
# Manually verify Cypress installation
npx cypress verify
npx cypress info
```

### Tests Passing Locally But Failing in CI
- Check Node version consistency (.nvmrc)
- Verify timeout values account for CI slowness
- Review CI-specific environment factors (headless mode, resources)

### Flaky Tests Not Reproducing
```bash
# Run tests multiple times
for i in {1..10}; do npm test; done

# Or use Cypress test retries in configuration
```

## Important Files for AI Assistants

### Always Read Before Changes
1. `package.json` - Dependencies and scripts
2. `cypress.config.js` - Test configuration
3. `cypress/e2e/app.cy.js` - Current test implementation
4. `src/10-remote-persist.js` - Main application logic
5. `src/api/client.js` - Timing delays source

### Configuration Files
- `.nvmrc` - Node version requirement
- `.prettierrc.json` - Code formatting rules
- `vite.config.js` - Build configuration
- `.circleci/config.yml` - CI/CD pipelines

### Documentation
- `README.md` - User-facing documentation
- This file (`CLAUDE.md`) - AI assistant guide

## Resources & Links

- **Blog Post**: [Cypress Flaky Tests Exercises](https://glebbahmutov.com/blog/cypress-flaky-tests-exercises/)
- **Cypress Courses**: https://cypress.tips/courses
- **Author's Site**: https://glebbahmutov.com
- **Cypress Tips**: https://cypress.tips
- **Newsletter**: https://cypresstips.substack.com/

## Quick Reference Commands

```bash
# Development
npm install          # Install dependencies
npm start            # Start dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run Cypress headless
npm run test:open    # Open Cypress UI
npm run test:headed  # Run with browser visible

# Git
git checkout level1  # Switch to challenge level
git checkout main    # Return to main branch
git branch -a        # List all branches

# Node Version
nvm use              # Use version from .nvmrc
node --version       # Check current version

# Cypress
npx cypress verify   # Verify installation
npx cypress info     # Show Cypress info
```

## Notes for Future Development

1. **React Version**: Currently on React 16.12.0 (pre-hooks). Consider modernization carefully as it affects educational value.
2. **Vite Migration**: Successfully migrated from Create React App to Vite for faster builds.
3. **Test Stability**: Main branch should always have stable tests; only level branches should be flaky.
4. **Educational Focus**: Preserve intentional flakiness in level branches for learning purposes.
5. **CI Coverage**: All level branches have dedicated CI workflows to detect flakiness.

---

**Last Updated**: 2025-12-05
**Version**: 1.0.0
