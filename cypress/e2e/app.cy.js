describe('Sign Up', () => {
  it('Adds person to course', () => {
    cy.visit('/')

    // type user name into input
    cy.get('input[name="name"]').click().type('Some Name')
    // type user email
    cy.get('input[name="email"]').click().type('some@email.com')
    // select the "core" department
    cy.get('select[name="department"]').select('core')
    // select the "git-it" course
    cy.get('select[name="course"]').select('git-it')
    // submit the form
    cy.get('input[type="submit"]').click()
    // the "Saved!" message should appear - wait up to 5 seconds for the async save
    cy.get('input[value="Saved!"]', { timeout: 5000 }).should('be.visible')
    // and the list of registered people should contain the new person
    // including the email and the course name
    cy.get('li').should('contain', 'Some Name - some@email.com - core - git-it')
  })
})
