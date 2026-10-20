# Nesto Playwright test suite

## Prerequisites

- Node.js and npm
- Access to the Nesto environment you want to test

## Install

From the project folder, install the dependencies and the Chromium browser used by Playwright:

```powershell
npm install
npx playwright install chromium
```

## Configure

Create a `.env` file in the project root and set `BASE_URL` to the base address of the target environment:

```dotenv
BASE_URL=https://your-nesto-environment.example
```

The signup tests navigate to `/signup`, so `BASE_URL` should not include that path.

## Run

Run the complete test suite:

```powershell
npx playwright test
```

The browser runs visibly (headed), as configured in `playwright.config.ts`. To run only the signup tests:

```powershell
npx playwright test tests/signup.spec.ts
```

The successful-signup tests create accounts in the configured environment. Use an appropriate test environment.

## View results

After a run, open the HTML report with:

```powershell
npx playwright show-report
```

Screenshots, traces, and videos are retained for failed tests.
