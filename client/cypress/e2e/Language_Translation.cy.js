it('Language_Translation (cookie method)', () => {
  cy.visit('http://localhost:5173/');

  // Switch to Sinhala
  cy.setCookie('googtrans', '/auto/si');
  cy.reload();

  // Assert some Sinhala text appears (pick text that exists on your page)
  cy.contains(/ලංකා|වෙත|කරත්තය|සාදරයෙන්/i, ).should('exist');

  // Switch to Tamil
  cy.setCookie('googtrans', '/auto/ta');
  cy.reload();
  cy.contains(/வரவேற்கிறோம்|கூடை|ஆர்டர்/i, ).should('exist');

  // Back to English
  cy.setCookie('googtrans', '/auto/en');
  cy.reload();
  cy.contains(/Welcome|Cart|Checkout/i, ).should('exist');
});
