// E2E test for Portal
describe('WISE forgot account pages for teachers and students', () => {

    function hasClass(element, cls) {
        return element.getAttribute('class').then((classes) => {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    }

    let forgotAccountLink = $('#forgotLogin a');

    it('should show select account page', () => {
        isAngularSite(false);
        browser.get('http://localhost:8080/wise/');
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(forgotAccountLink.isPresent()).toBeTruthy();
        forgotAccountLink.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/forgotaccount/selectaccounttype');
        let forgotStudentAccountLink = element(by.cssContainingText('a','Student Account'));
        let forgotTeacherAccountLink = element(by.cssContainingText('a','Teacher Account'));
        let returnToHomepageLink = element(by.cssContainingText('a','Return to Home Page'));
        expect(forgotStudentAccountLink.isPresent()).toBeTruthy();  // should have button to retrieve student account
        expect(forgotTeacherAccountLink.isPresent()).toBeTruthy();  // should have button to retrieve teacher account
        expect(returnToHomepageLink.isPresent()).toBeTruthy();  // should have link back to home page

        // clicking on return to homepage link should take user back to homepage
        returnToHomepageLink.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });

    // TODO: test forgot account student
    // TODO: test forgot account teacher
});
