
// the global WISE5 project
var wise5Project = {};

// the global WISE4 project
var wise4Project = null;

// used to generate the node ids
var nodeCounter = 1;

// used to generate the group ids
var groupCounter = 0;

// used to generate the constraint ids
var constraintCounter = 0;

// the project file path
var projectFilePath = '';

// the project folder path
var projectFolderPath = '';

// holds the node ids of the previous node so that we can create transitions
var previousNodeIds = [];

// the node id of the branch point
var branchNodeId = '';

// holds the current group we are parsing so we can put child nodes into it
var currentGroup = null;

// variable to turn debugging on or off
var test = false;

// a mapping of WISE4 node ids to WISE5 node ids
var wise4IdsToWise5Ids = {};

/**
 * Convert the WISE4 project into a WISE5 project
 */
function convert() {

    // create the WISE5 project object
    wise5Project = {};
    wise4Project = null;

    // initialize counters
    nodeCounter = 1;
    groupCounter = 0;
    constraintCounter = 0;

    // get the project path
    projectFilePath = $('#projectFilePathInput').val();

    // get the project folder path
    projectFolderPath = projectFilePath.substring(0, projectFilePath.lastIndexOf('/') + 1);

    // make a request for the WISE4 project file
    $.ajax({
        method: 'GET',
        url: projectFilePath
    }).done(function(response) {

        // get the WISE4 project
        wise4Project = response;

        // get the string representation of the WISE4 project
        var wise4ProjectString = JSON.stringify(wise4Project, null, 4);

        // display the WISE4 project string in the textarea
        $('#wise4ProjectFile').html(wise4ProjectString);

        // parse the WISE4 project to create the WISE5 project
        parseWISE4Project(wise4Project);
    });
}

/**
 * Parse the WISE4 project to create the WISE5 project
 * @param wise4Project the WISE4 project
 */
function parseWISE4Project(wise4Project) {

    // initialize the WISE5 project
    createWISE5Project();

    if (wise4Project != null) {

        // get the start point for the WISE4 project
        var startPoint = wise4Project.startPoint;

        // parse the WISE4 project
        parseWISE4ProjectHelper(wise4Project, startPoint);

        // set the title of the WISE5 project
        wise5Project.metadata.title = wise4Project.title;
    }

    // get the string representation of the WISE5 project
    var wise5ProjectString = JSON.stringify(wise5Project, null, 4);

    // display the WISE5 project string in the textarea
    $('#wise5ProjectFile').html(wise5ProjectString);

    // generate the project.json file that will be downloaded onto the user's computer
    generateProjectJSONFile('project.json', wise5ProjectString);
}

/**
 * Generate the project.json file and download it onto the user's computer
 * @param fileName the file name
 * @param stringContent the string content that will be placed in the file
 */
