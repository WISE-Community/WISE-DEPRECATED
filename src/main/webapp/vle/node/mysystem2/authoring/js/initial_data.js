/*globals */

var InitialMySystemData = {
 "type": "mysystem2",
 "prompt": "How can you cook an egg?",
 "modules": [
    {
       "name": "burner_static",
       "icon": "http://dl.dropbox.com/u/73403/mysystem/images/burner-transp-70.png",
       "image": "http://dl.dropbox.com/u/73403/mysystem/images/burner-transp-70.png",
       "xtype": "MySystemContainer",
       "etype": "source",
       "fields": {
          "efficiency": "1"
       }
    },
    {
       "name": "egg",
       "icon": "http://dl.dropbox.com/u/73403/mysystem/images/egg-transp-70.png",
       "image": "http://dl.dropbox.com/u/73403/mysystem/images/egg-transp-70.png",
       "xtype": "MySystemContainer",
       "etype": "source",
       "fields": {
          "efficiency": "1"
       }
    },
    {
       "name": "pot",
       "icon": "http://dl.dropbox.com/u/73403/mysystem/images/pot.jpg",
       "image": "http://dl.dropbox.com/u/73403/mysystem/images/pot.jpg",
       "xtype": "MySystemContainer",
       "etype": "source",
       "fields": {
          "efficiency": "1"
       }
    },
    {
       "name": "water",
       "icon": "http://dl.dropbox.com/u/73403/mysystem/images/water-70.png",
       "image": "http://dl.dropbox.com/u/73403/mysystem/images/water-70.png",
       "xtype": "MySystemContainer",
       "etype": "source",
       "fields": {
          "efficiency": "1"
       }
    }
 ],
 "energy_types": [
    {
       "label": "heat_static",
       "color": "#E97F02"
    }
 ],
 "diagram_rules": [],
 "rubric_categories": [],
 "minimum_requirements": [],
 "correctFeedback": "Your diagram has no obvious problems.",
 "maxFeedbackItems": 0,
 "minimumRequirementsFeedback": "",
 "enableNodeDescriptionEditing": false,
 "enableLinkDescriptionEditing": false,
 "enableLinkLabelEditing": false,
 "enableCustomRuleEvaluator": false,
 "customRuleEvaluator": "",
 "feedbackPanelWidth": 500,
 "feedbackPanelHeight": 250,
 "rubricExpression": "score(1);"
};
