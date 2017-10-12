// E2E test for Portal
describe('WISE Portal', () => {

    function hasClass(element, cls) {
        return element.getAttribute('class').then((classes) => {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    }

    let createAccountButton = $('#createAccountButton');
    let forgotAccountLink = $('#forgotLogin a');
    let usernameInput = $('#username');
    let passwordInput = $('#password');
    let signInButton = $('#signInButton');
    let contactUSLink = element(by.cssContainingText('a', 'Contact US'));

    it('should show WISE logo and login inputs in the homepage', () => {
        isAngularSite(false);
        browser.get('http://localhost:8080/wise/');

        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(usernameInput.isPresent()).toBeTruthy();
        expect(passwordInput.isPresent()).toBeTruthy();
        expect(signInButton.isPresent()).toBeTruthy();
        expect(createAccountButton.isPresent()).toBeTruthy();
        expect(forgotAccountLink.isPresent()).toBeTruthy();
        expect(contactUSLink.isPresent()).toBeTruthy();
    });

    it('should not allow invalid username/password to log in', () => {
        isAngularSite(false);
        browser.get('http://localhost:8080/wise/');
        // try to log in with empty username/password
        signInButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/login?failed=true');
        expect(browser.getTitle()).toEqual('Sign In');
        expect(usernameInput.isPresent()).toBeTruthy();
        expect(passwordInput.isPresent()).toBeTruthy();
        expect(signInButton.isPresent()).toBeTruthy();
        expect($(".forgotlink[href='forgotaccount/selectaccounttype']").isPresent()).toBeTruthy();
        expect($(".joinlink[href='join']").isPresent()).toBeTruthy();
        let returnToWISELink = $(".joinlink[href='/wise/']");
        expect(returnToWISELink.isPresent()).toBeTruthy();

        // test empty username
        usernameInput.sendKeys('preview');
        signInButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/login?failed=true');

        // test empty password
        passwordInput.sendKeys('wise');
        signInButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/login?failed=true');

        // test invalid username/password combo
        usernameInput.sendKeys('preview');
        passwordInput.sendKeys('bad_password');
        signInButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/login?failed=true');

        // clicking on return to WISE link should take user back to homepage
        returnToWISELink.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });

    it('should allow user to reach the create account page from the homepage', () => {
        isAngularSite(false);
        browser.get('http://localhost:8080/wise/');
        createAccountButton.click();
        expect(browser.getTitle()).toEqual('Create WISE Account');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/join');
        let createStudentAccountLink = element(by.cssContainingText('a','Student Account'));
        let createTeacherAccountLink = element(by.cssContainingText('a','Teacher Account'));
        expect(createStudentAccountLink.isPresent()).toBeTruthy();
        expect(createTeacherAccountLink.isPresent()).toBeTruthy();
        let returnToHomepageLink = element(by.cssContainingText('a','Return to Home Page'));
        expect(returnToHomepageLink.isPresent()).toBeTruthy();

        // clicking on return to homepage link should take user back to homepage
        returnToHomepageLink.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });

    it('should allow user to reach the contact us page from the homepage', () => {
        isAngularSite(false);
        browser.get('http://localhost:8080/wise/');
        contactUSLink.click();
        expect(browser.getTitle()).toEqual('Contact WISE');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/contact/contactwise.html');
        expect($('#name').isPresent()).toBeTruthy();
        expect($('#email').isPresent()).toBeTruthy();
        expect($('#issuetype').isPresent()).toBeTruthy();
        expect($('#summary').isPresent()).toBeTruthy();
        expect($('#description').isPresent()).toBeTruthy();
        expect($('#sendMessageButton').isPresent()).toBeTruthy();
        let returnToHomepageLink = element(by.cssContainingText('a','Return to Home Page'));
        expect(returnToHomepageLink.isPresent()).toBeTruthy();

        // clicking on return to homepage link should take user back to homepage
        returnToHomepageLink.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });

    // TODO: test create account student
    // TODO: test create account teacher

});
