'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeService = require('../../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableService = function (_NodeService) {
  _inherits(TableService, _NodeService);

  function TableService($filter, $q, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, TableService);

    var _this = _possibleConstructorReturn(this, (TableService.__proto__ || Object.getPrototypeOf(TableService)).call(this));

    _this.$filter = $filter;
    _this.$q = $q;
    _this.StudentAssetService = StudentAssetService;
    _this.StudentDataService = StudentDataService;
    _this.UtilService = UtilService;
    _this.$translate = _this.$filter('translate');
    return _this;
  }

  /**
   * Get the component type label
   * example
   * "Table"
   */


  _createClass(TableService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('table.componentTypeLabel');
    }

    /**
     * Create an Table component object
     * @returns a new Table component object
     */

  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = {};
      component.id = this.UtilService.generateKey();
      component.type = 'Table';
      component.prompt = '';
      component.showSaveButton = false;
      component.showSubmitButton = false;
      component.globalCellSize = 10;
      component.numRows = 3;
      component.numColumns = 3;
      component.tableData = [[{
        'text': '',
        'editable': true,
        'size': null
      }, {
        'text': '',
        'editable': true,
        'size': null
      }, {
        'text': '',
        'editable': true,
        'size': null
      }], [{
        'text': '',
        'editable': true,
        'size': null
      }, {
        'text': '',
        'editable': true,
        'size': null
      }, {
        'text': '',
        'editable': true,
        'size': null
      }], [{
        'text': '',
        'editable': true,
        'size': null
      }, {
        'text': '',
        'editable': true,
        'size': null
      }, {
        'text': '',
        'editable': true,
        'size': null
      }]];

      return component;
    }

    /**
     * Copies an existing Table component object
     * @returns a copied Table component object
     */

  }, {
    key: 'copyComponent',
    value: function copyComponent(componentToCopy) {
      var component = this.createComponent();
      component.prompt = componentToCopy.prompt;
      component.showSaveButton = componentToCopy.showSaveButton;
      component.showSubmitButton = componentToCopy.showSubmitButton;
      component.globalCellSize = componentToCopy.globalCellSize;
      component.numRows = componentToCopy.numRows;
      component.numColumns = componentToCopy.numColumns;
      component.tableData = componentToCopy.tableData;
      return component;
    }

    /**
     * Populate a component state with the data from another component state
     * @param componentStateFromOtherComponent the component state to obtain the data from
     * @return a new component state that contains the student data from the other
     * component state
     */

  }, {
    key: 'populateComponentState',
    value: function populateComponentState(componentStateFromOtherComponent) {
      var componentState = null;

      if (componentStateFromOtherComponent != null) {

        // create an empty component state
        componentState = this.StudentDataService.createComponentState();

        // get the component type of the other component state
        var otherComponentType = componentStateFromOtherComponent.componentType;

        if (otherComponentType === 'Table') {
          // the other component is an Table component

          // get the student data from the other component state
          var studentData = componentStateFromOtherComponent.studentData;

          // create a copy of the student data
          var studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

          // set the student data into the new component state
          componentState.studentData = studentDataCopy;
        }
      }

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
     * @returns whether the component was completed
     */
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      if (!this.componentHasEditableCells(component)) {
        /*
         * The component does not have any editable cells so we will say
         * it is completed.
         */
        return true;
      }
      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

        // loop through all the component states
        for (var c = 0, l = componentStates.length; c < l; c++) {

          // the component state
          var componentState = componentStates[c];

          // get the student data from the component state
          var studentData = componentState.studentData;

          if (studentData != null) {
            var tableData = studentData.tableData;

            if (tableData != null) {
              // there is a table data so the component has saved work
              // TODO: check for actual student data from the table (compare to starting state)
              if (submitRequired) {
                // completion requires a submission, so check for isSubmit
                if (componentState.isSubmit) {
                  return true;
                }
              } else {
                return true;
              }
            }
          }
        }
      }

      return false;
    }
  }, {
    key: 'componentHasEditableCells',


    /**
     * Check if a table component has any editable cells.
     * @param component The component content.
     * @return Whether the component has any editable cells.
     */
    value: function componentHasEditableCells(component) {
      if (component != null) {
        var tableData = component.tableData;
        if (tableData != null) {
          for (var r = 0; r < tableData.length; r++) {
            var row = tableData[r];
            if (row != null) {
              for (var c = 0; c < row.length; c++) {
                var cell = row[c];
                if (cell != null) {
                  if (cell.editable === true) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }

      return false;
    }

    /**
     * Whether this component generates student work
     * @param component (optional) the component object. if the component object
     * is not provided, we will use the default value of whether the
     * component type usually has work.
     * @return whether this component generates student work
     */

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      return true;
    }

    /**
     * Whether this component uses a save button
     * @return whether this component uses a save button
     */

  }, {
    key: 'componentUsesSaveButton',
    value: function componentUsesSaveButton() {
      return true;
    }

    /**
     * Whether this component uses a submit button
     * @return whether this component uses a submit button
     */

  }, {
    key: 'componentUsesSubmitButton',
    value: function componentUsesSubmitButton() {
      return true;
    }

    /**
     * Check if the component state has student work. Sometimes a component
     * state may be created if the student visits a component but doesn't
     * actually perform any work. This is where we will check if the student
     * actually performed any work.
     * @param componentState the component state object
     * @param componentContent the component content
     * @return whether the component state has any work
     */

  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {

      if (componentState != null) {

        var studentData = componentState.studentData;

        if (studentData != null) {

          // get the table from the student data
          var studentTableData = studentData.tableData;

          // get the table from the component content
          var componentContentTableData = componentContent.tableData;

          if (studentTableData != null) {

            var studentRows = studentTableData;

            // loop through the student rows
            for (var r = 0; r < studentRows.length; r++) {
              var studentRow = studentRows[r];

              if (studentRow != null) {

                // loop through the student columns
                for (var c = 0; c < studentRow.length; c++) {

                  // get cell from the student
                  var studentCell = this.getTableDataCellValue(r, c, studentTableData);

                  // get a cell from the component content
                  var componentContentCell = this.getTableDataCellValue(r, c, componentContentTableData);

                  if (studentCell !== componentContentCell) {
                    /*
                     * the cell values are not the same which means
                     * the student has changed the table
                     */
                    return true;
                  }
                }
              }
            }
          }
        }
      }

      return false;
    }

    /**
     * Get the value of a cell in the table
     * @param x the x coordinate
     * @param y the y coordinate
     * @param table (optional) table data to get the value from. this is used
     * when we want to look up the value in the default authored table
     * @returns the cell value (text or a number)
     */

  }, {
    key: 'getTableDataCellValue',
    value: function getTableDataCellValue(x, y, table) {

      var cellValue = null;

      if (table != null) {

        // get the row we want
        var row = table[y];

        if (row != null) {

          // get the cell we want
          var cell = row[x];

          if (cell != null) {

            // set the value into the cell
            cellValue = cell.text;
          }
        }
      }

      return cellValue;
    }

    /**
     * The component state has been rendered in a <component></component> element
     * and now we want to take a snapshot of the work.
     * @param componentState The component state that has been rendered.
     * @return A promise that will return an image object.
     */

  }, {
    key: 'generateImageFromRenderedComponentState',
    value: function generateImageFromRenderedComponentState(componentState) {
      var _this2 = this;

      var deferred = this.$q.defer();
      var tableElement = angular.element('#table_' + componentState.nodeId + '_' + componentState.componentId);
      if (tableElement != null && tableElement.length > 0) {
        tableElement = tableElement[0];
        // convert the table element to a canvas element
        (0, _html2canvas2.default)(tableElement).then(function (canvas) {
          // get the canvas as a base64 string
          var img_b64 = canvas.toDataURL('image/png');

          // get the image object
          var imageObject = _this2.UtilService.getImageObjectFromBase64String(img_b64);

          // add the image to the student assets
          _this2.StudentAssetService.uploadAsset(imageObject).then(function (asset) {
            deferred.resolve(asset);
          });
        });
      }
      return deferred.promise;
    }
  }]);

  return TableService;
}(_nodeService2.default);

TableService.$inject = ['$filter', '$q', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = TableService;
//# sourceMappingURL=tableService.js.map
