
it('Buyer_delivery_notification', function() {
  cy.visit('http://localhost:5173/login')
  cy.get('[placeholder="Email"]').type('Shevon@gmail.com');
 
  cy.get('[placeholder="Password"]').type('123');
  cy.get('[type="submit"]').click();
  cy.get('[title="Notifications"]').click();
  cy.get('.ok-button').click();
  
});
