'use strict';

import ConfigureStructureController from '../configureStructureController';

class PeerReviewAndRevisionController extends ConfigureStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $rootScope, $state, $stateParams, $scope, UtilService);
  }

  injectGroup() {
    this.structure.group = {
      id: 'group4',
      type: 'group',
      title: 'Peer Review & Revision',
      startId: 'node1',
      constraints: [],
      transitionLogic: {
        transitions: []
      },
      ids: ['node1', 'node2', 'node3', 'node4']
    };
  }

  injectNodes() {
    this.structure.nodes = [
      {
        id: 'node1',
        title: 'Share your idea!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node2'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: '0wb2kz80nd',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#397b21">Explore and share!</font></h5><p style="text-align: center; "><br></p><p style="text-align: center; ">Instructions for exploring a resource (optional) and sharing an idea...</p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><span style="color: rgb(255, 0, 0); font-size: medium;">Customize the introductory text above to outline the peer review activity and what topic(s) you want students to share about.</span></li><li><font color="#ff0000" size="3">If you would like students to explore a resource to gather ideas, you can use the Outside Resource component below.&nbsp;Alternatively, you can add media (pictures, videos) or instructions for accessing the resource (or offline activity) to the introductory text above.</font></li><li><font color="#ff0000" size="3"><b>If you do not want to use the Outside Resource component, feel free to delete it from this step.</b></font></li><li><span style="color: rgb(255, 0, 0); font-size: medium;">Edit the prompt for the Open response component below to elicit students\' ideas about the topic you want them to discuss.</span><br></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the prompt to the Discussion component below to encourage students to share their ideas with the class.</span></font></li><li><font color="#ff0000" size="3"><b>NOTE: If you do not want to&nbsp;<b>use an online discussion</b>&nbsp;and prefer to conduct the peer review activities offline, feel free to delete the Discussion component from this step. Be sure the add instructions to facilitate&nbsp;<b>this step in the&nbsp;</b>review process in the introductory text above.</b></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></font></li></ul><p><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'c71ge8e5oe',
            type: 'OutsideURL',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            url: '',
            height: 400,
            showAddToNotebookButton: true
          },
          {
            id: 'e3hs8mdfnc',
            type: 'OpenResponse',
            prompt: '[Customize prompt] Based on what you have learned, explain XXXX...',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'yz52a2noo5',
            type: 'Discussion',
            prompt:
              '[Customize prompt] Copy your [answer/explanation] and share it with your classmates!',
            showSaveButton: false,
            showSubmitButton: false,
            isStudentAttachmentEnabled: false,
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
        id: 'node2',
        title: 'What are your peers thinking?',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node3'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: '12kw6bhqht',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#397b21">Explore your peers\' ideas!</font></h5><h5 style="text-align: center;"><p style="font-size: 15px; font-weight: 400;"><br></p><p style="font-size: 15px;"><span style="font-weight: 400;">You have shared your own idea, now </span>let\'s discover what your classmates are thinking<span style="font-weight: 400;">.</span></p><p style=""><span style="font-size: 15px; font-weight: 400;">Explore the [Idea Market/Discussion Forum] and </span><span style="font-size: 15px;">find at least one [idea/answer] that differs from your own<span style="font-weight: 400;">.</span></span><br></p><p style="font-weight: 400; text-align: start; font-size: medium;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-weight: 400; text-align: start; font-size: medium;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li style=""><span style="font-size: medium; font-weight: 400; color: rgb(255, 0, 0);">Customize the introductory text above.</span></li><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the prompt for the Open Response item below.</span></font></li><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the prompt to the discussion forum to match your terminology (\'Discussion\', \'Idea Market\', something else).</span></font></li><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">[The discussion shows the same discussion content from the previous step.]</span></font></li><li><font color="#ff0000" size="3"><b>NOTE: If you do not want to&nbsp;<b>use an online discussion</b>&nbsp;and prefer to conduct the peer review activities offline, feel free to delete the Discussion component from this step. Be sure the add instructions to facilitate&nbsp;<b>this step in the&nbsp;review process&nbsp;</b>in the introductory text above.</b></font></li><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></li></ul><p style="font-size: 15px; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: 'ktcho0acwm',
            type: 'OpenResponse',
            prompt: '[Customize prompt] Copy the answers/ideas you find and paste them here:',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'c5vreynyxt',
            type: 'Discussion',
            prompt: '[Customize prompt] Idea Market',
            showSaveButton: false,
            showSubmitButton: false,
            isStudentAttachmentEnabled: false,
            gateClassmateResponses: true,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node1',
                componentId: 'yz52a2noo5',
                type: 'showWork'
              }
            ]
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
        id: 'node3',
        title: 'Help your peers revise their ideas!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node4'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: '7aeuntchdp',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#397b21">Help your peers revise!</font></h5><h5 style="text-align: center;"><p style="font-size: 15px; font-weight: 400;"><br></p><p style="font-size: 15px;"><span style="font-weight: normal;">How are the ideas you discovered from your peers</span> different from your own?</p><p><span style="font-size: 15px; font-weight: 400;">Go back to the [Discussion Forum/Idea Market] and </span><span style="font-size: 15px;">add comments to your peers\' explanations</span><span style="font-size: 15px; font-weight: 400;">.</span><br></p><p style="font-weight: 400; text-align: start; font-size: medium;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-weight: 400; text-align: start; font-size: medium;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><span style="font-size: medium; font-weight: 400; color: rgb(255, 0, 0);">Customize the introductory text above.</span></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the Discussion prompt to encourage students to provide feedback to peers.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">[Students often decide to give rather general comments such as "I like your idea" or "this is a nice idea". In your prompt, you can help students engage in meaningful and helpful (constructive and critical) feedback.]</span></font></li><li><font color="#ff0000" size="3"><b>NOTE: If you do not want to use an online discussion and prefer to conduct the peer review activities offline, feel free to delete the Discussion component from this step. Be sure the add instructions to facilitate&nbsp;<b>this step in the&nbsp;</b>review process in the introductory text above.</b></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></li></ul><p style="font-size: 15px; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: 'ffcufhnsq3',
            type: 'OpenResponse',
            prompt: "[Customize prompt] As a reminder, here are the peers' ideas you copied:",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node2',
                componentId: 'ktcho0acwm',
                type: 'showWork'
              }
            ]
          },
          {
            id: 'uy562rafjo',
            type: 'Discussion',
            prompt:
              "[Customize prompt] Find your peers' answers and comment on them. Make sure to explain how your idea is different and help them learn how they can use your idea to improve their own answer.",
            showSaveButton: false,
            showSubmitButton: false,
            isStudentAttachmentEnabled: false,
            gateClassmateResponses: true,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node1',
                componentId: 'yz52a2noo5',
                type: 'importWork'
              }
            ]
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
        id: 'node4',
        title: 'Revise your own ideas',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: []
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'fg06kqezaz',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#397b21">Apply what you\'ve learned!</font></h5><h5 style="text-align: center;"><p style="font-size: 15px; font-weight: 400;"><br></p><p style=""><span style="font-size: 15px; font-weight: 400;">You have helped your peers to improve their [answers/explanations].</span><br></p><p><span style="font-size: 15px; font-weight: 400;">Now, find your own post in the [Idea Market/Discussion Forum] and </span><span style="font-size: 15px;">check out the comments you received</span><span style="font-size: 15px; font-weight: 400;">!</span></p><p><span style="font-size: 15px; font-weight: 400;">After reviewing the comments, </span><span style="font-size: 15px;">revise your own [answer/explanation]</span><span style="font-size: 15px; font-weight: 400;">&nbsp;in the box below.<br></span><br></p><p style="font-weight: 400; text-align: start; font-size: medium;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-weight: 400; text-align: start; font-size: medium;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><span style="font-size: medium; font-weight: 400; color: rgb(255, 0, 0);">Customize the introductory text above.</span></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the Open Response prompt below to encourage students to use the comments they got from their peers to revise their own explanation.</span></font><br></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the prompt to the discussion forum as you see fit.</span></font></li><li><font color="#ff0000" size="3"><b>NOTE: If you do not want to use an online discussion and prefer to conduct the peer review activities offline, feel free to delete the Discussion component from this step. Be sure the add instructions to facilitate this step in the review process in the introductory text above.</b></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></li></ul><p style="font-size: 15px; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: '4qkh6bxy0s',
            type: 'OpenResponse',
            prompt:
              "[Customize prompt] Use your peers' ideas to improve your own [answer/explanation]!",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node1',
                componentId: 'e3hs8mdfnc',
                type: 'importWork'
              }
            ]
          },
          {
            id: '7sr2yi5wr7',
            type: 'Discussion',
            prompt:
              '[Customize prompt] Find your post to see the comments you received from your peers.',
            showSaveButton: false,
            showSubmitButton: false,
            isStudentAttachmentEnabled: false,
            gateClassmateResponses: true,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node3',
                componentId: 'uy562rafjo',
                type: 'importWork'
              }
            ]
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

PeerReviewAndRevisionController.$inject = [
  '$filter',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'UtilService'
];

export default PeerReviewAndRevisionController;
