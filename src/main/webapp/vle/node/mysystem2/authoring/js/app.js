/*globals Ember, SCUtil, InitialMySystemData*/

var MSA = Ember.Application.create();
MSA.PositionControls = Ember.Mixin.create({
  moveItemUp: function(item) {
    var c = this.get('content');
    var i = c.indexOf(item);

    if (i > 0) {
      var itemBefore = this.objectAt(i-1);
      this.replaceContent(i-1, 2, [item, itemBefore]);
    }
  },

  moveItemDown: function(item) {
    var c = this.get('content');
    var i = c.indexOf(item);


    if (i < (c.length-1)) {
      var itemAfter = this.objectAt(i+1);
      this.replaceContent(i, 2, [itemAfter, item]);
    }
  }
});

MSA.setPreviewApp = function(mysystem) {
  mysystem.setAuthoringDataController(MSA.dataController);
  mysystem.reloadAuthoringData();
  mysystem.saveInitialDiagramAsSaveFunction();

  // set maximum update rate...
  var maxUpdateInterval = 1000;
  var lastUpdateTime    = 0;
  var timeOutJob        = null;
  var _update_function = function() {
    if(timeOutJob !== null) {
      window.clearTimeout(timeOutJob);
    }
    var _actualyUpdate = function() {
      var data = MSA.dataController.get('data');
      mysystem.updateRuntime(data);
    };
    timeOutJob = window.setTimeout(_actualyUpdate,maxUpdateInterval);
  };

  MSA.dataController.addObserver('data', MSA.dataController, _update_function);
  MSA.rubricCategoriesController.set('scoreFunction',mysystem.scoreDiagram);
};

MSA.setupParentIFrame = function(dataHash, updateObject, mysystem) {

  if (typeof dataHash === "undefined" || dataHash === null){
    dataHash = MSA.dataController.get('data');
  }

  // migration from old content format
  if (!dataHash.diagram_rules) {
    dataHash.diagram_rules = [];
  }
  if (!dataHash.rubric_categories) {
    dataHash.rubric_categories = [];
  }
  if (!dataHash.rubricExpression) {
    dataHash.rubricExpression = "score(1);";
  }
  if (!dataHash.feedbackRules) {
    dataHash.feedbackRules = "none_f(allIconsUsed(), 'you must use every icon in your diagram.');";
  }
  if (typeof dataHash.correctFeedback === "undefined" || dataHash.correctFeedback === null){
    dataHash.correctFeedback = "";
  }

  if (typeof dataHash.enableNodeLabelDisplay === "undefined" || dataHash.enableNodeLabelDisplay === null){
    dataHash.enableNodeLabelDisplay = true;
  }
  if (typeof dataHash.enableNodeLabelEditing === "undefined" || dataHash.enableNodeLabelEditing === null){
    dataHash.enableNodeLabelEditing = false;
  }
  if (typeof dataHash.enableNodeDescriptionEditing === "undefined" || dataHash.enableNodeDescriptionEditing === null){
    dataHash.enableNodeDescriptionEditing = false;
  }
  if (typeof dataHash.enableLinkDescriptionEditing === "undefined" || dataHash.enableLinkDescriptionEditing === null){
    dataHash.enableLinkDescriptionEditing = false;
  }
  if (typeof dataHash.enableLinkLabelEditing === "undefined" || dataHash.enableLinkLabelEditing === null){
    dataHash.enableLinkLabelEditing = false;
  }
  if (typeof dataHash.enableCustomRuleEvaluator === "undefined" || dataHash.enableCustomRuleEvaluator === null){
    dataHash.enableCustomRuleEvaluator = false;
  }
  if (typeof dataHash.customRuleEvaluator === "undefined" || dataHash.customRuleEvaluator === null){
    dataHash.customRuleEvaluator = "";
  }

  if (typeof dataHash.maxSubmissionClicks === "undefined" || dataHash.maxSubmissionClicks === null){
    dataHash.maxSubmissionClicks = 0;
  }
  if (typeof dataHash.maxSubmissionFeedback === "undefined" || dataHash.maxSubmissionFeedback === null){
    dataHash.maxSubmissionFeedback = "You have clicked 'submit' too many times. Please continue working without hints.";
  }
  if (typeof dataHash.feedbackPanelHeight === "undefined" || dataHash.feedbackPanelHeight === null){
    dataHash.feedbackPanelHeight = 250;
  }
  if (typeof dataHash.feedbackPanelWidth === "undefined" || dataHash.feedbackPanelWidth === null){
    dataHash.feedbackPanelWidth = 500;
  }
  if (typeof dataHash.terminalRadius === "undefined" || dataHash.terminalRadius === null){
    dataHash.terminalRadius = 14;
  }
  if (typeof dataHash.nodeWidth === "undefined" || dataHash.nodeWidth === null){
    dataHash.nodeWidth = 100;
  }
  if (typeof dataHash.nodeHeight === "undefined" || dataHash.nodeHeight === null){
    dataHash.nodeHeight = 110;
  }

  if (typeof dataHash.backgroundImage === "undefined" || dataHash.backgroundImage === null){
    dataHash.backgroundImage = null;
  }

  if (typeof dataHash.backgroundImageScaling === "undefined" || dataHash.backgroundImageScaling === null){
    dataHash.backgroundImageScaling = false;
  }

  // TODO: migrate objects to have uuids that don't already have them

  MSA.dataController.loadData(dataHash);
  if(mysystem) {
    MSA.setPreviewApp(mysystem);
  }
};



