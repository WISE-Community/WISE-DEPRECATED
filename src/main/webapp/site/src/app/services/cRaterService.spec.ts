import { TestBed } from '@angular/core/testing';
import { CRaterService } from '../../../../wise5/services/cRaterService';
import { UpgradeModule } from '@angular/upgrade/static';
import { ConfigService } from '../../../../wise5/services/configService';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
let service: CRaterService;
let configService: ConfigService;
let http: HttpTestingController;

describe('CRaterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ConfigService, CRaterService]
    });
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    service = TestBed.get(CRaterService);
  });

  makeCRaterScoringRequest();
  getCRaterItemType();
  getCRaterItemId();
  getCRaterScoreOn();
  isCRaterEnabled();
  isCRaterScoreOnSave();
  isCRaterScoreOnSubmit();
  isCRaterScoreOnChange();
  getCRaterScoringRuleByScore();
  getCRaterFeedbackTextByScore();
  getMultipleAttemptCRaterFeedbackTextByScore();
  getMultipleAttemptCRaterScoringRuleByScore();
  makeCRaterVerifyRequest();
});

function makeCRaterScoringRequest() {
  describe('makeCRaterScoringRequest()', () => {
    it('should make a CRater scoring request', () => {
      spyOn(configService, 'getCRaterRequestURL').and.returnValue('/c-rater');
      const itemId = 'ColdBeverage1Sub';
      const responseId = 1;
      const studentData = 'Hello World.';
      service.makeCRaterScoringRequest(itemId, responseId, studentData);
      http.expectOne({
        url:
          `/c-rater/score?itemId=${itemId}&responseId=${responseId}` +
          `&studentData=${encodeURI(studentData)}`,
        method: 'GET'
      });
    });
  });
}

function getCRaterItemType() {
  describe('getCRaterItemType()', () => {
    it('should get the CRater item type', () => {
      const itemType = 'CRATER';
      const component = {
        cRater: {
          itemType: itemType
        }
      };
      expect(service.getCRaterItemType(component)).toEqual(itemType);
    });
  });
}

function getCRaterItemId() {
  describe('getCRaterItemId()', () => {
    it('should get the CRater Id', () => {
      const itemId = 'ColdBeverage1Sub';
      const component = {
        cRater: {
          itemId: itemId
        }
      };
      expect(service.getCRaterItemId(component)).toEqual(itemId);
    });
  });
}

function getCRaterScoreOn() {
  describe('getCRaterScoreOn()', () => {
    it('should get the CRater score on submit', () => {
      const scoreOn = 'submit';
      const component = {
        enableCRater: true,
        cRater: {
          scoreOn: scoreOn
        }
      };
      expect(service.getCRaterScoreOn(component)).toEqual(scoreOn);
    });

    it('should get the CRater score on save', () => {
      const component = createScoreOnComponent('save');
      expect(service.getCRaterScoreOn(component)).toEqual('save');
    });
  });
}

function isCRaterEnabled() {
  describe('isCRaterEnabled()', () => {
    it('should check if CRater is enabled', () => {
      const component = {
        enableCRater: true,
        cRater: {
          itemType: 'CRATER',
          itemId: 'ColdBeverage1Sub'
        }
      };
      expect(service.isCRaterEnabled(component)).toEqual(true);
      component.enableCRater = false;
      expect(service.isCRaterEnabled(component)).toEqual(false);
    });
  });
}

function isCRaterScoreOnSave() {
  describe('isCRaterScoreOnSave()', () => {
    it('should get is CRater score on save when true', () => {
      expectScoreOnSave('save', true);
    });

    it('should get is CRater score on save when false', () => {
      expectScoreOnSave('submit', false);
    });
  });
}

function expectScoreOnSave(scoreOn, expectedValue) {
  const component = createScoreOnComponent(scoreOn);
  expect(service.isCRaterScoreOnSave(component)).toEqual(expectedValue);
}

function isCRaterScoreOnSubmit() {
  describe('isCRaterScoreOnSubmit()', () => {
    it('should get is CRater score on submit when true', () => {
      expectScoreOnSubmit('submit', true);
    });

    it('should get is CRater score on submit when false', () => {
      expectScoreOnSubmit('save', false);
    });
  });
}

function expectScoreOnSubmit(scoreOn, expectedValue) {
  const component = createScoreOnComponent(scoreOn);
  expect(service.isCRaterScoreOnSubmit(component)).toEqual(expectedValue);
}

function createScoreOnComponent(scoreOn) {
  return {
    cRater: {
      scoreOn: scoreOn
    }
  };
}

function isCRaterScoreOnChange() {
  describe('isCRaterScoreOnChange()', () => {
    it('should get is CRater score on change when true', () => {
      expectScoreOnChange('change', true);
    });

    it('should get is CRater score on submit when false', () => {
      expectScoreOnChange('submit', false);
    });
  });
}

function expectScoreOnChange(scoreOn, expectedValue) {
  const component = createScoreOnComponent(scoreOn);
  expect(service.isCRaterScoreOnChange(component)).toEqual(expectedValue);
}

function createScoringRule(score, feedbackText) {
  return {
    score: score,
    feedbackText: feedbackText
  };
}