function generateProjectJSONFile(fileName, stringContent) {
    var a = document.createElement("a");
    var file = new Blob([stringContent], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

/**
 * The helper function for parsing the WISE4 project
 * @param project the WISE4 project object
 * @param elementId the current WISE4 element id (aka node id)
 * @returns the WISE5 element (aka node or group) that has been created from the WISE4 element (aka node or group)
 */
function parseWISE4ProjectHelper(project, elementId) {

    var element = null;

    if (elementId != null) {

        // try to get the sequence with the given element id
        var sequence = getSequence(project, elementId);

        // try to get the node with the given element id
        var node = getNode(project, elementId);

        if (sequence != null) {
            // the element is a sequence

            if (isBranchingActivity(sequence)) {
                // the sequence is a branching activity

                // get the branch node id
                branchNodeId = previousNodeIds[0];

                // generate the branch in the WISE5 project
                handleBranchActivity(sequence);
            } else {
                // this is a regular sequence

                // create a WISE5 group
                var wise5Group = createWISE5Group(sequence);

                currentGroup = wise5Group;

                // add the group to the array of nodes
                addWISE5Node(wise5Group);

                // loop through all the children of the sequence
                for (var x = 0; x < sequence.refs.length; x++) {

                    // get a child id
                    var sequenceRefId = sequence.refs[x];

                    // get the child node
                    var childNode = parseWISE4ProjectHelper(project, sequenceRefId);

                    if (childNode != null) {
                        // add the child to the group
                        wise5Group.ids.push(childNode.id);

                        if (wise5Group.startId === '') {

                            // set the start id of the group if there currently is none
                            wise5Group.startId = childNode.id;
                        }
                    }
                }

                element = wise5Group;
            }
        } else if (node != null) {
            // the element is a node

            // create the WISE5 node
            element = createWISE5NodeFromNodeContent(node.identifier);

            if (element == null) {
                // could not create WISE5 node. possible reasons: converter for step type not implemented yet
                // console.log("could not convert: " + node.identifier);
            } else {

                // get the element id
                var elementId = element.id;

                // add a mapping from the WISE4 id to WISE5 id
                wise4IdsToWise5Ids[node.identifier] = element.id;

                if (previousNodeIds.length > 0) {

                    /*
                     * loop through all the immediate previous node ids
                     *
                     * example 1
                     * (node1)--(node2)--(node3)
                     * if the current element is node3, the previousNodeIds would be [node2]
                     *
                     * example 2
                     * (node1)--(node2)--(node3)--(node5)
                     *                 \         /
                     *                  \       /
                     *                   (node4)
                     * if the current element is node5, the previousNodeIds would be [node3, node4]
                     */
                    for (var p = 0; p < previousNodeIds.length; p++) {
                        var previousNodeId = previousNodeIds[p];

                        // add a transition from the previous node id to the new node
                        addTransition(previousNodeId, elementId);
                    }

                    // set the previous node id
                    previousNodeIds = [elementId];
                } else {
                    // there are no previous node ids

                    // set the previous node id
                    previousNodeIds = [elementId];
                }
            }
        }
    }

    return element;
}

/**
 * Create a random id with 10 characters
 * @returns a random alphanumeric string
 */
function createRandomId() {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
        'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
        'y', 'z'];

    var result = '';

    var charCount = 10;

    for (var x = 0; x < charCount; x++) {

        // choose a random alphanumeric character
        var randomChar = chars[Math.floor(Math.random() * chars.length)];

        result += randomChar;
    }

    return result;
}

/**
 * Get the sequence from the project
 * @param project the project object
 * @param sequenceId the sequence id
 * @returns the sequence object
 */
function getSequence(project, sequenceId) {
    var sequence = null;

    if (project != null && sequenceId != null) {
        var sequences = project.sequences;

        // loop through all the sequences
        for (var s = 0; s < sequences.length; s++) {
            var tempSequence = sequences[s];

            if (tempSequence != null) {
                var identifier = tempSequence.identifier;

                if (sequenceId === identifier) {
                    // we have found the sequence we are looking for
                    sequence = tempSequence;
                    break;
                }
            }
        }
    }

    return sequence;
}

/**
 * Get the node from the project
 * @param project the project object
 * @param nodeId the node id
 * @returns the node object
 */
function getNode(project, nodeId) {
    var node = null;

    if (project != null && nodeId != null) {
        var nodes = project.nodes;

        // loop through all the nodes
        for (var n = 0; n < nodes.length; n++) {
            var tempNode = nodes[n];

            if (tempNode != null) {
                var identifier = tempNode.identifier;

                if (nodeId === identifier) {
                    // we have found the node we are looking for
                    node = tempNode;
                    break;
                }
            }
        }
    }

    return node;
}

/**
 * Create a WISE5 node from the WISE4 node content
 * @param identifier the WISE4 node id
 * @returns a WISE5 node
 */
function createWISE5NodeFromNodeContent(identifier) {

    var wise5Node = null;

    // get the path to the WISE4 node content file
    var nodeFilePath = projectFolderPath + identifier;

    $.ajax({
        method: 'GET',
        url: nodeFilePath,
        async: false,
        dataType: 'text'
    }).done(function(response) {

        if (response != null) {

            // get the WISE4 node
            var node = getNode(wise4Project, identifier);

            // replace linkTos with wiselinks
            var responseUpdated = replaceLinkToWithWISELink(node, response);

            // create the node content object
            var nodeContent = JSON.parse(responseUpdated);

            // create the WISE5 node
            wise5Node = convertNode(node, nodeContent);
        }
    });

    return wise5Node;
}

/**
 * Convert a WISE4 node into a WISE5 node
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns the WISE5 node
 */
function convertNode(node, nodeContent) {

    var wise5Node = null;

    if (nodeContent != null) {
        var nodeType = nodeContent.type;

        if (nodeType === 'Html') {
            wise5Node = convertHTML(node, nodeContent);
        } else if (nodeType === 'AssessmentList') {
            wise5Node = convertAssessmentList(node, nodeContent);
        } else if (nodeType === 'OpenResponse') {
            wise5Node = convertOpenResponse(node, nodeContent);
        } else if (nodeType === 'Note') {
            wise5Node = convertOpenResponse(node, nodeContent);
        } else if (nodeType === 'MultipleChoice' || nodeType === 'Challenge') {
            wise5Node = convertMultipleChoice(node, nodeContent);
        } else if (nodeType === 'MatchSequence') {
            wise5Node = convertMatchSequence(node, nodeContent);
        } else if (nodeType === 'SVGDraw') {
            wise5Node = convertDraw(node, nodeContent);
        } else if (nodeType === 'Brainstorm') {
            wise5Node = convertBrainstorm(node, nodeContent);
        } else if (nodeType === 'Fillin') {
            // TODO
        } else if (nodeType === 'Sensor') {
            // TODO
        } else if (nodeType === 'Table') {
            wise5Node = convertTable(node, nodeContent);
        } else if (nodeType === 'IdeaBasket') {
            // TODO
        } else if (nodeType === 'ExplanationBuilder') {
            // TODO
        } else if (nodeType === 'OutsideUrl') {
            wise5Node = convertOutsideURL(node, nodeContent);
        } else if (nodeType === 'Mysystem2') {
            // TODO
        } else if (nodeType === 'Annotator') {
            wise5Node = convertAnnotator(node, nodeContent);
        } else if (nodeType === 'Branching') {
            // TODO
        } else if (nodeType === 'PhET') {
            wise5Node = convertPhet(node, nodeContent);
        } else if (nodeType === 'Grapher') {
            wise5Node = convertGrapher(node, nodeContent);
        }
    }

    if (wise5Node != null) {
        //console.log(nodeType + '[x]');
    }

    return wise5Node;
}

/**
 * Create and initialize the WISE5 project object
 */
function createWISE5Project() {
    wise5Project.nodes = [];
    wise5Project.constraints = [];
    wise5Project.startGroupId = 'group0';
    wise5Project.startNodeId = 'node1';

    wise5Project.navigationMode = 'guided';
    wise5Project.navigationApplications = [
        'wiseMap',
        'wiseList'
    ];

    wise5Project.layout = {
        'template': 'starmap|leftNav|rightNav',
        'studentIsOnGroupNode': 'layout3',
        'studentIsOnApplicationNode': 'layout4'
    }

    var metadata = {};
    metadata.title = '';
    wise5Project.metadata = metadata;
}

/**
 * Create and initialize a WISE5 group object
 * @param sequence the WISE4 sequence
 * @returns a WISE5 group object
 */
function createWISE5Group(sequence) {
    var wise5Group = {};
    wise5Group.id = getNextGroupId();
    wise5Group.type = 'group';
    wise5Group.title = sequence.title;
    wise5Group.startId = '';
    wise5Group.ids = [];

    return wise5Group;
}

/**
 * Create and initialize a WISE5 node object
 * @returns a WISE5 node object
 */
function createWISE5Node() {
    var wise5Node = {};

    wise5Node.id = getNextNodeId();
    wise5Node.type = 'node';
    wise5Node.showSaveButton = true;
    wise5Node.showSubmitButton = true;
    wise5Node.constraints = [];

    var transitionLogic = {};
    transitionLogic.transitions = [];
    transitionLogic.howToChooseAmongAvailablePaths = null;
    transitionLogic.whenToChoosePath = null;
    transitionLogic.canChangePath = null;
    transitionLogic.maxPathsVisitable = null;

    wise5Node.transitionLogic = transitionLogic;

    return wise5Node;
}

/**
 * Get the prompt from a WISE4 assessment item
 * @param nodeContent the WISE4 node content
 * @returns the prompt
 */
function getPromptFromAssessmentItem(nodeContent) {
    var prompt = null;

    if (nodeContent != null &&
        nodeContent.assessmentItem != null &&
        nodeContent.assessmentItem.interaction != null &&
        nodeContent.assessmentItem.interaction.prompt != null) {

        prompt = nodeContent.assessmentItem.interaction.prompt;
    }

    return prompt;
};

/**
 * Convert a WISE4 html node into a WISE5 node with an html component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertHTML(node, nodeContent) {

    var wise5Node = null;

    if (nodeContent != null) {

        // get the path to the WISE4 html file
        var src = projectFolderPath + nodeContent.src;

        $.ajax({
            method: 'GET',
            url: src,
            async: false,
            dataType: 'html'
        }).done(function(response) {

            // get the html
            var html = response;

            if (html != null) {

                // create a WISE5 node
                wise5Node = createWISE5Node();

                // set the title
                wise5Node.title = node.title;

                // set the prompt
                var content = {};
                content.prompt = nodeContent.prompt;
                content.showSaveButton = false;
                content.showSubmitButton = false;
                content.components = [];

                var component = {};

                // set the component id
                component.id = createRandomId();
                component.type = 'HTML';

                // set the html
                component.html = html;

                // add the component
                content.components.push(component);

                // set the content
                wise5Node.content = content;

                // add the WISE5 node to the project
                addWISE5Node(wise5Node);
            }
        });
    }

    return wise5Node;
}

/**
 * Convert a WISE4 assessment list node into a WISE5 node with
 * open response and multiple choice components
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertAssessmentList(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    if (test) {
        console.log('before');
        console.log(prompt);

        prompt = fixAssetReferences(prompt);

        console.log('after');
        console.log(prompt);

        //test = true;
    }

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var prompt = nodeContent.prompt;

    if (prompt != null && prompt !== '') {
        // create an html component for the prompt
        var htmlPromptComponent = {};
        htmlPromptComponent.id = createRandomId();
        htmlPromptComponent.type = 'HTML';
        htmlPromptComponent.html = prompt;

        content.components.push(htmlPromptComponent);
    }

    // get all the assessment parts
    var assessments = nodeContent.assessments;

    if (assessments != null) {

        // loop through all the assessment parts
        for (var a = 0; a < assessments.length; a++) {

            // get an assessment part
            var assessment = assessments[a];

            if (assessment != null) {
                var component = {};

                // set the component id
                component.id = createRandomId();

                // set the prompt
                component.prompt = assessment.prompt;

                if (assessment.type === 'text') {
                    // create an open response component
                    component.type = 'OpenResponse';

                    if (assessment.starter != null) {
                        if (assessment.starter.display == 2 &&
                            assessment.starter.text != null &&
                            assessment.starter.text != '') {

                            // this component has a starter sentence
                            component.starterSentence = assessment.starter.text;
                        }
                    }
                } else if (assessment.type === 'radio' || assessment.type === 'checkbox') {
                    // create an multiple choice component
                    component.type = 'MultipleChoice';

                    if (assessment.type === 'radio') {
                        component.choiceType = 'radio';
                    } else if(assessment.type === 'checkbox') {
                        component.choiceType = 'checkbox';
                    }

                    // get all the choices
                    var choices = assessment.choices;

                    component.choices = [];

                    // loop through all the choices
                    for (var c = 0; c < choices.length; c++) {
                        var tempChoice = choices[c];

                        if (tempChoice != null) {
                            var tempText = tempChoice.text;
                            var choiceId = createRandomId();

                            // create the choice object
                            var choice = {};
                            choice.id = choiceId;
                            choice.text = tempText;
                            choice.feedback = '';

                            component.choices.push(choice);

                            if (tempChoice.isCorrect) {
                                // this choice is the correct choice
                                component.correctChoice = choiceId;
                            }
                        }
                    }
                }

                content.components.push(component);
            }
        }
    }

    // set the content into the WISE5 node
    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 open response node into a WISE5 node with an open response component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertOpenResponse(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    var prompt = getPromptFromAssessmentItem(nodeContent);

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};

    // set the component id
    component.id = createRandomId();

    component.type = 'OpenResponse';
    component.prompt = prompt;

    if (nodeContent.starterSentence != null) {
        if (nodeContent.starterSentence.display == 2 &&
            nodeContent.starterSentence.sentence != null &&
            nodeContent.starterSentence.sentence != '') {

            // this component has a starter sentence
            component.starterSentence = nodeContent.starterSentence.sentence;
        }
    }

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 multiple choice node into a WISE5 node with a multiple choice component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertMultipleChoice(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    // get the prompt
    var prompt = getPromptFromAssessmentItem(nodeContent);

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};

    // set the component id
    component.id = createRandomId();

    component.type = 'MultipleChoice';
    component.prompt = prompt;
    component.choices = [];
    component.showSaveButton = false;
    component.showSubmitButton = false;

    var assessmentItem = nodeContent.assessmentItem;

    if (assessmentItem != null) {

        // choice type will default to radio
        var choiceType = 'radio';

        var interaction = assessmentItem.interaction;

        var wise4ChoiceIdToWISE5ChoiceId = {};

        if (interaction != null) {
            // handle the choices

            // get the WISE4 choices
            var choices = interaction.choices;

            // get the max number of choices the student can choose
            var maxChoices = interaction.maxChoices;

            if (maxChoices != 1) {
                // the student can choose more than one choice so the choice type will be checkbox
                choiceType = 'checkbox';
            }

            if (choices != null) {

                // loop through all the WISE4 choices
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    if (choice != null) {
                        var wise5Choice = {};

                        // create an id for the choice
                        wise5Choice.id = createRandomId();

                        // set the text and feedback
                        wise5Choice.text = choice.text;
                        wise5Choice.feedback = choice.feedback;

                        // add an entry to map WISE4 choice id to WISE5 choice id
                        wise4ChoiceIdToWISE5ChoiceId[choice.identifier] = wise5Choice.id;

                        // add the WISE5 choice
                        component.choices.push(wise5Choice);
                    }
                }
            }
        }

        var responseDeclaration = assessmentItem.responseDeclaration;

        if (responseDeclaration != null) {
            // handle the correct choices

            // get the array of correct choice ids
            var correctResponse = responseDeclaration.correctResponse;

            if (correctResponse != null) {
                if (choiceType === 'radio') {
                    // this is a radio button choice type so there is only one correct answer

                    if (correctResponse.length > 0) {

                        // get the WISE4 correct choice id
                        var wise4ChoiceId = correctResponse[0];

                        if (wise4ChoiceId != null) {
                            // get the WISE5 correct choice id
                            var wise5ChoiceId = wise4ChoiceIdToWISE5ChoiceId[wise4ChoiceId];

                            if (wise5ChoiceId != null) {
                                component.correctChoice = wise5ChoiceId;
                            }
                        }
                    }
                } else if (choiceType === 'checkbox') {
                    // this is a checkbox type so there may be more than one correct answer
                    component.correctChoices = [];

                    // loop through all the WISE4 correct choice ids
                    for (var x = 0; x < correctResponse.length; x++) {

                        // get a WISE4 correct choice id
                        var wise4ChoiceId = correctResponse[x];

                        if (wise4ChoiceId != null) {
                            // get the WISE5 correct choice id
                            var wise5ChoiceId = wise4ChoiceIdToWISE5ChoiceId[wise4ChoiceId];

                            if (wise5ChoiceId != null) {
                                component.correctChoices.push(wise5ChoiceId);
                            }
                        }
                    }
                }
            }
        }

        // set the choice type
        component.choiceType = choiceType;

        // show the submit button if there is a correct choice
        if (component.correctChoice != null ||
            (component.correctChoices != null && component.correctChoices.length > 0)) {
            component.showSubmitButton = true;
        }
    }

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 match sequence node into a WISE5 node with a match component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertMatchSequence(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    // get the prompt
    var prompt = getPromptFromAssessmentItem(nodeContent);

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};

    // set the component id
    component.id = createRandomId();

    component.type = 'Match';
    component.prompt = prompt;
    component.choices = [];
    component.buckets = [];
    component.feedback = [];
    component.showSaveButton = false;
    component.showSubmitButton = true;

    var hasCorrectAnswer = false;

    var assessmentItem = nodeContent.assessmentItem;

    if (assessmentItem != null) {

        var interaction = assessmentItem.interaction;

        var wise4ChoiceIdToWISE5ChoiceId = {};
        var wise4BucketIdToWISE5BucketId = {};

        if (interaction != null) {
            var choices = interaction.choices;
            var fields = interaction.fields;

            if (choices != null) {
                // handle the choices

                // loop through all the WISE4 choices
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    if (choice != null) {
                        var wise5Choice = {};

                        // create an id for the choice
                        wise5Choice.id = createRandomId();

                        // set the value
                        wise5Choice.value = choice.value;

                        // set the type
                        wise5Choice.type = 'choice';

                        // add an entry to map WISE4 choice id to WISE5 choice id
                        wise4ChoiceIdToWISE5ChoiceId[choice.identifier] = wise5Choice.id;

                        // add the WISE5 choice
                        component.choices.push(wise5Choice);
                    }
                }
            }

            if (fields != null) {
                // handle the buckets

                // loop through all the buckets
                for (var f = 0; f < fields.length; f++) {
                    var field = fields[f];

                    if (field != null) {
                        var wise5Bucket = {};

                        // create an id for the bucket
                        wise5Bucket.id = createRandomId();

                        // set the value
                        wise5Bucket.value = field.name;

                        // set the type
                        wise5Bucket.type = 'bucket';

                        // add an entry to map WISE4 choice id to WISE5 choice id
                        wise4BucketIdToWISE5BucketId[field.identifier] = wise5Bucket.id;

                        // add the WISE5 choice
                        component.buckets.push(wise5Bucket);
                    }
                }
            }
        }

        var responseDeclaration = assessmentItem.responseDeclaration;

        if (responseDeclaration != null) {
            // handle the feedback

            // get the array of feedback objects
            var correctResponses = responseDeclaration.correctResponses;

            if (correctResponses != null) {

                // loop through all the feedback
                for (var c = 0; c < correctResponses.length; c++) {

                    // get a feedback object
                    var correctResponse = correctResponses[c];

                    if (correctResponse != null) {
                        var wise5Feedback = {};

                        // get the WISE5 choice id
                        var choiceId = wise4ChoiceIdToWISE5ChoiceId[correctResponse.choiceIdentifier];

                        // get the WISE5 bucket id
                        var bucketId = wise4BucketIdToWISE5BucketId[correctResponse.fieldIdentifier];

                        if (choiceId != null && bucketId != null) {

                            // create the WISE5 feedback
                            wise5Feedback.choiceId = choiceId;
                            wise5Feedback.bucketId = bucketId;
                            wise5Feedback.isCorrect = correctResponse.isCorrect;
                            wise5Feedback.feedback = correctResponse.feedback;

                            component.feedback.push(wise5Feedback);

                            if (correctResponse.isCorrect) {
                                // there is a correct answer
                                hasCorrectAnswer = true;
                            }
                        }
                    }
                }
            }
        }
    }

    // show the submit button if there is a correct answer
    if (hasCorrectAnswer) {
        component.showSubmitButton = true;
    }

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 table node into a WISE5 node with a table component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertTable(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var tableComponent = {};

    // set the component id
    tableComponent.id = createRandomId();
    tableComponent.type = 'Table';
    tableComponent.prompt = nodeContent.prompt;
    tableComponent.globalCellSize = nodeContent.globalCellSize;

    // convert the WISE4 table to a WISE5 table
    var newTableData = convertTableData(nodeContent.numColumns, nodeContent.numRows, nodeContent.tableData);
    tableComponent.tableData = newTableData;

    content.components.push(tableComponent);

    if (!nodeContent.hideEverythingBelowTable) {
        /*
         * if the WISE4 node has a textarea below the table we will
         * create an open response component
         */

        var openResponseComponent = {};

        openResponseComponent.id = createRandomId();
        openResponseComponent.type = 'OpenResponse';
        openResponseComponent.prompt = nodeContent.prompt2;

        content.components.push(openResponseComponent);
    }

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert the WISE4 table data into WISE5 table data
 * @param numColumns the number of columns in the table
 * @param numRows the number of rows in the table
 * @param tableData the WISE4 table data from a table step
 * @returns the table data for a WISE5 table component
 */
