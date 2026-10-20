# Assumptions

## Scope
- The suite targets the signup page in the QA environment (`/signup` and `/fr/signup`) only.
- Tests run on Chromium at a desktop viewport. Cross-browser and mobile coverage are out of scope for this exercise.
- The account-creation API is verified by capturing the browser's `POST /api/accounts` response during a real UI signup, rather than calling the API directly. This validates the integration path a user actually follows.

## Source of truth for expected text
- No functional specification or translation glossary was provided. Expected labels and validation messages are therefore based on the current QA UI in both languages.
- These assertions establish a regression baseline for the current UI copy; they do not imply that every message is the intended product requirement. Wording or translation inconsistencies found during testing are documented in `BUG_REPORT.md` rather than causing the baseline tests to fail.

## Environment
- `BASE_URL` is configured through a local `.env` file, which is not committed to source control.
- The QA environment is assumed to be accessible without authentication or a VPN.

## Test data
- Each run generates unique data: email addresses follow `qa_<timestamp>_<random>@mailinator.com`, and phone numbers use `+1514` followed by seven random digits to reduce collisions between runs.
- Accounts created by positive tests are not deleted. No account-deletion endpoint was provided, and creating test accounts is assumed to be acceptable in QA.
- Test data is intended for the QA environment only. It is assumed that test signup does not trigger real customer communications

## Application behaviour
- The province dropdown has a preselected value. Ontario was observed during development, while the challenge screenshot shows Quebec, so the default may vary by environment or location. The field/default-value test checks that a province is selected rather than hardcoding one. The existing required-fields test still assumes Ontario; that expectation is environment-specific and should be adjusted if the default differs.
- The UI language is determined by the URL (`/signup` or `/fr/signup`). The account's `preferredLanguage` in the API response is expected to match the selected language.
- The partner-consent checkbox is selected before signup submissions, so the suite currently covers the opted-in path. Signup without that consent is not covered.

## Framework design decisions
- **Page Object Model:** Locators and page actions are kept in `pages/SignupPage.ts`; tests focus on scenarios and assertions.
- **Selectors:** `data-testid` is preferred. Where an element lacks a unique test ID (such as the password hint, consent label, or login prompt), the locator is anchored to a nearby stable element rather than relying on CSS classes or visible text.
- **Data-driven localisation:** A single spec iterates through a `languages` array containing expected labels and validation messages, allowing the same scenarios to run in English and French without duplicating test logic.
- **Synchronisation:** During development, some fields were occasionally reset while the page was still initializing. The suite uses a `networkidle` wait and retries the consent-checkbox selection to improve stability. This is a pragmatic workaround, not a guarantee of application readiness; an application-specific readiness signal would be more reliable in a production framework.

## Out of scope / next steps
- Additional negative scenarios: duplicate email, password-confirmation mismatch, password-complexity rules beyond minimum length, maximum input lengths, and verifying that invalid forms do not send an account-creation API request.
- Direct API contract tests for invalid payloads, error codes, and response schemas.
- Post-signup workflows, such as email verification and logging in with a newly created account.
- Accessibility audits, visual regression, cross-browser runs, and CI pipeline integration.