MSA.ActivityModel = SCUtil.ModelObject.extend({
  prompt: SCUtil.dataHashProperty,
  correctFeedback: SCUtil.dataHashProperty,
  maxFeedbackItems: SCUtil.dataHashProperty,
  enableNodeLabelDisplay: SCUtil.dataHashProperty,
  enableNodeLabelEditing: SCUtil.dataHashProperty,
  enableNodeDescriptionEditing: SCUtil.dataHashProperty,
  enableLinkDescriptionEditing: SCUtil.dataHashProperty,
  enableLinkLabelEditing: SCUtil.dataHashProperty,
  enableCustomRuleEvaluator: SCUtil.dataHashProperty,
  customRuleEvaluator: SCUtil.dataHashProperty,
  maxSubmissionClicks: SCUtil.dataHashProperty,
  maxSubmissionFeedback: SCUtil.dataHashProperty,
  feedbackPanelWidth: SCUtil.dataHashProperty,
  feedbackPanelHeight: SCUtil.dataHashProperty,
  terminalRadius: SCUtil.dataHashProperty,
  nodeWidth: SCUtil.dataHashProperty,
  nodeHeight: SCUtil.dataHashProperty,
  backgroundImage: SCUtil.dataHashProperty,
  backgroundImageScaling: SCUtil.dataHashProperty,
  rubricExpression: SCUtil.dataHashProperty,
  feedbackRules: SCUtil.dataHashProperty,
  initialDiagramJson: SCUtil.dataHashProperty
});

MSA.Module = SCUtil.ModelObject.extend( SCUtil.UUIDModel, {
  name: SCUtil.dataHashProperty,
  image: SCUtil.dataHashProperty,

  defaultDataHash: {
     "xtype": "MySystemContainer",
     "etype": "source",
     "fields": {
        "efficiency": "1"
     }
  }
});

MSA.EnergyType = SCUtil.ModelObject.extend( SCUtil.UUIDModel, {
  label: SCUtil.dataHashProperty,
  color: SCUtil.dataHashProperty
});

// it would be useful to support polymorphic
// so there are different types of rule
MSA.DiagramRule = SCUtil.ModelObject.extend({
  suggestion: SCUtil.dataHashProperty,
  name: SCUtil.dataHashProperty,
  category: SCUtil.dataHashProperty,
  comparison: SCUtil.dataHashProperty,
  number: SCUtil.dataHashProperty,
  type: SCUtil.dataHashProperty,
  hasLink: SCUtil.dataHashProperty,
  linkDirection: SCUtil.dataHashProperty,
  otherNodeType: SCUtil.dataHashProperty,
  energyType: SCUtil.dataHashProperty,
  javascriptExpression: SCUtil.dataHashProperty,
  isJavascript: SCUtil.dataHashProperty,
  not: SCUtil.dataHashProperty,
  defaultDataHash: {
     "javascriptExpression": "",
     "isJavascript": false
  },
  shouldOption: function(key, value) {
    if (value){
      this.set("not", value !== "should");
    }
    return this.get("not") ? "should not" : "should";
  }.property('not'),
  toggleHasLink: function(){
    this.set('hasLink', !this.get('hasLink'));
  }
});