function convertTableData(numColumns, numRows, tableData) {
    var newTableData = [];

    if (tableData != null) {

        // loop through the rows
        for (var y = 0; y < numRows; y++) {

            var newRow = [];

            // loop through the columns
            for (var x = 0; x < numColumns; x++) {

                if (tableData[x] != null && tableData[x][y] != null) {

                    // get a cell
                    var cell = tableData[x][y];

                    if (cell != null) {
                        var newCell = {};

                        newCell.text = cell.text;
                        newCell.editable = !cell.uneditable;
                        newCell.size = parseInt(cell.cellSize);

                        newRow.push(newCell);
                    }
                }
            }

            newTableData.push(newRow);
        }
    }

    return newTableData;
}

/**
 * Convert the WISE4 Phet node into a WISE5 node with an outside url component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertPhet(node, nodeContent) {
    var wise5Node = createWISE5Node();

    wise5Node.title = node.title;

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};

    component.id = createRandomId();
    component.type = 'OutsideURL';

    // set the url for the Phet model
    component.url = nodeContent.url;

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 draw node into a WISE5 node with a draw component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertDraw(node, nodeContent) {
    var wise5Node = createWISE5Node();
    wise5Node.title = node.title;

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};
    component.id = createRandomId();
    component.type = 'Draw';
    component.prompt = nodeContent.prompt;

    if (nodeContent.stamps != null) {

        var wise5Stamps = {};
        wise5Stamps.Stamps = [];

        // get the WISE4 stamps
        var wise4Stamps = nodeContent.stamps;

        // loop through all the WISE4 stamps
        for (var x = 0; x < wise4Stamps.length; x++) {
            var tempStamp = wise4Stamps[x];

            if (tempStamp != null) {
                var tempStampUri = tempStamp.uri;

                if (tempStampUri != null) {
                    // add the stamp to WISE5
                    wise5Stamps.Stamps.push(tempStampUri);
                }
            }
        }

        component.stamps = wise5Stamps;
    }

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 brainstorm node into a WISE5 node with a discussion component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertBrainstorm(node, nodeContent) {
    var wise5Node = createWISE5Node();
    wise5Node.title = node.title;

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};
    component.id = createRandomId();
    component.type = 'Discussion';

    var prompt = '';

    if (nodeContent.assessmentItem != null &&
        nodeContent.assessmentItem.interaction != null &&
        nodeContent.assessmentItem.interaction.prompt != null) {

        // get the prompt
        prompt = nodeContent.assessmentItem.interaction.prompt
    }

    component.prompt = prompt;
    component.showSaveButton = false;
    component.showSubmitButton = true;
    component.gateClassmateResponses = false;

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 annotator node into a WISE5 node with a label component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertAnnotator(node, nodeContent) {
    var wise5Node = createWISE5Node();
    wise5Node.title = node.title;

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};
    component.id = createRandomId();
    component.type = 'Label';
    component.prompt = nodeContent.prompt;
    component.showSaveButton = false;
    component.showSubmitButton = false;
    component.backgroundImage = nodeContent.backgroundImg;
    component.width = 800;
    component.height = 600;
    component.labels = [];

    // get the pre-defined labels
    var defaultLabels = nodeContent.labels_default;

    if (defaultLabels != null) {

        // loop through all the pre-defined labels
        for (var d = 0; d < defaultLabels.length; d++) {

            // get a pre-defined label
            var defaultLabel = defaultLabels[d];

            if (defaultLabel != null) {

                var label = {};

                // get the text
                label.text = defaultLabel.text;

                // get the color
                var color = defaultLabel.color;

                // regex to match 6 character hex strings
                var hexRegex = /[0-9A-Fa-f]{6}/g;

                if (color != null) {
                    if (hexRegex.test(color)) {
                        // preprend a # if the color is a hex string and doesn't start with #
                        label.color = '#' + color;
                    } else {
                        label.color = color
                    }
                }

                var location = defaultLabel.location;
                if (location != null) {

                    // get the position of the point
                    label.pointX = location.x;
                    label.pointY = location.y;
                }

                var textLocation = defaultLabel.textLocation;
                if (textLocation != null) {

                    // get the relative position of the text relative to the point
                    label.textX = textLocation.x - location.x;
                    label.textY = textLocation.y - location.y;
                }

                component.labels.push(label);
            }
        }
    }

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 brainstorm node into a WISE5 node with a discussion component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertGrapher(node, nodeContent) {
    var wise5Node = createWISE5Node();
    wise5Node.title = node.title;

    var content = {};
    content.showSaveButton = true;
    content.showSubmitButton = false;
    content.components = [];

    var component = {};
    component.id = createRandomId();
    component.type = 'Graph';

    component.prompt = nodeContent.prompt;
    component.showSaveButton = false;
    component.showSubmitButton = false;
    component.title = nodeContent.graphTitle;
    component.xAxis = {};
    component.xAxis.title = {};
    component.xAxis.title.text = nodeContent.graphParams.xLabel;

    if (nodeContent.graphParams.xmin != null) {
        component.xAxis.min = parseFloat(nodeContent.graphParams.xmin);
    }

    if (nodeContent.graphParams.xmax != null) {
        component.xAxis.max = parseFloat(nodeContent.graphParams.xmax);
    }

    component.yAxis = {};
    component.yAxis.title = {};
    component.yAxis.title.text = nodeContent.graphParams.yLabel;

    if (nodeContent.graphParams.ymin != null) {
        component.yAxis.min = parseFloat(nodeContent.graphParams.ymin);
    }

    if (nodeContent.graphParams.ymax != null) {
        component.yAxis.max = parseFloat(nodeContent.graphParams.ymax);
    }

    component.series = [
        {
            "name": "Data",
            "data": [
            ],
            "color": "blue",
            "marker": {
                "symbol": "square"
            },
            "regression": false,
            "regressionSettings": {
            },
            "canEdit": true
        }
    ];

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 outside url node into a WISE5 node with an outside url component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
function convertOutsideURL(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    var content = {};
    content.components = [];

    var component = {};

    // set the component id
    component.id = createRandomId();

    component.type = 'OutsideURL';
    component.url = nodeContent.url;

    content.components.push(component);

    wise5Node.content = content;

    // add the WISE5 node to the project
    addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Get the next node id that is available
 * @returns a node id string
 */
