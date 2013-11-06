TestData = {
   "maxFeedbackItems": "1",
   "correctFeedback": "<div> congratulations you did it! </div>\nNice work!",
   "minimumRequirementsFeedback": "<b>You</b> need to work more on your diagram to get feedback!",
   "enableNodeDescriptionEditing": false,
   "enableLinkDescriptionEditing": false,
   "enableLinkLabelEditing": false,
   "enableCustomRuleEvaluator": false,
   "customRuleEvaluator": "",
   "enableNodeLabelEditing": false,
   "maxSubmissionClicks": "15",
   "maxSubmissionFeedback": "Sorry, but you have submitted your diagram more than three times. Please continue working without feedback.\nYou need to blah blah blah.",
   "feedbackPanelHeight": 250,
   "feedbackPanelWidth": 500,
   "terminalRadius": "10",
   "nodeWidth": "80",
   "nodeHeight": "80",
   "backgroundImage": "https://dl.dropbox.com/u/73403/wiseimages/planty.jpg",
   "backgroundImageScaling": false,
   "enableNodeLabelDisplay": true,
   "rubricExpression": "\nscore(1);",
   "modules": [
      {
         "name": "Glucose",
         "icon": "http://dl.dropbox.com/u/73403/mysystem/images/egg-transp-70.png",
         "image": "assets/glucose.png",
         "xtype": "MySystemContainer",
         "etype": "source",
         "fields": {
            "efficiency": "1"
         },
         "uuid": "d9a00071-5f44-47b2-a6a9-d0b43a31101e"
      },
      {
         "name": "Sun",
         "icon": "http://dl.dropbox.com/u/73403/mysystem/images/pot.jpg",
         "image": "assets/sun.png",
         "xtype": "MySystemContainer",
         "etype": "source",
         "fields": {
            "efficiency": "1"
         },
         "uuid": "874cf450-0383-4872-8c6d-2592bb3a2291"
      },
      {
         "name": "Mitochondria",
         "icon": "http://dl.dropbox.com/u/73403/mysystem/images/water-70.png",
         "image": "assets/mitochondria.png",
         "xtype": "MySystemContainer",
         "etype": "source",
         "fields": {
            "efficiency": "1"
         },
         "uuid": "9b8744d5-ac29-47c1-be0d-cb3437a199b1"
      },
      {
         "xtype": "MySystemContainer",
         "etype": "source",
         "fields": {
            "efficiency": "1"
         },
         "image": "assets/chloroplast.png",
         "name": "Chloroplast",
         "uuid": "26a808e3-e3c0-4354-8e87-e8abf83c46cc"
      },
      {
         "uuid": "29b4b435-2a29-42ba-b44f-625c6f1d2da0",
         "name": "Plant"
      },
      {
         "uuid": "8f4a4e6f-9238-4f39-8b90-bda7d3709fc1",
         "name": "C02"
      },
      {
         "uuid": "e298e564-2bbb-4c17-b9e6-18699606a83a",
         "name": "H20"
      }
   ],
   "energy_types": [
      {
         "label": "Light Energy",
         "color": "#fdb900",
         "uuid": "5565ad8c-27fa-41e3-835e-b20b562b5ded"
      },
      {
         "uuid": "b3248d8f-5842-4af3-be23-64a120a78bae",
         "label": "Chemical Energy",
         "color": "#fdb900"
      },
      {
         "uuid": "172d17cf-6dd4-47fd-8209-b2133a5a70c1",
         "label": "Chemical Compound",
         "color": "#fdb900"
      }
   ],
   "minimum_requirements": [
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "node"
      }
   ],
   "old_unused_thing": "boo",
   "diagram_rules": [
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Sun",
         "category": "none",
         "name": "SunToChloroplast",
         "number": "0",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Chloroplast",
         "energyType": "Light Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Sun",
         "category": "none",
         "name": "SunToPlant",
         "number": "0",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Plant",
         "energyType": "Light Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Plant",
         "category": "IncorrectChemicalTransformation",
         "name": "Bad Choloplast",
         "not": false,
         "number": "0",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Chloroplast",
         "energyType": "Chemical Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Plant",
         "category": "IncorrectChemicalTransformation",
         "name": "Bad Glucose",
         "number": "o",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Glucose",
         "energyType": "Chemical Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Chloroplast",
         "category": "none",
         "name": "ChloroplastToGlucose",
         "number": "0",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Glucose",
         "energyType": "(Stored) Chemical energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Plant",
         "category": "none",
         "name": "PlantTransfer",
         "number": "0",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Chloroplast",
         "energyType": "Light Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Glucose",
         "category": "none",
         "name": "EnergyStorage",
         "number": "0",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Plant",
         "energyType": "Chemical Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "C02",
         "category": "CO2ToChloroplast",
         "name": "C02->CC->Chloroplast",
         "number": "0",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Chloroplast",
         "energyType": "Chemical Compound"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "C02",
         "category": "CO2ToChloroplast",
         "name": "C02->CE->Chloroplast",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Chloroplast",
         "energyType": "Chemical Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "H20",
         "category": "H2OToChloroplast",
         "name": "H20->CC->Chloroplast",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Chloroplast",
         "energyType": "Chemical Compound"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "H20",
         "category": "H2OToChloroplast",
         "name": "H20->CE->Chloroplast",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Chloroplast",
         "energyType": "Chemical Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "C02",
         "category": "CO2ToPlant",
         "name": "C02->CC->Plant",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Plant",
         "energyType": "Chemical Compound"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "C02",
         "category": "CO2ToPlant",
         "name": "C02->CE->Plant",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Plant",
         "energyType": "any"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "H20",
         "category": "H2OToPlant",
         "name": "H2O->CC->Plant",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Plant",
         "energyType": "Chemical Compound"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "H20",
         "category": "H2OToPlant",
         "name": "H2O->CE->Plant",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "Plant",
         "energyType": "Chemical Energy"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Plant",
         "name": "Plant->CC->Chloroplast",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "node",
         "energyType": "Chemical Compound",
         "category": "PlantToChloroplast"
      },
      {
         "javascriptExpression": "",
         "isJavascript": false,
         "comparison": "more than",
         "type": "Plant",
         "name": "Plant->CE->Chloroplast",
         "hasLink": true,
         "linkDirection": "-->",
         "otherNodeType": "node",
         "energyType": "Chemical Energy",
         "category": "PlantToChloroplast"
      }
   ],
   "rubric_categories": [
      {
         "name": "IncorrectChemicalTransformation"
      },
      {
         "name": "CO2ToChloroplast"
      },
      {
         "name": "H2OToChloroplast"
      },
      {
         "name": "CO2ToPlant"
      },
      {
         "name": "H2OToPlant"
      },
      {
         "name": "PlantToChloroplast"
      }
   ],
   "prompt": "<p>The prompt. Is this.</p>",
   "initialDiagramJson": "{\"MySystem.Link\":{},\"MySystem.Node\":{}}",
   "feedbackRules": "//Incorrect Transformation Feedback (note simplification from original)\nany_f( 'IncorrectChemicalTransformation',\n      \"Where does energy transformation happen during photosynthesis? \" +\n      \"Go back to the visualizations in Step 2.15 - 2.19 and \" + \n      \"use evidence from the visualizations to improve your diagram.\");\n\n//Transformation Feedback\nnone_f( all('SunToChloroplast', \n            'ChloroplastToGlucose'), \n        all('SunToPlant', \n            'PlantTransfer', \n            'ChloroplastToGlucose'), \n       \"How is energy transformed? \"+\n       \"Compare your response to what you learned from the visualizations in Step 2.15 - 2.19.\");\n\n//Transfer Feedback or Energy Storage\nnone_f('EnergyStorage', \n       \"Where does energy from glucose go? \"+\n       \"Use evidence from the visualization in Step 3.3 to refine the path of energy. \");\n\n//Matter Feedback\nnone_f( all('CO2ToChloroplast', 'H2OToChloroplast'), \n        all('CO2ToPlant', 'H2OToPlant', 'PlantToChloroplast'), \n       \"What other elements do plants need for photosynthesis? \"+\n       \"Compare your response to information in the visualizations in Step 2.15-2.19. \");\n"
};
