import { expect, Page, Response } from '@playwright/test';
import { BasePage } from '../BasePage';
import { SignupUser } from '../fixtures/SignupUser';

export class SignupPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    // ===========================
    // Page Elements
    // ===========================

    readonly heading = this.page.getByRole('heading', { level: 2 });

    readonly firstName = this.page.getByTestId('first-name-input');

    readonly lastName = this.page.getByTestId('last-name-input');

    readonly phoneCountry = this.page.locator('select[name="phoneCountry"]');

    readonly phoneNumber = this.page.locator('input[type="tel"]');

    readonly email = this.page.getByTestId('email-input');

    readonly provinceOfPurchase = this.page.getByTestId('region-select');

    readonly termsCheckbox = this.page.getByTestId('agreement-checkbox').first();

    readonly password =
        this.page.getByTestId('password-input');

    readonly confirmPassword =
        this.page.getByTestId('passwordConfirmation-input');

    readonly createAccountButton = this.page.getByTestId('submit-button');

    readonly languageSwitch = this.page.getByTestId('header-language-switch');

    readonly loginButton = this.page.getByTestId('header-login-button');

    readonly firstNameError =
        this.page.getByTestId('first-name-error-message-typography');

    readonly lastNameError =
        this.page.getByTestId('last-name-error-message-typography');

    readonly phoneError =
        this.page.getByTestId('phone-error-message-typography');

    readonly regionError =
        this.page.getByTestId('region-error-message-typography');

    readonly emailError =
        this.page.getByTestId('email-error-message-typography');

    readonly passwordError =
        this.page.getByTestId('password-error-message-typography');

    // ===========================
    // Labels & Static Text
    // ===========================

    readonly firstNameLabel = this.page.getByTestId('first-name-input-placeholder');

    readonly lastNameLabel = this.page.getByTestId('last-name-input-placeholder');

    readonly phoneLabel = this.page.getByTestId('input-placeholder');

    readonly provinceLabel = this.page.getByTestId('select-placeholder');

    readonly emailLabel = this.page.getByTestId('email-input-placeholder');

    readonly passwordLabel = this.page.getByTestId('password-input-placeholder');

    readonly confirmPasswordLabel =
        this.page.getByTestId('passwordConfirmation-input-placeholder');

    readonly provinceOptions = this.provinceOfPurchase.locator('option');

    // Hint has no unique test id; scope it to the password field's group
    readonly passwordHint =
        this.page.getByRole('group').filter({ has: this.password }).getByTestId('typography');

    readonly consentLabel =
        this.page.locator('label[for="leadDistributeConsentAgreement"]');

    readonly loginLink = this.page.getByTestId('login-link');

    readonly loginPrompt =
        this.page.getByTestId('typography').filter({ has: this.loginLink });

    readonly termsLink = this.page.getByTestId('terms-link');

    readonly termsNotice =
        this.page.getByTestId('typography').filter({ has: this.termsLink });

    // ===========================
    // Navigation
    // ===========================

    async goto() {
        // Wait for the app to finish loading; interacting earlier lets it reset the form
        await this.page.goto('/signup', { waitUntil: 'networkidle' });
    }

    async verifyPageLoaded() {
        await expect(this.firstName).toBeVisible();
        await expect(this.createAccountButton).toBeVisible();
    }

    // ===========================
    // Form Actions
    // ===========================

    async enterFirstName(firstName: string) {
        await this.firstName.fill(firstName);
    }

    async enterLastName(lastName: string) {
        await this.lastName.fill(lastName);
    }

    async selectPhoneCountry(countryCode: string) {
        await this.phoneCountry.selectOption(countryCode);
    }

    async enterPhoneNumber(phone: string) {
        await this.phoneNumber.fill(phone);
    }

    async enterEmail(email: string) {
        await this.email.fill(email);
    }

    async enterPassword(password: string) {
        await this.password.fill(password);
    }

    async enterConfirmPassword(password: string) {
        await this.confirmPassword.fill(password);
    }

    async submit() {
        // Retry: the page can reset the checkbox while it is still hydrating
        await expect(async () => {
            await this.termsCheckbox.check();
            await expect(this.termsCheckbox).toBeChecked({ timeout: 1000 });
        }).toPass({ timeout: 10000 });
        await this.createAccountButton.click();
    }

    async selectProvince(province: string) {
        await this.provinceOfPurchase.selectOption({ value: province });
    }

    async signup(user: SignupUser) {

        await this.enterFirstName(user.firstName);

        await this.enterLastName(user.lastName);

        if (user.phone) {
            await this.enterPhoneNumber(user.phone);
        }

        await this.enterEmail(user.email);

        await this.enterPassword(user.password);

        await this.enterConfirmPassword(user.password);

        await this.selectProvince(user.province);
    }

    // ===========================
    // API Helpers
    // ===========================
    async submitAndWait(user: SignupUser): Promise<Response> {
        await this.signup(user);
        const responsePromise = this.page.waitForResponse(response =>
            response.url().includes('/api/accounts') &&
            response.request().method() === 'POST'
        );
        await this.submit();
        return await responsePromise;
    }

    async waitForSignupResponse(): Promise<Response> {
        return this.page.waitForResponse(response =>
            response.url().includes("/api/accounts") &&
            response.request().method() === "POST"
        );
    }

    // ===========================
    // Helpers
    // ===========================

    async switchLanguage(language: 'en' | 'fr') {

        const isFrench = this.page.url().includes('/fr/');

        if (language === 'fr' && !isFrench) {
            await this.languageSwitch.click();
            await expect(this.page).toHaveURL(/\/fr\/signup/);
        }

        if (language === 'en' && isFrench) {
            await this.languageSwitch.click();
            await expect(this.page).toHaveURL(/\/signup$/);
        }
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async logAllPostRequests() {
        this.page.on('request', request => {
            if (request.method() === 'POST') {
                console.log('POST Request:', request.url());
            }
        });

        this.page.on('response', async response => {
            if (response.request().method() === 'POST') {
                console.log('POST Response:', response.url(), response.status());
            }
        });
    }

    async submitEmptyForm() {
        await this.createAccountButton.click();
    }

    async expectFirstNameRequired() {
        await expect(this.firstNameError)
            .toContainText('The field is required');
    }

    async expectLastNameRequired() {
        await expect(this.lastNameError)
            .toContainText('The field is required');
    }

    async expectPhoneInvalid() {
        await expect(this.phoneError)
            .toContainText('Invalid value');
    }

    async expectRegionRequired() {
        await expect(this.regionError)
            .toContainText('The field is required');
    }

    async expectEmailInvalid() {
        await expect(this.emailError)
            .toContainText('Invalid email');
    }

    async expectPasswordInvalid() {
        await expect(this.passwordError)
            .toContainText('Minimum of 12 letters required');
    }
}