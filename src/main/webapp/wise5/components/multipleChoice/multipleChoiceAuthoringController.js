'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _multipleChoiceController = require('./multipleChoiceController');

var _multipleChoiceController2 = _interopRequireDefault(_multipleChoiceController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultipleChoiceAuthoringController = function (_MultipleChoiceContro) {
  _inherits(MultipleChoiceAuthoringController, _MultipleChoiceContro);

  function MultipleChoiceAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, MultipleChoiceService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, MultipleChoiceAuthoringController);

    // the options for when to update this component from a connected component
    var _this = _possibleConstructorReturn(this, (MultipleChoiceAuthoringController.__proto__ || Object.getPrototypeOf(MultipleChoiceAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, MultipleChoiceService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{
      type: 'MultipleChoice'
    }];

    _this.isPromptVisible = true;
    _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
    _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;

    // generate the summernote rubric element id
    _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

    // set the component rubric into the summernote rubric
    _this.summernoteRubricHTML = _this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = _this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    _this.summernoteRubricOptions = {
      toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    _this.updateAdvancedAuthoringView();

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    }.bind(_this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          // the asset was selected for this component
          var assetItem = args.assetItem;

          if (assetItem != null) {
            var fileName = assetItem.fileName;

            if (fileName != null) {
              /*
               * get the assets directory path
               * e.g.
               * /wise/curriculum/3/
               */
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              if (args.target == 'prompt' || args.target == 'rubric') {
                var summernoteId = '';

                if (args.target == 'prompt') {
                  // the target is the summernote prompt element
                  summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
                } else if (args.target == 'rubric') {
                  // the target is the summernote rubric element
                  summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
                }

                if (summernoteId != '') {
                  if (_this.UtilService.isImage(fileName)) {
                    /*
                     * move the cursor back to its position when the asset chooser
                     * popup was clicked
                     */
                    $('#' + summernoteId).summernote('editor.restoreRange');
                    $('#' + summernoteId).summernote('editor.focus');

                    // add the image html
                    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                  } else if (_this.UtilService.isVideo(fileName)) {
                    /*
                     * move the cursor back to its position when the asset chooser
                     * popup was clicked
                     */
                    $('#' + summernoteId).summernote('editor.restoreRange');
                    $('#' + summernoteId).summernote('editor.focus');

                    // insert the video element
                    var videoElement = document.createElement('video');
                    videoElement.controls = 'true';
                    videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                    $('#' + summernoteId).summernote('insertNode', videoElement);
                  }
                }
              } else if (args.target == 'choice') {
                // the target is a choice

                /*
                 * get the target object which should be a
                 * choice object
                 */
                var targetObject = args.targetObject;

                if (targetObject != null) {

                  // create the img html
                  var text = '<img src="' + fileName + '"/>';

                  // set the html into the choice text
                  targetObject.text = text;

                  // save the component
                  _this.authoringViewComponentChanged();
                }
              }
            }
          }
        }
      }

      // close the popup
      _this.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    _this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });
    return _this;
  }

  /**
   * Get the available choices from component content
   * @return the available choices from the component content
   */


  _createClass(MultipleChoiceAuthoringController, [{
    key: 'getAuthoringChoices',
    value: function getAuthoringChoices() {
      var choices = null;

      // get the component content
      var authoringComponentContent = this.authoringComponentContent;

      if (authoringComponentContent != null) {

        // get the choices
        choices = authoringComponentContent.choices;
      }

      return choices;
    }
  }, {
    key: 'authoringViewFeedbackChanged',


    /**
     * The author has changed the feedback so we will enable the submit button
     */
    value: function authoringViewFeedbackChanged() {

      var show = true;

      if (this.componentHasFeedback()) {
        // this component has feedback so we will show the submit button
        show = true;
      } else {
        /*
         * this component does not have feedback so we will not show the
         * submit button
         */
        show = false;
      }

      // show or hide the submit button
      this.setShowSubmitButtonValue(show);

      // save the component
      this.authoringViewComponentChanged();
    }

    /**
     * Check if this component has been authored to have feedback or has a
     * correct choice
     * @return whether this component has feedback or has a correct choice
     */

  }, {
    key: 'componentHasFeedback',
    value: function componentHasFeedback() {

      // get the choices
      var choices = this.authoringComponentContent.choices;

      if (choices != null) {

        // loop through all the choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {

            if (choice.feedback != null && choice.feedback != '') {
              // the choice has feedback
              return true;
            }

            if (choice.isCorrect) {
              // the choice is correct
              return true;
            }
          }
        }
      }

      return false;
    }

    /**
     * The component has changed in the regular authoring view so we will save the project
     */

  }, {
    key: 'authoringViewComponentChanged',
    value: function authoringViewComponentChanged() {

      // clean up the choices by removing fields injected by the controller during run time
      //this.cleanUpChoices();

      // update the JSON string in the advanced authoring view textarea
      this.updateAdvancedAuthoringView();

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    }
  }, {
    key: 'advancedAuthoringViewComponentChanged',


    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    value: function advancedAuthoringViewComponentChanged() {

      try {
        /*
         * create a new component by converting the JSON string in the advanced
         * authoring view into a JSON object
         */
        var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

        // replace the component in the project
        this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

        // set the new component into the controller
        this.componentContent = editedComponentContent;

        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: 'updateAdvancedAuthoringView',


    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'addChoice',


    /**
     * Add a choice from within the authoring tool
     */
    value: function addChoice() {

      // get the authored choices
      var choices = this.authoringComponentContent.choices;

      // make the new choice
      var newChoice = {};
      newChoice.id = this.UtilService.generateKey(10);
      newChoice.text = '';
      newChoice.feedback = '';
      newChoice.isCorrect = false;

      // add the new choice
      choices.push(newChoice);

      // save the component
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a choice from within the authoring tool
     * @param choiceId
     */

  }, {
    key: 'deleteChoice',
    value: function deleteChoice(choiceId) {

      // ask the author if they are sure they want to delete the choice
      var answer = confirm(this.$translate('multipleChoice.areYouSureYouWantToDeleteThisChoice'));

      if (answer) {
        // the author answered yes to delete the choice

        // get the authored choices
        var choices = this.authoringComponentContent.choices;

        if (choices != null) {

          // loop through all the authored choices
          for (var c = 0; c < choices.length; c++) {
            var choice = choices[c];

            if (choice != null) {
              var tempChoiceId = choice.id;

              if (choiceId === tempChoiceId) {
                // we have found the choice that we want to delete so we will remove it
                choices.splice(c, 1);
                break;
              }
            }
          }
        }

        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move a choice up
     * @param choiceId the choice to move
     */

  }, {
    key: 'moveChoiceUp',
    value: function moveChoiceUp(choiceId) {

      // get the authored choices
      var choices = this.authoringComponentContent.choices;

      if (choices != null) {

        // loop through all the authored choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {
            var tempChoiceId = choice.id;

            if (choiceId === tempChoiceId) {

              if (c == 0) {
                /*
                 * the choice is the first choice so we can't move
                 * it up
                 */
              } else {
                // we have found the choice that we want to move up

                // remove the choice
                choices.splice(c, 1);

                // add the choice one index back
                choices.splice(c - 1, 0, choice);
              }

              break;
            }
          }
        }
      }

      this.authoringViewComponentChanged();
    }

    /**
     * Move a choice down
     * @param choiceId the choice to move
     */

  }, {
    key: 'moveChoiceDown',
    value: function moveChoiceDown(choiceId) {
      // get the authored choices
      var choices = this.authoringComponentContent.choices;

      if (choices != null) {

        // loop through all the authored choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {
            var tempChoiceId = choice.id;

            if (choiceId === tempChoiceId) {

              if (c == choices.length - 1) {
                /*
                 * the choice is the last choice so we can't move
                 * it down
                 */
              } else {
                // we have found the choice that we want to move down

                // remove the choice
                choices.splice(c, 1);

                // add the choice one index forward
                choices.splice(c + 1, 0, choice);
              }

              break;
            }
          }
        }
      }
    }

    /**
     * Clean up the choice objects. In the authoring tool this is required
     * because we use the choice objects as ng-model values and inject
     * fields into the choice objects such as showFeedback and feedbackToShow.
     */

  }, {
    key: 'cleanUpChoices',
    value: function cleanUpChoices() {

      // get the authored choices
      var choices = this.getAuthoringChoices();

      if (choices != null) {

        // loop through all the authored choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {
            // remove the fields we don't want to be saved
            delete choice.showFeedback;
            delete choice.feedbackToShow;
          }
        }
      }
    }

    /**
     * The author has changed the rubric
     */

  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {

      // get the summernote rubric html
      var html = this.summernoteRubricHTML;

      /*
       * remove the absolute asset paths
       * e.g.
       * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
       * will be changed to
       * <img src='sun.png'/>
       */
      html = this.ConfigService.removeAbsoluteAssetPaths(html);

      /*
       * replace <a> and <button> elements with <wiselink> elements when
       * applicable
       */
      html = this.UtilService.insertWISELinks(html);

      // update the component rubric
      this.authoringComponentContent.rubric = html;

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Set the show submit button value
     * @param show whether to show the submit button
     */

  }, {
    key: 'setShowSubmitButtonValue',
    value: function setShowSubmitButtonValue(show) {

      if (show == null || show == false) {
        // we are hiding the submit button
        this.authoringComponentContent.showSaveButton = false;
        this.authoringComponentContent.showSubmitButton = false;
      } else {
        // we are showing the submit button
        this.authoringComponentContent.showSaveButton = true;
        this.authoringComponentContent.showSubmitButton = true;
      }

      /*
       * notify the parent node that this component is changing its
       * showSubmitButton value so that it can show save buttons on the
       * step or sibling components accordingly
       */
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }

    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {

      /*
       * perform additional processing for when we change the showSubmitButton
       * value
       */
      this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Show the asset popup to allow the author to choose an image for the
     * choice
     * @param choice the choice object to set the image into
     */

  }, {
    key: 'chooseChoiceAsset',
    value: function chooseChoiceAsset(choice) {
      // generate the parameters
      var params = {};
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = 'choice';
      params.targetObject = choice;

      // display the asset chooser
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Add a tag
     */

  }, {
    key: 'addTag',
    value: function addTag() {

      if (this.authoringComponentContent.tags == null) {
        // initialize the tags array
        this.authoringComponentContent.tags = [];
      }

      // add a tag
      this.authoringComponentContent.tags.push('');

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag up
     * @param index the index of the tag to move up
     */

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {

      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index back
        this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag down
     * @param index the index of the tag to move down
     */

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {

      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index forward
        this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a tag
     * @param index the index of the tag to delete
     */

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

      /*
       * create the new connected component object that will contain a
       * node id and component id
       */
      var newConnectedComponent = {};
      newConnectedComponent.nodeId = this.nodeId;
      newConnectedComponent.componentId = null;
      newConnectedComponent.type = null;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

      // initialize the array of connected components if it does not exist yet
      if (this.authoringComponentContent.connectedComponents == null) {
        this.authoringComponentContent.connectedComponents = [];
      }

      // add the connected component
      this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Automatically set the component id for the connected component if there
     * is only one viable option.
     * @param connectedComponent the connected component object we are authoring
     */

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var component = _step.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          if (numberOfAllowedComponents == 1) {
            /*
             * there is only one viable component to connect to so we
             * will use it
             */
            connectedComponent.componentId = allowedComponent.id;
            connectedComponent.type = 'importWork';
            this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);
          }
        }
      }
    }

    /**
     * Delete a connected component
     * @param index the index of the component to delete
     */

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

      if (answer) {
        // the author answered yes to delete

        if (this.authoringComponentContent.connectedComponents != null) {
          this.authoringComponentContent.connectedComponents.splice(index, 1);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Get the connected component type
     * @param connectedComponent get the component type of this connected component
     * @return the connected component type
     */

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

      var connectedComponentType = null;

      if (connectedComponent != null) {

        // get the node id and component id of the connected component
        var nodeId = connectedComponent.nodeId;
        var componentId = connectedComponent.componentId;

        // get the component
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

        if (component != null) {
          // get the component type
          connectedComponentType = component.type;
        }
      }

      return connectedComponentType;
    }

    /**
     * The connected component node id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
      if (connectedComponent != null) {
        connectedComponent.componentId = null;
        connectedComponent.type = null;
        this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The connected component component id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

      if (connectedComponent != null) {

        // default the type to import work
        connectedComponent.type = 'importWork';
        this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'copyChoiceTypeAndChoicesFromConnectedComponent',
    value: function copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent) {
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;
      if (this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId).type == "MultipleChoice") {
        this.copyChoiceTypeFromComponent(nodeId, componentId);
        this.copyChoicesFromComponent(nodeId, componentId);
      }
    }
  }, {
    key: 'copyChoiceTypeFromComponent',
    value: function copyChoiceTypeFromComponent(nodeId, componentId) {
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
      this.authoringComponentContent.choiceType = component.choiceType;
    }
  }, {
    key: 'copyChoicesFromComponent',
    value: function copyChoicesFromComponent(nodeId, componentId) {
      this.authoringComponentContent.choices = this.getCopyOfChoicesFromComponent(nodeId, componentId);
    }
  }, {
    key: 'getCopyOfChoicesFromComponent',
    value: function getCopyOfChoicesFromComponent(nodeId, componentId) {
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
      return this.UtilService.makeCopyOfJSONObject(component.choices);
    }

    /**
     * The connected component type has changed
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {}
        /*
         * the type has changed to show work
         */


        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

          if (allowedConnectedComponentType != null) {
            if (componentType == allowedConnectedComponentType.type) {
              // the component type is allowed
              return true;
            }
          }
        }
      }

      return false;
    }

    /**
     * The show JSON button was clicked to show or hide the JSON authoring
     */

  }, {
    key: 'showJSONButtonClicked',
    value: function showJSONButtonClicked() {
      // toggle the JSON authoring textarea
      this.showJSONAuthoring = !this.showJSONAuthoring;

      if (this.jsonStringChanged && !this.showJSONAuthoring) {
        /*
         * the author has changed the JSON and has just closed the JSON
         * authoring view so we will save the component
         */
        this.advancedAuthoringViewComponentChanged();

        // scroll to the top of the component
        this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });

        this.jsonStringChanged = false;
      }
    }

    /**
     * The author has changed the JSON manually in the advanced view
     */

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
    }
  }]);

  return MultipleChoiceAuthoringController;
}(_multipleChoiceController2.default);

;

MultipleChoiceAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'MultipleChoiceService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = MultipleChoiceAuthoringController;
//# sourceMappingURL=multipleChoiceAuthoringController.js.map
