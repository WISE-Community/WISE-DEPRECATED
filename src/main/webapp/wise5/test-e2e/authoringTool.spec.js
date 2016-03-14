'use strict';

// E2E test for VLE running preview mode
describe('WISE Classroom Monitor Tool', function () {

    function hasClass(element, cls) {
        return element.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    /**
     * @name waitForUrlToChange
     * @description Wait until the URL changes to match a provided regex
     * @param {RegExp} urlRegex wait until the URL changes to match this regex
     * @returns {!webdriver.promise.Promise} Promise
     */
    function waitForUrlToChange(expectedUrl, timeout) {
        var loaded = false;

        browser.wait(function () {
            browser.executeScript(function () {
                return {
                    url: window.location.href,
                    haveAngular: !!window.angular
                };
            }).then(function (obj) {
                loaded = obj.url == expectedUrl && obj.haveAngular;
            });

            return loaded;
        }, timeout);
    };

    var exitAuthoringToolButton;
    var createNewProjectButton;

    it('should require user to log in to use the authoring tool', function () {
        browser.ignoreSynchronization = true; // doesn't use Angular
        browser.get('http://localhost:8080/wise/author');

        expect(browser.getTitle()).toEqual('Sign In');
    });

    it('should log in using preview username and password and open the authoring tool', function () {
        browser.ignoreSynchronization = true; // doesn't use Angular
        element(by.id('username')).sendKeys('previewuser');
        element(by.id('password')).sendKeys('pass');
        element(by.id('signInButton')).click();

        waitForUrlToChange('http://localhost:8080/wise/author#/', 2000);

        browser.ignoreSynchronization = false; // uses Angular
        // check that the exitAuthoringTool button and create new project buttons are displayed
        expect(browser.getTitle()).toEqual('WISE Authoring');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/');
        exitAuthoringToolButton = element(by.id('exitAuthoringToolButton'));
        expect(exitAuthoringToolButton.isPresent()).toBeTruthy();
        createNewProjectButton = element(by.id('createNewProjectButton'));
        expect(createNewProjectButton.isPresent()).toBeTruthy();
    });

    // TODO: add test for creating new project

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