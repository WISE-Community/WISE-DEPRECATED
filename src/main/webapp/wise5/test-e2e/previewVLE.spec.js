'use strict';

// E2E test for VLE running preview mode
describe('WISE5 Student VLE Preview', function () {

    var hasClass = function hasClass(element, cls) {
        return element.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
    var previousButton = element(by.xpath('//button[@aria-label="Previous Item"]'));
    var nextButton = element(by.xpath('//button[@aria-label="Next Item"]'));
    var closeButton = element(by.xpath('//button[@aria-label="Go to project plan"]'));
    var accountButton = element(by.xpath('//button[@aria-label="Open user menu"]'));
    var accountMenu = element.all(by.css('._md-open-menu-container')).get(1);

    it('should load the vle and go to node 1', function () {
        var nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait(nodeDropDownMenu.isPresent(), 5000); // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('1.1: Introduction to Newton Scooters');
    });

    it('should have UI elements on the page', function () {
        // Check that previous, next, close, and account buttons are on the page and have the right md-icons
        expect(previousButton.getText()).toBe('arrow_back');
        expect(nextButton.getText()).toBe('arrow_forward');
        expect(closeButton.getText()).toBe('home');
        expect(accountButton.getText()).toBe('account_circle');
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("true"); // Account menu should be hidden
    });

    it('should navigate next and previous steps using the buttons', function () {

        // Click on the next button and expect to go to the next step
        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node2');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.2: Initial Ideas');

        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node3');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('2.1: Newton Scooter Concepts');

        // Click on the previous button and expect to go back to the previous step
        previousButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node2');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.2: Initial Ideas');
    });

    it('should allow user to jump to a step using the navigation drop-down menu', function () {
        var stepSelectMenu = $("#stepSelectMenu");
        stepSelectMenu.click();
        element.all(by.repeater("item in stepToolsCtrl.idToOrder | toArray | orderBy : 'order'")).then(function (stepSelectOptions) {
            expect(stepSelectOptions[1].element(by.css('.node-select__text')).getText()).toBe("1.1: Introduction to Newton Scooters");
            expect(stepSelectOptions[7].element(by.css('.node-select__text')).getText()).toBe("2.4: What is potential energy?");
            stepSelectOptions[7].element(by.css('.node-select__text')).click(); // Click on step 2.4 in the step select menu
            expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node6');
        });
    });

    it('should display the group view and allow user to collapse/expand group navitems', function () {
        // Click on the close button and expect to go to the group view
        closeButton.click();
        browser.waitForAngular(); // wait for Angular to load
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/group2');

        element.all(by.repeater('id in navCtrl.rootNode.ids')).then(function (groupNavItems) {
            var activity1 = groupNavItems[0];
            var activity2 = groupNavItems[1];
            var activity3 = groupNavItems[2];

            expect(activity1.element(by.className('md-title')).getText()).toEqual('1: Introduction to Newton Scooters');
            expect(activity2.element(by.className('md-title')).getText()).toEqual('2: Powering Your Newton Scooter');
            expect(activity3.element(by.className('md-title')).getText()).toEqual('3: Planning Your Newton Scooter');

            // Click on activity 1 to expand it
            expect(hasClass(activity1, 'expanded')).toBe(false);
            activity1.element(by.className('nav-item--card__content')).click();
            expect(hasClass(activity1, 'expanded')).toBe(true);
            expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/group1');

            // Check for completion icons for steps in Activity 1
            activity1.all(by.repeater('childId in navitemCtrl.item.ids')).then(function (stepNavItems) {

                // step 1.1 should be completed because it's an HTML step and we visited it
                expect(stepNavItems[0].getText()).toBe('chrome_reader_mode\n1.1: Introduction to Newton Scooters check_circle');
                expect(stepNavItems[0].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeTruthy();

                // step 1.2 should not be completed yet
                expect(stepNavItems[1].getText()).toBe('assignment\n1.2: Initial Ideas');
                expect(stepNavItems[1].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeFalsy();
            });

            // Activity 2 should be expanded because we came to the group view from step 2.4
            expect(hasClass(activity2, 'expanded')).toBe(true);

            // Check that steps in activity 2 displays the step title and icon
            activity2.all(by.repeater('childId in navitemCtrl.item.ids')).then(function (stepNavItems) {
                // step 2.1 should be completed because it's an HTML step and we visited it
                expect(stepNavItems[0].getText()).toBe('chrome_reader_mode\n2.1: Newton Scooter Concepts check_circle');
                expect(stepNavItems[0].element(by.cssContainingText('.material-icons', 'check_circle')).isPresent()).toBeTruthy();

                // step 2.4 node6 (the previous step we were on) should be highlighted because we came from it
                expect(stepNavItems[3].getText()).toBe('assignment\n2.4: What is potential energy?');
                expect(hasClass(stepNavItems[3], 'prev')).toBe(true); // should have 'prev' class

                expect(stepNavItems[2].getText()).toBe('gamepad\n2.3: Explore the concepts');
                stepNavItems[2].element(by.tagName('button')).click(); // Go to step 2.3.
                expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node5');
            });
        });
    });

    it('should allow user to jump to a step by changing the URL path', function () {
        browser.get('http://localhost:8080/wise/project/demo#/vle/node24'); // User changes the URL
        var nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait(nodeDropDownMenu.isPresent(), 5000); // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('3.4: Feature Selection');

        // Click on the next button and expect to go to the next step
        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node25');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('4.1: Sketch Your Design');

        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node26');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('4.2: Scooter Materials List');

        // Click on the previous button and expect to go back to the previous step
        previousButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node25');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('4.1: Sketch Your Design');
    });

    it('should allow preview user to view the account menu', function () {
        accountButton.click(); // Open the Account Menu by clicking on the account button
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("false"); // Account Menu should be displayed

        // The account menu should have the preview user account icon and the exit and sign out buttons
        element.all(by.repeater('userName in themeCtrl.workgroupUserNames')).then(function (workgroupNames) {
            expect(workgroupNames[0].getText()).toBe('Preview Team');
        });

        var exitButton = element(by.xpath('//button[@aria-label="Exit"]'));
        expect(exitButton.isPresent()).toBeTruthy();
        expect(exitButton.getText()).toEqual("EXIT");
        var logOutButton = element(by.xpath('//button[@aria-label="Sign Out"]'));
        expect(logOutButton.isPresent()).toBeTruthy();
        expect(logOutButton.getText()).toEqual("SIGN OUT");

        // Hitting the escape key should dismiss the account menu
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("true"); // Account Menu should be hidden

        accountButton.click(); // Open the Account Menu by clicking on the account button
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("false"); // Account Menu should be displayed

        // Clicking outside of the Account Menu should dismiss the Account Menu
        element(by.xpath('//body')).click();
        expect(accountMenu.getAttribute('aria-hidden')).toEqual("true"); // Account Menu should be hidden
    });
});
//# sourceMappingURL=previewVLE.spec.js.map