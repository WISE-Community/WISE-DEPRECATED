'use strict';

// E2E test for VLE running preview mode
describe('WISE5 Student VLE Preview', function () {

    var hasClass = function hasClass(element, cls) {
        return element.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    var previousButton;
    var nextButton;
    var closeButton;

    it('should load the vle and go to node 1', function () {
        browser.get('http://localhost:8080/wise/project/demo');

        expect(browser.getTitle()).toEqual('WISE');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');

        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.1: Introduction to Newton Scooters');
    });

    it('should have UI elements on the page', function () {
        // Check that previous, next and close buttons are on the page
        previousButton = element(by.xpath('//button[@aria-label="Previous Item"]'));
        expect(previousButton.getText()).toBe('arrow_back');
        nextButton = element(by.xpath('//button[@aria-label="Next Item"]'));
        expect(nextButton.getText()).toBe('arrow_forward');
        closeButton = element(by.xpath('//button[@aria-label="Close Step"]'));
        expect(closeButton.getText()).toBe('close');
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

    it('should display the group view and allow user to collapse/expand views', function () {
        // Click on the close button and expect to go to the group view
        closeButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/group1');

        // Clicking on Activity 1 should collapse the group1 view and
        // Clicking on Activity 2 should expand the group 2 view and display the steps inside
        element.all(by.repeater('id in navCtrl.rootNode.ids')).then(function (groupNavItems) {
            var activity1 = groupNavItems[0];
            var activity2 = groupNavItems[1];
            var titleElementGroup1 = activity1.element(by.className('md-title'));
            expect(titleElementGroup1.getText()).toEqual('1: Introduction to Newton Scooters');

            var titleElementGroup2 = activity2.element(by.className('md-title'));
            expect(titleElementGroup2.getText()).toEqual('2: Powering Your Newton Scooter');

            expect(hasClass(activity1, 'expanded')).toBe(true);
            activity1.element(by.className('nav-item--card__content')).click();
            expect(hasClass(activity1, 'expanded')).toBe(false);

            expect(hasClass(activity2, 'expanded')).toBe(false);
            activity2.element(by.className('nav-item--card__content')).click();
            expect(hasClass(activity2, 'expanded')).toBe(true);
            expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/group2');

            // Check that step 2.3 has title "Explore the concepts" and has the gamepad icon
            activity2.all(by.repeater('childId in navitemCtrl.item.ids')).then(function (stepNavItems) {
                expect(stepNavItems[2].element(by.css('.md-button')).getText()).toBe('gamepad\n2.3: Explore the concepts');
                stepNavItems[2].element(by.tagName('button')).click();
                expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node5');
            });
        });
    });
});
//# sourceMappingURL=previewVLE.spec.js.map