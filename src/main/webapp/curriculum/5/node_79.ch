{
   "assessmentItem": {
      "adaptive": false,
      "identifier": "Challenge",
      "interaction": {
         "attempts": {
            "navigateTo": "node_9.ht",
            "scores": {}
         },
         "choices": [
            {
               "feedback": "Incorrect. How many wheels go on one frame?",
               "fixed": true,
               "identifier": "pWQKQ8WJBG",
               "text": "1"
            },
            {
               "feedback": "Correct! Continue with the investigation",
               "fixed": true,
               "identifier": "Epx6OIcUMA",
               "text": "2"
            },
            {
               "feedback": "Incorrect. Do you have enough wheels to make 3 bicycles?",
               "fixed": true,
               "identifier": "hLHTkcvywz",
               "text": "3"
            },
            {
               "feedback": "Incorrect. Do you have enough materials to make 4 bicycles?",
               "fixed": true,
               "identifier": "egkh4FgNp2",
               "text": "4"
            }
         ],
         "hasInlineFeedback": true,
         "maxChoices": "1",
         "prompt": "<center><IMG SRC=\"assets/bicycleslimiting.png\" width=700><br>\nHow many COMPLETE bicycles can you make from 4 wheels and 3 frames?",
         "responseIdentifier": "Challenge",
         "shuffle": true
      },
      "responseDeclaration": {
         "correctResponse": [
            "Epx6OIcUMA"
         ],
         "identifier": "Challenge"
      },
      "timeDependent": false
   },
   "type": "Challenge",
   "excelExportStringTemplate": "Is Correct: {isCorrect}, Score: {score}, Answer: {response}"
}