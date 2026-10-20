import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { SignupFactory } from '../fixtures/signupFactory';

const languages = [
  {
    name: 'English',
    code: 'en' as const,
    validation: {
      required: 'The field is required',
      email: 'Invalid email',
      phone: 'Invalid value',
      password: 'Minimum of 12 letters required'
    },
    labels: {
      pageTitle: 'nesto | Signup',
      heading: 'Create a nesto account',
      languageSwitch: 'FR',
      headerLogin: 'Login',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone number',
      province: 'Province of purchase',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      passwordHint: 'Password must be between 12 and 32 characters and contain one uppercase letter, one lowercase letter and one number.',
      consent: 'By checking this box, you agree to be contacted by nesto’s partners for the purposes of offering you financial products. You agree to nesto sharing your mortgage information with its partners. You can opt-out at any time.',
      submit: 'Create your account',
      loginPrompt: 'Already have an account? Log in.',
      loginUrl: '/',
      termsNotice: 'By clicking on "Create your account", I agree and consent to the Terms of Service.',
      termsUrl: 'https://www.nesto.ca/terms-of-services/',
      provinces: [
        'Ontario', 'Quebec', 'Alberta', 'British-Columbia', 'Manitoba',
        'New Brunswick', 'Nova Scotia', 'Newfoundland and Labrador',
        'Prince Edward Island', 'Saskatchewan', 'Northwest Territories',
        'Yukon', 'Nunavut'
      ]
    }
  },
  {
    name: 'French',
    code: 'fr' as const,
    validation: {
      required: 'Ce champ est obligatoire.',
      email: 'Courriel invalide',
      phone: 'Valeur invalide.',
      password: 'Minimum de 12 lettres requises'
    },
    labels: {
      pageTitle: 'nesto | Enregistrement',
      heading: 'Créez un compte nesto',
      languageSwitch: 'EN',
      headerLogin: 'Connexion',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      province: "Province de l'achat",
      email: 'Courriel',
      password: 'Mot de passe',
      confirmPassword: 'Confirmation du mot de passe',
      passwordHint: 'Le mot de passe doit contenir au entre 12 et 32 caractères et contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.',
      consent: 'En cochant cette case, vous acceptez d’être contacté par les partenaires de nesto dans le but de vous proposer des produits financiers. Vous acceptez que nesto partage vos informations de demande hypothécaire avec ses partenaires, si nous ne sommes pas en mesure de vous fournir nos services. Vous pouvez vous désinscrire à tout moment.',
      submit: 'Créez votre compte',
      loginPrompt: 'Vous avez déjà un compte? Connectez-vous.',
      loginUrl: '/fr',
      termsNotice: `En cliquant sur "Créez votre compte", j'accepte et consens aux Conditions d'utilisation.`,
      termsUrl: 'https://www.nesto.ca/fr/conditions-d-utilisation/',
      provinces: [
        'Ontario', 'Québec', 'Alberta', 'Colombie-Britannique', 'Manitoba',
        'Nouveau-Brunswick', 'Nouvelle-Écosse', 'Terre-Neuve-et-Labrador',
        'Île-du-Prince-Édouard', 'Saskatchewan', 'Territoires du Nord-Ouest',
        'Yukon', 'Nunavut'
      ]
    }
  }
];

