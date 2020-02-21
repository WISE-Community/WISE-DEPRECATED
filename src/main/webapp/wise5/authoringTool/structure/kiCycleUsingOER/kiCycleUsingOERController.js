'use strict';

import ConfigureStructureController from '../configureStructureController';

class KICycleUSINGOERController extends ConfigureStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $rootScope, $state, $stateParams, $scope, UtilService);
  }

  injectGroup() {
    this.structure.group = {
      id: 'group3',
      type: 'group',
      title: 'KI Lesson with OER',
      startId: 'node28',
      constraints: [],
      transitionLogic: {
        transitions: []
      },
      ids: [
        'node28',
        'node12',
        'node13',
        'node14',
        'node17',
        'node20',
        'node21',
        'node22',
        'node23',
        'node24',
        'node27'
      ]
    };
  }

  injectNodes() {
    this.structure.nodes = [
      {
        id: 'node28',
        title: 'Instructions for Authors [DELETE ME]',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node12'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: [
          {
            id: 'miftk27320',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<p style="font-size: medium;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:&nbsp;</b></span><span style="color: rgb(255, 0, 0);">This lesson structure provides you with 1-3 steps per Knowledge Integration process from which you can choose:</span></p><p style="font-size: medium;"><font color="#ff0000">----</font></p><p><img ng-click="$emit(\'snipImage\', $event)" src="/curriculum/common_files/KI_OER.png" aria-hidden="false" alt="KI cycle and choices" style="width: 600px;"><span style="font-size: 18px;"><b><br></b></span></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><ul style="text-align: start;"><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">Choose the suggested steps you would like to include in this lesson and customize to your needs.</span></font></li><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">In your customization, </span>make sure you include at least 1 step for each of 4 KI processes<span style="font-weight: 400;">.</span></font><br></li><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">When you\'re finished, you can delete the steps that you do not want to include in this lesson.</span></font></li><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">You should also delete this step from the unit when you\'re done.<br></span></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
            showAddToNotebookButton: true
          }
        ],
        icons: {
          default: {
            color: '#2196F3',
            type: 'font',
            fontSet: 'material-icons',
            fontName: 'info'
          }
        }
      },
      {
        id: 'node12',
        title: "What's your prediction?",
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node13'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: '78idotbbrt',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Make a prediction: What will happen?</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;">Introduce the question you would like students to predict an answer for...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li style="font-size: medium;"><font color="#ff0000" style=""><span style="font-weight: 400;">This step gives you two options to choose from: 1) </span><span style="font-weight: normal;">a </span>multiple choice question with open response explanation<span style="font-weight: 400;">, and 2) a </span>prediction graph<span style="font-weight: 400;">.</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Choose the option you would like and then delete the components for the option you\'re not going to use.</span></font></font></li><li style=""><font color="#ff0000" style=""><font size="3"><span style="font-weight: 400;">Edit the introductory text above to outline the prediction activity or question you want students to engage in.</span></font></font></li><li style=""><font color="#ff0000" style=""><font size="3"><span style="font-weight: 400;">Then edit the prompt(s) and options for the component(s) below as you see fit.</span></font></font></li><li style="font-size: medium; font-weight: 400;"><span style="color: rgb(255, 0, 0);">Delete this help text when you\'re finished.</span><br></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: 'i5dt76nbxd',
            type: 'MultipleChoice',
            prompt: '[Customize prompt] What do you predict will happen when...?',
            showSaveButton: false,
            showSubmitButton: false,
            choiceType: 'radio',
            choices: [
              {
                id: 'isnnx18ryd',
                text: '[Edit choice] Riding a car will be faster than walking',
                feedback: '',
                isCorrect: false
              },
              {
                id: '6f66j4qjq8',
                text:
                  '[Edit choice] Riding a bike will be faster than walking but slower than riding a car',
                feedback: '',
                isCorrect: false
              },
              {
                id: 'vepenkijzn',
                text: '[Add more choices as needed]',
                feedback: '',
                isCorrect: false
              }
            ],
            showFeedback: true,
            showAddToNotebookButton: true
          },
          {
            id: 'jv2bn772yp',
            type: 'OpenResponse',
            prompt: '[Customize prompt] Explain your prediction! Why did you choose...?',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'jq25qn1ziv',
            type: 'Graph',
            prompt:
              '[Customize prompt] What will happen when...? Draw a graph to show your prediction!',
            showSaveButton: false,
            showSubmitButton: false,
            title: '[Enter graph title]',
            width: 600,
            height: 500,
            enableTrials: false,
            canCreateNewTrials: false,
            canDeleteTrials: false,
            hideAllTrialsOnNewTrial: false,
            canStudentHideSeriesOnLegendClick: false,
            roundValuesTo: 'integer',
            graphType: 'line',
            xAxis: {
              title: {
                text: '[Enter x-axis label]',
                useHTML: true
              },
              min: 0,
              max: 100,
              units: 's',
              locked: true,
              type: 'limits'
            },
            yAxis: {
              title: {
                text: '[Enter y-axis label]',
                useHTML: true
              },
              min: 0,
              max: 100,
              units: 'm',
              locked: true
            },
            series: [
              {
                name: 'Prediction',
                data: [],
                color: 'orange',
                dashStyle: 'Solid',
                marker: {
                  symbol: 'circle'
                },
                canEdit: true,
                type: 'line'
              }
            ],
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
        id: 'node13',
        title: "Let's brainstorm!",
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node14'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: [
          {
            id: 'ydlbj3e7i4',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">What do we know about...?</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;"><img src="/curriculum/common_files/Brainstorm.png" aria-hidden="false" alt="Brainstorm" style="max-width: 300px;"><br></p><p style="text-align: center;"><br></p><p style="text-align: center;">Introduce the topic you would like students to brainstorm about...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li style="font-size: medium;"><font color="#ff0000"><span style="font-weight: 400;">This step provides a class discussion where students can brainstorm their ideas about a topic.</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Edit the introductory text above to introduce a topic you\'d like students to brainstorm about.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Then edit the prompt for the discussion component below.</span></font></font></li><li style="font-size: medium; font-weight: 400;"><span style="color: rgb(255, 0, 0);">Delete this help text when you\'re finished.</span><br></li></ul></h5><p><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p>',
            showAddToNotebookButton: true
          },
          {
            id: '0tigjg63m0',
            type: 'Discussion',
            prompt:
              '[Customize prompt] What do you already know about...? Post your ideas to the share them with the class!',
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
        id: 'node14',
        title: 'A list of my ideas',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node17'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'y1ahqibj5e',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">What do you already know?</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;"><img src="/curriculum/common_files/James.png" aria-hidden="false" alt="student" style="max-width: 120px;"><br></p><p style="text-align: center;"><br></p><p style="text-align: center;">Introduce the topic you want students to think about...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li style="font-size: medium;"><font color="#ff0000"><span style="font-weight: 400;">This step provides a label component which allows students to add their initial ideas about a topic.</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Edit the introductory text above to introduce the topic you want students to think about.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Then edit the prompt for the label component below.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">You can also edit&nbsp;</span></font></font><font color="#ff0000" size="3"><span style="font-weight: 400;">the "Background Image" field in the Label component if you\'d like. Upload your own image by clicking the&nbsp;</span></font><img src="/curriculum/common_files/choose-an-image.jpg" aria-hidden="false" alt="choose an image" style="width: 50px;"><font color="#ff0000" size="3"><span style="font-weight: 400;"> (choose an image) button.</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span><br></font></font></li></ul></h5><p><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'b7cdbqnbvr',
            type: 'Label',
            prompt:
              '[Customize prompt]<p>Click on the boxes below to add two ideas you have about XXXX.</p>\n<p>Click the + button to add more ideas.</p>\n<p>Add as many boxes as you have ideas!</p>',
            showSaveButton: false,
            showSubmitButton: false,
            backgroundImage: 'stickman.png',
            canCreateLabels: true,
            canEditLabels: true,
            canDeleteLabels: true,
            enableCircles: true,
            width: 800,
            height: 600,
            pointSize: 5,
            fontSize: 20,
            labelWidth: 20,
            labels: [
              {
                text: 'I know that....',
                color: 'lightseagreen',
                pointX: 250,
                pointY: 100,
                textX: 400,
                textY: 150,
                canEdit: true,
                canDelete: true
              },
              {
                text: 'I also think....',
                color: 'lightseagreen',
                pointX: 260,
                pointY: 50,
                textX: 600,
                textY: 200,
                canEdit: true,
                canDelete: true
              }
            ],
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
        id: 'node17',
        title: 'Explore [a resource]!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node20'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'ujdka5vp0i',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Exploring...</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;">Introduce the model, simulation, or other OER you want students to investigate...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">This step provides students with an opportunity to explore a model, simulation, video, or some other open educational resource (OER).</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Edit the step title as well as the introductory text above to introduce the resource you want students engage with.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Select the resource you want students to see in the Outside Resource component below.</span></font></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">[Note: if you would like to use an offline activity or other resource, include instructions for accessing the resource above and feel free to delete the Outside Resource component.]</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Then edit the prompt for the open response component at the end of the step to help students make sense of the resource.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span><br></font></font></li></ul></h5><p><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'v8dwhgh5to',
            type: 'OutsideURL',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            url: '',
            height: 600,
            showAddToNotebookButton: true
          },
          {
            id: 'jxu5hfj7rn',
            type: 'HTML',
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Observe and Report</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;">After discovering new ideas by exploring the model, share what you have learned.</p>',
            showAddToNotebookButton: true
          },
          {
            id: 'l36xawnm9t',
            prompt: '[Customize prompt] Describe... Use evidence from the model to explain...',
            showSaveButton: false,
            showSubmitButton: false,
            type: 'OpenResponse',
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
        id: 'node20',
        title: 'Critique this, please!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node21'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'o6jozeabso',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Help a student improve their explanation/Critique your own work</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;"><img src="/curriculum/common_files/James.png" aria-hidden="false" alt="student" style="max-width: 120px;"></p><p style="text-align: center;"><br></p><p style="text-align: center;">Introduce the task here...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">This step provides a label component which allows students to add labels to specific parts an image.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">For this task, students will use the label component to critique an explanation. This could either be 1) an</span> example explanation that you provide<span style="font-weight: 400;">, or 2) </span>their own previous work<span style="font-weight: 400;">.</span></font></font></li></ul></h5><p><span style="color: rgb(255, 0, 0); font-size: medium;">1) To design your own explanation:</span><br></p><ul style="font-size: 20px; font-weight: 700;"><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Write an explanation that includes a common inaccurate idea or is incomplete.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Take a screenshot or save as a picture on your computer.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Then edit the "Background Image" field in the Label component below. You can upload your image by clicking the&nbsp;</span></font><img src="/curriculum/common_files/choose-an-image.jpg" aria-hidden="false" alt="choose an image" style="width: 50px;">&nbsp;<font color="#ff0000" size="3"><span style="font-weight: 400;">(choose an image) button.</span></font></li></ul><p><span style="color: rgb(255, 0, 0); font-size: medium;">2)&nbsp;</span><span style="color: rgb(255, 0, 0); font-size: medium;">To have students critique their own work:</span></p><ul style="font-size: 20px; font-weight: 700;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete the text in the "Background Image" field in the Label component below.&nbsp;</span></font></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Click on the&nbsp;</span></font><img src="/curriculum/common_files/advanced.png" aria-hidden="false" alt="advanced" style="width: 50px;"><font color="#ff0000" size="3"><span style="font-weight: 400;">&nbsp;(advanced) button, scroll to "Connected Component", and choose the Step and Component that contains the work you want to students to critique.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Make sure to check the "Import Work As Background" option. This will import the students\' own work as the background for the Label component.</span></font></li></ul><p><span style="color: rgb(255, 0, 0); font-size: medium;">3) Finally:</span></p><ul style="font-size: 20px; font-weight: 700;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Edit the introductory text above, as well as the the prompt for the Label component.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">You can also add starter labels to the Label component if you like.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></font></li></ul><p><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'uea1kk3zj5',
            type: 'Label',
            prompt:
              "[Customize prompt] Add labels Esra's [or your] writing to help improve his explanation.",
            showSaveButton: false,
            showSubmitButton: false,
            backgroundImage: 'ExampleCritique.png',
            canCreateLabels: true,
            canEditLabels: true,
            canDeleteLabels: true,
            enableCircles: true,
            width: 800,
            height: 600,
            pointSize: 5,
            fontSize: 20,
            labelWidth: 20,
            labels: [],
            showAddToNotebookButton: true,
            connectedComponents: []
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
        id: 'node21',
        title: 'Sort these ideas!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node22'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: [
          {
            id: 't7gnat220f',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Sorting ideas</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;">Introduce the task here...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">This step asks students to sort ideas into different categories.</span></font></font></li><li><span style="font-weight: 400; font-size: medium; color: rgb(255, 0, 0);">Edit the introductory text above to outline the sorting task&nbsp; you want students to engage in.</span><br></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Add "Choices" to the Match component below. These will be the ideas students will have to sort.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Customize the name for the "Choices" bucket.</span></font></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the "Target Buckets" as you see fit. These are the categories (buckets) in which students will drag the choices to.</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Optional: In the "Feedback section, you can mark which containers are correct for each of the choices and/or add feedback text the students will see when they submit their answers.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Customize the prompt for the Match component below.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.<br></span></font></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: 'wallfro3ha',
            type: 'Match',
            prompt: '[Customize prompt] Sort these ideas...',
            showSaveButton: true,
            showSubmitButton: true,
            choices: [
              {
                id: '6xa6lwpoyn',
                value: '[Customize] Apple',
                type: 'choice'
              },
              {
                id: '6zc1mc8wcv',
                value: '[Customize] Lettuce',
                type: 'choice'
              }
            ],
            buckets: [
              {
                id: '2thnk4q1vr',
                value: '[Customize] Fruit',
                type: 'bucket'
              },
              {
                id: 'forthr2t0d',
                value: '[Customize] Vegetables',
                type: 'bucket'
              }
            ],
            feedback: [
              {
                bucketId: '0',
                choices: [
                  {
                    choiceId: '6xa6lwpoyn',
                    feedback: '',
                    isCorrect: false
                  },
                  {
                    choiceId: '6zc1mc8wcv',
                    feedback: '',
                    isCorrect: false
                  }
                ]
              },
              {
                bucketId: '2thnk4q1vr',
                choices: [
                  {
                    choiceId: '6xa6lwpoyn',
                    feedback: 'Correct!',
                    isCorrect: true
                  },
                  {
                    choiceId: '6zc1mc8wcv',
                    feedback: '',
                    isCorrect: false
                  }
                ]
              },
              {
                bucketId: 'forthr2t0d',
                choices: [
                  {
                    choiceId: '6xa6lwpoyn',
                    feedback: '',
                    isCorrect: false
                  },
                  {
                    choiceId: '6zc1mc8wcv',
                    feedback: 'Correct!',
                    isCorrect: true
                  }
                ]
              }
            ],
            ordered: false,
            showAddToNotebookButton: true,
            choicesLabel: '[Customize] Ideas'
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
        id: 'node22',
        title: 'What did you find out?',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node23'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: [
          {
            id: '7jyjgbc5sq',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Have your ideas changed?</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;">Introduce the reflection/distinguishing task here...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">This step asks students to revisit their previous ideas and reflect on them based on new information they\'ve learned.</span></font></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">The step imports prior work to help students distinguish between their initial and their newly discovered ideas. It&nbsp;goes well with a prior step that elicited student ideas in the form of predictions.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Edit the introductory text above to outline the distinguishing task you want students to engage in.</span></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">To select the previous work to show students:</font></p><ul style="text-align: start;"><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Click on the&nbsp;</span></font><img src="/curriculum/common_files/advanced.png" aria-hidden="false" alt="advanced" style="width: 40px;"><font color="#ff0000" size="3"><span style="font-weight: 400;"> (advanced) button for the Open Response Component below.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Scroll to "Connected Components" and choose the Step and Component that contains the work you want to students to review.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">For the "Type" option, select "Show Work". (This will only show the previous work to the students, while selecting "Import Work" would import their previous response and then edit it.)</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">[Note: If you would like to show a different type of work, you can delete the Open Response component and add the type of component you\'d like by clicking the "Add New Component" button above. Then follow the same steps to import work.]</span></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">Next:</font></p><ul style="text-align: start;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Customize the prompt for the imported work component.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Then edit the prompts and content for the reflection questions that follow.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: 'ia2ylyue4i',
            type: 'OpenResponse',
            prompt: '[Customize prompt] Before you discovered new ideas, you made this prediction:',
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true
          },
          {
            id: 'x6545fynsj',
            type: 'MultipleChoice',
            prompt: '[Customize prompt] Was your prediction correct?',
            showSaveButton: true,
            showSubmitButton: true,
            choiceType: 'radio',
            choices: [
              {
                id: '8uswt3b6pv',
                text: 'Yes, I predicted exactly what happened!',
                feedback: 'Great! Add details about why or how your prediction was correct!',
                isCorrect: false
              },
              {
                id: 'x5gz8fcawq',
                text: 'No, I was wrong.',
                feedback: 'Great progress! Now that you know better, can you explain...',
                isCorrect: false
              }
            ],
            showFeedback: true,
            showAddToNotebookButton: true
          },
          {
            id: 'l0pjx61xe3',
            type: 'OpenResponse',
            prompt:
              "[Customize prompt] Based on any new ideas you've gained, revise your explanation...",
            showSaveButton: true,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node12',
                componentId: 'jv2bn772yp',
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
        id: 'node23',
        title: 'Revise your explanation!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node24'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: '4zk7sflp25',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Revise your explanation</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;">What have you learned now that you explored...?</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">This step imports prior work and asks students to revise their previous explanation or ideas.</span></font></font></li><li><span style="font-weight: 400; color: rgb(255, 0, 0); font-size: medium;">Edit the introductory text above to outline the revision task you want students to engage in.</span></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">To select the previous work for students to revise:</font></p><ul style="text-align: start;"><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Click on the&nbsp;</span></font><img src="/curriculum/common_files/advanced.png" aria-hidden="false" alt="advanced" style="width: 40px;"><font color="#ff0000" size="3"><span style="font-weight: 400;">&nbsp;(advanced) button for the Open Response Component below.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Scroll to "Connected Components" and choose the Step and Component that contains the work you want to students to review.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">For the "Type" option, select "Import Work".</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">[Note: If you would like to have students revise a different type of work, you can delete the Open Response component and add the type of component you\'d like by clicking the "Add New Component" button above. Then follow the same steps to import work.]</span></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">Next:</font></p><ul style="text-align: start;"><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Customize the prompt for the imported work component below.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></font></li></ul><p style="font-size: medium; font-weight: 400; text-align: start;"><font color="#ff0000">----</font></p></h5>',
            showAddToNotebookButton: true
          },
          {
            id: 'ng14ze3044',
            type: 'OpenResponse',
            prompt:
              "[Customize prompt] Here is what you predicted... Revise based on what you've learned by exploring...",
            showSaveButton: false,
            showSubmitButton: false,
            starterSentence: null,
            isStudentAttachmentEnabled: false,
            showAddToNotebookButton: true,
            connectedComponents: [
              {
                nodeId: 'node22',
                componentId: 'l0pjx61xe3',
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
      },
      {
        id: 'node24',
        title: 'Explain to Mia!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: [
            {
              to: 'node27'
            }
          ]
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: 'xgstb6cpbe',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Help Mia!</font></h5><p style="text-align: center;"><br></p><p style="text-align: center;"><img src="/curriculum/common_files/Girl.png" aria-hidden="false" alt="Girl" style="width: 200px;"><br></p><p style="text-align: center;"><br></p><p style="text-align: center;">Mia has some great ideas about... But she needs some help solving a problem...</p><p style="text-align: center;"><br></p><h5 style="text-align: center;"><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li style="font-size: medium;"><font color="#ff0000"><span style="font-weight: 400;">This step asks students to use what they\'ve learned to help someone with a problem related to what students have been learning in this unit.</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Create a story about a fictitious peer or character who needs help solving a problem or completing a task. Edit the introductory text above to introduce the task.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">At this point, it is important that students are asked to think about they variety of aspects they have explore for this topic and integrate these in their explanation or solution.</span><br></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Write your story about and then edit the prompt for the Open Response component below.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span><br></font></font></li></ul></h5><p><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'use0162gu4',
            type: 'OpenResponse',
            prompt:
              '[Customize prompt] Explain to Mia... How can Mia...? Be sure to include ideas about...',
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
      },
      {
        id: 'node27',
        title: 'Convince me!',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: []
        },
        showSaveButton: true,
        showSubmitButton: false,
        components: [
          {
            id: '5fpj1ohm7q',
            type: 'HTML',
            prompt: '',
            showSaveButton: false,
            showSubmitButton: false,
            html:
              '<h5 style="text-align: center;"><font color="#a54a7b">Convince Me!</font></h5><p></p><div style="text-align: center;"><br></div><div style="text-align: center;"><img src="/curriculum/common_files/Debate.jpg" aria-hidden="false" data-filename="Debate.jpg" style="width: 25%;"></div><div style="text-align: center;"><br></div><div style="text-align: center;">Two students are having a debate about...</div><div style="text-align: center;"><br></div><div style="text-align: center;"><h5><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);">----</span></p><p style="font-size: medium; font-weight: 400; text-align: start;"><span style="color: rgb(255, 0, 0);"><b>Curriculum authors:</b></span></p><ul style="text-align: start;"><li style=""><font color="#ff0000" size="3"><span style="font-weight: 400;">This step is meant to engage students in an argument.</span></font><br></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Create either: 1)&nbsp;</span></font></font><font color="#ff0000" size="3"><span style="font-weight: 400;">a </span>debate between two students<span style="font-weight: 400;"> about the science topic you are teaching, or 2)&nbsp;a </span>fictitious peers\' argument<span style="font-weight: 400;">.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">The fictitious peers\' arguments can either be one-sided, incorrect, or neglecting.</span></font></li><li><font color="#ff0000" size="3"><span style="font-weight: 400;">Ask students to weigh in on who they think is right in the debate or whether they think their peer\'s argument is correct and why. Make sure to encourage students to include evidence from the unit to add, correct, or counter the presented argument/debate.</span></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Add the contents of the debate or the peer\'s argument above and then edit the prompt for the Open Response component below.</span></font></font></li><li><font color="#ff0000"><font size="3"><span style="font-weight: 400;">Delete this help text when you\'re finished.</span></font></font></li></ul></h5><p style="text-align: start;"><span style="color: rgb(255, 0, 0); font-size: medium;">----</span></p></div><br><p></p>',
            showAddToNotebookButton: true
          },
          {
            id: 'b416d7pepn',
            type: 'OpenResponse',
            prompt:
              "[Customize prompt] Who do you think is right and why? Do you think XXXX's argument is correct? Why or why not?",
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

KICycleUSINGOERController.$inject = [
  '$filter',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'UtilService'
];

export default KICycleUSINGOERController;