function getCRaterScoringRuleByScore() {
  describe('getCRaterScoringRuleByScore()', () => {
    const scoringRule1 = createScoringRule(1, 'You received a score of 1.');
    const scoringRule2 = createScoringRule(2, 'You received a score of 2.');
    const component = {
      cRater: {
        scoringRules: [scoringRule1, scoringRule2]
      }
    };
    it('should get CRater scoring rule by score 1', () => {
      expect(service.getCRaterScoringRuleByScore(component, 1)).toEqual(scoringRule1);
    });

    it('should get CRater scoring rule by score 2', () => {
      expect(service.getCRaterScoringRuleByScore(component, 2)).toEqual(scoringRule2);
    });
  });
}

function getCRaterFeedbackTextByScore() {
  describe('getCRaterFeedbackTextByScore()', () => {
    const feedbackText1 = 'You received a score of 1.';
    const feedbackText2 = 'You received a score of 2.';
    const scoringRule1 = createScoringRule(1, feedbackText1);
    const scoringRule2 = createScoringRule(2, feedbackText2);
    const component = {
      cRater: {
        scoringRules: [scoringRule1, scoringRule2]
      }
    };
    it('should get CRater feedback text by score 1', () => {
      expect(service.getCRaterFeedbackTextByScore(component, 1)).toEqual(feedbackText1);
    });

    it('should get CRater feedback text by score 2', () => {
      expect(service.getCRaterFeedbackTextByScore(component, 2)).toEqual(feedbackText2);
    });
  });
}

function getMultipleAttemptCRaterFeedbackTextByScore() {
  describe('getMultipleAttemptCRaterFeedbackTextByScore()', () => {
    const feedbackText1 = 'You improved a little.';
    const feedbackText2 = 'You got worse.';
    const component = {
      cRater: {
        multipleAttemptScoringRules: [
          {
            scoreSequence: [1, 2],
            feedbackText: feedbackText1
          },
          {
            scoreSequence: [2, 1],
            feedbackText: feedbackText2
          }
        ]
      }
    };

    it('should get multiple attempt CRater feedback text by score 1 then 2', () => {
      expect(service.getMultipleAttemptCRaterFeedbackTextByScore(component, 1, 2)).toEqual(
        feedbackText1
      );
    });

    it('should get multiple attempt CRater feedback text by score 2 then 1', () => {
      expect(service.getMultipleAttemptCRaterFeedbackTextByScore(component, 2, 1)).toEqual(
        feedbackText2
      );
    });
  });
}

function getMultipleAttemptCRaterScoringRuleByScore() {
  it('should get multiple attempt CRater scoring rule by specific score', () => {
    const multipleAttemptScoringRule1To2 = {
      scoreSequence: [1, 2],
      feedbackText: 'You improved a little.'
    };
    const multipleAttemptScoringRule2To1 = {
      scoreSequence: [2, 1],
      feedbackText: 'You got worse.'
    };
    const component = {
      cRater: {
        multipleAttemptScoringRules: [
          multipleAttemptScoringRule1To2,
          multipleAttemptScoringRule2To1
        ]
      }
    };
    expect(service.getMultipleAttemptCRaterScoringRuleByScore(component, 1, 2)).toEqual(
      multipleAttemptScoringRule1To2
    );
  });

  const multipleAttemptScoringRule1To45 = {
    scoreSequence: [1, '4-5'],
    feedbackText: 'You improved a lot.'
  };
  const multipleAttemptScoringRule1To345 = {
    scoreSequence: [1, '3,4,5'],
    feedbackText: 'You improved a lot.'
  };
  const multipleAttemptScoringRule2To1 = {
    scoreSequence: [2, 1],
    feedbackText: 'You got worse.'
  };
  const component = {
    cRater: {
      multipleAttemptScoringRules: []
    }
  };
  it('should get multiple attempt CRater scoring rule by score with range', () => {
    component.cRater.multipleAttemptScoringRules = [
      multipleAttemptScoringRule1To45,
      multipleAttemptScoringRule2To1
    ];
    expect(service.getMultipleAttemptCRaterScoringRuleByScore(component, 1, 5)).toEqual(
      multipleAttemptScoringRule1To45
    );
  });

  it('should get multiple attempt CRater scoring rule by score with comma separated values', () => {
    component.cRater.multipleAttemptScoringRules = [
      multipleAttemptScoringRule1To345,
      multipleAttemptScoringRule2To1
    ];
    expect(service.getMultipleAttemptCRaterScoringRuleByScore(component, 1, 4)).toEqual(
      multipleAttemptScoringRule1To345
    );
  });
}

function makeCRaterVerifyRequest() {
  describe('makeCRaterVerifyRequest()', () => {
    it('should make a CRater verify request', () => {
      spyOn(configService, 'getCRaterRequestURL').and.returnValue('/c-rater');
      const itemId = 'ColdBeverage1Sub';
      service.makeCRaterVerifyRequest(itemId);
      http.expectOne({
        url: `/c-rater/verify?itemId=${itemId}`,
        method: 'GET'
      });
    });
  });
}
