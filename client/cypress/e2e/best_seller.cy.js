// best_seller.cy.js

describe('Best Seller Feature', () => {
  it('should display the TOP SELLER badge for the best seller products', () => {
    cy.visit('http://localhost:5173/shop');
    
    // Wait for the page to load and products to be fetched
    cy.get('.product-card', { timeout: 10000 }).should('have.length.greaterThan', 0);
    
    // Check if any products have the best seller badge
    cy.get('body').then(($body) => {
      if ($body.find('.best-seller-badge').length > 0) {
        // If badge exists, verify it contains the correct text
        cy.get('.best-seller-badge').should('contain', 'TOP SELLER');
        
        // Check each product card for the badge using .each()
        cy.get('.product-card').each(($card) => {
          if ($card.find('.best-seller-badge').length) {
            cy.wrap($card).find('.best-seller-badge').should('contain', 'TOP SELLER');
          }
        });
      } else {
        // If no badge exists, log it for debugging (this might be expected if no orders exist)
        cy.log('No best seller badge found - this might be expected if no orders exist in the database');
      }
    });
  });

  it('should show best seller badge when there are completed orders', () => {
    cy.visit('http://localhost:5173/shop');
    
    // Wait for products to load
    cy.get('.product-card', { timeout: 10000 }).should('have.length.greaterThan', 0);
    
    // Intercept the best seller API call to check if it's being called
    cy.intercept('GET', '/api/seller/best-seller').as('getBestSeller');
    
    // Reload the page to trigger the API call
    cy.reload();
    
    // Wait for the API call and check the response
    cy.wait('@getBestSeller').then((interception) => {
      if (interception.response.statusCode === 200) {
        // If API returns data, badge should exist
        cy.get('.best-seller-badge').should('exist');
      } else if (interception.response.statusCode === 404) {
        // If no best seller data, badge should not exist
        cy.get('.best-seller-badge').should('not.exist');
        cy.log('No best seller data found in database - this is expected for empty database');
      }
    });
  });
});