function getNextNodeId() {
    var nodeId = 'node' + nodeCounter;

    nodeCounter++;

    return nodeId;
}

/**
 * Get the next group id that is available
 * @returns a group id string
 */
function getNextGroupId() {
    var groupId = 'group' + groupCounter;

    groupCounter++;

    return groupId;
}

/**
 * Add a WISE5 node to the WISE5 project
 * @param wise5Node the WISE5 node
 */
function addWISE5Node(wise5Node) {
    wise5Project.nodes.push(wise5Node);
}

/**
 * Add a transition
 * @param fromNodeId the from node id
 * @param toNodeId the to node id
 * @param criteriaArray (optional) the criteria that needs to be satisifed
 * in order for the student to be able to traverse this transition
 */
function addTransition(fromNodeId, toNodeId, criteriaArray) {

    // get the from node
    var node = getWISE5NodeById(fromNodeId);

    if (node != null) {
        var transitionLogic = node.transitionLogic;

        if (transitionLogic != null) {
            var transitions = transitionLogic.transitions;

            if (transitions != null) {

                // create the transition object
                var transitionObject = {};
                transitionObject.to = toNodeId;

                if (criteriaArray != null) {
                    transitionObject.criteria = criteriaArray;
                }

                // add the transition
                transitions.push(transitionObject);
            }
        }
    }

}

