'use strict';

import ConfigureStructureController from '../configureStructureController';

class JigsawController extends ConfigureStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $rootScope, $state, $stateParams, $scope, UtilService);
    this.numGroups = '2';
  }

  injectGroup(numGroups) {
    if (numGroups === 2) {
      this.injectGroupsWithTwoGroups();
    } else if (numGroups === 3) {
      this.injectGroupsWithThreeGroups();
    } else if (numGroups === 4) {
      this.injectGroupsWithFourGroups();
    }
  }

  injectNodes(numGroups) {
    if (numGroups === 2) {
      this.injectNodesWithTwoGroups();
    } else if (numGroups === 3) {
      this.injectNodesWithThreeGroups();
    } else if (numGroups === 4) {
      this.injectNodesWithFourGroups();
    }
  }

  injectGroupsWithTwoGroups() {
    this.structure.group = {
      id: 'group2',
      type: 'group',
      title: 'Jigsaw',
      startId: 'node165',
      constraints: [],
      transitionLogic: {
        transitions: []
      },
      ids: ['node165', 'node114', 'node166', 'node249', 'node250', 'node251', 'node163']
    };
  }

  injectGroupsWithThreeGroups() {
    this.structure.group = {
      id: 'group1',
      type: 'group',
      title: 'Jigsaw Activity',
      startId: 'node1',
      ids: ['node1', 'node2', 'node3', 'node4', 'node5'],
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

  injectGroupsWithFourGroups() {
    this.structure.group = {
      id: 'group1',
      type: 'group',
      title: 'Jigsaw',
      startId: 'node1',
      ids: ['node1', 'node2', 'node3', 'node4', 'node5', 'node6'],
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

  injectNodesWithTwoGroups() {
    this.structure.nodes = [
      {
        components: [
          {
            id: 'nhbnnln5mm',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#085294">What do you want to explore?</font></h5><p><br></p><p style="font-size: medium;"><span style="font-size: 15px;">In this unit, we have explored/will explore...</span><br></p><p>Choose the topic/question you want to investigate.</p><p><br></p><p style="font-size: medium;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">C</span><span style="color: rgb(255, 0, 0);">ustomize this introductory content based on the topics and goals of your WISE unit. Outline and provide a brief description the topics students can choose from for the Jigsaw activity.</span></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">Then edit the text for the topics in the multiple choice component below.</span></li><li style="font-size: medium;"><font color="#ff0000">NOTE:&nbsp;<b>Do not add or remove</b>&nbsp;any of the pre-populated choices, as this will break the branching logic that is built into the lesson. You only need to edit the \'Choice text\' to reflect the topics you want students to choose. If you would like to change the number of topics in the Jigsaw, let the WISE staff know and we can help.</font></li></ul><p style="font-size: medium;"><font color="#ff0000">----</font></p>',
            showAddToNotebookButton: true
          },
          {
            choiceType: 'radio',
            showAddToNotebookButton: true,
            showSubmitButton: true,
            showSaveButton: false,
            id: '0w3e2kgerw',
            type: 'MultipleChoice',
            choices: [
              {
                feedback: '',
                id: '4z4f8xiqsj',
                text: 'TEAM XXXX: [ADD topic #1 here]',
                isCorrect: false
              },
              {
                feedback: '',
                id: '2824d0tdlr',
                text: 'TEAM XXXX: [ADD topic #2 here]',
                isCorrect: false
              }
            ],
            prompt: '[Customize prompt] What topic do you want to explore?',
            showFeedback: false
          }
        ],
        transitionLogic: {
          whenToChoosePath: 'studentDataChanged',
          maxPathsVisitable: 1,
          howToChooseAmongAvailablePaths: 'random',
          canChangePath: false,
          transitions: [
            {
              to: 'node114',
              criteria: [
                {
                  name: 'choiceChosen',
                  params: {
                    nodeId: 'node165',
                    componentId: '0w3e2kgerw',
                    choiceIds: ['4z4f8xiqsj']
                  }
                }
              ]
            },
            {
              criteria: [
                {
                  name: 'choiceChosen',
                  params: {
                    nodeId: 'node165',
                    componentId: '0w3e2kgerw',
                    choiceIds: ['2824d0tdlr']
                  }
                }
              ],
              to: 'node249'
            }
          ]
        },
        showSubmitButton: false,
        showSaveButton: false,
        id: 'node165',
        title: 'Pick your topic',
        type: 'node',
        constraints: [],
        icons: {
          default: {
            type: 'img',
            imgSrc: 'wise5/themes/default/nodeIcons/ki-color-elicit.svg',
            imgAlt: 'KI elicit ideas'
          }
        }
      },
      {
        components: [
          {
            showAddToNotebookButton: true,
            showSubmitButton: false,
            showSaveButton: false,
            html:
              '<h5 style="text-align: center; "><font color="#085294">Go Team [Enter topic #1 here]</font>!</h5><p style="text-align: center; "><br></p><p style="text-align: center; ">Introductory content...</p><p style="font-size: medium;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul><li style="font-size: medium;"><font color="#ff0000">Replace text for topic #1&nbsp;</font><span style="color: rgb(255, 0, 0);">for this Jigsaw in the title for this step and in the text above</span><span style="color: rgb(255, 0, 0);">.</span></li><li style="font-size: medium;"><font color="#ff0000">Add any intro content here that outlines the topic and what resource(s) students will be investigating to learn about the topic.</font></li><li style="font-size: medium;"><font color="#ff0000">Select a resource for students to investigate using the Outside Resource component below.</font></li><li style="font-size: medium;"><font color="#ff0000">Customize the prompt for the Open Response component at the bottom of this step. Ask students to reflect on or summarize what they\'ve learned.&nbsp;</font></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">Delete this help text when you\'re finished.</span><font color="#ff0000"><br></font></li></ul><p style="font-size: medium;"><font color="#ff0000">----</font></p>',
            id: 'if7yrkajl3',
            type: 'HTML',
            prompt: ''
          },
          {
            id: 'vznhagylsn',
            type: 'OutsideURL',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            url: '',
            height: 600,
            showAddToNotebookButton: true
          },
          {
            showAddToNotebookButton: true,
            starterSentence: null,
            showSubmitButton: false,
            showSaveButton: false,
            id: '4t2qx4mwi6',
            type: 'OpenResponse',
            prompt:
              '[EDIT REFLECTION PROMPT HERE] What did you notice about...? What did you learn about...? Record at least two observations about...',
            isStudentAttachmentEnabled: false
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node166'
            }
          ]
        },
        showSubmitButton: false,
        showSaveButton: true,
        id: 'node114',
        title: 'Team [Enter topic #1 here]',
        type: 'node',
        constraints: [
          {
            id: 'node114Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node114',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node114'
                }
              }
            ]
          },
          {
            id: 'node114Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node114',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node114'
                }
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
        components: [
          {
            id: 'qh56u3lupz',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#085294">Discuss what you learned with Team [Enter Topic #1 here]</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;">Instructions for how to meet/share with other team members...</p><p style="font-size: medium;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul><li style="font-size: medium;"><font color="#ff0000">Replace text for topic #1&nbsp;</font><span style="color: rgb(255, 0, 0);">for this Jigsaw in the title for this step and in the text above</span><span style="color: rgb(255, 0, 0);">.</span></li><li style="font-size: medium;"><font color="#ff0000">For this step in the Jigsaw, you can choose to have students discuss what they learned in pairs or small groups in the classroom (offline) or in an online discussion.</font></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">If you would like to use the online discussion, we have added a Discussion component below that asks students to post what they\'ve learned and comment on their peer\'s ideas. Feel free to edit the \'Prompt\' text to better suit your needs.</span><font color="#ff0000"><br></font></li><li style="font-size: medium;"><font color="#ff0000">If you would like students to work offline, add instructions above that help facilitate that process. Then delete the Discussion component below.</font></li><li style="font-size: medium;"><font color="#ff0000">Customize the prompt for the Open Response component at the bottom of this step.<br></font></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">Delete this help text when you\'re finished.<br></span></li></ul><p style="font-size: medium;"><font color="#ff0000">----</font></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'e6zkfriesm',
            type: 'OpenResponse',
            prompt: 'Here is what you learned in the previous step:',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node114',
                componentId: '4t2qx4mwi6',
                type: 'showWork'
              }
            ]
          },
          {
            id: 't84sg6f05k',
            type: 'Discussion',
            prompt:
              "[Customize instructions] <p>Share what you've learned with the other members of Team [Enter topic #1 here].</p><p>Read the ideas from your teammates and comment on at least one.</p><p>When you're finished, answer the question at the bottom of the page.</p>",
            showSaveButton: false,
            showSubmitButton: false,
            isStudentAttachmentEnabled: true,
            gateClassmateResponses: true,
            showAddToNotebookButton: true
          },
          {
            id: 'hylmcrchzv',
            type: 'OpenResponse',
            prompt:
              "[Customize reflection prompt] After meeting with another team [OR] reviewing your teammates' ideas, how have your ideas about XXXX changed? Make sure you mention...",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node251'
            }
          ]
        },
        showSubmitButton: false,
        showSaveButton: true,
        id: 'node166',
        title: 'Discuss what you learned: [Enter topic #1 here]',
        type: 'node',
        constraints: [
          {
            id: 'node166Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node166',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node114'
                }
              }
            ]
          },
          {
            id: 'node166Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node166',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node114'
                }
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
        components: [
          {
            showAddToNotebookButton: true,
            showSubmitButton: false,
            showSaveButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#085294">Go Team [Enter topic #2 here]</font>!</h5><h5 style="text-align: center; "><p style="font-weight: 400; font-size: 15px;"><br></p><p style="font-weight: 400; font-size: 15px;">Introductory content...</p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="font-weight: 400; text-align: start; font-size: 15px;"><li style="font-size: medium;"><font color="#ff0000">Replace text for topic #2&nbsp;</font><span style="color: rgb(255, 0, 0);">for this Jigsaw in the title for this step and in the text above</span><span style="color: rgb(255, 0, 0);">.</span></li><li style="font-size: medium;"><font color="#ff0000">Add any intro content here that outlines the topic and what resource(s) students will be investigating to learn about the topic.</font></li><li style="font-size: medium;"><font color="#ff0000">Select a resource for students to investigate using the Outside Resource component below.</font></li><li style="font-size: medium;"><font color="#ff0000">Customize the prompt for the Open Response component at the bottom of this step. Ask students to reflect on or summarize what they\'ve learned.&nbsp;</font></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">Delete this help text when you\'re finished.</span><font color="#ff0000"><br></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
            id: 'k208vvl7g6',
            type: 'HTML',
            prompt: ''
          },
          {
            id: '4gx3373z38',
            type: 'OutsideURL',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            url: '',
            height: 600,
            showAddToNotebookButton: true
          },
          {
            showAddToNotebookButton: true,
            starterSentence: null,
            showSubmitButton: false,
            showSaveButton: false,
            id: 'kd43661ip3',
            type: 'OpenResponse',
            prompt:
              '[EDIT REFLECTION PROMPT HERE] What did you notice about...? What did you learn about...? Record at least two observations about...',
            isStudentAttachmentEnabled: false
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node250'
            }
          ]
        },
        showSubmitButton: false,
        showSaveButton: true,
        id: 'node249',
        title: 'Team [Enter topic #2 here]',
        type: 'node',
        constraints: [
          {
            id: 'node249Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node249',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node249'
                }
              }
            ]
          },
          {
            id: 'node249Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node249',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node249'
                }
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
        components: [
          {
            id: 'euc2uab7br',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#085294">Discuss what you learned with Team [Enter Topic #2 here]</font></h5><h5 style="text-align: center;"><p style="font-weight: 400; font-size: 15px;"><br></p><p style="font-weight: 400; font-size: 15px;">Instructions for how to meet/share with other team members...</p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="font-weight: 400; text-align: start; font-size: 15px;"><li style="font-size: medium;"><font color="#ff0000">Replace text for topic #2&nbsp;</font><span style="color: rgb(255, 0, 0);">for this Jigsaw in the title for this step and in the text above</span><span style="color: rgb(255, 0, 0);">.</span></li><li style="font-size: medium;"><font color="#ff0000">For this step in the Jigsaw, you can choose to have students discuss what they learned in pairs or small groups in the classroom (offline) or in an online discussion.</font></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">If you would like to use the online discussion, we have added a Discussion component below that asks students to post what they\'ve learned and comment on their peer\'s ideas. Feel free to edit the \'Prompt\' text to better suit your needs.</span><font color="#ff0000"><br></font></li><li style="font-size: medium;"><font color="#ff0000">If you would like students to work offline, add instructions above that help facilitate that process. Then delete the Discussion component below.</font></li><li style="font-size: medium;"><font color="#ff0000">Customize the prompt for the Open Response component at the bottom of this step.<br></font></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">Delete this help text when you\'re finished.<br></span></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: '4ds7yjc84z',
            type: 'OpenResponse',
            prompt: 'Here is what you learned in the previous step:',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node114',
                componentId: '4t2qx4mwi6',
                type: 'showWork'
              }
            ]
          },
          {
            id: 'pf7msod64f',
            type: 'Discussion',
            prompt:
              "[Customize instructions] <p>Share what you've learned with the other members of Team XXXX.</p><p>Read the ideas from your teammates and comment on at least one.</p><p>When you're finished, answer the question at the bottom of the page.</p>",
            showSaveButton: false,
            showSubmitButton: false,
            isStudentAttachmentEnabled: true,
            gateClassmateResponses: true,
            showAddToNotebookButton: true
          },
          {
            id: 'c10pptolm8',
            type: 'OpenResponse',
            prompt:
              "[Customize reflection prompt] After meeting with another team [OR] reviewing your teammates' ideas, how have your ideas about XXXX changed? Make sure you mention...",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node251'
            }
          ]
        },
        showSubmitButton: false,
        showSaveButton: true,
        id: 'node250',
        title: 'Discuss what you learned: [Enter topic #2 here]',
        type: 'node',
        constraints: [
          {
            id: 'node250Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node250',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node249'
                }
              }
            ]
          },
          {
            id: 'node250Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node250',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node165',
                  toNodeId: 'node249'
                }
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
        id: 'node251',
        title: 'Share what you learned',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node163'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: [
          {
            id: 'eqhhrsfynt',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#085294">Share with another team!</font></h5><h5 style="text-align: center;"><p style="font-weight: 400; font-size: 15px;"><br></p><p style="font-size: 15px;">You will now get a chance to be an expert on your topic!</p><p style="font-weight: 400; font-size: 15px;">You will pair up with a [classmate/group] that investigated a different [topic/question]. Teach them what you learned about your topic and have them teach you about theirs.</p><p style="font-weight: 400; font-size: 15px;"><br></p><p style="font-weight: 400; font-size: 15px;">[Instructions for finding a group to pair up with...]</p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="font-weight: 400; text-align: start; font-size: 15px;"><li style="font-size: medium;"><font color="#ff0000">Customize the instructions above to help students pair up with a group that investigated a different topic in the Jigsaw. You will likely need to facilitate this process in your class.</font></li><li style="font-size: medium;"><font color="#ff0000">Feel free to add more specific instructions about the sharing and teaching process.</font></li><li style="font-size: medium;"><span style="color: rgb(255, 0, 0);">Delete this help text when you\'re finished.</span><br></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
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
        components: [
          {
            showAddToNotebookButton: true,
            starterSentence: 'I learned from the other team:\n1.\n2.',
            showSubmitButton: false,
            showSaveButton: false,
            id: 'blvba48xfw',
            type: 'OpenResponse',
            prompt:
              '[Customize reflection prompt] You had a chance to talk with a [classmate/group] who had learned about a different [topic/question]. Record two things you learned from talking with a [classmate/group] on the other team.',
            isStudentAttachmentEnabled: false
          },
          {
            id: 'd84m1j8aao',
            type: 'OpenResponse',
            prompt:
              '[Customize prompt] How does what you learned from the other team connect to the topic you investigated? Does it change or add to your understanding?',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          }
        ],
        transitionLogic: {
          transitions: []
        },
        showSubmitButton: false,
        showSaveButton: true,
        id: 'node163',
        title: 'What did you learn from your classmates?',
        type: 'node',
        constraints: [],
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

  injectNodesWithThreeGroups() {
    this.structure.nodes = [
      {
        id: 'node1',
        type: 'node',
        title: 'First Step (everyone)',
        components: [],
        constraints: [],
        showSaveButton: false,
        showSubmitButton: false,
        transitionLogic: {
          transitions: [
            {
              to: 'node2'
            },
            {
              to: 'node3'
            },
            {
              to: 'node4'
            }
          ],
          howToChooseAmongAvailablePaths: 'workgroupId',
          whenToChoosePath: 'enterNode',
          canChangePath: false,
          maxPathsVisitable: 1
        }
      },
      {
        id: 'node2',
        title: 'Group 1 Step 1',
        type: 'node',
        constraints: [
          {
            id: 'node2Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node2',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node2'
                }
              }
            ]
          },
          {
            id: 'node2Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node2',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node2'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node5'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node3',
        title: 'Group 2 Step 1',
        type: 'node',
        constraints: [
          {
            id: 'node3Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node3',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node3'
                }
              }
            ]
          },
          {
            id: 'node3Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node3',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node3'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node5'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node4',
        title: 'Group 3 Step 1',
        type: 'node',
        constraints: [
          {
            id: 'node4Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node4',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node4'
                }
              }
            ]
          },
          {
            id: 'node4Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node4',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node4'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node5'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node5',
        title: 'Synthesis Step (everyone)',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: []
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      }
    ];
  }

  injectNodesWithFourGroups() {
    this.structure.nodes = [
      {
        id: 'node1',
        type: 'node',
        title: 'First Step (everyone)',
        components: [],
        constraints: [],
        showSaveButton: false,
        showSubmitButton: false,
        transitionLogic: {
          transitions: [
            {
              to: 'node2'
            },
            {
              to: 'node3'
            },
            {
              to: 'node4'
            },
            {
              to: 'node5'
            }
          ],
          howToChooseAmongAvailablePaths: 'workgroupId',
          whenToChoosePath: 'enterNode',
          canChangePath: false,
          maxPathsVisitable: 1
        }
      },
      {
        id: 'node2',
        title: 'Group 1 Step 1',
        type: 'node',
        constraints: [
          {
            id: 'node2Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node2',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node2'
                }
              }
            ]
          },
          {
            id: 'node2Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node2',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node2'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node6'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node3',
        title: 'Group 2 Step 1',
        type: 'node',
        constraints: [
          {
            id: 'node3Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node3',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node3'
                }
              }
            ]
          },
          {
            id: 'node3Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node3',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node3'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node6'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node4',
        title: 'Group 3 Step 1',
        type: 'node',
        constraints: [
          {
            id: 'node4Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node4',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node4'
                }
              }
            ]
          },
          {
            id: 'node4Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node4',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node4'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node6'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node5',
        title: 'Group 4 Step 1',
        type: 'node',
        constraints: [
          {
            id: 'node5Constraint1',
            action: 'makeThisNodeNotVisible',
            targetId: 'node5',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node5'
                }
              }
            ]
          },
          {
            id: 'node5Constraint2',
            action: 'makeThisNodeNotVisitable',
            targetId: 'node5',
            removalConditional: 'all',
            removalCriteria: [
              {
                name: 'branchPathTaken',
                params: {
                  fromNodeId: 'node1',
                  toNodeId: 'node5'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node6'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node6',
        title: 'Synthesis Step (everyone)',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: []
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      }
    ];
  }

  injectGroupAndNodes(numGroups = 2) {
    this.injectGroup(numGroups);
    this.injectNodes(numGroups);
  }

  chooseLocation() {
    this.injectGroupAndNodes(parseInt(this.numGroups));
    this.$state.go('root.project.structure.location', { structure: this.structure });
  }
}

JigsawController.$inject = [
  '$filter',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'UtilService'
];

export default JigsawController;
