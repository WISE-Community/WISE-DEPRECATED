class CRaterService {
  constructor($http, ConfigService) {
    this.$http = $http;
    this.ConfigService = ConfigService;
  }

  /**
   * Make a CRater request to score student data
   * @param cRaterItemType the CRater item type e.g. 'HENRY'
   * @param cRaterRequestType the CRater request type 'scoring' or 'verify'
   * @param cRaterResponseId a randomly generated id used to keep track
   * of the request
   * @param studentData the student data
   * @returns a promise that returns the result of the CRater request
   */
  makeCRaterRequest(cRaterItemType, cRaterItemId, cRaterRequestType,
      cRaterResponseId, studentData) {
    const httpParams = {};
    httpParams.method = 'GET';
    httpParams.url = this.ConfigService.getCRaterRequestURL();
    httpParams.params = {
      cRaterItemType: cRaterItemType,
      itemId: cRaterItemId,
      cRaterRequestType: cRaterRequestType,
      responseId: cRaterResponseId,
      studentData: studentData,
      wiseRunMode: 'preview'
    };

    // make the CRater request
    return this.$http(httpParams).then((response) => {
      return response;
    });
  }

  /**
   * Make a CRater request to score student data
   * @param cRaterItemType the CRater item type e.g. 'HENRY'
   * @param cRaterResponseId a randomly generated id used to keep track
   * of the request
   * @param studentData the student data
   * @returns a promise that returns the result of the CRater request
   */
  makeCRaterScoringRequest(cRaterItemType, cRaterItemId, studentData) {
    const cRaterRequestType = 'scoring';
    const cRaterResponseId = new Date().getTime();
    return this.makeCRaterRequest(cRaterItemType,
      cRaterItemId,
      cRaterRequestType,
      cRaterResponseId,
      studentData);
  }

  /**
   * Make a CRater request to verifythe item type and item id
   * @param cRaterItemType the CRater item type e.g. 'HENRY'
   * @param cRaterResponseId a randomly generated id used to keep track
   * of the request
   * @param studentData the student data
   * @returns a promise that returns the result of the CRater request
   */
  makeCRaterVerifyRequest(cRaterItemType, cRaterItemId, studentData) {
    const cRaterRequestType = 'verify';
    const cRaterResponseId = new Date().getTime();
    return this.makeCRaterRequest(cRaterItemType, cRaterItemId,
        cRaterRequestType, cRaterResponseId, studentData);
  }

  /**
   * Get the CRater item type from the component
   * @param component the component content
   */
  getCRaterItemType(component) {
    let cRaterItemType = null;
    if (component != null && component.cRater != null) {
      cRaterItemType = component.cRater.itemType;
    }
    return cRaterItemType;
  }

  /**
   * Get the CRater item id from the component
   * @param component the component content
   */
  getCRaterItemId(component) {
    let cRaterItemId = null;
    if (component != null && component.cRater != null) {
      cRaterItemId = component.cRater.itemId;
    }
    return cRaterItemId;
  }

  /**
   * Find when we should perform the CRater scoring
   * @param component the component content
   * @returns when to perform the CRater scoring e.g. 'submit', 'save', 'change', 'exit'
   */
  getCRaterScoreOn(component) {
    let scoreOn = null;
    if (component != null) {
      /*
       * CRater can be enabled in two ways
       * 1. the enableCRater field is true
       * 2. there is no enableCRater field but there is a cRater object (this is for legacy purposes)
       */
      if ((component.enableCRater && component.cRater != null) ||
        (!component.hasOwnProperty('enableCRater') && component.cRater != null)) {

        // get the score on value e.g. 'submit', 'save', 'change', or 'exit'
        scoreOn = component.cRater.scoreOn;
      }
    }
    return scoreOn;
  }

  /**
   * Check if CRater is enabled for this component
   * @param component the component content
   */
  isCRaterEnabled(component) {
    let result = false;
    if (component != null) {
      // get the item type and item id
      const cRaterItemType = this.getCRaterItemType(component);
      const cRaterItemId = this.getCRaterItemId(component);
      if (cRaterItemType != null && cRaterItemId != null) {
        result = true;
      }
    }
    return result;
  }

  /**
   * Check if the CRater is set to score on save
   * @param component the component content
   * @returns whether the CRater is set to score on save
   */
  isCRaterScoreOnSave(component) {
    let result = false;
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'save') {
        result = true;
      }
    }
    return result;
  }

  /**
   * Check if the CRater is set to score on submit
   * @param component the component content
   * @returns whether the CRater is set to score on submit
   */
  isCRaterScoreOnSubmit(component) {
    let result = false;
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'submit') {
        result = true;
      }
    }
    return result;
  }

  /**
   * Check if the CRater is set to score on change
   * @param component the component content
   * @returns whether the CRater is set to score on change
   */
  isCRaterScoreOnChange(component) {
    let result = false;
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'change') {
        result = true;
      }
    }
    return result;
  }

  /**
   * Check if the CRater is set to score on exit
   * @param component the component content
   * @returns whether the CRater is set to score on exit
   */
  isCRaterScoreOnExit(component) {
    let result = false;
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'exit') {
        result = true;
      }
    }
    return result;
  }

  /**
   * Get the CRater scoring rule by score
   * @param component the component content
   * @param score the score
   * @returns the scoring rule for the given score
   */
  getCRaterScoringRuleByScore(component, score) {
    let scoringRule = null;
    if (component != null && score != null) {
      const cRater = component.cRater;
      if (cRater != null) {
        const scoringRules = cRater.scoringRules;
        if (scoringRules != null) {
          // loop through all the scoring rules
          for (let tempScoringRule of scoringRules) {
            if (tempScoringRule != null) {
              if (tempScoringRule.score == score) {
                /*
                 * the score matches so we have found
                 * the scoring rule that we want
                 */
                scoringRule = tempScoringRule;
                break;
              }
            }
          }
        }
      }
    }
    return scoringRule;
  }

  /**
   * Get the feedback text for the given score
   * @param component the component content
   * @param score the score we want feedback for
   * @returns the feedback text for the given score
   */
  getCRaterFeedbackTextByScore(component, score) {
    let feedbackText = null;

    // get the scoring rule for the given score
    const scoringRule = this.getCRaterScoringRuleByScore(component, score);
    if (scoringRule != null) {
      // get the feedback text
      feedbackText = scoringRule.feedbackText;
    }
    return feedbackText;
  }

  /**
   * Get the feedback text for the given previous score and current score
   * @param component the component content
   * @param previousScore the score from the last submit
   * @param currentScore the score from the current submit
   * @returns the feedback text for the given previous score and current score
   */
  getMultipleAttemptCRaterFeedbackTextByScore(component, previousScore,
      currentScore) {
    let feedbackText = null;

    // get the scoring rule for the given score
    const scoringRule = this.getMultipleAttemptCRaterScoringRuleByScore(
        component, previousScore, currentScore);
    if (scoringRule != null) {
      // get the feedback text
      feedbackText = scoringRule.feedbackText;
    }
    return feedbackText;
  }

  /**
   * Get the multiple attempt CRater scoring rule by previous score and
   * current score
   * @param component the component content
   * @param previousScore the score from the last submit
   * @param currentScore the score from the current submit
   * @returns the scoring rule for the given previous score and current score
   */
  getMultipleAttemptCRaterScoringRuleByScore(component, previousScore,
      currentScore) {
    let scoringRule = null;
    if (component != null && previousScore != null && currentScore != null) {
      const cRater = component.cRater;
      if (cRater != null) {

        // get the multiple attempt scoring rules
        const multipleAttemptScoringRules = cRater.multipleAttemptScoringRules;

        if (multipleAttemptScoringRules != null) {

          // loop through all the multiple attempt scoring rules
          for (let multipleAttemptScoringRule of multipleAttemptScoringRules) {

            if (multipleAttemptScoringRule != null) {

              // get a multiple attempt scoring rule
              const scoreSequence = multipleAttemptScoringRule.scoreSequence;

              if (scoreSequence != null) {

                /*
                 * get the expected previous score and current score
                 * that will satisfy the rule
                 */
                const previousScoreMatch = scoreSequence[0];
                const currentScoreMatch = scoreSequence[1];

                if (previousScore.toString().match("[" + previousScoreMatch + "]") &&
                  currentScore.toString().match("[" + currentScoreMatch + "]")) {

                  /*
                   * the previous score and current score match the
                   * expected scores so we have found the rule we want
                   */
                  scoringRule = multipleAttemptScoringRule;
                  break;
                }
              }
            }
          }
        }
      }
    }
    return scoringRule;
  }
}

CRaterService.$inject = [
  '$http',
  'ConfigService'
];

export default CRaterService;
