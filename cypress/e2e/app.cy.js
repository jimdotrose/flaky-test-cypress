describe('Sign Up', () => {
  it('Adds person to course', () => {
    cy.visit('/')

    // Wait for initial loading to complete - the form should be visible
    cy.get('form').should('be.visible')

    // type user name into input
    cy.get('input[name="name"]').click().type('Some Name')
    // type user email
    cy.get('input[name="email"]').click().type('some@email.com')
    // select the "core" department
    cy.get('select[name="department"]').select('core')

    // Wait for the course dropdown to be populated after department selection
    // The app has a 1-second delay loading courses
    cy.get('select[name="course"]').should('be.visible')
    cy.get('select[name="course"] option[value="git-it"]').should('exist')

    // select the "git-it" course
    cy.get('select[name="course"]').select('git-it')
    // submit the form
    cy.get('input[type="submit"]').click()

    // Wait for the async save operation to complete
    // the "Saved!" message should appear (not "Saving...")
    cy.get('input[value="Saved!"]').should('be.visible')

    // and the list of registered people should contain the new person
    // including the email and the course name
    cy.get('li').should('contain', 'Some Name - some@email.com - core - git-it')
  })
})
