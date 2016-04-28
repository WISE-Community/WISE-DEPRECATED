// E2E test for Setting up a run. The project we created in authoringTool.spec.es6 should now be available in the Project Library
describe('WISE Setting Up a Run', () => {

    function hasClass(element, cls) {
        return element.getAttribute('class').then((classes) => {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    /**
     * @name waitForUrlToChangeTo
     * @description Wait until the URL changes to match a provided regex
     * @param {RegExp} urlRegex wait until the URL changes to match this regex
     * @returns {!webdriver.promise.Promise} Promise
     */
    function waitForUrlToChangeTo(urlRegex) {
        var currentUrl;

        return browser.getCurrentUrl().then(function storeCurrentUrl(url) {
                currentUrl = url;
            }
        ).then(function waitForUrlToChangeTo() {
                return browser.wait(function waitForUrlToChangeTo() {
                    return browser.getCurrentUrl().then(function compareCurrentUrl(url) {
                        return urlRegex.test(url);
                    });
                });
            }
        );
    };

    it('should require teacher user to log in to view the project library', () => {
        browser.ignoreSynchronization = true;  // doesn't use Angular
        browser.get('http://localhost:8080/wise/login');

        expect(browser.getTitle()).toEqual('Sign In');
    });

    it('should log in using preview username and password and open the project library', () => {
        browser.ignoreSynchronization = true;  // doesn't use Angular
        element(by.id('username')).sendKeys('preview');
        element(by.id('password')).sendKeys('wise');
        element(by.id('signInButton')).click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher');
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');

        // click on the project library link
        let projectLibraryLink = element(by.id('projectLibraryLink'));
        expect(projectLibraryLink.isPresent()).toBeTruthy();
        projectLibraryLink.click();

        // check that the user is now on the Project Library page and has projects
        expect(browser.getTitle()).toEqual('Project Library');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher/management/library.html');
        let setUpRunLink = element(by.className('setupRun'));
        expect(setUpRunLink.isPresent()).toBeTruthy();
        setUpRunLink.click();
    });

    it('should display the set up run wizard page 1', () => {
        // check that the user is now on the set up run wizard page 1
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 1');
        let nextButton = element(by.id('nextButt'));
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 2', () => {
        // check that the user is now on the set up run wizard page 2
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 2');
        let nextButton = element(by.id('nextButt'));
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 3', () => {
        // check that the user is now on the set up run wizard page 3
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 3');

        // choose period 1
        element(by.id('PERIOD_1')).click();

        let nextButton = element(by.id('nextButt'));
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 4', () => {
        // check that the user is now on the set up run wizard page 4
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 4');
        let nextButton = element(by.id('nextButt'));
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 5', () => {
        // check that the user is now on the set up run wizard page 5
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 5');
        let submitFormButton = element(by.id('submit_form'));
        expect(submitFormButton.isPresent()).toBeTruthy();
        submitFormButton.click();
    });

    var newRunId;
    var newRunCode;

    it('should display the classroom run created confirmation page', () => {
        // check that the user is now on the classroom run created confirmation page
        expect(browser.getTitle()).toEqual('Classroom Run Created!');
        let runCode = element(by.id('runCode')).getText();
        runCode.then((value) => {
            newRunCode = value;
        });
        let runId = element(by.id('runId')).getText();
        runId.then((value) => {
            newRunId = value;
        });
        let myClassroomRunLink = element(by.id('myClassroomRunLink'));
        expect(myClassroomRunLink.isPresent()).toBeTruthy();
        myClassroomRunLink.click();
    });

    it('should display the my classroom runs page', () => {
        // check that the user is now on the my classroom runs page and the new run is listed.
        expect(browser.getTitle()).toEqual('My Classroom Runs');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher/management/classroomruns.html');
        expect(element(by.cssContainingText('.runRow .accesscode', newRunCode)).isPresent()).toBeTruthy();

    });

    it('should sign out', () => {
        browser.ignoreSynchronization = true;  // doesn't use Angular
        let signOutButton = element(by.id('signOut'));
        expect(signOutButton.isPresent()).toBeTruthy();
        signOutButton.click();
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });
});