MSA.RubricCategory = SCUtil.ModelObject.extend({
  name: SCUtil.dataHashProperty
});

MSA.RubricCategoriesController = SCUtil.ModelArray.extend(MSA.PositionControls, {
  modelType: MSA.RubricCategory,
  scoreFunction: null,

  showScore: function() {
    var scoreFunction = this.get('scoreFunction');
    if (scoreFunction) {
      scoreFunction();
    }
  }
});

MSA.RulesController = SCUtil.ModelArray.extend(MSA.PositionControls, {
  modelType: MSA.DiagramRule,

  nodesBinding: 'MSA.modulesController.content',

  nodeTypes: function (){
    return MSA.modulesController.mapProperty('name').insertAt(0, 'node');
  }.property('MSA.modulesController.@each.name').cacheable(),

  energyTypes: function() {
    return MSA.energyTypesController.mapProperty('label').insertAt(0, 'any');
  }.property('MSA.energyTypesController.[]', 'MSA.energyTypesController.@each.label').cacheable(),

  categories: function (){
    return MSA.rubricCategoriesController.mapProperty('name').insertAt(0, 'none');
  }.property('MSA.rubricCategoriesController.[]', 'MSA.rubricCategoriesController.@each.name').cacheable(),

  comparisons: ['more than', 'less than', 'exactly'],

  shouldOptions: ['should', 'should not'],

  linkDirections: ['-->', '<--', '---'],

});

MSA.rubricCategoriesController = MSA.RubricCategoriesController.create({});


MSA.ModuleController  = SCUtil.ModelArray.extend(MSA.PositionControls, {
  modelType: MSA.Module
});

MSA.modulesController = MSA.ModuleController.create();

MSA.EnergyTypesController = SCUtil.ModelArray.extend(MSA.PositionControls, {
  modelType: MSA.EnergyType
});
MSA.energyTypesController = MSA.EnergyTypesController.create();

MSA.diagramRulesController = MSA.RulesController.create({});


MSA.DataController = Ember.Object.extend({

  modulesBinding: 'MSA.modulesController.content',
  energyTypesBinding: 'MSA.energyTypesController.content',
  diagramRulesBinding: 'MSA.diagramRulesController.content',
  rubricCategoriesBinding: 'MSA.rubricCategoriesController.content',

  defaultDataHash: function() {
    var defaults = {
      "modules"                      : [],
      "energy_types"                 : [],
      "diagram_rules"                : [],
      "rubric_categories"            : [],
      "rubricExpression"             : "score(1);",
      "feedbackRules"                : "none_f(allIconsUsed(), 'you must use every icon in your diagram.');",
      "correctFeedback"              : "Your diagram has no obvious problems.",
      "maxFeedbackItems"             : 0,
      "enableNodeLabelDisplay"       : true,
      "enableNodeLabelEditing"       : false,
      "enableNodeDescriptionEditing" : false,
      "enableLinkDescriptionEditing" : false,
      "enableLinkLabelEditing"       : false,
      "enableCustomRuleEvaluator"    : false,
      "customRuleEvaluator"          : "",
      "maxSubmissionClicks"          : 0,
      "maxSubmissionFeedback"        :  "You have clicked 'submit' too many times. Please continue working without hints.",
      "feedbackPanelWidth"           : 500,
      "feedbackPanelHeight"          : 250,
      "terminalRadius"               : 14,
      "nodeHeight"                   : 110,
      "nodeWidth"                    : 110,
      "backgroundImage"              : null,
      "backgroundImageScaling"       : false,
      "initialDiagramJson"           : ""
    };

    if (top === self) {
      // TODO: (test this, is it still needed?)
      // we are not in iframe so load in some fake data
      defaults = InitialMySystemData;
    }
    return defaults;
  }.property().cacheable(),

  // update the dataHash we originated from.
  updateParentHash: function(data) {
    if (this.parentHash && typeof (this.parentHash === 'object')) {
      for (var attr in data) {
        if (data.hasOwnProperty(attr)){
          this.parentHash[attr] = data[attr];
        }
      }
    }
  },

  data: function() {
    var activity = this.get('activity');
    var data;
    if(Ember.isNone(activity)) {
      data = this.get('defaultDataHash');
    }
    else {
      data = activity.get('dataHash');
    }

    data.modules              = this.get('modules').mapProperty('dataHash');
    data.energy_types         = this.get('energyTypes').mapProperty('dataHash');
    data.diagram_rules        = this.get('diagramRules').mapProperty('dataHash');
    data.rubric_categories    = this.get('rubricCategories').mapProperty('dataHash');
    data.type = "mysystem2";
    this.updateParentHash(data);
    return data;
  }.property( 'activity.rev',
    'energyTypes.@each.rev',
    'modules.@each.rev',
    'diagramRules.@each.rev',
    'rubricCategories.@each.rev'
  ).cacheable(),

  dataJson: function() {
    return JSON.stringify(this.get('data'),null,2);
  }.property('data').cacheable(),


  saveInitialDiagramJson: function(initialDiagram) {
    this.setPath('activity.initialDiagramJson', initialDiagram);
  },

  loadData: function(dataHash) {
    var data = dataHash;
    this.parentHash = dataHash;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // old authored data hasn't specified this.
    // authoring interface incorrectly checks a box
    data.diagram_rules.forEach(function(rule) {
      if ((typeof rule.isJavascript === 'undefined')) {
        rule.isJavascript = false;
      }
    });

    MSA.modulesController.contentFromHashArray(data.modules);
    MSA.energyTypesController.contentFromHashArray(data.energy_types);
    MSA.diagramRulesController.contentFromHashArray(data.diagram_rules);
    MSA.rubricCategoriesController.contentFromHashArray(data.rubric_categories);

    var activity = MSA.ActivityModel.create();
    var item;
    for (item in data) {
      activity.set(item,data[item]);
    }
    this.set('activity',activity);
  }
});
MSA.dataController = MSA.DataController.create({});