/**
 * Get a WISE5 node by id
 * @param nodeId the node id
 * @returns the WISE5 node
 */
function getWISE5NodeById(nodeId) {
    var node = null;

    if (nodeId != null) {
        var nodes = wise5Project.nodes;

        // loop through all the WISE5 nodes currently in the WISE5 project
        for (var n = 0; n < nodes.length; n++) {
            var tempNode = nodes[n];

            if (tempNode != null) {
                var tempNodeId = tempNode.id;

                if (nodeId === tempNodeId) {
                    // we have found the node id that we want
                    node = tempNode;
                    break;
                }
            }
        }
    }

    return node;
}

/**
 * Check if the WISE4 sequence is a branching activity
 * @param sequence the WISE4 sequence
 * @returns whether the sequence is a branching activity
 */
function isBranchingActivity(sequence) {
    var result = false;

    if (sequence != null) {
        var refs = sequence.refs;

        // regex to that matches strings that end with br
        var regex = /.*br$/;

        if (refs != null && refs.length > 0) {
            var firstRef = refs[0];

            /*
             * check if the first node in the branch is a branching node
             * by checking if the node id ends with br
             */
            if (firstRef.match(regex)) {
                result = true;
            }
        }
    }

    return result;
}

/**
 * Create a WISE5 branch from the WISE4 branch
 * @param sequence the WISE4 branch sequence
 */
