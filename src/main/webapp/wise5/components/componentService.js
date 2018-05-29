'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentService = function () {
  function ComponentService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, ComponentService);

    this.$filter = $filter;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
  }

  /**
   * Get the component type label. For example "Open Response".
   * @returns {string}
   */


  _createClass(ComponentService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return '';
    }

    /**
     * Create a component object
     * @returns {object} a component object
     */

  }, {
    key: 'createComponent',
    value: function createComponent() {
      return {
        id: this.UtilService.generateKey(),
        type: '',
        prompt: '',
        showSaveButton: false,
        showSubmitButton: false
      };
    }

    /**
     * Populate a component state with the data from another component state
     * @param {object} componentStateFromOtherComponent the component state to obtain the data from
     * @return {object} a new component state that contains the student data from the other
     * component state
     */

  }, {
    key: 'populateComponentState',
    value: function populateComponentState(componentStateFromOtherComponent) {
      var studentDataCopy = this.UtilService.makeCopyOfJSONObject(componentStateFromOtherComponent.studentData);
      var componentState = this.StudentDataService.createComponentState();
      componentState.studentData = studentDataCopy;
      return componentState;
    }
  }, {
    key: 'isCompleted',


    /**
     * Check if the component was completed
     * @param component the component object
     * @param componentStates the component states for the specific component
     * @param componentEvents the events for the specific component
     * @param nodeEvents the events for the parent node of the component
     * @param node parent node of the component
     * @returns {boolean} whether the component was completed
     */
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      return true;
    }

    /**
     * Check if we need to display the annotation to the student
     * @param componentContent the component content
     * @param annotation the annotation
     * @returns {boolean} whether we need to display the annotation to the student
     */

  }, {
    key: 'displayAnnotation',
    value: function displayAnnotation(componentContent, annotation) {
      return true;
    }

    /**
     * Whether this component generates student work
     * @param component (optional) the component object. if the component object
     * is not provided, we will use the default value of whether the
     * component type usually has work.
     * @return {boolean} whether this component generates student work
     */

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      return true;
    }

    /**
     * Check if the component state has student work. Sometimes a component
     * state may be created if the student visits a component but doesn't
     * actually perform any work. This is where we will check if the student
     * actually performed any work.
     * @param componentState the component state object
     * @param componentContent the component content
     * @return {boolean} whether the component state has any work
     */

  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      return false;
    }

    /**
     * Get the human readable student data string
     * @param componentState the component state
     * @return {string} a human readable student data string
     */

  }, {
    key: 'getStudentDataString',
    value: function getStudentDataString(componentState) {
      return '';
    }

    /**
     * Whether this component uses a save button
     * @return {boolean} whether this component uses a save button
     */

  }, {
    key: 'componentUsesSaveButton',
    value: function componentUsesSaveButton() {
      return true;
    }

    /**
     * Whether this component uses a submit button
     * @return {boolean} whether this component uses a submit button
     */

  }, {
    key: 'componentUsesSubmitButton',
    value: function componentUsesSubmitButton() {
      return true;
    }
  }]);

  return ComponentService;
}();

ComponentService.$inject = [];

exports.default = ComponentService;
//# sourceMappingURL=componentService.js.map
