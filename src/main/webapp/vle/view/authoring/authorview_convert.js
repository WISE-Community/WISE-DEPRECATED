
/**
 * Ask the user if they are sure they want to convert the project from
 * WISE4 to WISE5.
 */
View.prototype.convert = function() {

    var result = confirm('Converting this project to WISE5 will not overwrite or delete this WISE4 project. The WISE5 project will be a brand new project. You will still be able to use this WISE4 project after the project is converted.\n\nAre you sure you want to convert this project to WISE5?');

    if (result) {
        // the user answered yes so they want to convert the project to WISE5
        this.convertProjectToWISE5();
    }
};

/**
 * Convert the project to WISE5
 */
View.prototype.convertProjectToWISE5 = function() {
    this.intializeConvertVariables();

    // get the WISE4 project
    this.wise4Project = this.getProject().projectJSON();

    // get the WISE4 project folder path
    this.projectFolderPath = this.wise4ProjectBaseURL;

    // regex to find the project folder name
    var projectFolderNameRegEx = new RegExp("(\/wise)?\/curriculum\/(.*)\/");

    // try to find the project folder name
    var projectFolderNameMatch = projectFolderNameRegEx.exec(this.wise4ProjectBaseURL);

    if (projectFolderNameMatch != null) {
        this.projectFolderName = projectFolderNameMatch[2];
    }

    // parse the WISE4 project to create a WISE5 project
    this.parseWISE4Project(this.wise4Project);
};

/**
 * Initialize the variables we will be using when converting the project from
 * WISE4 to WISE5.
 */
View.prototype.intializeConvertVariables = function() {
    // the global WISE5 project
    this.wise5Project = {};

    // the global WISE4 project
    this.wise4Project = null;

    // used to generate the node ids
    this.nodeCounter = 1;

    // used to generate the group ids
    this.groupCounter = 0;

    // used to generate the constraint ids
    this.constraintCounter = 0;

    // the project file path
    this.projectFilePath = '';

    // the project folder path
    this.projectFolderPath = '';

    // holds the node ids of the previous node so that we can create transitions
    this.previousNodeIds = [];

    // the node id of the branch point
    this.branchNodeId = '';

    // holds the current group we are parsing so we can put child nodes into it
    this.currentGroup = null;

    // holds the previous group so we can reference back to it to set transitions
    this.previousGroup = null;

    // variable to turn debugging on or off
    this.test = false;

    // a mapping of WISE4 node ids to WISE5 node ids
    this.wise4IdsToWise5Ids = {};

    // a list of WISE4 ids that have been converted
    this.convertedWISE4Ids = [];
};

/**
 * Parse the WISE4 project to create the WISE5 project
 * @param wise4Project the WISE4 project
 */
View.prototype.parseWISE4Project = function(wise4Project) {

    // initialize the WISE5 project
    this.createWISE5Project();

    if (wise4Project != null) {

        // get the start point for the WISE4 project
        var startPoint = wise4Project.startPoint;

        // parse the WISE4 project
        this.parseWISE4ProjectHelper(wise4Project, startPoint);

        // set the title of the WISE5 project
        this.wise5Project.metadata.title = wise4Project.title;
    }

    // get the string representation of the WISE5 project
    var wise5ProjectString = JSON.stringify(this.wise5Project, null, 4);

    // get the WISE base url e.g. http://wise.berkeley.edu
    var wiseBaseURL = this.config.getConfigParam('wiseBaseURL');

    // get the url to make the request to convert the project
    var convertURL = wiseBaseURL + '/author/convert.html';

    // make the request to create the WISE5 project
    $.ajax({
        method: 'POST',
        url: convertURL,
        async: false,
        dataType: 'text',
        data: {
            wise4ProjectId: this.portalProjectId,
            wise5Project:wise5ProjectString
        }
    }).done(function(response) {
        if (response != null) {
            // get the new WISE5 project id
            var wise5ProjectId = parseInt(response);

            /*
             * redirect the author to the WISE5 authoring tool and load the new
             * WISE5 project
             */
            var wise5AuthoringToolURL = wiseBaseURL + '/author#!/project/' + wise5ProjectId;

            /*
             * redirect the user to the WISE5 authoring tool and load the new
             * WISE5 project
             */
            window.parent.location = wise5AuthoringToolURL;
        }
    });
}

/**
 * The helper function for parsing the WISE4 project
 * @param project the WISE4 project object
 * @param elementId the current WISE4 element id (aka node id)
 * @returns the WISE5 element (aka node or group) that has been created from the WISE4 element (aka node or group)
 */