function handleBranchActivity(sequence) {

    if (sequence != null) {

        // get all the children of the sequence
        var refs = sequence.refs;

        var branchNode = null;

        var lastNodeIds = [];

        // loop through all the children
        for (var r = 0; r < refs.length; r++) {
            var ref = refs[r];

            if (r === 0) {
                // the first child should be a branch node
                branchNode = getBranchNode(ref);
            } else {

                /*
                 * all the children that are not the first child should be
                 * branch sequences
                 */

                // create the WISE5 nodes in this branch path
                var branchNodes = getWISE5NodesInBranchPath(ref);

                // remember the previous node ids so that we can create transitions later
                var tempPreviousNodeIds = previousNodeIds;

                var firstNodeIdInBranch = null;

                // loop through all the nodes in the branch path
                for (var b = 0; b < branchNodes.length; b++) {

                    // get a WISE5 node
                    var wise5Node = branchNodes[b];

                    var to = wise5Node.id;

                    // add the WISE5 node to the current group
                    currentGroup.ids.push(wise5Node.id);

                    if (b === 0) {
                        /*
                         * this is the first node in the branch path so we will remember it so we can
                         * create a transition later
                         */
                        firstNodeIdInBranch = wise5Node.id;
                    }

                    // loop through all the previous node ids
                    for (var p = 0; p < tempPreviousNodeIds.length; p++) {

                        // get a previous node id
                        var tempPreviousNodeId = tempPreviousNodeIds[p];

                        // get the previous node
                        var previousWISE5Node = getWISE5NodeById(tempPreviousNodeId);

                        // create a transition
                        addTransition(tempPreviousNodeId, to);

                        if (b === 0) {
                            // this is the first node in the branch path

                            /*
                             * get the transition logic from the previous node.
                             * the previous node is the branch point.
                             */
                            var transitionLogic = previousWISE5Node.transitionLogic;

                            // get the branching function
                            var branchingFunction = branchNode.branchingFunction;
                            var maxPathVisitable = branchNode.maxPathVisitable;

                            // set how to choose the path
                            transitionLogic.howToChooseAmongAvailablePaths = branchingFunction;
                            transitionLogic.whenToChoosePath = 'enterNode';

                            // set whether the student can change path
                            if (maxPathVisitable > 1) {
                                transitionLogic.canChangePath = true;
                            } else {
                                transitionLogic.canChangePath = false;
                            }

                            // set the max visitable paths
                            transitionLogic.maxPathsVisitable = maxPathVisitable;
                        }

                        /*
                         * loop through all the previous node ids. usually there will only be
                         * one previous node id and it will be the branch point.
                         *
                         * create constraints that make the nodes in the branch path not visible
                         * and not visitable until the student takes the path.
                         */
                        for (var x = 0; x < previousNodeIds.length; x++) {
                            // get the branch point node id
                            var branchPointNodeId = previousNodeIds[x];

                            // create a constraint that makes the node not visible
                            var notVisibleBranchConstraint = this.createBranchConstraint('makeThisNodeNotVisible', branchPointNodeId, firstNodeIdInBranch, to);

                            // create a constraint that makes the node not visitable
                            var notVisitableBranchConstraint = this.createBranchConstraint('makeThisNodeNotVisitable', branchPointNodeId, firstNodeIdInBranch, to);

                            // add the constraints
                            this.addWISE5Constraint(to, notVisibleBranchConstraint);
                            this.addWISE5Constraint(to, notVisitableBranchConstraint);
                        }
                    }

                    // update the previous node ids
                    tempPreviousNodeIds = [to];

                    if (b === (branchNodes.length - 1)) {
                        // remember the last node in the branch path so we can set it into the previousNodeIds later
                        lastNodeIds.push(wise5Node.id);
                    }
                }
            }
        }

        previousNodeIds = lastNodeIds;
    }
}