test.describe('Signup', () => {

  // =========================
  // Positive Tests
  // =========================

  languages.forEach(({ name, code }) => {

    test(`should create a new account successfully - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);
      const user = SignupFactory.createUser();

      await signupPage.goto();
      await signupPage.verifyPageLoaded();
      await signupPage.switchLanguage(code);

      const signupResponse = await signupPage.submitAndWait(user);

      expect(signupResponse.status()).toBe(201);

      const response = await signupResponse.json();

      expect(response.account.firstName).toBe(user.firstName);
      expect(response.account.lastName).toBe(user.lastName);
      expect(response.account.email).toBe(user.email);
      expect(response.account.phone).toBe(user.phone);
      expect(response.account.region).toBe(user.province);
      expect(response.account.preferredLanguage).toBe(code);
      expect(response.account.leadDistributeConsentAgreement).toBe(true);

      expect(response.token.accessToken).toBeTruthy();

      expect(signupResponse.request().postDataJSON().language).toBe(code);

    });

  });

  // =========================
  // Negative Tests
  // =========================

  languages.forEach(({ name, code, validation }) => {

    test(`should validate required fields - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await signupPage.submit();

      await expect(signupPage.firstNameError)
        .toContainText(validation.required);

      await expect(signupPage.lastNameError)
        .toContainText(validation.required);

      await expect(signupPage.phoneError)
        .toContainText(validation.phone);

      // Region defaults to Ontario, so no required error is expected
      await expect(signupPage.provinceOfPurchase).toHaveValue('ON');
      await expect(signupPage.regionError).toBeHidden();

      await expect(signupPage.emailError)
        .toContainText(validation.email);

      await expect(signupPage.passwordError)
        .toContainText(validation.password);

    });

    test(`should show validation for invalid email - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      const user = SignupFactory.createUser({
        email: 'abc.com'
      });

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await signupPage.signup(user);
      await signupPage.submit();

      await expect(signupPage.emailError)
        .toContainText(validation.email);

    });

    test(`should show validation for invalid phone - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      const user = SignupFactory.createUser({
        phone: '123'
      });

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await signupPage.signup(user);
      await signupPage.submit();

      await expect(signupPage.phoneError)
        .toContainText(validation.phone);

    });

    test(`should show validation for weak password - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      const user = SignupFactory.createUser({
        password: '12345'
      });

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await signupPage.signup(user);
      await signupPage.submit();

      await expect(signupPage.passwordError)
        .toContainText(validation.password);

    });

  });

  // =========================
  // Fields & Labels Tests
  // =========================

  languages.forEach(({ name, code, labels }) => {

    test(`should display page title, heading and header - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await expect(page).toHaveTitle(labels.pageTitle);

      await expect(signupPage.heading).toHaveText(labels.heading);

      await expect(signupPage.languageSwitch).toHaveText(labels.languageSwitch);

      await expect(signupPage.loginButton).toHaveText(labels.headerLogin);

    });

    test(`should display field labels - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await expect(signupPage.firstNameLabel).toHaveText(labels.firstName);

      await expect(signupPage.lastNameLabel).toHaveText(labels.lastName);

      await expect(signupPage.phoneLabel).toHaveText(labels.phone);

      await expect(signupPage.provinceLabel).toHaveText(labels.province);

      await expect(signupPage.emailLabel).toHaveText(labels.email);

      await expect(signupPage.passwordLabel).toHaveText(labels.password);

      await expect(signupPage.confirmPasswordLabel).toHaveText(labels.confirmPassword);

    });

    test(`should display password hint, consent, button and links - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await expect(signupPage.passwordHint).toHaveText(labels.passwordHint);

      await expect(signupPage.consentLabel).toHaveText(labels.consent);

      await expect(signupPage.createAccountButton).toHaveText(labels.submit);

      await expect(signupPage.loginPrompt).toHaveText(labels.loginPrompt);
      await expect(signupPage.loginLink).toHaveAttribute('href', labels.loginUrl);

      await expect(signupPage.termsNotice).toHaveText(labels.termsNotice);
      await expect(signupPage.termsLink).toHaveAttribute('href', labels.termsUrl);

    });

    test(`should render fields with correct types and default values - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      const textFields = [
        signupPage.firstName,
        signupPage.lastName,
        signupPage.phoneNumber,
        signupPage.email,
        signupPage.password,
        signupPage.confirmPassword
      ];

      for (const field of textFields) {
        await expect(field).toBeVisible();
        await expect(field).toBeEditable();
        await expect(field).toHaveValue('');
      }

      await expect(signupPage.password).toHaveAttribute('type', 'password');
      await expect(signupPage.confirmPassword).toHaveAttribute('type', 'password');

      await expect(signupPage.phoneNumber).toHaveAttribute('type', 'tel');
      await expect(signupPage.phoneCountry).toHaveValue('CA');

      // Default province can vary, so only check that one is preselected
      await expect(signupPage.provinceOfPurchase).not.toHaveValue('');

      await expect(signupPage.termsCheckbox).not.toBeChecked();

      await expect(signupPage.createAccountButton).toBeEnabled();

    });

    test(`should list all provinces in the province dropdown - ${name}`, async ({ page }) => {

      const signupPage = new SignupPage(page);

      await signupPage.goto();
      await signupPage.switchLanguage(code);

      await expect(signupPage.provinceOptions)
        .toHaveText([labels.province, ...labels.provinces]);

    });

  });

});