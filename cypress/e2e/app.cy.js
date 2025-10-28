describe('Sign Up', () => {
  it('Adds person to course', () => {
    // Make delays deterministic and clear persisted state
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.Math, 'random').returns(0)
        win.localStorage.clear()
      },
    })

    // Wait for initial data load to finish
    cy.get('img[alt="loading"]').should('not.exist')

    // Fill in the form
    cy.get('input[name="name"]').click().type('Some Name')
    cy.get('input[name="email"]').click().type('some@email.com')

    // Select department and wait for courses to populate
    cy.get('select[name="department"]').select('core')
    cy.get('select[name="course"]', { timeout: 10000 }).should('exist')
    cy.get('select[name="course"] option').contains('git-it').should('exist')

    // Choose course and submit
    cy.get('select[name="course"]').select('git-it')
    cy.get('input[type="submit"]').click()

    // Wait for save completion and verify
    cy.contains('input[type="submit"]', 'Saved!', { timeout: 10000 }).should(
      'be.visible',
    )
    cy.contains('li', 'Some Name - some@email.com - core - git-it').should(
      'be.visible',
    )
  })
})