View.prototype.parseWISE4ProjectHelper = function(project, elementId) {

    var element = null;

    if (elementId != null) {

        // try to get the sequence with the given element id
        var sequence = this.getSequence(project, elementId);

        // try to get the node with the given element id
        var node = this.getNode(project, elementId);

        if (sequence != null) {
            // the element is a sequence

            if (!this.isConvertedWISE4Id(elementId)) {
                if (this.isBranchingActivity(sequence)) {
                    // the sequence is a branching activity

                    // get the branch node id
                    this.branchNodeId = this.previousNodeIds[0];

                    // generate the branch in the WISE5 project
                    this.handleBranchActivity(sequence);
                } else {
                    // this is a regular sequence

                    // create a WISE5 group
                    var wise5Group = this.createWISE5Group(sequence);

                    // remember the previous group
                    this.previousGroup = this.currentGroup;

                    // set the new current group
                    this.currentGroup = wise5Group;

                    if (this.previousGroup != null) {
                        // create the transition from the previous group to the current group
                        this.addTransition(this.previousGroup.id, this.currentGroup.id);
                    }

                    // add the group to the array of nodes
                    this.addWISE5Node(wise5Group);

                    // loop through all the children of the sequence
                    for (var x = 0; x < sequence.refs.length; x++) {

                        // get a child id
                        var sequenceRefId = sequence.refs[x];

                        // get the child node
                        var childNode = this.parseWISE4ProjectHelper(project, sequenceRefId);

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
            }
        } else if (node != null) {
            // the element is a node

            var identifier = node.identifier;
            var ref = node.ref;

            // if (identifier != null && identifier.endsWith('.html')) {
            //     // remove the ml from html
            //     identifier = identifier.substring(0, identifier.length - 2);
            // }

            if (!this.isConvertedWISE4Id(identifier)) {
                // create the WISE5 node
                element = this.createWISE5NodeFromNodeContent(identifier, ref);

                if (element == null) {
                    // could not create WISE5 node. possible reasons: converter for step type not implemented yet
                    // console.log("could not convert: " + node.identifier);
                } else {

                    // get the element id
                    var elementId = element.id;

                    // add a mapping from the WISE4 id to WISE5 id
                    this.wise4IdsToWise5Ids[identifier] = element.id;

                    if (this.previousNodeIds.length > 0) {

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
                        for (var p = 0; p < this.previousNodeIds.length; p++) {
                            var previousNodeId = this.previousNodeIds[p];

                            // add a transition from the previous node id to the new node
                            this.addTransition(previousNodeId, elementId);
                        }

                        // set the previous node id
                        this.previousNodeIds = [elementId];
                    } else {
                        // there are no previous node ids

                        // set the previous node id
                        this.previousNodeIds = [elementId];
                    }
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
View.prototype.createRandomId = function() {
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
View.prototype.getSequence = function(project, sequenceId) {
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
View.prototype.getNode = function(project, nodeId) {
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
View.prototype.createWISE5NodeFromNodeContent = function(identifier, ref) {

    var wise5Node = null;

    // get the path to the WISE4 node content file
    var nodeFilePath = this.projectFolderPath + ref;

    var wise4Project = this.wise4Project;

    var thisView = this;

    $.ajax({
        method: 'GET',
        url: nodeFilePath,
        async: false,
        dataType: 'text'
    }).done(function(response) {

        if (response != null) {

            // get the WISE4 node
            var node = thisView.getNode(wise4Project, identifier);

            // replace linkTos with wiselinks
            var responseUpdated = thisView.replaceLinkToWithWISELink(node, response);

            // remove any usage of ./assets/ or assets/
            responseUpdated = thisView.removeAssetsFromPaths(responseUpdated);

            // create the node content object
            var nodeContent = JSON.parse(responseUpdated);

            // create the WISE5 node
            wise5Node = thisView.convertNode(node, nodeContent);
        }
    });

    this.addToConvertedWISE4Ids(identifier);

    return wise5Node;
}

/**
 * Remove assets from path strings
 * e.g.
 * ./assets/image.jpg will be converted to image.jpg
 * assets/image.jpg will be converted to image.jpg
 * @param wise4NodeJSONString the WISE4 node content string
 * @returns the WISE4 node content string with assets paths removed
 */
View.prototype.removeAssetsFromPaths = function(wise4NodeJSONString) {

    var updated = wise4NodeJSONString;

    /*
     * regex for matching an img src that contains ? params
     * for example an img src may look like this sometimes
     * <img src="assets/oxygen.png?w=50&h=50"/>
     * and we want to remove the ? and values after it so it ends up like
     * <img src="assets/oxygen.png"/>
     */
    var srcMatcher = new RegExp(/src=\\?["'](([^?"'\\]*).*?)\\?["']/, 'gi');

    // run the regex matcher
    var matchResults = srcMatcher.exec(wise4NodeJSONString);

    /*
     * run the regex matcher until it no longer finds a match.
     * the matcher maintains search state and exec can be called
     * until no more matches are found
     */
    while (matchResults != null) {

        if (matchResults.length > 2) {
            // get the match with the ?. for example assets/oxygen.png?w=50&h=50
            var matchWithQuestionMark = matchResults[1];

            // get the match without the ?. for example assets/oxygen.png
            var matchWithoutQuestionMark = matchResults[2];

            // check if the matches are different
            if (matchWithQuestionMark != matchWithoutQuestionMark) {
                /*
                 * the matches are different so we will remove the ? and
                 * everything after it
                 */
                updated = updated.replace(matchWithQuestionMark, matchWithoutQuestionMark);
            }
        }

        // search for a match again
        matchResults = srcMatcher.exec(wise4NodeJSONString);
    }

    // remove "./assets/ and replace with "
    updated = updated.replace(/"\.\/assets\//g, '"');

    // remove "/assets/ and replace with "
    updated = updated.replace(/"\/assets\//g, '"');

    // remove "assets/ and replace with "
    updated = updated.replace(/"assets\//g, '"');

    // remove './assets/ and replace with '
    updated = updated.replace(/'\.\/assets\//g, "'");

    // remove '/assets/ and replace with '
    updated = updated.replace(/'\/assets\//g, "'");

    // remove 'assets/ and replace with '
    updated = updated.replace(/'assets\//g, "'");

    // remove "/curriculum/12345/assets/ and replace it with "
    var curriculumAssetsPathDoubleQuote = '"/curriculum/[0-9]*/assets/';
    updated = updated.replace(new RegExp(curriculumAssetsPathDoubleQuote, 'gi'), '"');

    // remove '/curriculum/12345/assets/ and replace it with '
    var curriculumAssetsPathSingleQuote = "'/curriculum/[0-9]*/assets/";
    updated = updated.replace(new RegExp(curriculumAssetsPathSingleQuote, 'gi'), "'");

    return updated;
}

/**
 * Convert a WISE4 node into a WISE5 node
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns the WISE5 node
 */
View.prototype.convertNode = function(node, nodeContent) {

    var wise5Node = null;

    if (nodeContent != null) {
        var nodeType = nodeContent.type;

        if (nodeType === 'Html') {
            wise5Node = this.convertHTML(node, nodeContent);
        } else if (nodeType === 'AssessmentList') {
            wise5Node = this.convertAssessmentList(node, nodeContent);
        } else if (nodeType === 'OpenResponse') {
            wise5Node = this.convertOpenResponse(node, nodeContent);
        } else if (nodeType === 'Note') {
            wise5Node = this.convertOpenResponse(node, nodeContent);
        } else if (nodeType === 'MultipleChoice' || nodeType === 'Challenge') {
            wise5Node = this.convertMultipleChoice(node, nodeContent);
        } else if (nodeType === 'MatchSequence') {
            wise5Node = this.convertMatchSequence(node, nodeContent);
        } else if (nodeType === 'SVGDraw') {
            wise5Node = this.convertDraw(node, nodeContent);
        } else if (nodeType === 'Brainstorm') {
            wise5Node = this.convertBrainstorm(node, nodeContent);
        } else if (nodeType === 'Fillin') {
            // TODO
        } else if (nodeType === 'Sensor') {
            // TODO
        } else if (nodeType === 'Table') {
            wise5Node = this.convertTable(node, nodeContent);
        } else if (nodeType === 'IdeaBasket') {
            // TODO
        } else if (nodeType === 'ExplanationBuilder') {
            // TODO
        } else if (nodeType === 'OutsideUrl') {
            wise5Node = this.convertOutsideURL(node, nodeContent);
        } else if (nodeType === 'mysystem') {
            wise5Node = this.convertMysystem(node, nodeContent);
        } else if (nodeType === 'mysystem2') {
            wise5Node = this.convertMysystem2(node, nodeContent);
        } else if (nodeType === 'Annotator') {
            wise5Node = this.convertAnnotator(node, nodeContent);
        } else if (nodeType === 'Branching') {
            /*
             * we do not need to return a wise5Node because we don't want
             * to create a step for the branch node. the branching will
             * occur in the previous step before.
             */
            this.convertBranchNode(node, nodeContent);
        } else if (nodeType === 'PhET') {
            wise5Node = this.convertPhet(node, nodeContent);
        } else if (nodeType === 'Grapher') {
            wise5Node = this.convertGrapher(node, nodeContent);
        } else if (nodeType === 'CarGraph') {
            wise5Node = this.convertCarGraph(node, nodeContent);
        } else if (nodeType === 'WebApp') {
            wise5Node = this.convertWebApp(node, nodeContent);
        } else if (nodeType === 'Box2dModel') {
            wise5Node = this.convertBox2dModel(node, nodeContent);
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
View.prototype.createWISE5Project = function() {
    this.wise5Project.nodes = [];
    this.wise5Project.constraints = [];
    this.wise5Project.startGroupId = 'group0';
    this.wise5Project.startNodeId = 'node1';

    this.wise5Project.navigationMode = 'guided';

    this.wise5Project.layout = {
        'template': 'starmap|leftNav|rightNav',
        'studentIsOnGroupNode': 'layout3',
        'studentIsOnApplicationNode': 'layout4'
    }

    var metadata = {};
    metadata.title = '';
    this.wise5Project.metadata = metadata;
}

/**
 * Create and initialize a WISE5 group object
 * @param sequence the WISE4 sequence
 * @returns a WISE5 group object
 */
View.prototype.createWISE5Group = function(sequence) {
    var wise5Group = {};
    wise5Group.id = this.getNextGroupId();
    wise5Group.type = 'group';
    wise5Group.title = sequence.title;
    wise5Group.startId = '';
    wise5Group.ids = [];

    var transitionLogic = {};
    transitionLogic.transitions = [];
    transitionLogic.howToChooseAmongAvailablePaths = null;
    transitionLogic.whenToChoosePath = null;
    transitionLogic.canChangePath = null;
    transitionLogic.maxPathsVisitable = null;

    wise5Group.transitionLogic = transitionLogic;

    this.addToConvertedWISE4Ids(sequence.identifier);

    return wise5Group;
}

/**
 * Create and initialize a WISE5 node object
 * @returns a WISE5 node object
 */
View.prototype.createWISE5Node = function() {
    var wise5Node = {};

    wise5Node.id = this.getNextNodeId();
    wise5Node.type = 'node';
    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
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
View.prototype.getPromptFromAssessmentItem = function(nodeContent) {
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
View.prototype.convertHTML = function(node, nodeContent) {

    var wise5Node = null;

    if (nodeContent != null) {

        // get the path to the WISE4 html file
        var src = this.projectFolderPath + nodeContent.src;

        var thisView = this;

        $.ajax({
            method: 'GET',
            url: src,
            async: false,
            dataType: 'html'
        }).done(function(response) {

            // get the html
            var html = response;

            if (html != null) {

                html = thisView.removeAssetsFromPaths(html);

                // create a WISE5 node
                wise5Node = thisView.createWISE5Node();

                // set the title
                wise5Node.title = node.title;

                wise5Node.showSaveButton = false;
                wise5Node.showSubmitButton = false;
                wise5Node.components = [];

                var component = {};

                // set the component id
                component.id = thisView.createRandomId();
                component.type = 'HTML';

                // set the html
                component.html = html;

                // add the component
                wise5Node.components.push(component);

                // add the WISE5 node to the project
                thisView.addWISE5Node(wise5Node);
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
View.prototype.convertAssessmentList = function(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = this.createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    wise5Node.showSaveButton = true;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var prompt = nodeContent.prompt;

    if (prompt != null && prompt !== '') {
        // create an html component for the prompt
        var htmlPromptComponent = {};
        htmlPromptComponent.id = this.createRandomId();
        htmlPromptComponent.type = 'HTML';
        htmlPromptComponent.html = prompt;

        wise5Node.components.push(htmlPromptComponent);
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
                component.id = this.createRandomId();

                // set the prompt
                component.prompt = assessment.prompt;
                component.showSaveButton = false;
                component.showSubmitButton = false;

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
                            var choiceId = this.createRandomId();

                            // create the choice object
                            var choice = {};
                            choice.id = choiceId;
                            choice.text = tempText;
                            choice.feedback = '';

                            if (tempChoice.isCorrect) {
                                // this choice is the correct choice
                                choice.isCorrect = true;
                            } else {
                                // this choice is not the correct choice
                                choice.isCorrect = false;
                            }

                            component.choices.push(choice);
                        }
                    }
                }

                wise5Node.components.push(component);
            }
        }
    }

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 open response node into a WISE5 node with an open response component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertOpenResponse = function(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = this.createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    var prompt = this.getPromptFromAssessmentItem(nodeContent);

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};

    // set the component id
    component.id = this.createRandomId();

    component.type = 'OpenResponse';
    component.prompt = prompt;
    component.showSaveButton = true;
    component.showSubmitButton = false;

    if (nodeContent.starterSentence != null) {
        if (nodeContent.starterSentence.display == 2 &&
            nodeContent.starterSentence.sentence != null &&
            nodeContent.starterSentence.sentence != '') {

            // this component has a starter sentence
            component.starterSentence = nodeContent.starterSentence.sentence;
        }
    }

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 multiple choice node into a WISE5 node with a multiple choice component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertMultipleChoice = function(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = this.createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    // get the prompt
    var prompt = this.getPromptFromAssessmentItem(nodeContent);

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};

    // set the component id
    component.id = this.createRandomId();

    component.type = 'MultipleChoice';
    component.prompt = prompt;
    component.choices = [];
    component.showSaveButton = true;
    component.showSubmitButton = false;
    component.showFeedback = true;

    var assessmentItem = nodeContent.assessmentItem;

    if (assessmentItem != null) {

        // choice type will default to radio
        var choiceType = 'radio';

        var interaction = assessmentItem.interaction;

        var wise4ChoiceIdToWISE5ChoiceId = {};

        var responseDeclaration = assessmentItem.responseDeclaration;

        var correctResponse = null;

        if (responseDeclaration != null) {

            // get the array of correct choice ids
            correctResponse = responseDeclaration.correctResponse;
        }

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
                        wise5Choice.id = this.createRandomId();

                        // check if this choice is correct
                        var isCorrect = this.isChoiceCorrect(choice.identifier, correctResponse);

                        // set the text and feedback
                        wise5Choice.text = choice.text;
                        wise5Choice.feedback = choice.feedback;
                        wise5Choice.isCorrect = isCorrect;

                        if (isCorrect) {
                            /*
                             * there is a correct choice so we will show the
                             * save and submit button in the component
                             */
                            component.showSaveButton = true;
                            component.showSubmitButton = true;
                        }

                        // add an entry to map WISE4 choice id to WISE5 choice id
                        wise4ChoiceIdToWISE5ChoiceId[choice.identifier] = wise5Choice.id;

                        // add the WISE5 choice
                        component.choices.push(wise5Choice);
                    }
                }
            }
        }
    }

    // set the choice type
    component.choiceType = choiceType;

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Check if the choice is correct
 * @param wise4ChoiceId the WISE4 choice id
 * @param wise4CorrectResponse the WISE4 correct response array
 * @returns whether the choice is correct
 */
View.prototype.isChoiceCorrect = function(wise4ChoiceId, wise4CorrectResponse) {

    var result = false;

    if (wise4CorrectResponse != null) {
        // check if the id is in the array of correct responses
        if (wise4CorrectResponse.indexOf(wise4ChoiceId) != -1) {
            result = true;
        }
    }

    return result;
}

/**
 * Convert a WISE4 match sequence node into a WISE5 node with a match component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertMatchSequence = function(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = this.createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    // get the prompt
    var prompt = this.getPromptFromAssessmentItem(nodeContent);

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};

    // set the component id
    component.id = this.createRandomId();

    component.type = 'Match';
    component.prompt = prompt;
    component.choices = [];
    component.buckets = [];
    component.feedback = [];
    component.showSaveButton = true;
    component.showSubmitButton = false;
    component.ordered = false;

    var hasCorrectAnswer = false;

    var assessmentItem = nodeContent.assessmentItem;

    if (assessmentItem != null) {

        var interaction = assessmentItem.interaction;

        var wise4ChoiceIdToWISE5ChoiceId = {};
        var wise4BucketIdToWISE5BucketId = {};

        var ordered = false;

        if (interaction != null) {
            var choices = interaction.choices;
            var fields = interaction.fields;

            ordered = assessmentItem.interaction.ordered;

            if (ordered) {
                // the choices are ordered
                component.ordered = true;
            }

            if (choices != null) {
                // handle the choices

                // loop through all the WISE4 choices
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    if (choice != null) {
                        var wise5Choice = {};

                        // create an id for the choice
                        wise5Choice.id = this.createRandomId();

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
                        wise5Bucket.id = this.createRandomId();

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

            var wise5Choices = component.choices;
            var wise5Buckets = component.buckets;

            /*
             * create the feedback by creating all the feedback objects with default values
             * that will be populated later.
             */

            // loop through all the buckets
            for (var b = 0; b < wise5Buckets.length; b++) {
                var wise5Bucket = wise5Buckets[b];

                // create a bucket feedback
                var bucketFeedback = {};
                bucketFeedback.bucketId = wise5Bucket.id;
                bucketFeedback.choices = [];

                // loop through all the choices
                for (var c = 0; c < wise5Choices.length; c++) {
                    var wise5Choice = wise5Choices[c];

                    // create a choice feedback
                    var choiceFeedback = {};
                    choiceFeedback.choiceId = wise5Choice.id;
                    choiceFeedback.feedback = '';
                    choiceFeedback.isCorrect = false;
                    choiceFeedback.position = null;
                    choiceFeedback.incorrectPositionFeedback;

                    bucketFeedback.choices.push(choiceFeedback);
                }

                component.feedback.push(bucketFeedback);
            }
        }

        var responseDeclaration = assessmentItem.responseDeclaration;

        if (responseDeclaration != null) {
            // handle the feedback

            // get the array of feedback objects
            var correctResponses = responseDeclaration.correctResponses;

            if (correctResponses != null) {

                var feedback = component.feedback;

                // loop through all the feedback
                for (var c = 0; c < correctResponses.length; c++) {

                    // get a feedback object
                    var correctResponse = correctResponses[c];

                    if (correctResponse != null) {

                        // get the WISE5 choice id
                        var choiceId = wise4ChoiceIdToWISE5ChoiceId[correctResponse.choiceIdentifier];

                        // get the WISE5 bucket id
                        var bucketId = wise4BucketIdToWISE5BucketId[correctResponse.fieldIdentifier];

                        if (choiceId != null && bucketId != null) {

                            // get the feedback object for the given choice id and bucket id combination
                            var feedbackObject = this.getFeedbackObject(feedback, choiceId, bucketId);

                            if (feedbackObject != null) {

                                // populate the feedback object
                                feedbackObject.feedback = correctResponse.feedback;
                                feedbackObject.isCorrect = correctResponse.isCorrect;
                                feedbackObject.position = null;
                                feedbackObject.incorrectPositionFeedback = null;

                                if (ordered && correctResponse.isCorrect && !isNaN(parseInt(correctResponse.order))) {
                                    /*
                                     * the choices are ordered so we will set the position. we will
                                     * add 1 because WISE4 started counting positions at 0 where as
                                     * WISE5 starts counting positions at 1.
                                     */
                                    feedbackObject.position = parseInt(correctResponse.order) + 1;
                                }
                            }

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
        component.showSaveButton = true;
        component.showSubmitButton = true;
    }

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Get the feedback object for the choice id and bucket id combination
 * @param feedback the array of bucket feedback objects
 * @param choiceId the choice id
 * @param bucketId the bucket id
 * @returns the choice feedback object
 */
View.prototype.getFeedbackObject = function(feedback, choiceId, bucketId) {

    if (feedback != null && choiceId != null && bucketId != null) {

        // loop throgha all the buckets
        for (var f = 0; f < feedback.length; f++) {
            var bucketFeedback = feedback[f];

            if (bucketFeedback != null) {

                if (bucketId === bucketFeedback.bucketId) {
                    // we have found the bucket we are looking for

                    var choices = bucketFeedback.choices;

                    // loop througha all the choices
                    for (var c = 0; c < choices.length; c++) {

                        var choiceFeedback = choices[c];

                        if (choiceFeedback != null) {
                            if (choiceId === choiceFeedback.choiceId) {
                                // we have found the choice we are looking for
                                return choiceFeedback;
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
 * Convert a WISE4 table node into a WISE5 node with a table component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertTable = function(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = this.createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var tableComponent = {};

    // set the component id
    tableComponent.id = this.createRandomId();
    tableComponent.type = 'Table';
    tableComponent.prompt = nodeContent.prompt;
    tableComponent.showSaveButton = true;
    tableComponent.showSubmitButton = false;
    tableComponent.globalCellSize = nodeContent.globalCellSize;

    // convert the WISE4 table to a WISE5 table
    var newTableData = this.convertTableData(nodeContent.numColumns, nodeContent.numRows, nodeContent.tableData);
    tableComponent.tableData = newTableData;
    tableComponent.numRows = nodeContent.numRows;
    tableComponent.numColumns = nodeContent.numColumns;

    wise5Node.components.push(tableComponent);

    if (!nodeContent.hideEverythingBelowTable) {
        /*
         * if the WISE4 node has a textarea below the table we will
         * create an open response component
         */

        var openResponseComponent = {};

        openResponseComponent.id = this.createRandomId();
        openResponseComponent.type = 'OpenResponse';
        openResponseComponent.prompt = nodeContent.prompt2;

        wise5Node.components.push(openResponseComponent);
    }

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert the WISE4 table data into WISE5 table data
 * @param numColumns the number of columns in the table
 * @param numRows the number of rows in the table
 * @param tableData the WISE4 table data from a table step
 * @returns the table data for a WISE5 table component
 */
View.prototype.convertTableData = function(numColumns, numRows, tableData) {
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
View.prototype.convertPhet = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();

    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};

    component.id = this.createRandomId();
    component.type = 'OutsideURL';

    // set the url for the Phet model
    component.url = nodeContent.url;

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 draw node into a WISE5 node with a draw component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertDraw = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();
    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};
    component.id = this.createRandomId();
    component.type = 'Draw';
    component.prompt = nodeContent.prompt;
    component.showSaveButton = true;
    component.showSubmitButton = false;

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

    if (nodeContent.img_background != null) {
        // get the background image file path
        var imgBackground = nodeContent.img_background;

        // remove the assets part of the path
        var backgroundFileName = imgBackground.replace('assets/', '');

        // set the background image file name
        component.background = backgroundFileName;
    }

    if (true || component.background == null) {
        /*
         * we have not obtained a background yet so we will now check for the
         * svg background
         */
        if (nodeContent.svg_background != null && nodeContent.svg_background != '') {

            // get the svg background
            var svgBackground = nodeContent.svg_background;

            // regex to match the background file name in the svg
            var backgroundImageRegEx = /xlink:href=["'](assets\/)*(.*?)["']/

            // perform the match
            var match = svgBackground.match(backgroundImageRegEx);

            // get the second match group
            var backgroundFileName = match[2];

            if (backgroundFileName != null) {
                // set the background image file name
                component.background = backgroundFileName;
            }
        }
    }

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 brainstorm node into a WISE5 node with a discussion component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertBrainstorm = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();
    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};
    component.id = this.createRandomId();
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

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 annotator node into a WISE5 node with a label component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertAnnotator = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();
    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};
    component.id = this.createRandomId();
    component.type = 'Label';
    component.prompt = nodeContent.prompt;
    component.showSaveButton = true;
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

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert a WISE4 grapher node into a WISE5 node with a graph component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertGrapher = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();
    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};
    component.id = this.createRandomId();
    component.type = 'Graph';
    component.graphType = 'line';
    component.roundValuesTo = 'integer';
    component.prompt = nodeContent.prompt;
    component.showSaveButton = true;
    component.showSubmitButton = false;
    component.title = nodeContent.graphTitle;
    component.xAxis = {};
    component.xAxis.title = {};
    component.xAxis.title.text = nodeContent.graphParams.xLabel;
    component.xAxis.locked = true;
    component.xAxis.type = 'limits';

    if (nodeContent.graphParams.xmin != null) {
        component.xAxis.min = parseFloat(nodeContent.graphParams.xmin);
    }

    if (nodeContent.graphParams.xmax != null) {
        component.xAxis.max = parseFloat(nodeContent.graphParams.xmax);
    }

    component.yAxis = {};
    component.yAxis.title = {};
    component.yAxis.title.text = nodeContent.graphParams.yLabel;
    component.yAxis.locked = true;

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
            "dashStyle": "Solid",
            "marker": {
                "symbol": "square"
            },
            "regression": false,
            "regressionSettings": {
            },
            "canEdit": true,
            "type": "line"
        }
    ];

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}


/**
 * Convert a WISE4 car graph node into a WISE5 node with a graph component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertCarGraph = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();
    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    // create an html component to show the prompt
    var htmlComponent = {};
    htmlComponent.id = this.createRandomId();
    htmlComponent.type = 'HTML';
    htmlComponent.html = nodeContent.prompt;

    // create a graph component
    var graphComponent = {};
    graphComponent.id = this.createRandomId();
    graphComponent.type = 'Graph';

    // create an animation component
    var animationComponent = {};
    animationComponent.id = this.createRandomId();
    animationComponent.type = 'Animation';

    // get the ymin and ymax so we can use it later in the animation component
    var ymin = nodeContent.graphParams.ymin;
    var ymax = nodeContent.graphParams.ymax;


    // create the graph component //

    graphComponent.showSaveButton = false;
    graphComponent.showSubmitButton = false;
    graphComponent.graphType = 'line';
    graphComponent.title = nodeContent.graphTitle;
    graphComponent.width = 600;
    graphComponent.height = 250;
    graphComponent.roundValuesTo = 'integer';

    // create the x axis
    graphComponent.xAxis = {};
    graphComponent.xAxis.title = {};
    graphComponent.xAxis.title.text = nodeContent.graphParams.xLabel;
    graphComponent.xAxis.locked = true;
    graphComponent.xAxis.units = nodeContent.graphParams.xUnits;

    if (nodeContent.graphParams.xmin != null) {
        graphComponent.xAxis.min = parseFloat(nodeContent.graphParams.xmin);
    }

    if (nodeContent.graphParams.xmax != null) {
        graphComponent.xAxis.max = parseFloat(nodeContent.graphParams.xmax);
    }

    // create the y axis
    graphComponent.yAxis = {};
    graphComponent.yAxis.title = {};
    graphComponent.yAxis.title.text = nodeContent.graphParams.yLabel;
    graphComponent.yAxis.locked = true;
    graphComponent.yAxis.units = nodeContent.graphParams.yUnits;

    if (nodeContent.graphParams.ymin != null) {
        graphComponent.yAxis.min = parseFloat(nodeContent.graphParams.ymin);
    }

    if (nodeContent.graphParams.ymax != null) {
        graphComponent.yAxis.max = parseFloat(nodeContent.graphParams.ymax);
    }

    // create a series
    graphComponent.series = [
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

    /*
     * Create two connected components. One will import the student graph from
     * the previous step. Another will listen for the time from the animation
     * component to show the red vertical line while the animation plays.
     */
    var connectedComponents = [];

    // Create the connected component that will import the student graph

    var previousWorkNodeId = null;
    var previousWorkComponentId = null;

    var previousWorkNodeIds = node.previousWorkNodeIds;

    if (previousWorkNodeIds != null) {

        /*
         * Loop through all the WISE4 previous work node ids for this step.
         * There should only be one.
         */
        for (var p = 0; p < previousWorkNodeIds.length; p++) {

            var previousWorkNodeId = previousWorkNodeIds[p];

            // get the WISE5 node id
            var previousWorkWISE5NodeId = this.getWISE5NodeIdByWISE4NodeId(previousWorkNodeId);

            // get the WISE5 node
            var previousWorkWISE5Node = this.getWISE5NodeById(previousWorkWISE5NodeId);

            if (previousWorkWISE5Node != null &&
                previousWorkWISE5Node.components != null &&
                previousWorkWISE5Node.components.length > 0) {

                // get the first component
                var tempComponent = previousWorkWISE5Node.components[0];

                if (tempComponent != null) {

                    if (tempComponent) {

                        // create the connected component
                        var previousWorkConnectedComponent = {};
                        previousWorkConnectedComponent.nodeId = previousWorkWISE5Node.id;
                        previousWorkConnectedComponent.componentId = tempComponent.id;
                        previousWorkConnectedComponent.type = 'showWork';
                        connectedComponents.push(previousWorkConnectedComponent);

                        /*
                         * remember the node id and component id so we can use
                         * them later when we are creating the dynamic animation
                         * object
                         */
                        previousWorkNodeId = previousWorkWISE5Node.id;
                        previousWorkComponentId = tempComponent.id;
                    }
                }
            }
        }
    }

    /*
     * Create the connected component that will listen for the time from the
     * animation component
     */
    var connectedComponent = {};
    connectedComponent.nodeId = wise5Node.id;
    connectedComponent.componentId = animationComponent.id;
    connectedComponent.updateOn = 'change';
    connectedComponents.push(connectedComponent);

    // set the connected components into the graph component
    graphComponent.connectedComponents = connectedComponents;


    // create the animation component //

    animationComponent.showSaveButton = false;
    animationComponent.showSubmitButton = false;

    /*
     * guess the with and height of the svg div. Ideally we would match the
     * width with the width of the background image but that would require
     * some synchronization.
     */
    animationComponent.widthInPixels = 800;
    animationComponent.heightInPixels = 200;

    // set the width and height in units
    animationComponent.widthInUnits = parseInt(ymax) + 3;
    animationComponent.heightInUnits = 20;

    // set the data origin location
    animationComponent.dataXOriginInPixels = 0;
    animationComponent.dataYOriginInPixels = 90;

    // set the coordinate system
    animationComponent.coordinateSystem = 'screen';

    // create the objects we will display in the svg div
    animationComponent.objects = [];

    // get the background image filename
    var pathBackgroundImage = nodeContent.pathBackgroundImage ? nodeContent.pathBackgroundImage : '';
    pathBackgroundImage = pathBackgroundImage.replace('assets/', '');

    // create the background image object
    var backgroundObject = {};
    backgroundObject.id = this.createRandomId();
    backgroundObject.type = 'image';
    backgroundObject.image = pathBackgroundImage;
    backgroundObject.pixelX = 0;
    backgroundObject.pixelY = 90;
    animationComponent.objects.push(backgroundObject);

    // calcualte the tick spacing and tick size
    var tickSpacing = nodeContent.tickSpacing;
    var tickSize = parseInt(700 / (nodeContent.graphParams.ymax / tickSpacing));

    // handle the static images
    var staticImages = nodeContent.staticImages;

    if (staticImages != null) {

        // loop through all the static images
        for (var s = 0; s < staticImages.length; s++) {
            var staticImage = staticImages[s];

            if (staticImage != null) {
                var id = staticImage.id;
                var label = staticImage.label;
                var tickIndex = staticImage.tickIndex;
                var img = staticImage.img;
                img = img.replace('assets/', '');

                // set the x location
                var left = parseInt((tickIndex / tickSpacing) * tickSize);

                // set the image object
                var staticImageObject = {};
                staticImageObject.id = this.createRandomId();
                staticImageObject.type = 'image';
                staticImageObject.image = img;
                staticImageObject.pixelX = left;
                staticImageObject.pixelY = 25;

                // set the text label object for the image
                var staticImageTextObject = {};
                staticImageTextObject.id = this.createRandomId();
                staticImageTextObject.type = 'text';
                staticImageTextObject.text = label;
                staticImageTextObject.pixelX = left;
                staticImageTextObject.pixelY = 0;

                animationComponent.objects.push(staticImageObject);
                animationComponent.objects.push(staticImageTextObject);
            }
        }
    }

    // handle the tick label objects that will be displayed in the svg div
    var tickValues = nodeContent.tickValues;

    if (tickValues == null || tickValues.length == 0) {

        // tick values are not explicitly defined so we will generate them
        for (var i = parseInt(ymin); i <= ymax; i += tickSpacing) {
            var tickPosition = parseInt((i / tickSpacing) * tickSize);

            // create the tick text object
            var tickObject = {};
            tickObject.id = this.createRandomId();
            tickObject.type = 'text';
            tickObject.text = i + '';
            tickObject.pixelX = tickPosition;
            tickObject.pixelY = 60;
            animationComponent.objects.push(tickObject);
        }
    } else {
        // tick values are defined

        // loop through all the tick values
        for (var t = 0; t < tickValues.length; t++) {
            var tickValue = tickValues[t];

            // get the x location
            var tick = parseInt((tickValue / tickSpacing) * tickSize);

            // create the tick text object
            var tickObject = {};
            tickObject.id = this.createRandomId();
            tickObject.type = 'text';
            tickObject.text = tickValue + '';
            tickObject.pixelX = tick;
            tickObject.pixelY = 60;

            animationComponent.objects.push(tickObject);
        }
    }

    // handle the correct image objects that show the correct movement
    var expectedResults = nodeContent.expectedResults;

    if (expectedResults != null) {

        // loop through all the expected results
        for (var e = 0; e < expectedResults.length; e++) {
            var expectedResult = expectedResults[e];

            if (expectedResult != null) {

                // get the filename of the correct image
                var filename = this.getDynamicImageFilenameById(expectedResult.id, nodeContent.dynamicImages);

                if (filename != null) {
                    filename = filename.replace('.png', '-correct.png');
                }

                // create the image object for the correct image
                var expectedResultObject = {};
                expectedResultObject.id = this.createRandomId();
                expectedResultObject.type = 'image';
                expectedResultObject.image = filename;
                expectedResultObject.dataX = 0;
                expectedResultObject.dataY = 0;
                expectedResultObject.data = [];

                // generate the correct data points
                var expectedPoints = expectedResult.expectedPoints;

                if (expectedPoints != null) {
                    for (var ep = 0; ep < expectedPoints.length; ep++) {
                        var expectedPoint = expectedPoints[ep];

                        if (expectedPoint != null) {
                            var x = expectedPoint.x;
                            var y = expectedPoint.y;

                            var dataPoint = {};
                            dataPoint.t = x;
                            dataPoint.x = y;

                            expectedResultObject.data.push(dataPoint);
                        }
                    }
                }

                animationComponent.objects.push(expectedResultObject);
            }
        }
    }

    // handle the student image objects
    var dynamicImages = nodeContent.dynamicImages;

    if (dynamicImages != null) {

        // loop through all the images that will be controlled by the student data
        for (var d = 0; d < dynamicImages.length; d++) {
            var dynamicImage = dynamicImages[d];

            if (dynamicImage != null) {

                // get the filename of the image
                var img = dynamicImage.img;
                img = img.replace('assets/', '');

                // create the image object for the student controlled image
                var dynamicImageObject = {};
                dynamicImageObject.id = this.createRandomId();
                dynamicImageObject.type = 'image';
                dynamicImageObject.image = img;
                dynamicImageObject.dataX = 0;
                dynamicImageObject.dataY = 0;

                if (previousWorkNodeId != null && previousWorkComponentId != null) {
                    // we are getting the student data from a previous step

                    /*
                     * create the data source which specifies to get the data
                     * for this object from another component
                     */
                    var dataSource = {};
                    dataSource.nodeId = previousWorkNodeId;
                    dataSource.componentId = previousWorkComponentId;
                    dataSource.trialIndex = 0;
                    dataSource.seriesIndex = 0;
                    dataSource.tColumnIndex = 0;
                    dataSource.xColumnIndex = 1;

                    dynamicImageObject.dataSource = dataSource;
                }

                if (dynamicImage.width != null && dynamicImage.width != '' &&
                    dynamicImage.height != null && dynamicImage.height != '') {

                    dynamicImageObject.width = dynamicImage.width;
                    dynamicImageObject.height = dynamicImage.height;
                }

                animationComponent.objects.push(dynamicImageObject);
            }
        }
    }

    // add the 3 components
    wise5Node.components.push(htmlComponent);
    wise5Node.components.push(graphComponent);
    wise5Node.components.push(animationComponent);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Get a dynamic image filename by id
 * @param id the WISE4 id of the dynamic image object
 * @param dynamicImages an array of WISE4 dynamic image objects from a cargraph
 * step
 */
View.prototype.getDynamicImageFilenameById = function(id, dynamicImages) {

    if (id != null && dynamicImages != null) {

        // loop through all the dynamic images
        for (var d = 0; d < dynamicImages.length; d++) {
            var dynamicImage = dynamicImages[d];

            if (dynamicImage != null) {
                if (dynamicImage.id == id) {
                    // we have found the image with the id we want
                    return dynamicImage.img;
                }
            }
        }
    }

    return null;
}

/**
 * Convert a WISE4 outside url node into a WISE5 node with an outside url component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertOutsideURL = function(node, nodeContent) {

    // create a WISE5 node
    var wise5Node = this.createWISE5Node();

    // set the title
    wise5Node.title = node.title;

    wise5Node.components = [];

    var component = {};

    // set the component id
    component.id = this.createRandomId();

    component.type = 'OutsideURL';
    component.url = nodeContent.url;

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert the WISE4 Mysystem node into a WISE5 node with an empty
 * embedded component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertMysystem = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();

    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};

    component.id = this.createRandomId();
    component.type = 'Embedded';
    component.showSaveButton = false;
    component.showSubmitButton = false;

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert the WISE4 Mysystem2 node into a WISE5 node with an Concept Map component.
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertMysystem2 = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();
    wise5Node.title = node.title;
    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};
    component.id = this.createRandomId();
    component.type = 'ConceptMap';
    component.showSaveButton = true;
    component.showSubmitButton = true;
    component.prompt = nodeContent.prompt;
    component.width = 800;
    component.height = 600;
    component.nodes = [];
    component.links = [];
    component.rules = [];
    component.customRuleEvaluator = '';
    component.showAutoScore = false;
    component.showAutoFeedback = true;
    component.linksTitle = 'Energy Type';
    component.starterConceptMap = null;
    component.background = nodeContent.backgroundImage;
    if (nodeContent.backgroundImageScaling === true) {
      component.stretchBackground = true;
    } else {
      component.stretchBackground = false;
    }
    this.addNodesToConceptMap(nodeContent, component);
    this.addLinksToConceptMap(nodeContent, component);
    this.addRulesToConceptMap(nodeContent, component);
    this.addCustomRuleEvaluatorToConceptMap(nodeContent, component);

    wise5Node.components.push(component);
    this.addWISE5Node(wise5Node);
    return wise5Node;
}

/**
 * Generate the Concept Map nodes and add them to the component.
 * @param nodeContent the WISE4 node content
 * @param component the WISE5 Concept Map component
 */
View.prototype.addNodesToConceptMap = function(nodeContent, component) {
  var nodeCounter = 1;
  var modules = nodeContent.modules;
  if (modules != null) {
    for (var n = 0; n < modules.length; n++) {
      var module = modules[n];
      var node = {
        id: 'node' + nodeCounter,
        label: module.name,
        fileName: module.image,
        width: 100,
        height: 100
      };
      component.nodes.push(node);
      nodeCounter++;
    }
  }
}

/**
 * Generate the Concept Map links and add them to the component.
 * @param nodeContent the WISE4 node content
 * @param component the WISE5 Concept Map component
 */
View.prototype.addLinksToConceptMap = function(nodeContent, component) {
  var linkCounter = 1;
  var energyTypes = nodeContent.energy_types;
  if (energyTypes != null) {
    for (var l = 0; l < energyTypes.length; l++) {
      var energyType = energyTypes[l];
      var link = {
        id: 'link' + linkCounter,
        label: energyType.label,
        color: energyType.color
      };
      component.links.push(link);
      linkCounter++;
    }
  }
}

/**
 * Generate the Concept Map rules and add them to the component.
 * @param nodeContent the WISE4 node content
 * @param component the WISE5 Concept Map component
 */
View.prototype.addRulesToConceptMap = function(nodeContent, component) {
  var diagramRules = nodeContent.diagram_rules;
  if (diagramRules != null) {
    for (var r = 0; r < diagramRules.length; r++) {
      var diagramRule = diagramRules[r];
      var rule = {
        name: diagramRule.name
      }
      rule.nodeLabel = diagramRule.type;
      if (diagramRule.hasLink) {
        rule.type = 'link';
        rule.otherNodeLabel = diagramRule.otherNodeType;
      } else {
        rule.type = 'node';
      }
      rule.categories = [];
      rule.comparison = diagramRule.comparison;
      rule.number = parseInt(diagramRule.number);
      rule.linkLabel = diagramRule.energyType;
      if (diagramRule.not === true) {
        rule.not = true;
      } else {
        rule.not = false;
      }
      component.rules.push(rule);
    }
  }
}

/**
 * Generate the Concept Map custom rule evaluator and add them to the component.
 * @param nodeContent the WISE4 node content
 * @param component the WISE5 Concept Map component
 */
View.prototype.addCustomRuleEvaluatorToConceptMap = function(nodeContent, component) {
  var feedbackRules = nodeContent.feedbackRules;
  if (feedbackRules != null) {
    var updatedFeedbackRules = feedbackRules;
    /*
     * Move the MySystemImages/ from the img src to the file name. We need to do this because
     * of how WISE5 automatically prepends the curriculum folder path to asset file references
     * in the content. If we didn't do this, WISE5 would try to look up the file at a bad path.
     *
     * Bad Path
     * http://wise.berkeley.edu/MySystemImages/curriculum/290/assets/f_Sun_solar_Surface_miss_ki.png
     *
     * Good Path
     * http://wise.berkeley.edu/curriculum/290/assets/MySystemImages/f_Sun_solar_Surface_miss_ki.png
     *
     * Code Before Fix
     * var f_html_mid = " along the left menu for help.</span><img src='MySystemImages/";
     * var f_Sun_solar_Surface_miss = f_html_mid + "f_Sun_solar_Surface_miss_ki.png" + f_html_end;
     *
     * Code After Fix
     * var f_html_mid = " along the left menu for help.</span><img src='";
     * var f_Sun_solar_Surface_miss = f_html_mid + "MySystemImages/f_Sun_solar_Surface_miss_ki.png" + f_html_end;
     */
    updatedFeedbackRules = updatedFeedbackRules.replace(/MySystemImages\//g, '');
    updatedFeedbackRules = updatedFeedbackRules.replace(/"(.*?\.png)"/g,
      function(group0, group1) {
        return '"MySystemImages/' + group1 + '"';
      });

    /*
     * We only have the functions any() and all() in WISE5 so we will change these function names
     * to use them.
     */
    updatedFeedbackRules = updatedFeedbackRules.replace(/none\(/g, '!any(');
    updatedFeedbackRules = updatedFeedbackRules.replace(/not_all\(/g, '!all(');

    /*
     * We display feedback in a different way in WISE5 so we don't need to use the feedback() function.
     * Change the feedback() call to console.log() for the sake of simplicity.
     */
    updatedFeedbackRules = updatedFeedbackRules.replace(/feedback\(/g, 'console.log(');

    // Insert the WISE5 way of handling the score and feedback.
    updatedFeedbackRules += '\n';
    updatedFeedbackRules += 'var result = {};\n';
    updatedFeedbackRules += 'result.score = my_score;\n';
    updatedFeedbackRules += 'result.feedback = my_feedback;\n';
    updatedFeedbackRules += 'setResult(result);\n';
    component.customRuleEvaluator = updatedFeedbackRules;
  }
}

/**
 * Convert the WISE4 WebApp node into a WISE5 node with an embedded component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertWebApp = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();

    wise5Node.title = node.title;

    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};

    component.id = this.createRandomId();
    component.type = 'Embedded';
    component.showSaveButton = false;
    component.showSubmitButton = false;
    component.url = nodeContent.url;

    wise5Node.components.push(component);

    // add the WISE5 node to the project
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Convert the Box2dModel node into a WISE5 node with an embedded component
 * @param node the WISE4 node
 * @param nodeContent the WISE4 node content
 * @returns a WISE5 node
 */
View.prototype.convertBox2dModel = function(node, nodeContent) {
    var wise5Node = this.createWISE5Node();
    wise5Node.title = node.title;
    wise5Node.showSaveButton = false;
    wise5Node.showSubmitButton = false;
    wise5Node.components = [];

    var component = {};
    component.id = this.createRandomId();
    component.type = 'Embedded';
    component.url = 'Box-2D-Model/box2dModel.html';
    component.height = 1600;
    component.parameters = nodeContent;

    wise5Node.components.push(component);
    this.addWISE5Node(wise5Node);

    return wise5Node;
}

/**
 * Get the next node id that is available
 * @returns a node id string
 */
View.prototype.getNextNodeId = function() {
    var nodeId = 'node' + this.nodeCounter;

    this.nodeCounter++;

    return nodeId;
}

/**
 * Get the next group id that is available
 * @returns a group id string
 */
View.prototype.getNextGroupId = function() {
    var groupId = 'group' + this.groupCounter;

    this.groupCounter++;

    return groupId;
}

/**
 * Add a WISE5 node to the WISE5 project
 * @param wise5Node the WISE5 node
 */
View.prototype.addWISE5Node = function(wise5Node) {
    this.wise5Project.nodes.push(wise5Node);
}

/**
 * Add a transition
 * @param fromNodeId the from node id
 * @param toNodeId the to node id
 * @param criteriaArray (optional) the criteria that needs to be satisifed
 * in order for the student to be able to traverse this transition
 */
View.prototype.addTransition = function(fromNodeId, toNodeId, criteriaArray) {

    // get the from node
    var node = this.getWISE5NodeById(fromNodeId);

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
View.prototype.getWISE5NodeById = function(nodeId) {
    var node = null;

    if (nodeId != null) {
        var nodes = this.wise5Project.nodes;

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
View.prototype.isBranchingActivity = function(sequence) {
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
 * Convert a branch node
 * @param node the WISE4 node from the project file
 * @param nodeContent the WISE4 step content
 */
View.prototype.convertBranchNode = function(node, nodeContent) {

    if (node != null) {

        // get all the paths in the branch
        var paths = nodeContent.paths;

        var lastNodeIds = [];

        // loop through all the paths
        for (var p = 0; p < paths.length; p++) {

            // get a path
            var path = paths[p];

            if (path != null) {

                // get the sequence id of the path
                var sequenceRef = path.sequenceRef;

                // create the branch path
                this.createBranchPath(nodeContent, sequenceRef, lastNodeIds);
            }
        }

        this.previousNodeIds = lastNodeIds;
    }
};

/**
 * Create a WISE5 branch from the WISE4 branch
 * @param sequence the WISE4 branch sequence
 */
View.prototype.handleBranchActivity = function(sequence) {

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
                branchNode = this.getBranchNode(ref);
            } else {

                /*
                 * all the children that are not the first child should be
                 * branch sequences
                 */

                 this.createBranchPath(branchNode, ref, lastNodeIds);
            }
        }

        this.previousNodeIds = lastNodeIds;
    }
}

/**
 * Create a branch path
 * @param branchNode the WISE4 branch node content
 * @param sequenceRef the sequence id of the path
 * @param lastNodeIds we will put the last node id in the path into this array
 */
View.prototype.createBranchPath = function(branchNode, sequenceRef, lastNodeIds) {

    if (sequenceRef != null) {

        // create the WISE5 nodes in this branch path
        var branchNodes = this.getWISE5NodesInBranchPath(sequenceRef);

        // remember the previous node ids so that we can create transitions later
        var tempPreviousNodeIds = this.previousNodeIds;

        var firstNodeIdInBranch = null;

        // loop through all the nodes in the branch path
        for (var b = 0; b < branchNodes.length; b++) {

            // get a WISE5 node
            var wise5Node = branchNodes[b];

            if (wise5Node != null) {
                var to = wise5Node.id;

                // add the WISE5 node to the current group
                this.currentGroup.ids.push(wise5Node.id);

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
                    var previousWISE5Node = this.getWISE5NodeById(tempPreviousNodeId);

                    // create a transition
                    this.addTransition(tempPreviousNodeId, to);

                    if (b === 0) {
                        // this is the first node in the branch path

                        /*
                         * get the transition logic from the previous node.
                         * the previous node is the branch point.
                         */
                        var transitionLogic = previousWISE5Node.transitionLogic;

                        // get the branching function
                        var branchingFunction = branchNode.branchingFunction;
                        var branchingFunctionParams = branchNode.branchingFunctionParams;
                        var maxPathVisitable = branchNode.maxPathVisitable;

                        if (branchingFunction == 'mod') {
                            branchingFunction = 'workgroupId';
                        }

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
                    for (var x = 0; x < this.previousNodeIds.length; x++) {
                        // get the branch point node id
                        var branchPointNodeId = this.previousNodeIds[x];

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

    /*
     * remember that we have already converted this sequence so we don't
     * convert it again later
     */
    this.addToConvertedWISE4Ids(sequenceRef);

    return lastNodeIds;
}

/**
 * Create a branch path taken constraint
 * @param constraintAction the constraint action
 * @param fromNodeId the from node id
 * @param toNodeId the to node id
 * @param targetNodeId the node id to constrain
 * @returns the constraint object
 */
View.prototype.createBranchConstraint = function(constraintAction, fromNodeId, toNodeId, targetNodeId) {
    var branchConstraint = null;

    if (fromNodeId != null && toNodeId != null && targetNodeId != null) {

        // create the constraint action
        branchConstraint = {};
        branchConstraint.id = 'constraint' + this.constraintCounter;
        branchConstraint.action = constraintAction;
        branchConstraint.targetId = targetNodeId;
        branchConstraint.removalCriteria = [];

        this.constraintCounter++;

        // create the critera that needs to be satisfied in order to remove the constraint
        var criteria = {};
        criteria.name = 'branchPathTaken';

        // create the params for the criteria
        var params = {};
        params.fromNodeId = fromNodeId;
        params.toNodeId = toNodeId;
        criteria.params = params;

        branchConstraint.removalCriteria.push(criteria);
    }

    return branchConstraint;
}

/**
 * Add the WISE5 constraint
 * @param nodeId the node id
 * @param constraint the constraint object
 */
View.prototype.addWISE5Constraint = function(nodeId, constraint) {

    var node = this.getWISE5NodeById(nodeId);

    if (node != null) {
        node.constraints.push(constraint);
    }
}

/**
 * Get the WISE4 branch node
 * @param nodeId the WISE4 node id
 * @returns the WISE4 branch node content
 */
View.prototype.getBranchNode = function(nodeId) {
    var nodeFilePath = this.projectFolderPath + nodeId;

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
View.prototype.getWISE5NodesInBranchPath = function(sequenceId) {

    var branchNodes = [];

    if (this.wise4Project != null && sequenceId != null) {

        // get the WISE4 sequence
        var sequence = this.getSequence(this.wise4Project, sequenceId);

        if (sequence != null) {
            var refs = sequence.refs;

            if (refs != null) {

                // loop through all the nodes in the sequence
                for (var r = 0; r < refs.length; r++) {
                    var ref = refs[r];

                    // try to get the node
                    var node = this.getNode(this.wise4Project, ref);

                    if (node == null) {
                        /*
                         * we were unable to get the node most likely because
                         * the ref ends in .ht and the identifier should actually
                         * end in .html so we will try to get the node ending
                         * with .html
                         */
                        node = this.getNode(this.wise4Project, ref + "ml");
                    }

                    // get the identifier
                    var identifier = node.identifier;
                    ref = node.ref;

                    if (!this.isConvertedWISE4Id(identifier)) {
                        // create a WISE5 node
                        var wise5Node = this.createWISE5NodeFromNodeContent(identifier, ref);

                        branchNodes.push(wise5Node);
                    }
                }
            }
        }
    }

    return branchNodes;
}

View.prototype.fixAssetReferences = function(html) {

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
View.prototype.replaceLinkToWithWISELink = function(node, text) {

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
                    var wise5Link = "<wiselink type='link' node-id='" + wise5NodeId + "' link-text='" + linkText + "'/>";

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
View.prototype.getWISE4NodeIdByLinkToKey = function(node, linkToKey) {
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
View.prototype.getWISE5NodeIdByWISE4NodeId = function(wise4NodeId) {
    var wise5NodeId = null;

    if (wise4NodeId != null) {
        wise5NodeId = this.wise4IdsToWise5Ids[wise4NodeId];
    }

    return wise5NodeId;
}

/**
 * Add a WISE4 id to the converted WISE4 ids array
 */
View.prototype.addToConvertedWISE4Ids = function(wise4Id) {
    this.convertedWISE4Ids.push(wise4Id);
}

/**
 * Check if a WISE4 id has been converted yet
 * @param wise4Id the id to check
 * @returns whether the WISE4 id has been converted yet
 */
View.prototype.isConvertedWISE4Id = function(wise4Id) {

    var result = false;

    if (wise4Id != null) {
        if (this.convertedWISE4Ids.indexOf(wise4Id) != -1) {
            result = true;
        }
    }

    return result;
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_convert.js');
};
