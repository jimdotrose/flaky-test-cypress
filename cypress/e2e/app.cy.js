describe('Sign Up', () => {
  it('Adds person to course', () => {
    cy.clearLocalStorage()
    cy.visit('/')

    // type user name into input
    cy.get('input[name="name"]').click().type('Some Name')
    // type user email
    cy.get('input[name="email"]').click().type('some@email.com')
    // select the "core" department
    cy.get('select[name="department"]').select('core')
    // wait for courses to load and include "git-it"
    cy.get('select[name="course"]').should('contain', 'git-it')
    // select the "git-it" course
    cy.get('select[name="course"]').select('git-it')
    // submit the form
    cy.get('input[type="submit"]').click()
    // the "Saved!" message should appear (allow extra time)
    cy.get('input[value="Saved!"]', { timeout: 8000 }).should('be.visible')
    // and the list of registered people should contain the new person
    // including the email and the course name
    cy.get('li', { timeout: 8000 }).should(
      'contain',
      'Some Name - some@email.com - core - git-it',
    )
  })
})
