// driver_login.cy.js

describe('Driver Login', () => {
  it('should log in a driver successfully', () => {
    cy.visit('http://localhost:5173/login');
    cy.get('input[type="email"]').type('testdriver@example.com');
    cy.get('input[type="password"]').type('TestPassword123');
    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Login successful!');
    });
  });
});
