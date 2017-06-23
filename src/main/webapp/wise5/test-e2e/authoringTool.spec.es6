// E2E test for Authoring Tool
describe('WISE Authoring Tool', () => {

    function hasClass(element, cls) {
        return element.getAttribute('class').then((classes) => {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    }

    /**
     * @name waitForUrlToChangeTo
     * @description Wait until the URL changes to match a provided regex
     * @param {RegExp} urlRegex wait until the URL changes to match this regex
     * @returns {!webdriver.promise.Promise} Promise
     */
    function waitForUrlToChangeTo(urlRegex) {
        let currentUrl;

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

    let projectStructureButton = element(by.xpath('//side-menu/div/a[@aria-label="Project Structure"]'));
    let createNewStepButton = $("#createNewStepButton");
    let createNewProjectButton = $('#createNewProjectButton');

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

        // check that the create new project button is displayed
        expect(browser.getTitle()).toEqual('WISE Authoring Tool');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/');
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
        expect(element(by.cssContainingText('top-bar',"My Science Project")).isDisplayed()).toBeTruthy();

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].getText()).toBe("1 First Activity");  // should have one default activity
        });

        // check that move, delete buttons are disabled and other buttons are enabled.
        expect($("#moveButton").isEnabled()).toBe(false);
        expect($("#copyButton").isEnabled()).toBe(false);
        expect($("#deleteButton").isEnabled()).toBe(false);
        expect($("#saveProjectButton").isEnabled()).toBe(true);
        expect($("#createNewActivityButton").isEnabled()).toBe(true);
        expect(createNewStepButton.isEnabled()).toBe(true);
        expect($("#previewProjectButton").isEnabled()).toBe(true);
        // look for side-menu items
        expect(projectStructureButton.isDisplayed()).toBe(true);
        expect(element(by.xpath('//side-menu/div/a[@aria-label="Notebook Settings"]')).isDisplayed()).toBe(true);
        expect(element(by.xpath('//side-menu/div/a[@aria-label="File Manager"]')).isDisplayed()).toBe(true);
        expect(element(by.xpath('//side-menu/div/a[@aria-label="Project Info"]')).isDisplayed()).toBe(true);
    });

    it('should create new steps', () => {
        // test adding a new step to an empty project
        createNewStepButton.click();
        expect($("#createNodeTitle").isDisplayed()).toBeTruthy();
        expect($("#createNodeCreateButton").isDisplayed()).toBeTruthy();
        expect($("#createNodeCancelButton").isDisplayed()).toBeTruthy();
        // clicking on cancel should hide the create node input and buttons
        $("#createNodeCancelButton").click();
        expect($("#createNodeTitle").isDisplayed()).toBeFalsy();
        expect($("#createNodeCreateButton").isDisplayed()).toBeFalsy();
        expect($("#createNodeCancelButton").isDisplayed()).toBeFalsy();

        createNewStepButton.click();
        $('#createNodeTitle').clear();  // clear out what's there.
        $('#createNodeTitle').sendKeys('Step 1');
        $("#createNodeCreateButton").click();

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].element(by.className('groupHeader')).getText()).toBe("1 First Activity");
            let insertInsideAct1Button = nodeItem[1].element(by.cssContainingText('button','Insert Inside'));
            expect(insertInsideAct1Button.isDisplayed()).toBeTruthy();
            insertInsideAct1Button.click();
            let EC = protractor.ExpectedConditions;
            browser.wait(EC.alertIsPresent(), 5000);  // Wait for an alert pops up asking if it should this should be the first step in the project.
            browser.switchTo().alert().accept();   // accept the alert
        });

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].element(by.className('groupHeader')).getText()).toBe("1 First Activity");  // should have one default activity
            expect(nodeItem[2].element(by.className('stepHeader')).getText()).toBe("1.1 Step 1");  // should now have the newly added step
        });

        // now test adding another step after the first step. This time the alert should not show.

        createNewStepButton.click();
        $('#createNodeTitle').clear();  // clear out what's there.
        $('#createNodeTitle').sendKeys('Step 2');
        $("#createNodeCreateButton").click();

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            let insertAfterStep1Button = nodeItem[2].element(by.cssContainingText('button','Insert After'));
            expect(insertAfterStep1Button.isDisplayed()).toBeTruthy();
            insertAfterStep1Button.click();
        });

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].element(by.className('groupHeader')).getText()).toBe("1 First Activity");  // should have one default activity
            expect(nodeItem[2].element(by.className('stepHeader')).getText()).toBe("1.1 Step 1");  // should have step 1
            expect(nodeItem[3].element(by.className('stepHeader')).getText()).toBe("1.2 Step 2");  // should now have the newly added step
        });
    });

    it('should display my assets', () => {
        element(by.xpath('//side-menu/div/a[@aria-label="File Manager"]')).click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+/asset');
        expect($(".drop-box").isPresent()).toBeTruthy();  // the drop box for uploading assets should exist.
        projectStructureButton.click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+');  // should go back to the project editing view.
    });

    it('should allow user to edit notebook settings', () => {
        element(by.xpath('//side-menu/div/a[@aria-label="Notebook Settings"]')).click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+/notebook');
        let enableNotebookCheckbox = $("#enableNotebookCheckbox");
        expect(enableNotebookCheckbox.isPresent()).toBeTruthy();  // the checkbox for enabling/disabling notebook should exist.
        // TODO: the checkbox should be unchecked by default.
        $("#closeNotebookSettingsButton").click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+');  // should go back to the project editing view.
    });

    it('should allow user to edit project info', () => {
        // TODO add more tests here
        element(by.xpath('//side-menu/div/a[@aria-label="Project Info"]')).click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+/info');

        // check that there are inputs for metadata items
        element.all(by.repeater("metadataField in projectInfoController.metadataAuthoring.fields")).then((metadataField) => {
            let titleInput = metadataField[0].element(by.model('projectInfoController.metadata[metadataField.key]'));
            expect(titleInput.getAttribute('value')).toBe("My Science Project");  // should show the title of the project
            titleInput.clear();  // clear out what's there.
            titleInput.sendKeys('My Awesome Science Project');  // change the title to "My Awesome Science Project"
            let summaryTextarea = metadataField[1].element(by.model('projectInfoController.metadata[metadataField.key]'));
            expect(summaryTextarea.getAttribute('value')).toBe("");  // should show the summary of the project, which is empty to start with
            summaryTextarea.sendKeys('This is my science project summary.');
        });

        projectStructureButton.click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+');  // should go back to the project editing view.
        let projectTitle = element(by.css('[ng-if="$ctrl.projectTitle"]'));
        expect(element(by.cssContainingText('top-bar',"My Awesome Science Project")).isDisplayed()).toBeTruthy();  // check that the title has been updated
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


    /*
    it('should exit the authoring tool and then sign out', () => {
        exitAuthoringToolButton.click();

        browser.ignoreSynchronization = true;  // doesn't use Angular
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');
        let signOutButton = $("#signOut");
        expect(signOutButton.isPresent()).toBeTruthy();
        signOutButton.click();
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });
    */
});