import { SignupUser } from './SignupUser';

export const invalidEmailUser: SignupUser = {
  firstName: 'John',
  lastName: 'Smith',
  country: 'Canada',
  email: 'abc.com',
  password: 'Password@123'
};

export const shortPasswordUser: SignupUser = {
  firstName: 'John',
  lastName: 'Smith',
  country: 'Canada',
  email: 'john@test.com',
  password: '123'
};

export const emptyFieldsUser: SignupUser = {
  firstName: '',
  lastName: '',
  country: 'Canada',
  email: '',
  password: ''
};