'use strict';

import ConfigureStructureController from '../configureStructureController';

class SelfDirectedInvestigationController extends ConfigureStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $rootScope, $state, $stateParams, $scope, UtilService);
  }

  injectGroup() {
    this.structure.group = {
      id: 'group1',
      type: 'group',
      title: 'Self-Directed Investigation',
      startId: 'node241',
      ids: ['node241', 'node242', 'node244', 'node247', 'node248'],
      transitionLogic: {
        transitions: []
      }
    };
  }

  injectNodes() {
    this.structure.nodes = [
      {
        id: 'node241',
        title: 'Initial Questions',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node242'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: [
          {
            id: '2gov8u68iy',
            type: 'OpenResponse',
            prompt:
              'Now that you have learned some new ideas about [Curriculum authors: INSERT TOPIC HERE], what are some questions that you still have that you would like to explore?',
            showSaveButton: true,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'v2cd200lmz',
            type: 'Discussion',
            prompt:
              'Copy and paste you question here to share with your class. <br>Read the other questions and make a comment on at least one.',
            showSaveButton: false,
            showSubmitButton: false,
            isStudentAttachmentEnabled: true,
            gateClassmateResponses: true,
            showAddToNotebookButton: true
          }
        ],
        icons: {
          default: {
            type: 'img',
            imgSrc: 'wise5/themes/default/nodeIcons/ki-color-elicit.svg',
            imgAlt: 'KI elicit ideas'
          }
        }
      },
      {
        id: 'node242',
        title: 'What makes a good research question?',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node244'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'edw8ds6q5f',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center; "><font color="#9c00ff">To help you get started on your own investigation, we need to think about what makes a good research question!</font></h5><p style="text-align: center;"><br></p><p>We want to choose a research question that <b>isn\'t too hard or too easy</b> to answer.&nbsp;</p><p><b><br></b></p><p><b>Here are some ways to identify a good research question:</b></p><ol><li>The answer is more detailed than yes or no.&nbsp;<br></li><li>Even though you don\'t know the answer, you\'ll have a hypothesis or an idea of what it could be.<br></li><li>You can think of some kinds of data or evidence that will help answer you question.<br></li><li>You can think of resources that have that data and evidence.<br></li></ol><p>Let\'s practice!<br></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'e2mr4txd85',
            type: 'OpenResponse',
            prompt:
              "Choose either your question or one of your classmate's questions. Copy and paste it here.",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'm3icbxu38i',
            type: 'MultipleChoice',
            prompt: 'Can your question be answered by "yes" or "no"?',
            showSaveButton: false,
            showSubmitButton: false,
            choiceType: 'radio',
            choices: [
              {
                id: '1pw5t24zfv',
                text: 'Yes',
                feedback:
                  'This question might not need research to answer it. Try thinking of a question that starts with "how" or "why". Write your question in the last blank.',
                isCorrect: false
              },
              {
                id: 'y8ln0z2huu',
                text: 'No',
                feedback: 'Great, this might be a question you can research.',
                isCorrect: false
              }
            ],
            showFeedback: true,
            showAddToNotebookButton: true
          },
          {
            id: '374hknjq27',
            type: 'MultipleChoice',
            prompt:
              "You shouldn't  know the answer to your question yet. Do you have a hypothesis or idea about what the answer to your question <i>might</i> be?",
            showSaveButton: false,
            showSubmitButton: false,
            choiceType: 'radio',
            choices: [
              {
                id: '0nha2zyem1',
                text: 'Yes',
                feedback: 'Great! Record your hypothesis in the next blank.',
                isCorrect: false
              },
              {
                id: 'h70f0vostr',
                text: 'No',
                feedback:
                  'This means your question needs to be more specific. Try to focus on just one question. Rewrite your question in the last blank.',
                isCorrect: false
              }
            ],
            showFeedback: true,
            showAddToNotebookButton: true
          },
          {
            id: 'bxdyikriih',
            type: 'OpenResponse',
            prompt: 'What is your hypothesis, or what could be a possible answer to your question?',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'p407ekucya',
            type: 'OpenResponse',
            prompt:
              'What kind of data or information would you need as evidence to answer your question?',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'p67jyur86p',
            type: 'OpenResponse',
            prompt:
              'What are some resources you could use to find evidence to learn more about your question?',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'hwlnu2yuwi',
            type: 'OpenResponse',
            prompt: 'Write your revised question here.',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: []
          }
        ],
        icons: {
          default: {
            type: 'img',
            imgSrc: 'wise5/themes/default/nodeIcons/ki-color-elicit.svg',
            imgAlt: 'KI elicit ideas'
          }
        }
      },
      {
        id: 'node244',
        title: 'Start Investigating!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node247'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'lqsbipreov',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center; "><font color="#9c00ff">Now that we know how to ask a good research question, let\'s begin exploring!</font></h5><p></p><p>You question could be:</p><ul><li>The question you worked on earlier</li>Another question from the discussion board<li>OR a new question</li></ul><p><font color="#ff0000">Just remember, if you have a good research question:</font></p><ol><li>The answer is more detailed than yes or no.&nbsp;<br></li><li>Even though you don\'t know the answer, you\'ll have a hypothesis or an idea of what it could be.<br></li><li>You can think of some kinds of data or evidence to answer you question.<br></li><li>You can think of resources that have that data and evidence.<br></li></ol>',
            showAddToNotebookButton: true
          },
          {
            id: 'mziyayfdww',
            type: 'OpenResponse',
            prompt:
              'Here is your research question from the previous exercise. Is this still what you want to investigate? If not, revise your question now.',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node242',
                componentId: 'hwlnu2yuwi',
                type: 'importWork'
              }
            ]
          },
          {
            id: '7r7v56v7nd',
            type: 'OpenResponse',
            prompt: 'What is your hypothesis, or what could be a possible answer to your question?',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'npkt4evfyn',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<p style="text-align: center; "><font color="#9c00ff"></font></p><h5 style="text-align: center; "><font color="#9c00ff">To understand more about your question, you need to collect evidence.</font></h5><p></p><p style="text-align: center;"><b><br></b></p><p><span style="font-size: 18px;">Here are some resources to get you started on your investigation. You may also use the internet to find your own!</span></p><p><b><br></b></p><p><font color="#ff0000">[<b>Curriculum authors:</b> Insert links to resources that you want to provide students in the lists below. Feel free to edit the resource types or categories as you see fit. If you have offline resources that you would like to include, feel free to add them as well along with instructions for how students can access them.</font></p><p><font color="#ff0000">You can also use the WISE Outside Resource component (which includes a library of open educational resources)</font><span style="color: rgb(255, 0, 0);">. To access, press the "Add New Component" button (+) at the top of step and choose "Outside Resource".]</span></p><p><span style="color: rgb(255, 0, 0);"><br></span></p><p>Website Resources:</p><ol><li>[Insert link]</li><li>[Insert link]</li><li>...</li></ol><p><br></p><p>Video Resources:</p><ol><li>[Insert link]</li><li>[Insert link]</li><li>...</li></ol>',
            showAddToNotebookButton: true
          },
          {
            id: '4vlw3pfgfl',
            type: 'Table',
            prompt:
              'List the evidence you collect, the source you found it from, and a statement about how much you trust or believe in the evidence and why in the table below.',
            showSaveButton: false,
            showSubmitButton: false,
            globalCellSize: 10,
            numRows: 6,
            numColumns: 3,
            tableData: [
              [
                {
                  text: 'Evidence: What did you learn about your question?',
                  editable: false,
                  size: 50
                },
                {
                  text: 'Source: Where did you find this evidence?',
                  editable: false,
                  size: 50
                },
                {
                  text: 'Reliability: How much do you trust this source? WHY?',
                  editable: false,
                  size: 50
                }
              ],
              [
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                }
              ],
              [
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                }
              ],
              [
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                }
              ],
              [
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                }
              ],
              [
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                },
                {
                  text: '',
                  editable: true,
                  size: 50
                }
              ]
            ],
            showAddToNotebookButton: true
          },
          {
            id: '014hp3k1ol',
            type: 'OpenResponse',
            prompt:
              "Reflect on the evidence you've found: <br> 1. What claims and evidence were most convincing? Why? <br> 2. Did you find any evidence or claims that disagree with each other? Which do you agree with more and why? <br> 3.How does your evidence change your ideas about the answer to your question?",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          }
        ],
        icons: {
          default: {
            type: 'img',
            imgSrc: 'wise5/themes/default/nodeIcons/ki-color-add.svg',
            imgAlt: 'KI discover ideas'
          }
        }
      },
      {
        id: 'node247',
        title: 'What did you learn about Your Question?',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node248'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'y5msfwwdq4',
            type: 'OpenResponse',
            prompt: 'Here is the question you tried to answer:',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node244',
                componentId: 'mziyayfdww',
                type: 'showWork'
              }
            ]
          },
          {
            id: 'rht0apkb88',
            type: 'OpenResponse',
            prompt:
              'What did you learn about your question? Include claims based on the evidence you found that was most convincing.',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'n4lbims0wu',
            type: 'OpenResponse',
            prompt:
              "How are the ideas you learned about similar to and different from the ideas you've learned about in the rest of the unit?",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          }
        ],
        icons: {
          default: {
            type: 'img',
            imgSrc: 'wise5/themes/default/nodeIcons/ki-color-distinguish.svg',
            imgAlt: 'KI distinguish ideas'
          }
        }
      },
      {
        id: 'node248',
        title: 'Reflect and Connect',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: []
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'bdps0mglrv',
            type: 'OpenResponse',
            prompt:
              "Write a paragraph to explain to your classmates what you learned about your research question(s). Include information about what you learned, how it is similar or different from what you've learned in the WISE unit, and how you will use the new information. [Curriculum authors: feel free to edit this prompt to connect it more directly to the topics or goals of your WISE unit.]",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          }
        ],
        icons: {
          default: {
            type: 'img',
            imgSrc: 'wise5/themes/default/nodeIcons/ki-color-connect.svg',
            imgAlt: 'KI connect ideas'
          }
        }
      }
    ];
  }
}

SelfDirectedInvestigationController.$inject = [
  '$filter',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'UtilService'
];

export default SelfDirectedInvestigationController;
