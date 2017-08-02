// E2E test for Authoring Tool
describe('WISE Authoring Tool', () => {

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

    let projectHomeButton = element(by.xpath('//side-menu/div/a[@aria-label="Project Home"]'));
    let createNewStepButton = $("#createNewStepButton");
    let createNewProjectButton = $("#createNewProjectButton");
    let chooseStepDropDown = element(by.xpath('//step-tools/div/md-select[@ng-model="$ctrl.nodeId"]'));
    let previousButton = element(by.xpath('//button[@ng-click="$ctrl.goToPrevNode()"]'));
    let nextButton = element(by.xpath('//button[@ng-click="$ctrl.goToNextNode()"]'));
    let homeButton = $("#projectHomeButton")
    let projectId = null;  // this will be set when we create a new project.

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
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/'); // url should stay the same
        let createProjectButton = $('#createProjectButton');
        expect(createProjectButton.isPresent()).toBeTruthy();
        let cancelCreateProjectButton = $('#cancelCreateProjectButton');
        expect(cancelCreateProjectButton.isPresent()).toBeTruthy();
        cancelCreateProjectButton.click();  // cancel create. url should stay the same
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/');

        createNewProjectButton.click();  // click button to create a new project
        $('#newProjectTitle').clear();  // clear out what's there.
        $('#newProjectTitle').sendKeys('My Science Project');
        createProjectButton.click();
        expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/author#/project/[0-9]+');  // should open the project editing view.

        // get the new project id and set it in the global variable
        browser.getCurrentUrl().then((url) => {
            projectId = url.substring(url.lastIndexOf("/") + 1);
        });
    });

    it('should have elements on the page in project view', () => {
        expect(element(by.cssContainingText('top-bar',"My Science Project")).isDisplayed()).toBeTruthy();

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].getText()).toBe("1 First Activity");  // should have one default activity
        });

        // check that move, delete buttons are disabled and other buttons are enabled.
        expect(homeButton.isEnabled()).toBe(true);
        expect(chooseStepDropDown.isEnabled()).toBe(true);
        expect(previousButton.isEnabled()).toBe(false);
        expect(nextButton.isEnabled()).toBe(false);
        expect($("#moveButton").isEnabled()).toBe(false);
        expect($("#copyButton").isEnabled()).toBe(false);
        expect($("#deleteButton").isEnabled()).toBe(false);
        expect($("#createNewActivityButton").isEnabled()).toBe(true);
        expect(createNewStepButton.isEnabled()).toBe(true);
        expect($("#previewProjectButton").isEnabled()).toBe(true);
        // look for side-menu items
        expect(projectHomeButton.isDisplayed()).toBe(true);
        expect(element(by.xpath('//side-menu/div/a[@aria-label="Notebook Settings"]')).isDisplayed()).toBe(true);
        expect(element(by.xpath('//side-menu/div/a[@aria-label="File Manager"]')).isDisplayed()).toBe(true);
        expect(element(by.xpath('//side-menu/div/a[@aria-label="Project Info"]')).isDisplayed()).toBe(true);
    });

    it('should create new steps', () => {
        // test adding a new step to an empty project
        createNewStepButton.click();
        let createNodeTitle = element(by.model('projectController.createNodeTitle'));
        expect(createNodeTitle.isDisplayed()).toBeTruthy();
        expect($("#createNodeCreateButton").isDisplayed()).toBeTruthy();
        expect($("#createNodeCancelButton").isDisplayed()).toBeTruthy();
        // clicking on cancel should hide the create node input and buttons
        $("#createNodeCancelButton").click();
        expect(createNodeTitle.isDisplayed()).toBeFalsy();
        expect($("#createNodeCreateButton").isDisplayed()).toBeFalsy();
        expect($("#createNodeCancelButton").isDisplayed()).toBeFalsy();

        createNewStepButton.click();
        createNodeTitle.clear();  // clear out what's there.
        createNodeTitle.sendKeys('Step 1');
        $("#createNodeCreateButton").click();

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].element(by.css('.groupHeader h6')).getText()).toBe("1 First Activity");
            let insertInsideAct1Button = nodeItem[1].element(by.css('button.insertButton[aria-label="Insert As First Step"]'));
            expect(insertInsideAct1Button.isDisplayed()).toBeTruthy();
            insertInsideAct1Button.click();
            let EC = protractor.ExpectedConditions;
            browser.wait(EC.alertIsPresent(), 3000);  // Wait for an alert pops up asking if it should this should be the first step in the project.
            browser.switchTo().alert().accept();      // accept the alert
        });

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].element(by.css('.groupHeader h6')).getText()).toBe("1 First Activity");  // should have one default activity
            expect(nodeItem[2].element(by.css('.stepHeader h6')).getText()).toBe("1.1 Step 1");  // should now have the newly added step
        });

        // now test adding another step after the first step. This time the alert should not show.

        createNewStepButton.click();
        createNodeTitle.clear();  // clear out what's there.
        createNodeTitle.sendKeys('Step 2');
        $("#createNodeCreateButton").click();

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            let insertAfterStep1Button = nodeItem[2].element(by.css('button.insertButton[aria-label="Insert After"]'));
            expect(insertAfterStep1Button.isDisplayed()).toBeTruthy();
            insertAfterStep1Button.click();
        });

        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].element(by.css('.groupHeader h6')).getText()).toBe("1 First Activity");  // should have one default activity
            expect(nodeItem[2].element(by.css('.stepHeader h6')).getText()).toBe("1.1 Step 1");  // should have step 1
            expect(nodeItem[3].element(by.css('.stepHeader h6')).getText()).toBe("1.2 Step 2");  // should now have the newly added step
        });
    });

    // TODO test adding new activity
    it('should allow author to jump to step authoring using the navigation drop-down menu', () => {
        chooseStepDropDown.click();
        element.all(by.repeater("item in $ctrl.idToOrder | toArray | orderBy : 'order'")).then((stepSelectOptions) => {
            expect(stepSelectOptions[0].element(by.css('.node-select__text')).getText()).toBe("1: First Activity");
            expect(stepSelectOptions[1].element(by.css('.node-select__text')).getText()).toBe("1.1: Step 1");
            expect(stepSelectOptions[2].element(by.css('.node-select__text')).getText()).toBe("1.2: Step 2");
            stepSelectOptions[2].element(by.css('.node-select__text')).click();  // Click on step 1.2 in the step select menu
            expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/node/node2');
        });

        chooseStepDropDown.click();
        element.all(by.repeater("item in $ctrl.idToOrder | toArray | orderBy : 'order'")).then((stepSelectOptions) => {
            stepSelectOptions[0].element(by.css('.node-select__text')).click();  // Click on activity 1 in the step select menu
            expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/node/group1');
        });

        projectHomeButton.click(); // click on the project view button
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId);
    });

    it('should allow editing of activity and step titles', () => {
        element(by.cssContainingText("h6", "First Activity")).click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/node/group1');
        // the navigation drop-down should show the activity title
        expect(chooseStepDropDown.getText()).toBe("1: First Activity");
        // TODO: uncomment me when we figured out what to do with home button and project structure buttons
        // expect(previousButton.isEnabled()).toBe(false);
        // expect(nextButton.isEnabled()).toBe(false);
        let activity1TitleInput = element(by.model("nodeAuthoringController.node.title"));
        expect(activity1TitleInput.isPresent()).toBeTruthy();
        expect(activity1TitleInput.getAttribute('value')).toBe("First Activity");
        activity1TitleInput.clear();  // clear out what's there.
        activity1TitleInput.sendKeys('Act One');  // change the title to "Act One"
        element(by.css('button[ng-click="nodeAuthoringController.backButtonClicked()"]')).click();  // click on the home button to go back to main view.
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId);

        // now check that the activity title has been updated in the project view
        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[1].element(by.css('.groupHeader h6')).getText()).toBe("1 Act One");
        });

        element(by.cssContainingText("h6", "Step 1")).click();  // click on step 1
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/node/node1');
        // the navigation drop-down should show the step title
        expect(chooseStepDropDown.getText()).toBe("1.1: Step 1");
        expect(previousButton.isEnabled()).toBe(false); // previous button should be disabled
        expect(nextButton.isEnabled()).toBe(true); // next button should be enabled
        let step1TitleInput = element(by.model("nodeAuthoringController.node.title"));
        expect(step1TitleInput.isPresent()).toBeTruthy();
        expect(step1TitleInput.getAttribute('value')).toBe("Step 1");
        step1TitleInput.clear();  // clear out what's there.
        step1TitleInput.sendKeys('One Small Step for Man');  // change the title to "One Small Step for Man"
        element(by.css('button[ng-click="nodeAuthoringController.backButtonClicked()"]')).click();  // click on the home button to go back to main view.
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId);
        // now check that the step title has been updated in the project view
        element.all(by.repeater("item in projectController.items")).then((nodeItem) => {
            expect(nodeItem[2].element(by.css('.stepHeader h6')).getText()).toBe("1.1 One Small Step for Man");
        });
    });

    it('should allow navigating between steps with arrows', () => {
        element(by.cssContainingText("h6", "One Small Step for Man")).click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/node/node1');
        expect(chooseStepDropDown.getText()).toBe("1.1: One Small Step for Man");
        expect(previousButton.isEnabled()).toBe(false); // previous button should be disabled
        expect(nextButton.isEnabled()).toBe(true); // next button should be enabled
        nextButton.click(); // go to next node, node2.
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/node/node2');
        expect(chooseStepDropDown.getText()).toBe("1.2: Step 2");
        expect(previousButton.isEnabled()).toBe(true); // previous button should be enabled
        expect(nextButton.isEnabled()).toBe(false); // next button should be disabled, because this is the last step
        previousButton.click(); // go back to node1
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/node/node1');
    });

    it('should display my assets', () => {
        element(by.xpath('//side-menu/div/a[@aria-label="File Manager"]')).click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/asset');
        expect($(".drop-box").isPresent()).toBeTruthy();  // the drop box for uploading assets should exist.
        projectHomeButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId); // should go back to the project editing view.
    });

    it('should allow user to edit notebook settings', () => {
        element(by.xpath('//side-menu/div/a[@aria-label="Notebook Settings"]')).click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/notebook');

        let enableNotebookCheckbox = $("#enableNotebookCheckbox");
        expect(enableNotebookCheckbox.isPresent()).toBeTruthy();  // the checkbox for enabling/disabling notebook should exist.
        // TODO: the checkbox should be unchecked by default.
        $("#closeNotebookSettingsButton").click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId); // should go back to the project editing view.
    });

    it('should allow user to edit project info', () => {
        // TODO add more tests here
        element(by.xpath('//side-menu/div/a[@aria-label="Project Info"]')).click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId + '/info');

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

        projectHomeButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId); // should go back to the project editing view.
        let projectTitle = element(by.css('[ng-if="$ctrl.projectTitle"]'));
        expect(element(by.cssContainingText('top-bar',"My Awesome Science Project")).isDisplayed()).toBeTruthy();  // check that the title has been updated
    });

    it('should allow user to preview the project', () => {
        // Clicking on the preview project button should open the preview in a new window
        $("#previewProjectButton").click();
        browser.getAllWindowHandles().then((handles) => {
            browser.switchTo().window(handles[1]).then(() => {
                browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
                expect(browser.getCurrentUrl()).toContain('http://localhost:8080/wise/project/' + projectId + '#/vle/');
                // close the current window
                browser.driver.close().then(() => {
                    // switch to the main authoring window
                    browser.switchTo().window(handles[0]);
                });
            });
        });
    });

    it('should allow user to preview the project without constraints', () => {
        // Clicking on the preview project button should open the preview in a new window
        $("#previewProjectWithoutConstraintsButton").click();
        browser.getAllWindowHandles().then((handles) => {
            browser.switchTo().window(handles[1]).then(() => {
                browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
                expect(browser.getCurrentUrl()).toContain('http://localhost:8080/wise/project/' + projectId + '?constraints=false#/vle/');
                // close the current window
                browser.driver.close().then(() => {
                    // switch to the main authoring window
                    browser.switchTo().window(handles[0]);
                });
            });
        });
    });

    it('should show the new project in the project listing view', () => {
        browser.get('http://localhost:8080/wise/author');
        browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
        waitForUrlToChangeTo(new RegExp('http://localhost:8080/wise/author#/', 'gi'));
        expect(browser.getTitle()).toEqual('WISE Authoring Tool');

        element.all(by.repeater("project in authoringToolMainController.projects")).then((projectItems) => {
            projectItems[0].all(by.css('span')).then((projectItemSpans) => {
                expect(projectItemSpans[0].getText()).toBe("pageview");
                expect(projectItemSpans[1].getText()).toBe("content_copy");
                expect(projectItemSpans[2].getText()).toBe("file_download");
                expect(projectItemSpans[3].getText()).toBe("mode_edit");
                expect(projectItemSpans[4].getText()).toBe(projectId + " - My Awesome Science Project");
            })
        });
    });

    it('should open the project authoring from project listing view', () => {
        element.all(by.repeater("project in authoringToolMainController.projects")).then((projectItems) => {
            projectItems[0].all(by.css('span')).then((projectItemSpans) => {
                projectItemSpans[3].click(); // open Project authoring view by clicking on mode_edit icon
            });
        });
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId);

        browser.get('http://localhost:8080/wise/author');
        browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
        waitForUrlToChangeTo(new RegExp('http://localhost:8080/wise/author#/', 'gi'));
        expect(browser.getTitle()).toEqual('WISE Authoring Tool');

        element.all(by.repeater("project in authoringToolMainController.projects")).then((projectItems) => {
            projectItems[0].all(by.css('span')).then((projectItemSpans) => {
                projectItemSpans[4].click(); // open Project authoring view by clicking on project title
            });
        });
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/author#/project/' + projectId);
    });


    it('should exit the authoring tool from project listing view and go to teacher home', () => {
        browser.get('http://localhost:8080/wise/author');
        browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
        waitForUrlToChangeTo(new RegExp('http://localhost:8080/wise/author#/', 'gi'));
        expect(browser.getTitle()).toEqual('WISE Authoring Tool');

        browser.ignoreSynchronization = true;  // doesn't use Angular, disable synchronization
        $("#goHomeButton").click();
     });

    // TODO: add test for copying a project
    // TODO: add test for copying a step

});