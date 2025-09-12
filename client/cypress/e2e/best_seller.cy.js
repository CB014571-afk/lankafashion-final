// best_seller.cy.js

describe('Best Seller Feature', () => {
  it('should display the TOP SELLER badge for the best seller products', () => {
    cy.visit('http://localhost:5173/shop');
    // Check that at least one product has the TOP SELLER badge
    cy.get('.best-seller-badge').should('contain', 'TOP SELLER');
    // Check each product card for the badge using .each()
    cy.get('.product-card').each(($card) => {
      if ($card.find('.best-seller-badge').length) {
        cy.wrap($card).find('.best-seller-badge').should('contain', 'TOP SELLER');
      }
    });
  });
});
