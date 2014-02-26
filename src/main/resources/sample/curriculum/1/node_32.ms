{
   "assessmentItem": {
      "adaptive": false,
      "identifier": "MatchSequence",
      "interaction": {
         "choices": [
            {
               "identifier": "gapText_0",
               "matchMax": "1",
               "value": "the molecules have less energy."
            },
            {
               "identifier": "gapText_1",
               "matchMax": "1",
               "value": "there are more molecules in the same area."
            },
            {
               "identifier": "gapText_2",
               "matchMax": "1",
               "value": "the molecules are more dense."
            },
            {
               "identifier": "gapText_4",
               "matchMax": "1",
               "value": "there are less molecules in the same area."
            },
            {
               "identifier": "gapText_5",
               "matchMax": "1",
               "value": "the molecules are less dense."
            },
            {
               "identifier": "gapText_3",
               "matchMax": "1",
               "value": "the molecules have more energy."
            }
         ],
         "fields": [
            {
               "identifier": "gapMultiple_0",
               "name": "Farthest from the heat source,",
               "numberOfEntries": "0",
               "ordinal": "false"
            },
            {
               "identifier": "gapMultiple_1",
               "name": "Closest to the heat source,",
               "numberOfEntries": "0",
               "ordinal": "false"
            }
         ],
         "hasInlineFeedback": true,
         "ordered": false,
         "prompt": "Look at the snapshots again. How are the molecules <u>closest</u> to the heat source and the molecules <u>farthest</u> from the heat source different?<br>\n<img src=\"assets/HeatDensity.png\"</img> ",
         "responseIdentifier": "MatchSequence",
         "shuffle": true,
         "attempts": {
            "navigateTo": "node_2.html",
            "scores": {
               "1": 10,
               "2": 5,
               "3": 3,
               "4": 1
            }
         }
      },
      "responseDeclaration": {
         "correctResponses": [
            {
               "choiceIdentifier": "gapText_0",
               "feedback": "Incorrect",
               "fieldIdentifier": "gapMultiple_1",
               "isCorrect": false,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_0",
               "feedback": "Correct.",
               "fieldIdentifier": "gapMultiple_0",
               "isCorrect": true,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_1",
               "feedback": "Incorrect",
               "fieldIdentifier": "gapMultiple_1",
               "isCorrect": false,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_1",
               "feedback": "Correct.",
               "fieldIdentifier": "gapMultiple_0",
               "isCorrect": true,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_2",
               "feedback": "Incorrect",
               "fieldIdentifier": "gapMultiple_1",
               "isCorrect": false,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_2",
               "feedback": "Correct.",
               "fieldIdentifier": "gapMultiple_0",
               "isCorrect": true,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_4",
               "feedback": "Incorrect",
               "fieldIdentifier": "gapMultiple_0",
               "isCorrect": false,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_4",
               "feedback": "Correct.",
               "fieldIdentifier": "gapMultiple_1",
               "isCorrect": true,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_5",
               "feedback": "Incorrect",
               "fieldIdentifier": "gapMultiple_0",
               "isCorrect": false,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_5",
               "feedback": "Correct.",
               "fieldIdentifier": "gapMultiple_1",
               "isCorrect": true,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_3",
               "feedback": "Incorrect",
               "fieldIdentifier": "gapMultiple_0",
               "isCorrect": false,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_3",
               "feedback": "Correct.",
               "fieldIdentifier": "gapMultiple_1",
               "isCorrect": true,
               "isDefault": false,
               "order": "0"
            }
         ],
         "identifier": "MatchSequence"
      },
      "timeDependent": false
   },
   "type": "MatchSequence",
   "showFeedback": true
}