class CRaterService {
  constructor($http, ConfigService) {
    this.$http = $http;
    this.ConfigService = ConfigService;
  }

  /**
   * Make a CRater request to score student data
   * @param cRaterResponseId a randomly generated id used to keep track
   * of the request
   * @param studentData the student data
   * @returns a promise that returns the result of the CRater request
   */
  makeCRaterScoringRequest(cRaterItemId, cRaterResponseId, studentData) {
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getCRaterRequestURL() + '/score',
      params: {
        itemId: cRaterItemId,
        responseId: cRaterResponseId,
        studentData: studentData
      }
    };
    return this.$http(httpParams).then((response) => {
      return response;
    });
  }

  /**
   * Get the CRater item type from the component
   * @param component the component content
   */
  getCRaterItemType(component) {
    if (component != null && component.cRater != null) {
      return component.cRater.itemType;
    }
    return null;
  }

  /**
   * Get the CRater item id from the component
   * @param component the component content
   */
  getCRaterItemId(component) {
    if (component != null && component.cRater != null) {
      return component.cRater.itemId;
    }
    return null;
  }

  /**
   * Find when we should perform the CRater scoring
   * @param component the component content
   * @returns when to perform the CRater scoring e.g. 'submit', 'save', 'change', 'exit'
   */
  getCRaterScoreOn(component) {
    if (component != null) {
      /*
       * CRater can be enabled in two ways
       * 1. the enableCRater field is true
       * 2. there is no enableCRater field but there is a cRater object (this is for legacy purposes)
       */
      if ((component.enableCRater && component.cRater != null) ||
        (!component.hasOwnProperty('enableCRater') && component.cRater != null)) {

        // get the score on value e.g. 'submit', 'save', 'change', or 'exit'
        return component.cRater.scoreOn;
      }
    }
    return null;
  }

  /**
   * Check if CRater is enabled for this component
   * @param component the component content
   */
  isCRaterEnabled(component) {
    if (component != null) {
      // get the item type and item id
      const cRaterItemType = this.getCRaterItemType(component);
      const cRaterItemId = this.getCRaterItemId(component);
      if (cRaterItemType != null && cRaterItemId != null) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the CRater is set to score on save
   * @param component the component content
   * @returns whether the CRater is set to score on save
   */
  isCRaterScoreOnSave(component) {
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'save') {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the CRater is set to score on submit
   * @param component the component content
   * @returns whether the CRater is set to score on submit
   */
  isCRaterScoreOnSubmit(component) {
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'submit') {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the CRater is set to score on change
   * @param component the component content
   * @returns whether the CRater is set to score on change
   */
  isCRaterScoreOnChange(component) {
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'change') {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the CRater is set to score on exit
   * @param component the component content
   * @returns whether the CRater is set to score on exit
   */
  isCRaterScoreOnExit(component) {
    if (component != null) {
      // find when we should perform the CRater scoring
      const scoreOn = this.getCRaterScoreOn(component);
      if (scoreOn != null && scoreOn === 'exit') {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the CRater scoring rule by score
   * @param component the component content
   * @param score the score
   * @returns the scoring rule for the given score
   */
  getCRaterScoringRuleByScore(component, score) {
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
                return tempScoringRule;
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Get the feedback text for the given score
   * @param component the component content
   * @param score the score we want feedback for
   * @returns the feedback text for the given score
   */
  getCRaterFeedbackTextByScore(component, score) {
    const scoringRule = this.getCRaterScoringRuleByScore(component, score);
    if (scoringRule != null) {
      return scoringRule.feedbackText;
    }
    return null;
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
    const scoringRule = this.getMultipleAttemptCRaterScoringRuleByScore(
        component, previousScore, currentScore);
    if (scoringRule != null) {
      return scoringRule.feedbackText;
    }
    return null;
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
    if (component != null && previousScore != null && currentScore != null) {
      const cRater = component.cRater;
      if (cRater != null) {
        const multipleAttemptScoringRules = cRater.multipleAttemptScoringRules;
        if (multipleAttemptScoringRules != null) {
          for (let multipleAttemptScoringRule of multipleAttemptScoringRules) {
            if (multipleAttemptScoringRule != null) {
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
                  return multipleAttemptScoringRule;
                }
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if the item id is a valid CRater item id.
   * @param itemId A string.
   * @return A promise that returns whether the item id is valid.
   */
  makeCRaterVerifyRequest(itemId) {
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getCRaterRequestURL() + '/verify',
      params: {
        itemId: itemId
      }
    };
    return this.$http(httpParams).then((response) => {
      return response.data.isAvailable;
    });
  }
}

CRaterService.$inject = [
  '$http',
  'ConfigService'
];

export default CRaterService;
