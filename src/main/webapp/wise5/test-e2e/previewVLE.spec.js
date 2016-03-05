'use strict';

// test for VLE running preview mode
describe('WISE5 Student VLE Preview', function () {

    it('should load the vle and go to node 1', function () {
        browser.get('http://localhost:8080/wise/project/demo');

        expect(browser.getTitle()).toEqual('WISE');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');

        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.1: Introduction to Newton Scooters');

        // check that previous, next and close buttons are on the page
        var previousButton = element(by.xpath('//button[@aria-label="Previous Item"]'));
        expect(previousButton.getText()).toBe('arrow_back');
        var nextButton = element(by.xpath('//button[@aria-label="Next Item"]'));
        expect(nextButton.getText()).toBe('arrow_forward');
        var closeButton = element(by.xpath('//button[@aria-label="Close Step"]'));
        expect(closeButton.getText()).toBe('close');

        // click on the next button and expect to go back to the next step
        nextButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node2');
        expect(element(by.model("stepToolsCtrl.toNodeId")).getText()).toBe('1.2: Initial Ideas');

        // click on the close button and expect to go to the group view
        closeButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/group1');
    });
});
//# sourceMappingURL=previewVLE.spec.js.map