/**
 * Create a branch path taken constraint
 * @param constraintAction the constraint action
 * @param fromNodeId the from node id
 * @param toNodeId the to node id
 * @param targetNodeId the node id to constrain
 * @returns the constraint object
 */
function createBranchConstraint(constraintAction, fromNodeId, toNodeId, targetNodeId) {
    var branchConstraint = null;

    if (fromNodeId != null && toNodeId != null && targetNodeId != null) {

        // create the constraint action
        branchConstraint = {};
        branchConstraint.id = 'constraint' + constraintCounter;
        branchConstraint.action = constraintAction;
        branchConstraint.targetId = targetNodeId;
        branchConstraint.removalCriteria = [];

        constraintCounter++;

        // create the critera that needs to be satisfied in order to remove the constraint
        var criteria = {};
        criteria.functionName = 'branchPathTaken';
        criteria.fromNodeId = fromNodeId;
        criteria.toNodeId = toNodeId;
        branchConstraint.removalCriteria.push(criteria);
    }

    return branchConstraint;
}

/**
 * Add the WISE5 constraint
 * @param nodeId the node id
 * @param constraint the constraint object
 */
function addWISE5Constraint(nodeId, constraint) {

    var node = getWISE5NodeById(nodeId);

    if (node != null) {
        node.constraints.push(constraint);
    }
}

