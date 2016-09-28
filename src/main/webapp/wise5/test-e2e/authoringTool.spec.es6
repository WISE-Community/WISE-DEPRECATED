// E2E test for Authoring Tool
describe('WISE Authoring Tool', () => {

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
    }

    var exitAuthoringToolButton;
    var createNewProjectButton;

    it('should require user to log in to use the authoring tool', () => {
        browser.ignoreSynchronization = true;  // doesn't use Angular
        browser.get('http://localhost:8080/wise/login');

        expect(browser.getTitle()).toEqual('Sign In');
    });

    it('should log in using preview username and password and open the authoring tool', () => {
        browser.ignoreSynchronization = true;  // doesn't use Angular
        $('#username').sendKeys('preview');
        $('#password').sendKeys('wise');
        $('#signInButton').click();

        browser.ignoreSynchronization = false;  // uses Angular
        browser.get('http://localhost:8080/wise/author');
        browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
        waitForUrlToChangeTo(new RegExp('http://localhost:8080/wise/author#/', 'gi'));

        // check that the exitAuthoringTool button and create new project buttons are displayed
        expect(browser.getTitle()).toEqual('WISE Authoring');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/');
        exitAuthoringToolButton = $('#exitAuthoringToolButton');
        expect(exitAuthoringToolButton.isPresent()).toBeTruthy();
        createNewProjectButton = $('#createNewProjectButton');
        expect(createNewProjectButton.isPresent()).toBeTruthy();
    });

    it('should create a new project and open it', () => {
        createNewProjectButton.click();  // click button to create a new project
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/new');
        let createProjectButton = $('#createProjectButton');
        expect(createProjectButton.isPresent()).toBeTruthy();
        let cancelCreateProjectButton = $('#cancelCreateProjectButton');
        expect(cancelCreateProjectButton.isPresent()).toBeTruthy();
        cancelCreateProjectButton.click();  // cancel create. We should go back to main authoring page.
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/');

        createNewProjectButton.click();  // click button to create a new project
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/new');
        $('#newProjectTitle').clear();  // clear out what's there.
        $('#newProjectTitle').sendKeys('My Science Project');
        createProjectButton.click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+');  // should open the project editing view.
    });

    it('should have elements on the page in project view', () => {
        expect($("#projectTitle").getAttribute('value')).toEqual("My Science Project");

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].getText()).toBe("1 First Activity");  // should have one default activity
        });

        // check that move, delete buttons are disabled and other buttons are enabled.
        expect($("#moveButton").isEnabled()).toBe(false);
        expect($("#copyButton").isEnabled()).toBe(false);
        expect($("#deleteButton").isEnabled()).toBe(false);
        expect($("#saveProjectButton").isEnabled()).toBe(true);
        expect($("#closeProjectButton").isEnabled()).toBe(true);
        expect($("#createNewActivityButton").isEnabled()).toBe(true);
        expect($("#createNewStepButton").isEnabled()).toBe(true);
        expect($("#previewProjectButton").isEnabled()).toBe(true);
        expect($("#manageAssetsButton").isEnabled()).toBe(true);
        expect($("#editNotebookSettingsButton").isEnabled()).toBe(true);
    });

    it('should display my assets', () => {
        $("#manageAssetsButton").click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+/asset');
        expect($(".drop-box").isPresent()).toBeTruthy();  // the drop box for uploading assets should exist.
        $("#closeAssetsButton").click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+');  // should go back to the project editing view.
    });

    it('should allow user to edit notebook settings', () => {
        $("#editNotebookSettingsButton").click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+/notebook');
        let enableNotebookCheckbox = $("#enableNotebookCheckbox");
        expect(enableNotebookCheckbox.isPresent()).toBeTruthy();  // the checkbox for enabling/disabling notebook should exist.
        // TODO: the checkbox should be unchecked by default.
        $("#closeNotebookSettingsButton").click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+');  // should go back to the project editing view.
    });

    it('should allow user to preview the project', () => {
        // Clicking on the preview project button should open the preview in a new window
        $("#previewProjectButton").click();
        browser.getAllWindowHandles().then((handles) => {
            browser.switchTo().window(handles[1]).then(() => {
                browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
                expect(browser.getCurrentUrl()).toContain('http://localhost:8080/wise/project/');
                // close the current window
                browser.driver.close().then(() => {
                    // switch to the main authoring window
                    browser.switchTo().window(handles[0]);
                });
            });
        });
    });

    // TODO: add test for opening newly-created project

    // TODO: add test for copying a project

    // TODO: add test for copying a step


    it('should exit the authoring tool and then sign out', () => {
        exitAuthoringToolButton.click();

        browser.ignoreSynchronization = true;  // doesn't use Angular
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');
        var signOutButton = $("#signOut");
        expect(signOutButton.isPresent()).toBeTruthy();
        signOutButton.click();
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });
});