MSA.NodeTypesView = Ember.CollectionView.extend({
  tagName: 'ul',
  contentBinding: "MSA.diagramRulesController.nodes"
});

// add missing textarea tag attributes
MSA.TextArea = Ember.TextArea.extend({
  attributeBindings: ['rows', 'cols', 'wrap'],
  // reasonable defaults?
  cols: 50,
  rows: 4,
  wrap: "off"
});

// add size, no live_update
MSA.TextField = Ember.View.extend({
  classNames: ['ember-text-field'],
  tagName: "input",
  attributeBindings: ['type', 'value', 'size', 'placeholder'],
  type: "text",
  value: "",
  size: null,

  // unlike Ember.TextSupport, we dont trigger
  // on key-up, paste, copy, &etc. Why?
  // because updated 20 or so lists of nodes (in the rules)
  // was causing CPU spin.
  init: function() {
    this._super();
    this.on("focusOut", this, this._elementValueDidChange);
    this.on("change", this, this._elementValueDidChange);
  },

  _elementValueDidChange: function() {
    Ember.set(this, 'value', this.$().val());
  }
});


MSA.editorController = Ember.Object.create({
  owner: null,
  editorWindow: null,
  value: '',
  callback: function() {},


  editCustomRule: function(owner,value,callback) {
    this.registerWindowCallbacks();
    this.save();// save the previous data back to whomever.
    this.set('owner',owner);
    this.set('value',value);
    this.set('callback',callback);

    var editorWindow = this.get('editorWindow');
    var features  = "menubar=false,location=false,titlebar=false,toolbar=false,resizable=yes,scrollbars=yes,status=false,width=750,height=650";

    // reuse existing window:
    if (editorWindow) {
      editorWindow.postMessage(JSON.stringify(value),"*");
      editorWindow.focus();
    }

    // or create a new one:
    else {
      editorWindow = window.open("codemirror.html", 'editorwindow', features);
      this.set('editorWindow', editorWindow);
      editorWindow.originParent = window;
    }

  },

  registerWindowCallbacks: function() {
    if(this.hasregisteredCallbacks) {
      return;
    }
    var self = this;

    var updateMessage = function(event) {
      var message = JSON.parse(event.data);
      var value = self.get('value');
      if (message.javascript) {
        value.code = message.javascript;
        self.set('value', value);
        self.save();
      }
      if (message.windowClosed) {
        self.set('editorWindow',null);
      }
      if (message.ready) {
        self.set('editorWindow', event.source);
        event.source.postMessage(JSON.stringify(self.get('value')), "*");
        event.source.focus();
      }
    }.bind(self);
    window.addEventListener("message", updateMessage, false);
    this.hasregisteredCallbacks = true;
  },

  save: function() {
    var value = this.get('value');
    var callback = this.get("callback");
    if (callback) {
      callback(value.code);
    }
    else {
      console.log("false callback defined");
    }
  }
});

