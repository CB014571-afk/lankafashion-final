// driver_registration.cy.js

describe('Driver Registration', () => {
  it('should register a new driver successfully', () => {
    cy.visit('http://localhost:5173/register');
    cy.get('select[name="role"]').select('Driver');
    cy.get('input[name="name"]').type('Test Driver');
    cy.get('input[name="email"]').type('testdriver@example.com');
    cy.get('input[name="password"]').type('TestPassword123');
    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Registered successfully!');
    });
  });
});
