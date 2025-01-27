

const { isValidEmail, isValidPassword } = require('../auth-utils');


describe('Validation Functions', () => {
  test('isValidEmail should validate email formats correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
  });

  test('isValidPassword should validate password strength', () => {
    expect(isValidPassword('Strong@123')).toBe(true);
    expect(isValidPassword('weakpass')).toBe(false);
    expect(isValidPassword('NoSpecial123')).toBe(false);
    expect(isValidPassword('short@1')).toBe(false);
  });
});