MSA.promptController = Ember.Object.create({
  showPrompt: false
});

MSA.customRuleController = Ember.Object.create({
  helpDiv: '#evalHelp',
  editCustomRule: function() {
    var code = MSA.dataController.activity.get('customRuleEvaluator');
    var mode  = 'curomRule';
    var value = {'code': code, 'mode': mode};
    var callback = function(value) {
      MSA.dataController.activity.set('customRuleEvaluator',value);
    }.bind(this);
    MSA.editorController.editCustomRule(this,value,callback);
  }
});

MSA.rubricController = Ember.Object.create({
  helpDiv: '#evalHelp',
  editRubric: function() {
    var code  = MSA.dataController.activity.get('rubricExpression');
    var mode  = 'rubric';
    var value = {'code': code, 'mode': mode};
    var callback = function(value) {
      MSA.dataController.activity.set('rubricExpression',value);
    }.bind(this);
    MSA.editorController.editCustomRule(this,value,callback);
  }
});

MSA.feedbackRulesController = Ember.Object.create({
  helpDiv: '#evalHelp',
  editFeedback: function() {
    var code = MSA.dataController.activity.get('feedbackRules');
    var mode = "feedback";
    var value = {'code': code, 'mode': mode};
    var callback = function(value) {
      MSA.dataController.activity.set('feedbackRules',value);
    }.bind(this);
    MSA.editorController.editCustomRule(this,value,callback);
  }
});


MSA.NodeView = Ember.View.extend({
  templateName: 'node-template',
  remove: function() {
    MSA.modulesController.removeObject(this.get('node'));
    return true;
  },
  moveItemUp: function() {
    MSA.modulesController.moveItemUp(this.get('node'));
    return true;
  },
  moveItemDown: function() {
    MSA.modulesController.moveItemDown(this.get('node'));
    return true;
  }
});

MSA.LinkView = Ember.View.extend({
  templateName: 'link-template',
  remove: function() {
    MSA.energyTypesController.removeObject(this.get('link'));
    return true;
  }
});

MSA.CategoryView = Ember.View.extend({
  templateName: 'category-template',
  remove: function() {
    MSA.rubricCategoriesController.removeObject(this.get('category'));
    return true;
  }
});

MSA.RuleView = Ember.View.extend({
  templateName: 'rule-template',
  showName: true,
  ruleType: "Diagram Rule",
  javascriptExpressionBinding: "rule.javascriptExpression",

  remove: function() {
    MSA.diagramRulesController.removeObject(this.get('rule'));
  },
  moveItemUp: function() {
   MSA.diagramRulesController.moveItemUp(this.get('rule'));
  },
  moveItemDown: function() {
   MSA.diagramRulesController.moveItemDown(this.get('rule'));
  },
  toggleHasLink: function() {
    var rule   = this.get('rule');
    rule.toggleHasLink();
  },
  editorWindow: null,
  editJSRule: function() {
    var self = this;
    var code = this.get('javascriptExpression');
    var mode = 'JSRule';
    var value = {'code': code, 'mode': mode};
    var myCallback = function(newValue) {
      self.set('javascriptExpression',newValue);
    }.bind(this);
    MSA.editorController.editCustomRule(this, value, myCallback);
  }
});

MSA.RubricExpressionView = Ember.View.extend({
  templateName: 'rubricExpression-template',
  showScore: function() {
    MSA.rubricCategoriesController.showScore();
  },
  edit: function() {
    MSA.rubricController.editRubric();
  }
});

MSA.FeedbackRulesView = Ember.View.extend({
  templateName: 'feedbackRules-template',
  edit: function() {
    MSA.feedbackRulesController.editFeedback();
  }
});

MSA.PromptView = Ember.View.extend({
  templateName: 'prompt-template',
  isVisibleBinding: 'MSA.promptController.showPrompt'
});


