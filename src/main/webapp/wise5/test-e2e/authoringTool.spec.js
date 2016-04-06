'use strict';

// E2E test for Authoring Tool
describe('WISE Authoring Tool', function () {

    function hasClass(element, cls) {
        return element.getAttribute('class').then(function (classes) {
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
        }).then(function waitForUrlToChangeTo() {
            return browser.wait(function waitForUrlToChangeTo() {
                return browser.getCurrentUrl().then(function compareCurrentUrl(url) {
                    return urlRegex.test(url);
                });
            });
        });
    };

    var exitAuthoringToolButton;
    var createNewProjectButton;

    it('should require user to log in to use the authoring tool', function () {
        browser.ignoreSynchronization = true; // doesn't use Angular
        browser.get('http://localhost:8080/wise/login');

        expect(browser.getTitle()).toEqual('Sign In');
    });

    it('should log in using preview username and password and open the authoring tool', function () {
        browser.ignoreSynchronization = true; // doesn't use Angular
        element(by.id('username')).sendKeys('preview');
        element(by.id('password')).sendKeys('wise');
        element(by.id('signInButton')).click();

        browser.ignoreSynchronization = false; // uses Angular
        browser.get('http://localhost:8080/wise/author');
        browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
        waitForUrlToChangeTo(new RegExp('http://localhost:8080/wise/author#/', 'gi'));

        // check that the exitAuthoringTool button and create new project buttons are displayed
        expect(browser.getTitle()).toEqual('WISE Authoring');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/');
        exitAuthoringToolButton = element(by.id('exitAuthoringToolButton'));
        expect(exitAuthoringToolButton.isPresent()).toBeTruthy();
        createNewProjectButton = element(by.id('createNewProjectButton'));
        expect(createNewProjectButton.isPresent()).toBeTruthy();
    });

    it('should create a new project', function () {
        createNewProjectButton.click(); // click button to create a new project
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/new');
        var createProjectButton = element(by.id('createProjectButton'));
        expect(createProjectButton.isPresent()).toBeTruthy();
        var cancelCreateProjectButton = element(by.id('cancelCreateProjectButton'));
        expect(cancelCreateProjectButton.isPresent()).toBeTruthy();
        cancelCreateProjectButton.click(); // cancel create. We should go back to main authoring page.
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/');

        createNewProjectButton.click(); // click button to create a new project
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/new');
        element(by.id('newProjectTitle')).clear(); // clear out what's there.
        element(by.id('newProjectTitle')).sendKeys('My Science Project');
        createProjectButton.click();
        expect(element(by.id("projectTitle")).getText()).toEqual("My Science Project");
    });

    // TODO: add test for opening newly-created project

    it('should exit the authoring tool and then sign out', function () {
        exitAuthoringToolButton.click();

        browser.ignoreSynchronization = true; // doesn't use Angular
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');
        var signOutButton = element(by.id('signOut'));
        expect(signOutButton.isPresent()).toBeTruthy();
        signOutButton.click();
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });
});
//# sourceMappingURL=authoringTool.spec.js.map