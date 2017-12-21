'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnnotationService = function () {
  function AnnotationService($filter, $http, $q, $rootScope, ConfigService, ProjectService, UtilService) {
    _classCallCheck(this, AnnotationService);

    this.$filter = $filter;
    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.annotations = null;

    /*
     * A dummy annotation id that is used in preview mode when we simulate
     * saving of annotation.
     */
    this.dummyAnnotationId = 1;
  }

  /**
   * Get all the annotations
   */


  _createClass(AnnotationService, [{
    key: 'getAnnotations',
    value: function getAnnotations() {
      return this.annotations;
    }

    /**
     * Get the annotation with the specified id, or null if not found
     * @param annotationId
     */

  }, {
    key: 'getAnnotationById',
    value: function getAnnotationById(annotationId) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.annotations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var annotation = _step.value;

          if (annotation.id === annotationId) {
            return annotation;
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

      return null;
    }

    /**
     * Get the latest annotation with the given params
     * @param params an object containing the params to match
     * @returns the latest annotation that matches the params
     */

  }, {
    key: 'getLatestAnnotation',
    value: function getLatestAnnotation(params) {
      var annotation = null;

      if (params != null) {
        var nodeId = params.nodeId;
        var componentId = params.componentId;
        var fromWorkgroupId = params.fromWorkgroupId;
        var toWorkgroupId = params.toWorkgroupId;
        var type = params.type;

        var annotations = this.annotations;

        if (annotations != null) {
          for (var a = annotations.length - 1; a >= 0; a--) {
            var tempAnnotation = annotations[a];

            if (tempAnnotation != null) {
              var match = true;

              if (nodeId && tempAnnotation.nodeId !== nodeId) {
                match = false;
              }
              if (match && componentId && tempAnnotation.componentId !== componentId) {
                match = false;
              }
              if (match && fromWorkgroupId && tempAnnotation.fromWorkgroupId !== fromWorkgroupId) {
                match = false;
              }
              if (match && toWorkgroupId && tempAnnotation.toWorkgroupId !== toWorkgroupId) {
                match = false;
              }
              if (match && type) {
                if (type.constructor === Array) {
                  var _iteratorNormalCompletion2 = true;
                  var _didIteratorError2 = false;
                  var _iteratorError2 = undefined;

                  try {
                    for (var _iterator2 = type[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                      var thisType = _step2.value;

                      if (tempAnnotation.type !== thisType) {
                        match = false;
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
                } else {
                  if (tempAnnotation.type !== type) {
                    match = false;
                  }
                }
              }

              if (match) {
                annotation = tempAnnotation;
                break;
              }
            }
          }
        }
      }
      return annotation;
    }
  }, {
    key: 'createAnnotation',


    /**
     * Create an annotation object
     * @param annotationId the annotation id
     * @param runId the run id
     * @param periodId the period id
     * @param fromWorkgroupId the from workgroup id
     * @param toWorkgroupId the to workgroup id
     * @param nodeId the node id
     * @param componentId the component id
     * @param studentWorkId the student work id
     * @param annotationType the annotation type
     * @param data the data
     * @param clientSaveTime the client save time
     * @returns an annotation object
     */
    value: function createAnnotation(annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId, nodeId, componentId, studentWorkId, localNotebookItemId, notebookItemId, annotationType, data, clientSaveTime) {
      var annotation = {};
      annotation.id = annotationId;
      annotation.runId = runId;
      annotation.periodId = periodId;
      annotation.fromWorkgroupId = fromWorkgroupId;
      annotation.toWorkgroupId = toWorkgroupId;
      annotation.nodeId = nodeId;
      annotation.componentId = componentId;
      annotation.studentWorkId = studentWorkId;
      annotation.localNotebookItemId = localNotebookItemId;
      annotation.notebookItemId = notebookItemId;
      annotation.type = annotationType;
      annotation.data = data;
      annotation.clientSaveTime = clientSaveTime;
      return annotation;
    }
  }, {
    key: 'saveAnnotation',


    /**
     * Save the annotation to the server
     * @param annotation the annotation object
     * @returns a promise
     */
    value: function saveAnnotation(annotation) {
      if (annotation != null) {
        var annotations = [];
        annotations.push(annotation);
        if (annotations != null && annotations.length > 0) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = annotations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _annotation = _step3.value;

              if (_annotation != null) {
                _annotation.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved annotations.
                this.addOrUpdateAnnotation(_annotation);
              }
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
        } else {
          annotations = [];
        }

        if (this.ConfigService.isPreview()) {
          // if we're in preview, don't make any request to the server but pretend we did
          var savedAnnotationDataResponse = {
            annotations: annotations
          };
          var _annotation2 = this.saveToServerSuccess(savedAnnotationDataResponse);

          var deferred = this.$q.defer();
          deferred.resolve(_annotation2);
          return deferred.promise;
        } else {
          var params = {
            runId: this.ConfigService.getRunId(),
            workgroupId: this.ConfigService.getWorkgroupId(),
            annotations: angular.toJson(annotations)
          };

          var httpParams = {
            method: "POST",
            url: this.ConfigService.getConfigParam('teacherDataURL'),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param(params)
          };

          return this.$http(httpParams).then(angular.bind(this, function (result) {

            var localAnnotation = null;

            if (result != null && result.data != null) {
              var _savedAnnotationDataResponse = result.data;
              localAnnotation = this.saveToServerSuccess(_savedAnnotationDataResponse);
            }

            return localAnnotation;
          }));
        }
      }
    }
  }, {
    key: 'saveToServerSuccess',
    value: function saveToServerSuccess(savedAnnotationDataResponse) {
      var localAnnotation = null;
      if (savedAnnotationDataResponse != null) {
        var savedAnnotations = savedAnnotationDataResponse.annotations;
        var localAnnotations = this.annotations;
        if (savedAnnotations != null && localAnnotations != null) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = savedAnnotations[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var savedAnnotation = _step4.value;

              for (var y = localAnnotations.length - 1; y >= 0; y--) {
                localAnnotation = localAnnotations[y];

                if (localAnnotation.id != null && localAnnotation.id === savedAnnotation.id) {

                  // we have found the matching local annotation so we will update it
                  localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime;
                  //localAnnotation.requestToken = null; // requestToken is no longer needed.

                  this.$rootScope.$broadcast('annotationSavedToServer', { annotation: localAnnotation });
                  break;
                } else if (localAnnotation.requestToken != null && localAnnotation.requestToken === savedAnnotation.requestToken) {

                  // we have found the matching local annotation so we will update it
                  localAnnotation.id = savedAnnotation.id;
                  localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime;
                  localAnnotation.requestToken = null; // requestToken is no longer needed.

                  if (this.ConfigService.isPreview() && localAnnotation.id == null) {
                    /*
                     * we are in preview mode so we will set a dummy
                     * annotation id into the annotation
                     */
                    localAnnotation.id = this.dummyAnnotationId;
                    /*
                     * increment the dummy annotation id for the next
                     * annotation
                     */
                    this.dummyAnnotationId++;
                  }

                  this.$rootScope.$broadcast('annotationSavedToServer', { annotation: localAnnotation });
                  break;
                }
              }
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
      }
      return localAnnotation;
    }

    /**
     * Add or update the annotation to our local collection
     * @param annotation the annotation object
     */

  }, {
    key: 'addOrUpdateAnnotation',
    value: function addOrUpdateAnnotation(annotation) {
      if (annotation != null) {
        var updated = false;
        var annotations = this.annotations;
        if (annotations != null) {
          for (var a = annotations.length - 1; a >= 0; a--) {
            var tempAnnotation = annotations[a];
            if (tempAnnotation != null) {
              if (annotation.id == tempAnnotation.id && annotation.nodeId == tempAnnotation.nodeId && annotation.componentId == tempAnnotation.componentId && annotation.fromWorkgroupId == tempAnnotation.fromWorkgroupId && annotation.toWorkgroupId == tempAnnotation.toWorkgroupId && annotation.type == tempAnnotation.type && annotation.studentWorkId == tempAnnotation.studentWorkId && annotation.runId == tempAnnotation.runId && annotation.periodId == tempAnnotation.periodId) {

                // the annotation matches so we will update it
                tempAnnotation.data = annotation.data;
                tempAnnotation.clientSaveTime = annotation.clientSaveTime;
                tempAnnotation.serverSaveTime = annotation.serverSaveTime;
                updated = true;
              }
            }
          }
        }
        if (!updated) {
          // we did not find a match so we will add it
          annotations.push(annotation);
        }
      }
    }
  }, {
    key: 'setAnnotations',


    /**
     * Set the annotations
     * @param annotations the annotations aray
     */
    value: function setAnnotations(annotations) {
      this.annotations = annotations;
    }
  }, {
    key: 'getTotalScore',


    /**
     * Get the total score for a workgroup
     * @param annotations an array of annotations
     * @param workgroupId the workgroup id
     */
    value: function getTotalScore(annotations, workgroupId) {
      var totalScore = 0;
      var scoresFound = [];

      if (annotations != null && workgroupId != null) {
        for (var a = annotations.length - 1; a >= 0; a--) {
          var annotation = annotations[a];
          if (annotation != null && annotation.toWorkgroupId == workgroupId) {
            if (annotation.type === 'score' || annotation.type === "autoScore") {
              var nodeId = annotation.nodeId;
              var componentId = annotation.componentId;
              var data = annotation.data;
              if (this.ProjectService.isActive(nodeId, componentId)) {
                var scoreFound = nodeId + '-' + componentId;
                if (scoresFound.indexOf(scoreFound) == -1) {
                  if (data != null) {
                    var value = data.value;
                    if (!isNaN(value)) {
                      if (totalScore == null) {
                        totalScore = value;
                      } else {
                        totalScore += value;
                      }

                      /*
                       * remember that we have found a score for this component
                       * so that we don't double count it if the teacher scored
                       * the component more than once
                       */
                      scoresFound.push(scoreFound);
                    }
                  }
                }
              }
            }
          }
        }
      }
      return totalScore;
    }

    /**
     * Get the score for a workgroup for a node
     * @param workgroupId the workgroup id
     * @param nodeId the node id
     * @returns the score for a workgroup for a node
     */

  }, {
    key: 'getScore',
    value: function getScore(workgroupId, nodeId) {
      var score = null;

      /*
       * an array to keep track of the components that we have obtained a
       * score for. we do not want to double count components if the student
       * has received a score multiple times for a node from the teacher.
       */
      var scoresFound = [];
      var annotations = this.annotations;

      if (workgroupId != null && nodeId != null) {
        for (var a = annotations.length - 1; a >= 0; a--) {
          var annotation = annotations[a];
          if (annotation != null && annotation.toWorkgroupId == workgroupId) {
            if (annotation.type === 'score' || annotation.type === 'autoScore') {
              var tempNodeId = annotation.nodeId;
              if (nodeId == tempNodeId) {
                var componentId = annotation.componentId;
                var data = annotation.data;
                var scoreFound = tempNodeId + '-' + componentId;
                if (scoresFound.indexOf(scoreFound) == -1) {
                  if (data != null) {
                    var value = data.value;
                    if (!isNaN(value)) {
                      if (score == null) {
                        score = value;
                      } else {
                        score += value;
                      }

                      /*
                       * remember that we have found a score for this component
                       * so that we don't double count it if the teacher scored
                       * the component more than once
                       */
                      scoresFound.push(scoreFound);
                    }
                  }
                }
              }
            }
          }
        }
      }

      return score;
    }

    /**
     * Create an auto score annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto score annotation
     */

  }, {
    key: 'createAutoScoreAnnotation',
    value: function createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data) {
      var annotationId = null;
      var fromWorkgroupId = null;
      var studentWorkId = null;
      var localNotebookItemId = null;
      var notebookItemId = null;
      var annotationType = 'autoScore';
      var clientSaveTime = Date.parse(new Date());
      var annotation = this.createAnnotation(annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId, nodeId, componentId, studentWorkId, localNotebookItemId, notebookItemId, annotationType, data, clientSaveTime);
      return annotation;
    }

    /**
     * Create an auto comment annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto comment annotation
     */

  }, {
    key: 'createAutoCommentAnnotation',
    value: function createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data) {
      var annotationId = null;
      var fromWorkgroupId = null;
      var studentWorkId = null;
      var localNotebookItemId = null;
      var notebookItemId = null;
      var annotationType = 'autoComment';
      var clientSaveTime = Date.parse(new Date());
      var annotation = this.createAnnotation(annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId, nodeId, componentId, studentWorkId, localNotebookItemId, notebookItemId, annotationType, data, clientSaveTime);
      return annotation;
    }

    /**
     * Create an auto comment annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param fromWorkgroupId the teacher workgroup id
     * @param toWorkgroupId the student workgroup id
     * @param studentWorkId the component state id
     * @param data the annotation data
     * @returns the inappropriate flag annotation
     */

  }, {
    key: 'createInappropriateFlagAnnotation',
    value: function createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data) {
      var annotationId = null;
      var localNotebookItemId = null;
      var notebookItemId = null;
      var annotationType = 'inappropriateFlag';
      var clientSaveTime = Date.parse(new Date());
      var annotation = this.createAnnotation(annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId, nodeId, componentId, studentWorkId, localNotebookItemId, notebookItemId, annotationType, data, clientSaveTime);
      return annotation;
    }

    /**
     * Get the latest annotations for a given component (as an object)
     * @param nodeId the node id
     * @param componentId the component id
     * @param workgroupId the workgroup id
     * @param scoreType (optional) the type of score
     * e.g.
     * 'autoScore' for auto graded score
     * 'score' for teacher graded score
     * 'any' for auto graded score or teacher graded score
     * @param commentType (optional) the type of comment
     * e.g.
     * 'autoComment' for auto graded comment
     * 'comment' for teacher graded comment
     * 'any' for auto graded comment or teacher graded comment
     * @return object containing the component's latest score and comment annotations
     */

  }, {
    key: 'getLatestComponentAnnotations',
    value: function getLatestComponentAnnotations(nodeId, componentId, workgroupId, scoreType, commentType) {
      var latestScoreAnnotation = this.getLatestScoreAnnotation(nodeId, componentId, workgroupId, scoreType);
      var latestCommentAnnotation = this.getLatestCommentAnnotation(nodeId, componentId, workgroupId, commentType);

      return {
        'score': latestScoreAnnotation,
        'comment': latestCommentAnnotation
      };
    }
  }, {
    key: 'getLatestNotebookItemAnnotations',


    /**
     * Get the latest annotations for a given notebook item (as an object)
     * @param workgroupId the workgroup id that did the notebook
     * @param localNotebookItemId unique id for note and its revisions ["finalReport", "xyzabc", ...]
     */
    value: function getLatestNotebookItemAnnotations(workgroupId, localNotebookItemId) {
      var latestScoreAnnotation = null;
      var latestCommentAnnotation = null;
      latestScoreAnnotation = this.getLatestNotebookItemScoreAnnotation(workgroupId, localNotebookItemId);
      latestCommentAnnotation = this.getLatestNotebookItemCommentAnnotation(workgroupId, localNotebookItemId);

      return {
        'score': latestScoreAnnotation,
        'comment': latestCommentAnnotation
      };
    }
  }, {
    key: 'getLatestNotebookItemScoreAnnotation',


    /**
     * Get the latest score annotation for this workgroup and localNotebookItemId, or null if not found
     * @param workgroupId the workgroup id that did the notebook
     * @param localNotebookItemId unique id for note and its revisions ["finalReport", "xyzabc", ...]
     */
    value: function getLatestNotebookItemScoreAnnotation(workgroupId, localNotebookItemId) {
      var annotations = this.getAnnotations();
      for (var a = annotations.length - 1; a >= 0; a--) {
        var annotation = annotations[a];
        if (annotation != null && annotation.type === "score" && annotation.notebookItemId != null && annotation.localNotebookItemId === localNotebookItemId) {
          return annotation;
        }
      }
      return null;
    }

    /**
     * Get the latest comment annotation for this workgroup and localNotebookItemId, or null if not found
     * @param workgroupId the workgroup id that did the notebook
     * @param localNotebookItemId unique id for note and its revisions ["finalReport", "xyzabc", ...]
     */

  }, {
    key: 'getLatestNotebookItemCommentAnnotation',
    value: function getLatestNotebookItemCommentAnnotation(workgroupId, localNotebookItemId) {
      var annotations = this.getAnnotations();
      for (var a = annotations.length - 1; a >= 0; a--) {
        var annotation = annotations[a];
        if (annotation != null && annotation.type === "comment" && annotation.notebookItemId != null && annotation.localNotebookItemId === localNotebookItemId) {
          return annotation;
        }
      }
      return null;
    }

    /**
     * Get the latest score annotation
     * @param nodeId the node id
     * @param componentId the component id
     * @param workgroupId the workgroup id
     * @param scoreType (optional) the type of score
     * e.g.
     * 'autoScore' for auto graded score
     * 'score' for teacher graded score
     * 'any' for auto graded score or teacher graded score
     * @returns the latest score annotation
     */

  }, {
    key: 'getLatestScoreAnnotation',
    value: function getLatestScoreAnnotation(nodeId, componentId, workgroupId, scoreType) {
      var annotation = null;
      var annotations = this.getAnnotations();

      if (scoreType == null) {
        scoreType = 'any';
      }

      for (var a = annotations.length - 1; a >= 0; a--) {
        var tempAnnotation = annotations[a];
        if (tempAnnotation != null) {
          var acceptAnnotation = false;
          var tempNodeId = tempAnnotation.nodeId;
          var tempComponentId = tempAnnotation.componentId;
          var tempToWorkgroupId = tempAnnotation.toWorkgroupId;
          var tempAnnotationType = tempAnnotation.type;

          if (nodeId == tempNodeId && componentId == tempComponentId && workgroupId == tempToWorkgroupId) {
            if (scoreType === 'any' && (tempAnnotationType === 'autoScore' || tempAnnotationType === 'score')) {
              acceptAnnotation = true;
            } else if (scoreType === 'autoScore' && tempAnnotationType === 'autoScore') {
              acceptAnnotation = true;
            } else if (scoreType === 'score' && tempAnnotationType === 'score') {
              acceptAnnotation = true;
            }

            if (acceptAnnotation) {
              annotation = tempAnnotation;
              break;
            }
          }
        }
      }
      return annotation;
    }

    /**
     * Get the latest comment annotation
     * @param nodeId the node id
     * @param componentId the component id
     * @param workgroupId the workgroup id
     * @param commentType (optional) the type of comment
     * e.g.
     * 'autoComment' for auto graded comment
     * 'comment' for teacher graded comment
     * 'any' for auto graded comment or teacher graded comment
     * @returns the latest comment annotation
     */

  }, {
    key: 'getLatestCommentAnnotation',
    value: function getLatestCommentAnnotation(nodeId, componentId, workgroupId, commentType) {
      var annotation = null;
      var annotations = this.getAnnotations();

      if (commentType == null) {
        commentType = 'any';
      }

      for (var a = annotations.length - 1; a >= 0; a--) {
        var tempAnnotation = annotations[a];
        if (tempAnnotation != null) {
          var acceptAnnotation = false;
          var tempNodeId = tempAnnotation.nodeId;
          var tempComponentId = tempAnnotation.componentId;
          var tempToWorkgroupId = tempAnnotation.toWorkgroupId;
          var tempAnnotationType = tempAnnotation.type;

          if (nodeId == tempNodeId && componentId == tempComponentId && workgroupId == tempToWorkgroupId) {
            if (commentType === 'any' && (tempAnnotationType === 'autoComment' || tempAnnotationType === 'comment')) {
              acceptAnnotation = true;
            } else if (commentType === 'autoComment' && tempAnnotationType === 'autoComment') {
              acceptAnnotation = true;
            } else if (commentType === 'comment' && tempAnnotationType === 'comment') {
              acceptAnnotation = true;
            }

            if (acceptAnnotation) {
              annotation = tempAnnotation;
              break;
            }
          }
        }
      }
      return annotation;
    }

    /**
     * Get the score value from the score annotation
     * @param scoreAnnotation a score annotation
     * @returns the score value e.g. 5
     */

  }, {
    key: 'getScoreValueFromScoreAnnotation',
    value: function getScoreValueFromScoreAnnotation(scoreAnnotation) {
      if (scoreAnnotation != null) {
        var data = scoreAnnotation.data;

        if (data != null) {
          return data.value;
        }
      }
      return null;
    }

    /**
     * Get all global annotations that are active and inactive for a specified node and component
     * @returns all global annotations that are active and inactive for a specified node and component
     */

  }, {
    key: 'getAllGlobalAnnotationsByNodeIdAndComponentId',
    value: function getAllGlobalAnnotationsByNodeIdAndComponentId(nodeId, componentId) {
      var allGlobalAnnotations = this.getAllGlobalAnnotations();
      var globalAnnotationsByNodeIdAndComponentId = allGlobalAnnotations.filter(function (globalAnnotation) {
        return globalAnnotation.nodeId === nodeId && globalAnnotation.componentId === componentId;
      });
      return globalAnnotationsByNodeIdAndComponentId;
    }
  }, {
    key: 'getAllGlobalAnnotations',


    /**
     * Get all global annotations that are active and inactive
     * @returns all global annotations that are active and inactive
     */
    value: function getAllGlobalAnnotations() {
      var globalAnnotations = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.annotations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var annotation = _step5.value;

          if (annotation != null && annotation.data != null) {
            if (annotation.data.isGlobal) {
              globalAnnotations.push(annotation);
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

      return globalAnnotations;
    }
  }, {
    key: 'getAllGlobalAnnotationGroups',


    /**
     * Get all global annotations that are active and inactive and groups them by annotation group name
     * @returns all global annotations that are active and inactive
     */
    value: function getAllGlobalAnnotationGroups() {
      var globalAnnotationGroups = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.annotations[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var annotation = _step6.value;

          if (annotation != null && annotation.data != null) {
            if (annotation.data.isGlobal) {
              // check if this global annotation can be grouped (has the same annotationGroupName as another that we've seen before)
              if (annotation.data.annotationGroupName != null && annotation.data.annotationGroupCreatedTime != null) {
                var sameGroupFound = false;
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                  for (var _iterator7 = globalAnnotationGroups[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var globalAnnotationGroup = _step7.value;

                    if (globalAnnotationGroup.annotationGroupNameAndTime == annotation.data.annotationGroupName + annotation.data.annotationGroupCreatedTime) {
                      // push this annotation to the end of the group
                      globalAnnotationGroup.annotations.push(annotation);
                      sameGroupFound = true;
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

                if (!sameGroupFound) {
                  var annotationGroup = {
                    "annotationGroupNameAndTime": annotation.data.annotationGroupName + annotation.data.annotationGroupCreatedTime,
                    "annotations": [annotation]
                  };
                  globalAnnotationGroups.push(annotationGroup);
                }
              } else {
                // each global annotation should have a name, so it shouldn't get here
                console.error(this.$translate('GLOBAL_ANNOTATION_DOES_NOT_HAVE_A_NAME') + annotation);
              }
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

      return globalAnnotationGroups;
    }
  }, {
    key: 'getActiveGlobalAnnotationGroups',


    /**
     * Get all global annotations that are active
     * @returns all global annotations that are active, in a group
     * [
     * {
       *   annotationGroupName:"score1",
       *   annotations:[
       *   {
       *     type:autoScore,
       *     value:1
       *   },
       *   {
       *     type:autoComment,
       *     value:"you received a score of 1."
       *   }
       *   ]
       * },
     * {
       *   annotationGroupName:"score2",
       *   annotations:[...]
       * }
     * ]
     */
    value: function getActiveGlobalAnnotationGroups() {
      return this.activeGlobalAnnotationGroups;
    }
  }, {
    key: 'calculateActiveGlobalAnnotationGroups',


    /**
     * Calculates the active global annotations and groups them by annotation group name
     */
    value: function calculateActiveGlobalAnnotationGroups() {
      this.activeGlobalAnnotationGroups = [];

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.annotations[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var annotation = _step8.value;

          if (annotation != null && annotation.data != null) {
            if (annotation.data.isGlobal && annotation.data.unGlobalizedTimestamp == null) {
              // check if this global annotation can be grouped (has the same annotationGroupName as another that we've seen before)
              if (annotation.data.annotationGroupName != null) {
                var sameGroupFound = false;
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                  for (var _iterator9 = this.activeGlobalAnnotationGroups[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var activeGlobalAnnotationGroup = _step9.value;

                    if (activeGlobalAnnotationGroup.annotationGroupName == annotation.data.annotationGroupName + '_' + annotation.data.annotationGroupCreatedTime) {
                      // push this annotation to the end of the group
                      activeGlobalAnnotationGroup.annotations.push(annotation);
                      sameGroupFound = true;
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

                if (!sameGroupFound) {
                  var annotationGroup = {
                    "annotationGroupName": annotation.data.annotationGroupName + '_' + annotation.data.annotationGroupCreatedTime,
                    "annotations": [annotation],
                    "nodeId": annotation.nodeId,
                    "componentId": annotation.componentId,
                    "serverSaveTime": annotation.serverSaveTime
                  };
                  this.activeGlobalAnnotationGroups.push(annotationGroup);
                }
              } else {
                // each global annotation should have a name, so it shouldn't get here
                console.error(his.$translate('GLOBAL_ANNOTATION_DOES_NOT_HAVE_A_NAME') + annotation);
              }
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
    }

    /**
     * Get all global annotations that are in-active
     * @returns all global annotations that are in-active
     * In-active global annotations has data.isGlobal = false and data.unGlobalizedTimestamp is set.
     */

  }, {
    key: 'getInActiveGlobalAnnotations',
    value: function getInActiveGlobalAnnotations() {
      var inActiveGlobalAnnotations = [];
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.annotations[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var annotation = _step10.value;

          if (annotation != null && annotation.data != null) {
            if (annotation.data.isGlobal && annotation.data.unGlobalizedTimestamp != null) {
              inActiveGlobalAnnotations.push(annotation);
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

      return inActiveGlobalAnnotations;
    }
  }, {
    key: 'getLatestTeacherScoreAnnotationByStudentWorkId',


    /**
     * Get the latest teacher score annotation for a student work id
     * @param studentWorkId the student work id
     * @return the latest teacher score annotation for the student work
     */
    value: function getLatestTeacherScoreAnnotationByStudentWorkId(studentWorkId) {
      return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'score');
    }

    /**
     * Get the latest teacher comment annotation for a student work id
     * @param studentWorkId the student work id
     * @return the latest teacher comment annotation for the student work
     */

  }, {
    key: 'getLatestTeacherCommentAnnotationByStudentWorkId',
    value: function getLatestTeacherCommentAnnotationByStudentWorkId(studentWorkId) {
      return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'comment');
    }

    /**
     * Get the latest auto score annotation for a student work id
     * @param studentWorkId the student work id
     * @return the latest auto score annotation for the student work
     */

  }, {
    key: 'getLatestAutoScoreAnnotationByStudentWorkId',
    value: function getLatestAutoScoreAnnotationByStudentWorkId(studentWorkId) {
      return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'autoScore');
    }

    /**
     * Get the latest auto comment annotation for a student work id
     * @param studentWorkId the student work id
     * @return the latest auto comment annotation for the student work
     */

  }, {
    key: 'getLatestAutoCommentAnnotationByStudentWorkId',
    value: function getLatestAutoCommentAnnotationByStudentWorkId(studentWorkId) {
      return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'autoComment');
    }

    /**
     * Get the latest annotation for the given student work and annotation type
     * @param studentWorkId the student work id
     * @param type the type of annotation
     * @return the latest annotation for the given student work and annotation type
     */

  }, {
    key: 'getLatestAnnotationByStudentWorkIdAndType',
    value: function getLatestAnnotationByStudentWorkIdAndType(studentWorkId, type) {
      for (var a = this.annotations.length - 1; a >= 0; a--) {
        var annotation = this.annotations[a];

        if (annotation != null) {
          if (studentWorkId == annotation.studentWorkId && type == annotation.type) {
            /*
             * we have found an annotation with the given student work
             * id and annotation type
             */
            return annotation;
          }
        }
      }
      return null;
    }

    /**
     * Get the annotations for the given student work
     * @param studentWorkId the student work id
     * @return array of annotations for the given student work
     */

  }, {
    key: 'getAnnotationsByStudentWorkId',
    value: function getAnnotationsByStudentWorkId(studentWorkId) {
      var annotations = [];
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = this.annotations[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var annotation = _step11.value;

          if (annotation && studentWorkId == annotation.studentWorkId) {
            annotations.push(annotation);
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

      return annotations;
    }
  }]);

  return AnnotationService;
}();

AnnotationService.$inject = ['$filter', '$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = AnnotationService;
//# sourceMappingURL=annotationService.js.map