/**
 * Get the WISE4 branch node
 * @param nodeId the WISE4 node id
 * @returns the WISE4 branch node content
 */
function getBranchNode(nodeId) {
    var nodeFilePath = projectFolderPath + nodeId;

    var nodeContent = '';

    $.ajax({
        method: 'GET',
        url: nodeFilePath,
        async: false,
        dataType: 'json'
    }).done(function(response) {
        nodeContent = response;
    });

    return nodeContent;
}

/**
 * Get the WISE5 nodes in the branch path
 * @param sequenceId the WISE4 sequence id
 * @returns an array of WISE5 nodes that are in the branch path
 */
function getWISE5NodesInBranchPath(sequenceId) {

    var branchNodes = [];

    if (wise4Project != null && sequenceId != null) {

        // get the WISE4 sequence
        var sequence = getSequence(wise4Project, sequenceId);

        if (sequence != null) {
            var refs = sequence.refs;

            if (refs != null) {

                // loop through all the nodes in the sequence
                for (var r = 0; r < refs.length; r++) {
                    var ref = refs[r];

                    // create a WISE5 node
                    var wise5Node = createWISE5NodeFromNodeContent(ref);

                    branchNodes.push(wise5Node);
                }
            }
        }
    }

    return branchNodes;
}

function fixAssetReferences(html) {

    var fixedHTML = '';

    var regex = /['"]\.jpg['"]]/g;

    return fixedHTML;
}

/**
 * Replace WISE4 linkTo occurrences with WISE5 wiselinks
 * @param node the WISE4 node object
 * @param text the text that may contain linkTo occurrences
 * @returns the text with linkTo occurrences replaced with wiselinks
 */
function replaceLinkToWithWISELink(node, text) {

    if (text != null && text.indexOf('linkTo') != -1) {
        // the text contains a linkTo

        // pattern that matches the <a></a> that contains the linkTo
        var anchorPattern = /(<a.*?linkTo.*?<\/a>)/g;

        // find the matches in the text
        var anchorResult = text.match(anchorPattern);

        if (anchorResult != null) {

            // pattern to capture the linkTo key and link text
            var linkToPattern = /node.linkTo\(['"](.*?)['"]\).*?>(.*?)<\/a>/;

            // loop through all the linkTo occurrences
            for (var r = 0; r < anchorResult.length; r++) {

                // get an occurrence of linkTo
                var tempResult = anchorResult[r];

                // find the linkTo key and link text
                var linkToResult = tempResult.match(linkToPattern);

                if (linkToResult != null) {
                    // get the linkTo key
                    var linkToKey = linkToResult[1];

                    // get the link text
                    var linkText = linkToResult[2];

                    // get the WISE4 node id
                    var wise4NodeId = this.getWISE4NodeIdByLinkToKey(node, linkToKey);

                    // get the WISE5 node id
                    var wise5NodeId = this.getWISE5NodeIdByWISE4NodeId(wise4NodeId);

                    // create the WISE5 wiselink
                    var wise5Link = "<wiselink nodeid='" + wise5NodeId + "' linkText='" + linkText + "'/>";

                    // replace the WISE4 linkTo with the WISE5 wiselink
                    text = text.replace(tempResult, wise5Link);
                }
            }
        }
    }

    return text;
}

/**
 * Get a WISE4 node id given the link to key
 * @param node the WISE4 node object
 * @param linkToKey the link to key
 * @returns the WISE4 node id
 */
function getWISE4NodeIdByLinkToKey(node, linkToKey) {
    var nodeId = null;

    if (node != null && linkToKey != null) {

        // get the links from the node
        var links = node.links;

        if (links != null) {

            // loop through all the links
            for (var l = 0; l < links.length; l++) {
                var link = links[l];

                if (link != null) {
                    if (linkToKey === link.key) {
                        // the key matches the one we are looking for
                        nodeId = link.nodeIdentifier;
                    }
                }
            }
        }
    }

    return nodeId;
}

/**
 * Get a WISE5 node id given the WISE4 node id
 * @param wise4NodeId the WISE4 node id
 * @returns the WISE5 node id
 */
function getWISE5NodeIdByWISE4NodeId(wise4NodeId) {
    var wise5NodeId = null;

    if (wise4NodeId != null) {
        wise5NodeId = wise4IdsToWise5Ids[wise4NodeId];
    }

    return wise5NodeId;
}