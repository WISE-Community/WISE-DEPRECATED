// E2E test for VLE running preview mode
describe('WISE5 Student VLE Preview', () => {

    var hasClass = (element, cls) => {
        return element.getAttribute('class').then((classes) => {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
    var previousButton = element(by.xpath('//button[@aria-label="Previous Item"]'));
    var nextButton = element(by.xpath('//button[@aria-label="Next Item"]'));
    var closeButton = element(by.xpath('//button[@aria-label="Project Plan"]'));
    var accountButton = element(by.xpath('//button[@aria-label="Open account menu"]'));
    var accountMenu = element(by.cssContainingText('.md-open-menu-container','Preview Team'));
    var notificationButton = element(by.xpath('//button[@aria-label="View notifications"]'));
    var notificationMenu = element(by.cssContainingText('.md-open-menu-container','Alerts'));

    it('should load the vle and go to node 1', () => {
        let nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait((nodeDropDownMenu).isPresent(), 5000);  // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('1.1: HTML Step');
    });

    it('should have UI elements on the page', () => {
        // Check that previous, next, close, and account buttons are on the page and have the right md-icons
        expect(previousButton.getText()).toBe('arrow_back');
        expect(nextButton.getText()).toBe('arrow_forward');
        expect(nextButton.getText()).toBe('arrow_forward');
        expect(closeButton.getText()).toBe('view_list');
        expect(accountButton.getText()).toBe('account_circle');
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("true");  // Account menu should be hidden
    });

    it('should show step content on the page', () => {
        // Check that the html content is displayed on the page
        var nodeContent = element(by.cssContainingText('.node-content','This is a step where authors can enter their own html.'));
        expect(nodeContent.isPresent()).toBeTruthy();
        expect(previousButton.getAttribute("disabled")).toBe("true");  // the previous button should be disabled on the first step.
    });

    it('should navigate next and previous steps using the buttons', () => {

        // Click on the next button and expect to go to the next step
        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node2');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.2: Open Response Step');
        expect(previousButton.getAttribute("disabled")).toBe(null);  // the previous button should be enabled on the second step.


        var nodeContent = element(by.cssContainingText('.node-content','This is a step where students enter text.'));
        expect(nodeContent.isPresent()).toBeTruthy();

        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node3');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.3: Open Response Step Auto Graded');

        nodeContent = element(by.cssContainingText('.node-content','Explain how the sun helps animals survive.'));
        expect(nodeContent.isPresent()).toBeTruthy();

        // Click on the previous button and expect to go back to the previous step
        previousButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node2');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.2: Open Response Step');
    });

    it('should allow user to jump to a step using the navigation drop-down menu', () => {
        let stepSelectMenu = $("#stepSelectMenu");
        stepSelectMenu.click();
        element.all(by.repeater("item in stepToolsCtrl.idToOrder | toArray | orderBy : 'order'")).then((stepSelectOptions) => {
            expect(stepSelectOptions[1].element(by.css('.node-select__text')).getText()).toBe("1.1: HTML Step");
            expect(stepSelectOptions[7].element(by.css('.node-select__text')).getText()).toBe("1.7: Challenge Question Step");
            stepSelectOptions[7].element(by.css('.node-select__text')).click();  // Click on step 1.7 in the step select menu
            expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node7');
        });
    });

    it('should display the group view and allow user to collapse/expand group navitems', () => {
        // Click on the close button and expect to go to the group view
        closeButton.click();
        browser.waitForAngular();   // wait for Angular to load
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/group1');

        element.all(by.repeater('id in navCtrl.rootNode.ids')).then((groupNavItems) => {
            var activity1 = groupNavItems[0];
            var activity2 = groupNavItems[1];

            expect(activity1.element(by.className('md-title')).getText()).toEqual('1: Example Steps');
            expect(activity2.element(by.className('md-title')).getText()).toEqual('2: Example Features');

            // Activity 1 should be expanded, Activity 2 should be collapsed
            expect(hasClass(activity1, 'expanded')).toBe(true);
            expect(hasClass(activity2, 'expanded')).toBe(false);
            expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/group1');

            // Check for completion icons for steps in Activity 1
            activity1.all(by.repeater('childId in navitemCtrl.item.ids')).then((stepNavItems) => {

                // step 1.1 should be completed because it's an HTML step and we visited it
                expect(stepNavItems[0].getText()).toBe('school\n1.1: HTML Step check_circle');
                expect(stepNavItems[0].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeTruthy();

                // step 1.2 should not be completed yet
                expect(stepNavItems[1].getText()).toBe('school\n1.2: Open Response Step');
                expect(stepNavItems[1].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();

                // step 1.7 node7 (the previous step we were on) should be highlighted because we came from it
                expect(stepNavItems[6].getText()).toBe('school\n1.7: Challenge Question Step');
                expect(hasClass(stepNavItems[6], 'prev')).toBe(true);  // should have 'prev' class
                expect(stepNavItems[6].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();
            });

            // Activity 2 should not be expanded yet, so expand it
            activity2.element(by.className('nav-item--card__content')).click();
            expect(hasClass(activity2, 'expanded')).toBe(true);
            expect(hasClass(activity1, 'expanded')).toBe(true);  // activity 1 should also be expanded still

            // Check that steps in activity 2 displays the step title and icon
            activity2.all(by.repeater('childId in navitemCtrl.item.ids')).then((stepNavItems) => {

                expect(stepNavItems[0].getText()).toBe('school\n2.1: Show Previous Work 1');

                expect(stepNavItems[1].getText()).toBe('school\n2.2: Show Previous Work 2');
                expect(stepNavItems[2].getText()).toBe('school\n2.3: Import Work 1');
                stepNavItems[2].element(by.tagName('button')).click();   // Go to step 2.3.
                expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node22');
            });
        });
    });

    it('should allow user to jump to a step by changing the URL path', () => {
        browser.get('http://localhost:8080/wise/project/demo#/vle/node11');  // User changes the URL
        let nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait((nodeDropDownMenu).isPresent(), 5000);  // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('1.11: Draw Step');

        // Click on the next button and expect to go to the next step
        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node12');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.12: Draw Step Auto Graded');

        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node13');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.13: Brainstorm Step');

        // Click on the previous button and expect to go back to the previous step
        previousButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node12');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.12: Draw Step Auto Graded');
    });

    it('should allow preview user to view the account menu', () => {
        accountButton.click();   // Open the Account Menu by clicking on the account button
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("false");  // Account Menu should be displayed

        // The account menu should have the preview user account icon and the exit and sign out buttons
        element.all(by.repeater('userName in themeCtrl.workgroupUserNames')).then((workgroupNames) => {
            expect(workgroupNames[0].getText()).toBe('Preview Team');
        });

        let exitButton = element(by.xpath('//button[@aria-label="Go Home"]'));
        expect(exitButton.isPresent()).toBeTruthy();
        expect(exitButton.getText()).toEqual("GO HOME");
        let logOutButton = element(by.xpath('//button[@aria-label="Sign Out"]'));
        expect(logOutButton.isPresent()).toBeTruthy();
        expect(logOutButton.getText()).toEqual("SIGN OUT");

        // Hitting the escape key should dismiss the account menu
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("true");  // Account Menu should be hidden

        accountButton.click();  // Open the Account Menu by clicking on the account button
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("false");  // Account Menu should be displayed

        // Clicking outside of the Account Menu should dismiss the Account Menu
        element(by.xpath('//body')).click();
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("true");  // Account Menu should be hidden
    });

    it('should allow preview user to view the notification menu', () => {
        notificationButton.click();   // Open the Notification Menu by clicking on the notification button
        expect(notificationMenu.getAttribute('aria-hidden')).toEqual("false");  // Notification Menu should be displayed

        // The notification menu should have the Alerts title and say that there are no alerts.
        let notificationDialogTitle = element(by.xpath('//md-toolbar/span/span[@translate="notificationsTitle"]'));
        expect(notificationDialogTitle.isDisplayed()).toBeTruthy();
        expect(notificationDialogTitle.getText()).toEqual("Alerts");

        let notificationDialogContent = element(by.xpath('//md-content/div/span[@translate="noAlerts"]'));
        expect(notificationDialogContent.isDisplayed()).toBeTruthy();
        expect(notificationDialogContent.getText()).toEqual("Hi there! You currently have no alerts.");

        // Hitting the escape key should dismiss the notification menu
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        expect(notificationMenu.getAttribute('aria-hidden')).toEqual("true");  // Notification Menu should be hidden

        notificationButton.click();  // Open the Notification Menu by clicking on the notification button
        expect(notificationMenu.getAttribute('aria-hidden')).toEqual("false");  // Notification Menu should be displayed

        // Clicking outside of the Notification Menu should dismiss the Notification Menu
        element(by.xpath('//body')).click();
        expect(notificationMenu.getAttribute('aria-hidden')).toEqual("true");  // Notification Menu should be hidden
    });
});
