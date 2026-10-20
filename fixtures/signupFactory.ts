import { faker } from '@faker-js/faker';
import { SignupUser } from './SignupUser';

export class SignupFactory {

  static createUser(overrides: Partial<SignupUser> = {}): SignupUser {

    // Generate a unique 7-digit number
    const uniqueNumber = faker.string.numeric(7);

    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),

      // API expects +1514xxxxxxx
      phone: `+1514${uniqueNumber}`,

      // Ensure uniqueness
      email: `qa_${Date.now()}_${faker.string.alphanumeric(5).toLowerCase()}@mailinator.com`,

      password: 'Srikanth@1988',

      // UI value (adjust if your dropdown expects abbreviation)
      province: 'ON',

      ...overrides
    };
  }
}