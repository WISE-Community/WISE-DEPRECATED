'use strict';

import ConfigureStructureController from '../configureStructureController';

class GuidanceChoiceController extends ConfigureStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $rootScope, $state, $stateParams, $scope, UtilService);
  }

  injectGroup() {
    this.structure.group = {
      id: 'group1',
      type: 'group',
      title: 'Guidance Choice',
      startId: 'node1',
      ids: ['node1'],
      icons: {
        default: {
          color: '#2196F3',
          type: 'font',
          fontSet: 'material-icons',
          fontName: 'info'
        }
      },
      transitionLogic: {
        transitions: []
      }
    };
  }

  injectNodes() {
    this.structure.nodes = [
      {
        components: [
          {
            showAddToNotebookButton: true,
            showSubmitButton: false,
            showSaveButton: false,
            html:
              '<div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div><table class="table table-bordered"><tbody><tr><td><div style="color: rgb(0, 0, 0);"><b><span style="font-size: 18px;">Engineers work collaboratively to get new ideas for their design decisions.&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></b></div><div style="color: rgb(0, 0, 0);"><b style=""><span style="font-size: 18px;">So - it\'s time to consult your classmates and get some advice in return!&nbsp;</span><span style="font-size: 18px;">&nbsp;</span></b></div><div style="color: rgb(0, 0, 0);"><span style="background-color: rgb(255, 255, 0);"><br></span></div><div style="color: rgb(0, 0, 0);"><b style="background-color: rgb(239, 198, 49);">[IN THIS INITIAL SECTION OF THE STEP, TEACHERS SHOULD PUT IN A GUIDING PROMPT AS TO THE PURPOSE OF THE PEER REVIEW ACTIVITY. IN THIS CASE, IT IS IN THE CONTEXT OF ACTING AS A \'CONSULTANT\']</b></div><div style="color: rgb(0, 0, 0);"><div></div></div></td><td><p><img src="engineers_consult.png" aria-hidden="false" data-filename="engineers_consult.png" style="width: 319px;"><br></p></td></tr></tbody></table>',
            id: 'eenjpajqg3',
            type: 'HTML',
            prompt: ''
          },
          {
            showAddToNotebookButton: true,
            starterSentence: null,
            showSubmitButton: true,
            connectedComponents: [
              {
                componentId: 'xf08bpgtol',
                type: 'importWork',
                nodeId: 'node263'
              }
            ],
            showSaveButton: false,
            id: 'so4rplu8kw',
            type: 'OpenResponse',
            prompt:
              '<b><u style="background-color: rgb(255, 255, 0);">Step 1 - Revisit your previous explanation</u></b><br>Below is your previous answer to a question about what made your car slow down. <br>\nYou can edit your answer now if you want to.\n<BR>\n<BR>\n<u style="background-color: rgb(903, 196, 1);">[IN THIS FIRST STEP, TEACHERS SHOULD THINK ABOUT LINKING THE STUDENTS\' PREVIOUS EXPLANATION TO PRIME THEM AROUND A PARTICULAR CONCEPT OR SKILL THEY ARE FOCUSING ON FOR THE PEER REVIEW. IN THIS EXAMPLE, STUDENTS ARE REVISITING THEIR EXPLANATION OF HOW THEIR PHYSICAL SCOOTER MODEL SLOWED DOWN BECAUSE THE GOAL WAS TO DEVELOP ENGINEERING DESIGN SKILLS TO OPTIMIZE HOW FAR THEIR PHYSICAL SCOOTERS WOULD TRAVEL]',
            isStudentAttachmentEnabled: false
          },
          {
            showAddToNotebookButton: true,
            showSubmitButton: false,
            showSaveButton: false,
            html:
              '<p><b class="ng-scope" style="color: rgba(0, 0, 0, 0.87);"><u style="background-color: rgb(255, 255, 0);">Step 2 - Give advice</u></b><br class="ng-scope" style="color: rgba(0, 0, 0, 0.87);"><span class="ng-scope" style="color: rgba(0, 0, 0, 0.87);">Working with your closest neighboring group, discuss each group\'s scooters design and data:</span></p><p><span class="ng-scope" style="color: rgba(0, 0, 0, 0.87);">What were the strengths and weaknesses of the designs and how do you know that these are the strengths and weaknesses?</span></p><p><span class="ng-scope" style="color: rgba(0, 0, 0, 0.87);">After discussing your designs,&nbsp;</span><span class="ng-scope" style="color: rgba(0, 0, 0, 0.87);">suggest a solution to the problem(s) your partner group.</span></p><p><span class="ng-scope" style="color: rgba(0, 0, 0, 0.87);">To convince your peers, explain why your suggestion could work building on the scientific ideas you have learned.</span></p><p><span class="ng-scope" style="color: rgba(0, 0, 0, 0.87);"><br></span></p><p><span class="ng-scope" style=""><b style="background-color: rgb(239, 198, 49);">[IN THIS SECOND STEP STUDENTS ARE PEER REVIEWING OUTSIDE OF WISE, TEACHERS SHOULD USE THE ABOVE DIRECTIONS AND MODIFY THEM TO MEET THEIR NEEDS FOR THE PARTICULAR UNIT THEY ARE ADDING THIS STRATEGY INTO]</b><br></span></p>',
            id: 't7nxnl3h1b',
            type: 'HTML',
            prompt: ''
          },
          {
            showAddToNotebookButton: true,
            starterSentence: null,
            showSubmitButton: true,
            showSaveButton: false,
            id: 'he2susxavu',
            type: 'OpenResponse',
            prompt:
              'What suggestions did you give to the other group about changing their scooter?\n<BR>\n<BR>\n<u style="background-color: rgb(903, 196, 1);">[IN THIS STEP STUDENTS ARE RECORDING THE FEEDBACK THEY GAVE TO THEIR PARTNER GROUP, MODIFY AS NEEDED]',
            isStudentAttachmentEnabled: false
          },
          {
            showAddToNotebookButton: true,
            starterSentence: null,
            showSubmitButton: true,
            showSaveButton: false,
            id: 'h51gpncpdn',
            type: 'OpenResponse',
            prompt:
              '<b><u style="background-color: rgb(255, 255, 0);">Step 3 - Get advice</u></b><br>What suggestions did you get from the other groups about changing your scooter?\n<BR>\n<BR>\n<u style="background-color: rgb(903, 196, 1);">[IN THIS STEP STUDENTS ARE RECORDING THE FEEDBACK THEY RECEIVED FROM THEIR PARTNER GROUP, MODIFY AS NEEDED]',
            isStudentAttachmentEnabled: false
          }
        ],
        transitionLogic: {
          transitions: []
        },
        showSubmitButton: false,
        showSaveButton: false,
        id: 'node1',
        title: 'Guidance Choice Step',
        type: 'node',
        constraints: []
      }
    ];
  }
}

GuidanceChoiceController.$inject = [
  '$filter',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'UtilService'
];

export default GuidanceChoiceController;
