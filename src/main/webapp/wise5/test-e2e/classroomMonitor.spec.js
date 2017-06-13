'use strict';

// E2E test for Classroom Monitor
describe('WISE Classroom Monitor', function () {

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
    }

    it('should log in using preview username and password and open the classroom monitor tool', function () {
        browser.ignoreSynchronization = true; // doesn't use Angular
        browser.get('http://localhost:8080/wise/login');
        expect(browser.getTitle()).toEqual('Sign In');
        $('#username').sendKeys('preview');
        $('#password').sendKeys('wise');
        $('#signInButton').click();

        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher');
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');
        // Find and click on the classroom monitor link
        var classroomMonitorLink = $(".classroomMonitor");
        expect(classroomMonitorLink.isPresent()).toBeTruthy();
        classroomMonitorLink.click();

        // Clicking on the classroom monitor link should open the classroom monitor in a new window
        browser.getAllWindowHandles().then(function (handles) {
            browser.switchTo().window(handles[1]).then(function () {
                browser.ignoreSynchronization = false; // uses Angular
                browser.refresh(); // needed for this issue https://github.com/angular/protractor/issues/2643
                browser.waitForAngular(); // wait for Angular to load
                expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/classroomMonitor/[0-9]+#/project/');
                expect(browser.getTitle()).toEqual('WISE Classroom Monitor');

                // check for elements on the page
                expect(element(by.xpath('//button[@aria-label="Main Menu"]')).isPresent()).toBeTruthy();
                expect(element(by.xpath('//a[@aria-label="Grading & Feedback"]')).isPresent()).toBeTruthy();
                expect(element(by.xpath('//a[@aria-label="Student Summary"]')).isPresent()).toBeTruthy();
                expect(element(by.xpath('//md-switch[@aria-label="Lock student screens switch"]')).isPresent()).toBeTruthy();

                var notificationButton = element(by.xpath('//button[@aria-label="Alerts"]'));
                var notificationMenu = element(by.cssContainingText('.md-open-menu-container', 'Alerts'));
                expect(notificationMenu.getAttribute('aria-hidden')).toEqual("true"); // Notification menu should be hidden

                notificationButton.click(); // Open the Notification Menu by clicking on the notification button
                expect(notificationMenu.getAttribute('aria-hidden')).toEqual("false"); // Notification Menu should be displayed
                // Clicking outside of the Notification Menu should dismiss the Notification Menu
                element(by.xpath('//body')).click();
                expect(notificationMenu.getAttribute('aria-hidden')).toEqual("true"); // Notification menu should be hidden

                var accountButton = element(by.xpath('//button[@aria-label="User Menu"]'));
                expect(accountButton.isPresent()).toBeTruthy();

                var filterByWorkgroup = element(by.xpath('//workgroup-select'));
                expect(filterByWorkgroup.isPresent()).toBeTruthy(); // make sure filter by workgroup input is present

                var periodFilter = element(by.xpath('//period-select'));
                expect(periodFilter.isPresent()).toBeTruthy(); // make sure filter by workgroup input is present

                // test that the project map is displayed
                element.all(by.repeater('id in nodeProgressController.rootNode.ids')).then(function (groupNavItems) {
                    var activity1 = groupNavItems[0];

                    expect(activity1.element(by.className('md-title')).getText()).toEqual('1: First Activity');

                    // Activity 1 should not be expanded yet, so expand it
                    activity1.click();
                    expect(hasClass(activity1, 'expanded')).toBe(true);
                });

                // close the current window
                browser.driver.close().then(function () {
                    // switch to the main authoring window
                    browser.switchTo().window(handles[0]);
                });
            });
        });

        browser.ignoreSynchronization = true; // doesn't use Angular
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');
        var signOutButton = $("#signOut");
        expect(signOutButton.isPresent()).toBeTruthy();
        signOutButton.click();
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });
});
//# sourceMappingURL=classroomMonitor.spec.js.map