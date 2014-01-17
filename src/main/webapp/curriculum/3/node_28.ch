{
   "assessmentItem": {
      "adaptive": false,
      "identifier": "Challenge",
      "interaction": {
         "attempts": {
            "navigateTo": "node_42.html",
            "scores": {
               "1": 5,
               "2": 3,
               "3": 1
            }
         },
         "choices": [
            {
               "feedback": "Oops! Lots of earthquakes do happen at transform boundaries, but it's not the only place!",
               "fixed": true,
               "identifier": "6Bp6A8tf80",
               "text": "Only at transform boundaries."
            },
            {
               "feedback": "Oops! Earthquakes do happen at convergent boundaries, but it's not the only place!",
               "fixed": true,
               "identifier": "83QNG2UmAd",
               "text": "Only at convergent boundaries."
            },
            {
               "feedback": "Oops! Earthquakes do happen at divergent boundaries, but it's not the only place!",
               "fixed": true,
               "identifier": "ydgeWXXo52",
               "text": "Only at divergent boundaries."
            },
            {
               "feedback": "Good job! Earthquakes happen whenever there is tectonic activity.",
               "fixed": true,
               "identifier": "q3JdCSODBw",
               "text": "At all boundary types."
            }
         ],
         "hasInlineFeedback": true,
         "maxChoices": "1",
         "prompt": "Where do earthquakes happen?",
         "responseIdentifier": "Challenge",
         "shuffle": true
      },
      "responseDeclaration": {
         "correctResponse": [
            "q3JdCSODBw"
         ],
         "identifier": "Challenge"
      },
      "timeDependent": false
   },
   "type": "Challenge",
   "excelExportStringTemplate": "Is Correct: {isCorrect}, Score: {score}, Answer: {response}"
}