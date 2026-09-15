describe('Página inicial - TrihbAU PetShop', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve carregar a página com sucesso', () => {
    cy.url().should('include', 'localhost:5173');
  });

  it('deve exibir o título/hero principal', () => {
    cy.get('h1').should('be.visible');
  });

  it('deve exibir a seção de serviços', () => {
    cy.contains(/cuidados|tosas|banho/i).should('exist');
  });

  it('deve ter o botão de contato/WhatsApp visível', () => {
    cy.get('a[href*="wa.me"], a[href*="whatsapp"]').should('exist');
  });

  it('deve navegar até a seção de contato ao clicar no link do menu', () => {
    cy.contains(/contato/i).click();
    cy.url().should('include', '#contato');
  });
});