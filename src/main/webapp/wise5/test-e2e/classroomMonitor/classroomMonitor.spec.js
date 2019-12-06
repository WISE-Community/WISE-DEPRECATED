// E2E test for Classroom Monitor
describe('WISE Classroom Monitor', () => {

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

    it('should load even without any students', () => {
        isAngularSite(false);
        browser.get('http://localhost:8080/wise/login');
        expect(browser.getTitle()).toEqual('Sign In');
        $('#username').sendKeys('preview');
        $('#password').sendKeys('wise');
        $('#signInButton').click();

        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher');
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');
        // Find and click on the classroom monitor link
        let classroomMonitorLink = element.all(by.css(".classroomMonitor")).get(0);
        expect(classroomMonitorLink.isPresent()).toBeTruthy();
        classroomMonitorLink.click();

        // Clicking on the classroom monitor link should open the classroom monitor in a new window
        browser.getAllWindowHandles().then((handles) => {
            browser.switchTo().window(handles[1]).then(() => {
                isAngularSite(true);
                browser.refresh();  // needed for this issue https://github.com/angular/protractor/issues/2643
                browser.waitForAngular();   // wait for Angular to load
                expect(browser.getCurrentUrl()).toMatch('http://localhost:8080/wise/classroomMonitor/[0-9]+#!/project/');
                expect(browser.getTitle()).toEqual('WISE Classroom Monitor');
                expect(element(by.cssContainingText('top-bar',"My Awesome Science Project")).isDisplayed()).toBeTruthy();  // check that the title of the run is displayed
                expect(element(by.cssContainingText('md-toolbar',"Grade By Step")).isDisplayed()).toBeTruthy();  // check Grade by Step view is displayed

                // check for elements on the page
                expect(element(by.xpath('//a[@aria-label="Grade By Step"]')).isPresent()).toBeTruthy();
                expect(element(by.xpath('//a[@aria-label="Grade By Student"]')).isPresent()).toBeTruthy();
                expect(element(by.xpath('//a[@aria-label="Milestones"]')).isPresent()).toBeTruthy();

                // tests for notifications
                let notificationButton = element(by.xpath('//button[@aria-label="Alerts"]'));
                let notificationMenu = element(by.cssContainingText('.md-open-menu-container','Alerts'));
                expect(notificationMenu.getAttribute('aria-hidden')).toEqual("true");  // Notification menu should be hidden

                notificationButton.click();   // Open the Notification Menu by clicking on the notification button
                expect(notificationMenu.getAttribute('aria-hidden')).toEqual("false");  // Notification Menu should be displayed
                // Clicking outside of the Notification Menu should dismiss the Notification Menu
                element(by.xpath('//body')).click();
                expect(notificationMenu.getAttribute('aria-hidden')).toEqual("true");  // Notification menu should be hidden

                // tests for pause screens
                let pauseScreensButton = element(by.xpath('//button[@aria-label="Lock Student Screens"]'));
                let pauseScreensMenu = element(by.cssContainingText('.md-open-menu-container','Lock Student Screens'));
                expect(pauseScreensMenu.getAttribute('aria-hidden')).toEqual("true");  // Pause Screens menu should be hidden

                pauseScreensButton.click();   // Open the Pause Screens Menu by clicking on the pause screens button
                expect(pauseScreensMenu.getAttribute('aria-hidden')).toEqual("false");  // Pause Screens Menu should be displayed
                // Clicking outside of the Pause Screens Menu should dismiss the Pause Screens Menu
                element(by.xpath('//body')).click();
                expect(pauseScreensMenu.getAttribute('aria-hidden')).toEqual("true");  // Pause Screens menu should be hidden

                // tests for user accounts
                let accountButton = element(by.xpath('//button[@aria-label="User Menu"]'));
                expect(accountButton.isPresent()).toBeTruthy();

                let filterByWorkgroup = element(by.xpath('//workgroup-select'));
                expect(filterByWorkgroup.isPresent()).toBeTruthy(); // make sure filter by workgroup input is present

                let periodFilter = element(by.xpath('//period-select'));
                expect(periodFilter.isPresent()).toBeTruthy(); // make sure filter by workgroup input is present

                // test that the project map is displayed
                element.all(by.repeater('id in nodeProgressController.rootNode.ids')).then((groupNavItems) => {
                    let activity1 = groupNavItems[0];
                    expect(activity1.element(by.className('md-title')).getText()).toEqual('1: Act One');

                    // Activity 1 should not be expanded yet, so expand it
                    activity1.click();
                    expect(hasClass(activity1, 'expanded')).toBe(true);
                });

                // close the current window
                browser.driver.close().then(() => {
                    // switch to the main authoring window
                    browser.switchTo().window(handles[0]);
                });
            });
        });

        isAngularSite(false);
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');
        let signOutButton = $("#signOut");
        expect(signOutButton.isPresent()).toBeTruthy();
        signOutButton.click();
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });
});
