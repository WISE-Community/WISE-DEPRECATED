'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeController = function () {
  function NodeController($compile, $filter, $q, $rootScope, $scope, $state, $timeout, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, NodeController);

    this.$compile = $compile;
    this.$filter = $filter;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$timeout = $timeout;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.NodeService = NodeService;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');

    // the auto save interval in milliseconds
    this.autoSaveInterval = 60000;

    // the node id of the current node
    this.nodeId = null;
    this.nodeContent = null;
    this.nodeStatus = null;
    this.nodeTitle = null;

    // hold ids of dirty components
    this.dirtyComponentIds = [];

    // array to hold ids of components where student work has changed since last submission
    this.dirtySubmitComponentIds = [];

    // whether the student work has changed since last submit
    this.submit = false;
    this.workgroupId = this.ConfigService.getWorkgroupId();
    this.teacherWorkgroupId = this.ConfigService.getTeacherWorkgroupId();

    /*
     * an object that holds the mappings with the key being the component
     * and the value being the scope object from the child controller
     */
    this.componentToScope = {};

    // message to show next to save/submit buttons
    this.saveMessage = {
      text: '',
      time: ''
    };

    // the step rubric
    this.rubric = null;

    // get the mode e.g. 'preview', 'student', 'authoring', 'grading', etc.
    this.mode = this.ConfigService.getMode();

    // perform setup of this node only if the current node is not a group.
    if (this.StudentDataService.getCurrentNode() && this.ProjectService.isApplicationNode(this.StudentDataService.getCurrentNodeId())) {
      var currentNode = this.StudentDataService.getCurrentNode();
      if (currentNode != null) {
        this.nodeId = currentNode.id;
      }

      // get the node content
      this.nodeContent = this.ProjectService.getNodeById(this.nodeId);

      this.nodeTitle = this.ProjectService.getNodeTitleByNodeId(this.nodeId);

      this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];

      // populate the student work into this node
      //this.setStudentWork();

      // check if we need to lock this node
      this.calculateDisabled();

      //this.importWork();

      // start the auto save interval
      this.startAutoSaveInterval();

      // register this controller to listen for the exit event
      this.registerExitListener();

      if (this.NodeService.hasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('enterNode')) {
        this.NodeService.evaluateTransitionLogic();
      }

      // set save message with last save/submission
      // for now, we'll use the latest component state (since we don't currently keep track of node-level saves)
      // TODO: use node states once we implement node state saving
      var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId);
      if (latestComponentState) {
        var latestClientSaveTime = latestComponentState.clientSaveTime;
        if (latestComponentState.isSubmit) {
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), latestClientSaveTime);
        } else {
          this.setSaveMessage(this.$translate('LAST_SAVED'), latestClientSaveTime);
        }
      }

      // save nodeEntered event
      var nodeId = this.nodeId;
      var componentId = null;
      var componentType = null;
      var category = "Navigation";
      var event = "nodeEntered";
      var eventData = {};
      eventData.nodeId = nodeId;
      this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

      if (this.nodeContent != null) {
        // get the step rubric
        this.rubric = this.nodeContent.rubric;

        // create the rubric tour bubbles
        this.createRubricTour();
      }

      /*
       * Check if the component id was provided in the state params. If
       * it is provided, we will scroll to it and then briefly highlight
       * it.
       */
      if (this.$state != null && this.$state.params != null && this.$state.params.componentId != null) {

        // get the component id
        var _componentId = this.$state.params.componentId;

        this.$timeout(function () {
          // get the UI element of the component
          var componentElement = $("#component_" + _componentId);

          if (componentElement != null) {
            // save the original background color
            var originalBackgroundColor = componentElement.css("backgroundColor");

            // highlight the background briefly to draw attention to it
            componentElement.css("background-color", "#FFFF9C");

            // scroll to the first new component that we've added
            $('#content').animate({
              scrollTop: componentElement.prop("offsetTop")
            }, 1000);

            /*
             * remove the background highlighting so that it returns
             * to its original color
             */
            componentElement.css({
              'transition': 'background-color 3s ease-in-out',
              'background-color': originalBackgroundColor
            });
          }
        }, 1000);
      }
    }

    /**
     * Listen for the componentSaveTriggered event which occurs when a
     * component is requesting student data to be saved
     */
    this.$scope.$on('componentSaveTriggered', function (event, args) {
      var isAutoSave = false;

      if (args != null) {
        var _nodeId = args.nodeId;
        var _componentId2 = args.componentId;

        if (_nodeId != null && _componentId2 != null) {
          if (_this.nodeId == _nodeId && _this.nodeContainsComponent(_componentId2)) {
            /*
             * obtain the component states from the children and save them
             * to the server
             */
            _this.createAndSaveComponentData(isAutoSave, _componentId2);
          }
        }
      }
    });

    /**
     * Listen for the componentSubmitTriggered event which occurs when a
     * component is requesting student data to be submitted
     */
    this.$scope.$on('componentSubmitTriggered', function (event, args) {
      var isAutoSave = false;
      var isSubmit = true;

      if (args != null) {
        var _nodeId2 = args.nodeId;
        var _componentId3 = args.componentId;

        if (_nodeId2 != null && _componentId3 != null) {
          if (_this.nodeId == _nodeId2 && _this.nodeContainsComponent(_componentId3)) {
            /*
             * obtain the component states from the children and save them
             * to the server
             */
            _this.createAndSaveComponentData(isAutoSave, _componentId3, isSubmit);
          }
        }
      }
    });

    /**
     * Listen for the componentStudentDataChanged event that will come from
     * child component scopes
     * @param event
     * @param args the arguments provided when the event is fired
     */
    this.$scope.$on('componentStudentDataChanged', function (event, args) {
      /*
       * the student data in one of our child scopes has changed so
       * we will need to save
       */
      if (args != null) {
        var _componentId4 = args.componentId;
        var componentState = args.componentState;
        if (_componentId4 != null && componentState != null) {
          if (componentState.nodeId == null) {
            if (args.nodeId != null) {
              /*
               * set the node id into the component state because
               * the component state hasn't had it set at this
               * point.
               */
              componentState.nodeId = args.nodeId;
            }
          }

          if (componentState.componentId == null) {

            if (args.componentId != null) {
              /*
               * set the component id into the component state
               * because the component state hasn't had it set at
               * this point.
               */
              componentState.componentId = args.componentId;
            }
          }

          /*
           * notify the parts that are connected that the student
           * data has changed
           */
          _this.notifyConnectedParts(_componentId4, componentState);
          _this.$scope.$broadcast('siblingComponentStudentDataChanged', args);
        }
      }
    });

    /**
     * Listen for the componentDirty event that will come from child component
     * scopes; notifies node that component has/doesn't have unsaved work
     * @param event
     * @param args the arguments provided when the event is fired
     */
    this.$scope.$on('componentDirty', function (event, args) {
      var componentId = args.componentId;
      if (componentId) {
        var isDirty = args.isDirty;
        var index = _this.dirtyComponentIds.indexOf(componentId);
        if (isDirty && index === -1) {
          // add component id to array of dirty components
          _this.dirtyComponentIds.push(componentId);
        } else if (!isDirty && index > -1) {
          // remove component id from array of dirty components
          _this.dirtyComponentIds.splice(index, 1);
        }
      }
    });

    /**
     * Listen for the componentSubmitDirty event that will come from child
     * component scopes; notifies node that work has/has not changed for a
     * component since last submission
     * @param event
     * @param args the arguments provided when the event is fired
     */
    this.$scope.$on('componentSubmitDirty', function (event, args) {
      var componentId = args.componentId;
      if (componentId) {
        var isDirty = args.isDirty;
        var index = _this.dirtySubmitComponentIds.indexOf(componentId);
        if (isDirty && index === -1) {
          // add component id to array of dirty submit components
          _this.dirtySubmitComponentIds.push(componentId);
        } else if (!isDirty && index > -1) {
          // remove component id from array of dirty submit components
          _this.dirtySubmitComponentIds.splice(index, 1);
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the node. This will perform saving when the student exits
     * the node.
     */
    this.$scope.$on('exitNode', function (event, args) {
      var nodeToExit = args.nodeToExit;
      /*
       * make sure the node id of the node that is exiting is
       * this node
       */
      if (nodeToExit.id === _this.nodeId) {
        var saveTriggeredBy = 'exitNode';
        _this.stopAutoSaveInterval();

        /*
         * tell the parent that this node is done performing
         * everything it needs to do before exiting
         */
        _this.nodeUnloaded(_this.nodeId);

        // check if this node has transition logic that should be run when the student exits the node
        if (_this.NodeService.hasTransitionLogic() && _this.NodeService.evaluateTransitionLogicOn('exitNode')) {
          // this node has transition logic
          _this.NodeService.evaluateTransitionLogic();
        }
      }
    });

    // load script for this node, if any
    var script = this.nodeContent.script;
    if (script != null) {
      this.ProjectService.retrieveScript(script).then(function (script) {
        new Function(script).call(_this);
      });
    }
  }

  /**
   * Create the tour bubbles for all of the rubrics for this node
   */


  _createClass(NodeController, [{
    key: 'createRubricTour',
    value: function createRubricTour() {
      this.rubricTour = {
        id: 'rubricTour',
        arrowWidth: 12,
        bubblePadding: 0,
        bubbleWidth: 800,
        container: '#content',
        steps: [],
        showPrevButton: true,
        showNextButton: true,
        scrollDuration: 400,
        customRenderer: this.getRubricTemplate,
        customData: {
          $ctrl: this
        },
        i18n: {
          nextBtn: this.$translate('NEXT'),
          prevBtn: this.$translate('PREVIOUS'),
          doneBtn: this.$translate('DONE'),
          closeTooltip: this.$translate('CLOSE')
        }
      };

      if (this.rubric) {
        var thisTarget = '#nodeRubric_' + this.nodeId;

        // add a tour bubble for the node rubric
        this.rubricTour.steps.push({
          target: thisTarget,
          placement: 'bottom',
          title: this.$translate('STEP_INFO'),
          content: this.ProjectService.replaceAssetPaths(this.rubric),
          xOffset: 'center',
          arrowOffset: 'center',
          onShow: this.onShowRubric,
          viewed: false
        });
      }

      // add tour bubbles for each of the component rubrics
      var components = this.getComponents();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var component = _step.value;

          if (component.rubric) {
            var _thisTarget = '#rubric_' + component.id;
            this.rubricTour.steps.push({
              target: _thisTarget,
              arrowOffset: 21,
              placement: 'right',
              yOffset: 1,
              title: this.$translate('ITEM_INFO'),
              content: this.ProjectService.replaceAssetPaths(component.rubric),
              onShow: this.onShowRubric,
              viewed: false
            });
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
    }

    /**
     * Show the tour bubble for the rubric with the given componentId or nodeId
     * @param id componentId or nodeId of rubric to show
     */

  }, {
    key: 'showRubric',
    value: function showRubric(id) {
      if (this.rubricTour) {
        var step = -1;
        var index = 0;

        var thisTarget = '#nodeRubric_' + this.nodeId;
        if (this.nodeId === id) {
          // the given id matches this nodeId
          step = index;
        }

        if (step < 0) {
          if (this.rubric) {
            index++;
          }

          var components = this.getComponents();
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = components[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var component = _step2.value;

              if (component.rubric) {
                thisTarget = '#rubric_' + component.id;
                if (component.id === id) {
                  // the given id matches the current componentId
                  step = index;
                  break;
                }
                index++;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }

        // end any currently running rubric tour
        hopscotch.endTour(this.rubricTour);
        // show the rubric tour starting with the step for the matched index
        hopscotch.startTour(this.rubricTour, step);
      }
    }

    /**
     * Create and return the custom template for the rubric tour bubbles
     * @param details Object with the tour details
     * @return HTML string
     */

  }, {
    key: 'getRubricTemplate',
    value: function getRubricTemplate(details) {
      var i18n = details.i18n;
      var buttons = details.buttons;
      var step = details.step;
      var tour = details.tour;
      var $ctrl = tour.customData.$ctrl;
      var template = '<div class="hopscotch-bubble-container help-bubble md-whiteframe-4dp" style="width: ' + step.width + 'px; padding: ' + step.padding + 'px;">\n                <md-toolbar class="md-subhead help-bubble__title md-toolbar--wise">\n                    <div class="help-bubble___title__content" layout="row" layout-align="start center" flex>\n                        <span>' + (tour.isTour ? i18n.stepNum + ' | ' : '') + (step.title !== '' ? '' + step.title : '') + '</span>\n                        <span flex></span>\n                        ' + (buttons.showClose ? '<md-button class="md-icon-button hopscotch-close">\n                            <md-icon aria-label="' + i18n.closeTooltip + '"> close </md-icon>\n                        </md-button>' : '') + '\n                    </div>\n                </md-toolbar>\n                <div class="help-bubble__content">\n                    ' + (step.content !== '' ? '' + step.content : '') + '\n                    ' + (buttons.showCTA ? '<md-button class="hopscotch-cta md-primary md-raised">' + i18n.ctaLabel + '</md-button>' : '') + '\n                </div>\n                <md-divider></md-divider>\n                <div class="help-bubble__actions gray-lightest-bg" layout="row" layout-align="start center">\n                    ' + (buttons.showClose ? '<md-button class="button--small hopscotch-close">' + i18n.closeTooltip + '</md-button>' : '') + '\n                    <span flex></span>\n                    ' + (buttons.showPrev ? '<md-button class="button--small info hopscotch-prev">' + i18n.prevBtn + '</md-button>' : '') + '\n                    ' + (buttons.showNext ? '<md-button class="button--small info hopscotch-next">' + i18n.nextBtn + '</md-button>' : '') + '\n                </md-card-actions>\n            </div>';

      // need to compile the template here because Hopscotch inserts raw html
      var templateHTML = $ctrl.$compile(template)($ctrl.$scope)[0].outerHTML + '<div class="hopscotch-bubble-arrow-container hopscotch-arrow">\n                <div class="hopscotch-bubble-arrow-border"></div>\n                <div class="hopscotch-bubble-arrow"></div>\n            </div>';
      return templateHTML;
    }

    /**
     * Callback for when a rubric tour bubble is shown
     */

  }, {
    key: 'onShowRubric',
    value: function onShowRubric() {
      // stop the pulsing animation on the info button for the rubric being shown
      var index = hopscotch.getCurrStepNum();
      hopscotch.getCurrTour().customData.$ctrl.rubricTour.steps[index].viewed = true;
    }

    /**
     * The function that child component controllers will call to register
     * themselves with this node
     * @param childScope the child scope object
     * @param component the component content for the component
     */

  }, {
    key: 'registerComponentController',
    value: function registerComponentController(childScope, component) {
      if (childScope != null && component != null) {
        var componentId = component.id;
        this.componentToScope[componentId] = childScope;
      }
    }

    /**
     * Populate the student work into the node
     */

  }, {
    key: 'setStudentWork',
    value: function setStudentWork() {}
  }, {
    key: 'importWork',


    /**
     * Import work from another node
     */
    value: function importWork() {}
  }, {
    key: 'getRevisions',


    /**
     * Returns all the revisions made by this user for the specified component
     */
    value: function getRevisions(componentId) {
      var revisions = [];
      var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, componentId);
      return componentStates;
    }
  }, {
    key: 'showRevisions',
    value: function showRevisions($event, componentId, isComponentDisabled) {
      var revisions = this.getRevisions(componentId);
      var allowRevert = !isComponentDisabled;

      var childScope = this.componentToScope[componentId];

      // TODO: generalize for other controllers
      var componentController = null;

      if (childScope.openResponseController) {
        componentController = childScope.openResponseController;
      } else if (childScope.drawController) {
        componentController = childScope.drawController;
      }

      this.$rootScope.$broadcast('showRevisions', { revisions: revisions, componentController: componentController, allowRevert: allowRevert, $event: $event });
    }
  }, {
    key: 'showStudentAssets',


    /**
     * Show student assets
     * @param $event
     * @param componentId
     */
    value: function showStudentAssets($event, componentId) {
      var childScope = this.componentToScope[componentId];

      // TODO: generalize for other controllers
      var componentController = null;

      if (childScope.openResponseController) {
        componentController = childScope.openResponseController;
      } else if (childScope.drawController) {
        componentController = childScope.drawController;
      } else if (childScope.discussionController) {
        componentController = childScope.discussionController;
      } else if (childScope.tableController) {
        componentController = childScope.tableController;
      } else if (childScope.graphController) {
        componentController = childScope.graphController;
      }

      this.$rootScope.$broadcast('showStudentAssets', { componentController: componentController, $event: $event });
    }
  }, {
    key: 'saveButtonClicked',


    /**
     * Called when the student clicks the save button
     */
    value: function saveButtonClicked() {
      this.$rootScope.$broadcast('nodeSaveClicked', { nodeId: this.nodeId });

      var isAutoSave = false;

      /*
       * obtain the component states from the children and save them
       * to the server
       */
      this.createAndSaveComponentData(isAutoSave);
    }
  }, {
    key: 'submitButtonClicked',


    /**
     * Called when the student clicks the submit button
     */
    value: function submitButtonClicked() {
      // notify the child components that the submit button was clicked
      this.$rootScope.$broadcast('nodeSubmitClicked', { nodeId: this.nodeId });

      var isAutoSave = false;
      var isSubmit = true;

      /*
       * obtain the component states from the children and save them
       * to the server
       */
      this.createAndSaveComponentData(isAutoSave, null, isSubmit);
    }
  }, {
    key: 'calculateDisabled',


    /**
     * Check if we need to lock the node
     */
    value: function calculateDisabled() {
      var nodeId = this.nodeId;
      var nodeContent = this.nodeContent;

      if (nodeContent) {
        var lockAfterSubmit = nodeContent.lockAfterSubmit;
        if (lockAfterSubmit) {
          var componentStates = this.StudentDataService.getComponentStatesByNodeId(nodeId);
          var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);
          if (isSubmitted) {
            this.isDisabled = true;
          }
        }
      }
    }
  }, {
    key: 'getComponents',


    /**
     * Get the components for this node.
     * @return an array that contains the content for the components.
     */
    value: function getComponents() {
      var components = null;
      if (this.nodeContent != null) {
        components = this.nodeContent.components;
      }

      if (components != null && this.isDisabled) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = components[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var component = _step3.value;

            component.isDisabled = true;
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }

      if (components != null && this.nodeContent.lockAfterSubmit) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = components[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _component = _step4.value;

            _component.lockAfterSubmit = true;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
      return components;
    }
  }, {
    key: 'getComponentById',


    /**
     * Get the component given the component id
     * @param componentId the component id we want
     * @return the component object with the given component id
     */
    value: function getComponentById(componentId) {
      var component = null;
      if (componentId != null) {
        var components = this.getComponents();
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = components[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var tempComponent = _step5.value;

            if (tempComponent != null) {
              var tempComponentId = tempComponent.id;
              if (tempComponentId === componentId) {
                component = tempComponent;
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
      return component;
    }
  }, {
    key: 'nodeContainsComponent',


    /**
     * Check if this node contains a given component id
     * @param componentId the component id
     * @returns whether this node contains the component
     */
    value: function nodeContainsComponent(componentId) {
      var result = false;
      if (componentId != null) {
        var components = this.getComponents();
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = components[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var tempComponent = _step6.value;

            if (tempComponent != null) {
              var tempComponentId = tempComponent.id;
              if (tempComponentId === componentId) {
                result = true;
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'getComponentTemplatePath',


    /**
     * Get the html template for the component
     * @param componentType the component type
     * @return the path to the html template for the component
     */
    value: function getComponentTemplatePath(componentType) {
      return this.NodeService.getComponentTemplatePath(componentType);
    }
  }, {
    key: 'showSaveButton',


    /**
     * Check whether we need to show the save button
     * @return whether to show the save button
     */
    value: function showSaveButton() {
      var result = false;
      if (this.nodeContent != null && this.nodeContent.showSaveButton) {
        result = true;
      }
      return result;
    }
  }, {
    key: 'showSubmitButton',


    /**
     * Check whether we need to show the submit button
     * @return whether to show the submit button
     */
    value: function showSubmitButton() {
      var result = false;
      if (this.nodeContent != null && this.nodeContent.showSubmitButton) {
        result = true;
      }
      return result;
    }
  }, {
    key: 'isLockAfterSubmit',


    /**
     * Check whether we need to lock the component after the student
     * submits an answer.
     */
    value: function isLockAfterSubmit() {
      var result = false;
      if (this.componentContent != null) {
        if (this.componentContent.lockAfterSubmit) {
          result = true;
        }
      }
      return result;
    }
  }, {
    key: 'setSaveMessage',


    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    value: function setSaveMessage(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: 'startAutoSaveInterval',


    /**
     * Start the auto save interval for this node
     */
    value: function startAutoSaveInterval() {
      var _this2 = this;

      this.autoSaveIntervalId = setInterval(function () {
        if (_this2.dirtyComponentIds.length) {
          var isAutoSave = true;

          /*
           * obtain the component states from the children and save them
           * to the server
           */
          _this2.createAndSaveComponentData(isAutoSave);
        }
      }, this.autoSaveInterval);
    }
  }, {
    key: 'stopAutoSaveInterval',


    /**
     * Stop the auto save interval for this node
     */
    value: function stopAutoSaveInterval() {
      clearInterval(this.autoSaveIntervalId);
    }
  }, {
    key: 'createAndSaveComponentData',


    /**
     * Obtain the componentStates and annotations from the children and save them
     * to the server
     * @param isAutoSave whether the component states were auto saved
     * @param componentId (optional) the component id of the component
     * that triggered the save
     * @param isSubmit (optional) whether this is a sumission or not
     * @returns a promise that will save all the component states for the step
     * that need saving
     */
    value: function createAndSaveComponentData(isAutoSave, componentId, isSubmit) {
      var _this3 = this;

      return this.createComponentStates(isAutoSave, componentId, isSubmit).then(function (componentStates) {
        var componentAnnotations = [];
        var componentEvents = null;
        var nodeStates = null;

        if (componentStates != null && _this3.UtilService.arrayHasNonNullElement(componentStates) || componentAnnotations != null && componentAnnotations.length || componentEvents != null && componentEvents.length) {
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = componentStates[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var componentState = _step7.value;

              if (componentState != null) {
                var annotations = componentState.annotations;
                if (annotations != null) {
                  /*
                   * add the annotations to our array of annotations that will
                   * be saved to the server
                   */
                  componentAnnotations = componentAnnotations.concat(annotations);
                }
                delete componentState.annotations;
              }
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          return _this3.StudentDataService.saveToServer(componentStates, nodeStates, componentEvents, componentAnnotations).then(function (savedStudentDataResponse) {
            if (savedStudentDataResponse) {
              // check if this node has transition logic that should be run when the student data changes
              if (_this3.NodeService.hasTransitionLogic() && _this3.NodeService.evaluateTransitionLogicOn('studentDataChanged')) {
                // this node has transition logic
                _this3.NodeService.evaluateTransitionLogic();
              }

              // check if this node has transition logic that should be run when the student score changes
              if (_this3.NodeService.hasTransitionLogic() && _this3.NodeService.evaluateTransitionLogicOn('scoreChanged')) {
                if (componentAnnotations != null && componentAnnotations.length > 0) {
                  var evaluateTransitionLogic = false;
                  var _iteratorNormalCompletion8 = true;
                  var _didIteratorError8 = false;
                  var _iteratorError8 = undefined;

                  try {
                    for (var _iterator8 = componentAnnotations[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                      var componentAnnotation = _step8.value;

                      if (componentAnnotation != null) {
                        if (componentAnnotation.type === 'autoScore') {
                          evaluateTransitionLogic = true;
                        }
                      }
                    }
                  } catch (err) {
                    _didIteratorError8 = true;
                    _iteratorError8 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                      }
                    } finally {
                      if (_didIteratorError8) {
                        throw _iteratorError8;
                      }
                    }
                  }

                  if (evaluateTransitionLogic) {
                    // the student score has changed so we will evaluate the transition logic
                    _this3.NodeService.evaluateTransitionLogic();
                  }
                }
              }

              var studentWorkList = savedStudentDataResponse.studentWorkList;
              if (!componentId && studentWorkList && studentWorkList.length) {
                // this was a step save or submission and student work was saved, so set save message
                var latestStudentWork = studentWorkList[studentWorkList.length - 1];
                var serverSaveTime = latestStudentWork.serverSaveTime;
                var clientSaveTime = _this3.ConfigService.convertToClientTimestamp(serverSaveTime);

                if (isAutoSave) {
                  _this3.setSaveMessage(_this3.$translate('AUTO_SAVED'), clientSaveTime);
                } else if (isSubmit) {
                  _this3.setSaveMessage(_this3.$translate('SUBMITTED'), clientSaveTime);
                } else {
                  _this3.setSaveMessage(_this3.$translate('SAVED'), clientSaveTime);
                }
              } else {
                _this3.setSaveMessage('', null);
              }
            }

            return savedStudentDataResponse;
          });
        }
      });
    }
  }, {
    key: 'createComponentStates',


    /**
     * Loop through this node's components and get/create component states
     * @param isAutoSave whether the component states were auto saved
     * @param componentId (optional) the component id of the component
     * that triggered the save
     * @param isSubmit (optional) whether this is a submission or not
     * @returns an array of promises that will return component states
     */
    value: function createComponentStates(isAutoSave, componentId, isSubmit) {
      var components = [];
      var componentStatePromises = [];

      if (componentId) {
        var component = this.getComponentById(componentId);
        if (component) {
          components.push(component);
        }
      } else {
        components = this.getComponents();
      }

      if (components.length) {
        var runId = this.ConfigService.getRunId();
        var periodId = this.ConfigService.getPeriodId();
        var workgroupId = this.ConfigService.getWorkgroupId();
        var nodeId = this.nodeId;

        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = components[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var _component2 = _step9.value;

            if (_component2 != null) {
              var tempComponentId = _component2.id;
              var componentType = _component2.type;

              var childScope = this.componentToScope[tempComponentId];
              if (childScope != null) {
                if (childScope.getComponentState) {
                  var componentStatePromise = this.getComponentStateFromChildScope(childScope, runId, periodId, workgroupId, nodeId, componentId, tempComponentId, componentType, isAutoSave, isSubmit);
                  componentStatePromises.push(componentStatePromise);
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }

      return this.$q.all(componentStatePromises);
    }
  }, {
    key: 'getComponentStateFromChildScope',


    /**
     * Get the component state from the child scope
     * @param childScope the child scope
     * @param runId the run id
     * @param periodId the period id
     * @param workgroupId the workgroup id
     * @param nodeId the node id
     * @param componentId the component id that has triggered the save
     * @param tempComponentId the component id of the component we are obtaining
     * a component state for
     * @param componentType the component type
     * @param isAutoSave whether this save was triggered by an auto save
     * @param isSubmit whether this save was triggered by a submit
     */
    value: function getComponentStateFromChildScope(childScope, runId, periodId, workgroupId, nodeId, componentId, tempComponentId, componentType, isAutoSave, isSubmit) {
      var _this4 = this;

      return childScope.getComponentState(isSubmit).then(function (componentState) {
        if (componentState != null) {
          componentState.runId = runId;
          componentState.periodId = periodId;
          componentState.workgroupId = workgroupId;
          componentState.nodeId = _this4.nodeId;
          componentState.componentId = tempComponentId;
          componentState.componentType = componentType;

          if (componentId == null) {
            /*
             * the node has triggered the save so all the components will
             * either have isAutoSave set to true or false; if this is a
             * submission, all the components will have isSubmit set to true
             */
            componentState.isAutoSave = isAutoSave;

            if (isSubmit) {
              /*
               * set the isSubmit value in the component state if
               * it wasn't set by the component
               */
              if (componentState.isSubmit == null) {
                componentState.isSubmit = true;
              }
            }
          } else {
            /*
             * a component has triggered the save so only that component will
             * have isAutoSave set to false; if this is a submission,
             * component will have isSubmit set to true
             */

            if (componentId === tempComponentId) {
              componentState.isAutoSave = false;

              if (isSubmit) {
                /*
                 * set the isSubmit value in the component state if
                 * it wasn't set by the component
                 */
                if (componentState.isSubmit == null) {
                  componentState.isSubmit = true;
                }
              }
            }
          }
          return componentState;
        }
      });
    }

    /**
     * Get the latest annotations for a given component
     * TODO: move to a parent component class in the future?
     * @param componentId the component's id
     * @return object containing the component's latest score and comment annotations
     */

  }, {
    key: 'getLatestComponentAnnotations',
    value: function getLatestComponentAnnotations(componentId) {
      var latestScoreAnnotation = null;
      var latestCommentAnnotation = null;

      var nodeId = this.nodeId;
      var workgroupId = this.workgroupId;
      latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(nodeId, componentId, workgroupId, 'any');
      latestCommentAnnotation = this.AnnotationService.getLatestCommentAnnotation(nodeId, componentId, workgroupId, 'any');

      return {
        'score': latestScoreAnnotation,
        'comment': latestCommentAnnotation
      };
    }
  }, {
    key: 'notifyConnectedParts',


    /**
     * Notify any connected components that the student data has changed
     * @param componentId the component id that has changed
     * @param componentState the new component state
     */
    value: function notifyConnectedParts(changedComponentId, componentState) {
      if (changedComponentId != null && componentState != null) {
        var components = this.getComponents();
        if (components != null) {

          /*
           * loop through all the components and look for components
           * that are listening for the given component id to change.
           * only notify components that are listening for changes
           * from the specific component id.
           */
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = components[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var tempComponent = _step10.value;

              if (tempComponent != null) {
                var tempComponentId = tempComponent.id;
                /*
                 * get the connected components that this component is
                 * listening for
                 */
                var connectedComponents = tempComponent.connectedComponents;
                if (connectedComponents != null) {
                  var _iteratorNormalCompletion11 = true;
                  var _didIteratorError11 = false;
                  var _iteratorError11 = undefined;

                  try {
                    for (var _iterator11 = connectedComponents[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                      var connectedComponentParams = _step11.value;

                      if (connectedComponentParams != null) {
                        var nodeId = connectedComponentParams.nodeId;
                        var componentId = connectedComponentParams.componentId;

                        /*
                         * get the id which is the old field that we used to store
                         * the component id in. this is here to maintain backwards
                         * compatibility.
                         */
                        var id = connectedComponentParams.id;

                        if (nodeId != null && componentId != null) {
                          var connectedComponentId = componentId;
                          var connectedNodeId = nodeId;
                          if (connectedNodeId == this.nodeId && connectedComponentId === changedComponentId) {
                            var connectedComponent = this.getComponentById(connectedComponentId);
                            var componentScope = this.componentToScope[tempComponentId];
                            if (componentScope.handleConnectedComponentStudentDataChanged != null) {
                              componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                            }
                          }
                        } else if (componentId != null) {
                          /*
                           * the node id was not provided but the component id was provided
                           * so we will assume the component id is in the current node
                           */
                          var _connectedComponentId = componentId;
                          if (_connectedComponentId === changedComponentId) {
                            var _connectedComponent = this.getComponentById(_connectedComponentId);
                            var _componentScope = this.componentToScope[tempComponentId];
                            if (_componentScope.handleConnectedComponentStudentDataChanged != null) {
                              _componentScope.handleConnectedComponentStudentDataChanged(_connectedComponent, connectedComponentParams, componentState);
                            }
                          }
                        } else if (id != null) {
                          /*
                           * the node id and component id were not provided but the
                           * id was provided which is the old field we used to set
                           * the component id in. this is here to maintain backwards
                           * compatibility.
                           */
                          var _connectedComponentId2 = id;
                          if (_connectedComponentId2 === changedComponentId) {
                            var _connectedComponent2 = this.getComponentById(_connectedComponentId2);
                            var _componentScope2 = this.componentToScope[tempComponentId];
                            if (_componentScope2.handleConnectedComponentStudentDataChanged != null) {
                              _componentScope2.handleConnectedComponentStudentDataChanged(_connectedComponent2, connectedComponentParams, componentState);
                            }
                          }
                        }
                      }
                    }
                  } catch (err) {
                    _didIteratorError11 = true;
                    _iteratorError11 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                      }
                    } finally {
                      if (_didIteratorError11) {
                        throw _iteratorError11;
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }
        }
      }
    }
  }, {
    key: 'getComponentStateByComponentId',


    /**
     * Get the student data for a specific part
     * @param the componentId
     * @return the student data for the given component
     */
    value: function getComponentStateByComponentId(componentId) {
      var componentState = null;
      if (componentId != null) {
        componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, componentId);
      }
      return componentState;
    }
  }, {
    key: 'getComponentStateByNodeIdAndComponentId',


    /**
     * Get the student data for a specific part
     * @param the nodeId
     * @param the componentId
     * @return the student data for the given component
     */
    value: function getComponentStateByNodeIdAndComponentId(nodeId, componentId) {
      var componentState = null;
      if (nodeId != null && componentId != null) {
        componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
      }
      return componentState;
    }
  }, {
    key: 'nodeUnloaded',
    value: function nodeUnloaded(nodeId) {
      hopscotch.endTour(this.rubricTour);
      var isAutoSave = true;
      this.createAndSaveComponentData(isAutoSave);
      var componentId = null;
      var componentType = null;
      var category = "Navigation";
      var event = "nodeExited";
      var eventData = {};
      eventData.nodeId = nodeId;
      this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
    }
  }, {
    key: 'getSubmitDirty',


    /**
     * Checks whether any of the node's components have unsubmitted work
     * @return boolean whether or not there is unsubmitted work
     */
    value: function getSubmitDirty() {
      var submitDirty = false;
      var components = this.getComponents();

      if (components != null) {
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = components[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var component = _step12.value;

            var componentId = component.id;
            var latestState = this.getComponentStateByComponentId(componentId);
            if (latestState && !latestState.isSubmit) {
              submitDirty = true;
              break;
            }
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }
      }
      return submitDirty;
    }
  }, {
    key: 'registerExitListener',


    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    value: function registerExitListener() {
      var _this5 = this;

      /**
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before exiting.
       */
      this.logOutListener = this.$scope.$on('exit', function (event, args) {

        // stop the auto save interval for this node
        _this5.stopAutoSaveInterval();

        /*
         * tell the parent that this node is done performing
         * everything it needs to do before exiting
         */
        _this5.nodeUnloaded(_this5.nodeId);

        // call this function to remove the listener
        _this5.logOutListener();

        /*
         * tell the session service that this listener is done
         * performing everything it needs to do before exiting
         */
        _this5.$rootScope.$broadcast('doneExiting');
      });
    }
  }]);

  return NodeController;
}();

NodeController.$inject = ['$compile', '$filter', '$q', '$rootScope', '$scope', '$state', '$timeout', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = NodeController;
//# sourceMappingURL=nodeController.js.map
