{
   "assessmentItem": {
      "adaptive": false,
      "identifier": "MatchSequence",
      "interaction": {
         "choices": [
            {
               "identifier": "gapText_0",
               "matchMax": "1",
               "value": "less dense"
            },
            {
               "identifier": "gapText_1",
               "matchMax": "1",
               "value": "thicker"
            },
            {
               "identifier": "gapText_2",
               "matchMax": "1",
               "value": "more dense"
            },
            {
               "identifier": "gapText_3",
               "matchMax": "1",
               "value": "thinner"
            }
         ],
         "fields": [
            {
               "identifier": "gapMultiple_0",
               "name": "Continental Plates are...",
               "numberOfEntries": "0",
               "ordinal": "false"
            },
            {
               "identifier": "gapMultiple_1",
               "name": "Oceanic Plates are...",
               "numberOfEntries": "0",
               "ordinal": "false"
            }
         ],
         "hasInlineFeedback": true,
         "ordered": false,
         "prompt": "What are some differences between continental and oceanic plates? Match each description to the correct plate type.",
         "responseIdentifier": "MatchSequence",
         "shuffle": true,
         "attempts": {
            "navigateTo": "node_0.ht",
            "scores": {
               "1": 5,
               "2": 3,
               "3": 1
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
               "fieldIdentifier": "gapMultiple_0",
               "isCorrect": false,
               "isDefault": false,
               "order": "0"
            },
            {
               "choiceIdentifier": "gapText_2",
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
   "type": "MatchSequence"
}