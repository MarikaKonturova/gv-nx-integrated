/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe('MapComponent', () => {
  beforeEach(() => {
    cy.visit('/main');
  });

  it('should render the map container', () => {
    cy.get('#map-container').should('be.visible');
  });

  it('should display the spinner while the map is loading', () => {
    cy.get('#map-container').should('have.class', 'spinner');
    cy.window().then(win => {
      const map = win.document.querySelector('#map-container');

      map?.addEventListener('loadend', () => {
        cy.get('#map-container').should('not.have.class', 'spinner');
      });
    });
  });

  it('should switch to draw interaction, enable drawing and show poopup', () => {
    cy.get('#map-container').should('have.class', 'spinner');

    cy.get('[data-value="edit"]').click();
    cy.get('[data-value="draw"]').click();
    cy.get('#map-container').should('be.visible').scrollIntoView();
    cy.viewport(1000, 800);
    cy.get('#map-container').should('not.have.class', 'spinner', { timeout: 10000 });
    cy.get('canvas').then($canvas => {
      const canvasWidth = $canvas.width()!;
      const canvasHeight = $canvas.height()!;

      cy.wrap($canvas).click(canvasHeight / 2, canvasWidth / 2);
      cy.wrap($canvas).click(canvasHeight / 3, canvasWidth / 2);
      cy.wrap($canvas).click(canvasHeight / 3, canvasWidth / 3);
      cy.wrap($canvas).click(canvasHeight / 2, canvasWidth / 2);
      cy.get('[data-value="info"]').click();

      cy.wrap($canvas).click(canvasHeight / 2, canvasWidth / 2);
      cy.get('.ol-popup').should('be.visible');
    });
  });
});
