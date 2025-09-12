describe('Driver Accept Delivery', () => {
  it('should log in and accept a delivery', function() {
    cy.visit('http://localhost:5173/login');
    cy.get('[placeholder="Email"]').clear().type('sheryl@gmail.com');
    cy.get('[placeholder="Password"]').clear().type('4321');
    cy.get('[type="submit"]').click();
    cy.on('window:alert', (msg) => {
      expect(msg).to.equal('Login successful!');
    });
    // Wait for dashboard to load if needed
    cy.wait(1000);
    // Accept delivery (update selector if needed)
    cy.get(':nth-child(1) > :nth-child(8) > button').click();
  
  });
});
