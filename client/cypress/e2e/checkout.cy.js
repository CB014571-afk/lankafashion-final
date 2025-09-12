it('Place an order', function() {
  cy.visit('http://localhost:5173/login');

  cy.get('[placeholder="Email"]').clear().type('Shevon@gmail.com');
  cy.get('[placeholder="Password"]').clear().type('123');
  cy.get('[type="submit"]').click();

  cy.get('a button').click();
  cy.get(':nth-child(2) > .btn-wrapper > .cart-btn').click();
  cy.get('.add').click();
  cy.get('[href="/cart"]').click();
  cy.get('.checkout-btn').click();

  cy.get('[name="name"]').clear().type('customer');
  cy.get('[name="address"]').clear().type('123 Panandura');
  cy.get('[name="email"]').clear().type('buyer@gmail.com');
  cy.get('[name="phone"]').clear().type('0112234213');

  cy.get('.submit-btn').click();
});
