
var wise5Project = {};
var wise4Project = null;

var nodeCounter = 1;
var groupCounter = 0;
var transitionCounter = 1;
var constraintCounter = 0;

var nodeX = 50;
var nodeY = 140;

var groupX = 150;
var groupY = 150;

var projectFilePath = '';
var projectFolderPath = '';

var previousNodeIds = [];
var branchNodeId = '';

var currentGroup = null;

function convert() {
    wise5Project = {};
    wise4Project = null;

    nodeCounter = 1;
    groupCounter = 0;
    transitionCounter = 1;
    constraintCounter = 0;

    nodeX = 50;
    nodeY = 140;

    groupX = 150;
    groupY = 150;

    projectFilePath = $('#projectFilePathInput').val();
    //console.log();

    projectFolderPath = projectFilePath.substring(0, projectFilePath.lastIndexOf('/') + 1);

    $.ajax({
        method: 'GET',
        url: projectFilePath
    }).done(function(response) {
        //console.log(response);
        wise4Project = response;

        var wise4ProjectString = JSON.stringify(wise4Project, null, 3);

        $('#wise4ProjectFile').html(wise4ProjectString);

        parseWISE4Project(wise4Project);
    });
};

function parseWISE4Project(project) {
    //console.log('parseWISE4Project');

    createWISE5Project();

    if (project != null) {
        var nodes = project.nodes;
        var sequences = project.sequences;
        var startPoint = project.startPoint;

        var startSequence = getSequence(project, startPoint);

        parseWISE4ProjectHelper(project, startPoint);
    }

    var wise5ProjectString = JSON.stringify(wise5Project, null, 3);

    $('#wise5ProjectFile').html(wise5ProjectString);
    console.log(wise5ProjectString);
};

function parseWISE4ProjectHelper(project, elementId) {

    var element = null;

    if (elementId != null) {

        var sequence = getSequence(project, elementId);

        var node = getNode(project, elementId);

        if (sequence != null) {
            //console.log(sequence.identifier);

            if (isBranchingActivity(sequence)) {
                branchNodeId = previousNodeIds[0];
                handleBranchActivity(sequence);
            } else {
                var wise5Group = createWISE5Group(sequence);

                currentGroup = wise5Group;

                addWISE5Group(wise5Group);

                for (var x = 0; x < sequence.refs.length; x++) {
                    var sequenceRefId = sequence.refs[x];

                    var childNode = parseWISE4ProjectHelper(project, sequenceRefId);

                    //console.log('childNode=' + childNode);

                    if (childNode != null) {
                        wise5Group.ids.push(childNode.id);

                        if (wise5Group.startId === '') {
                            wise5Group.startId = childNode.id;
                        }
                    }
                }

                element = wise5Group;
            }
        } else if (node != null) {
            //console.log(node.identifier);
            element = createWISE5NodeFromNodeContent(node.identifier);

            if (previousNodeIds != '') {
                var to = element.id;

                for (var p = 0; p < previousNodeIds.length; p++) {
                    var previousNodeId = previousNodeIds[p];

                    // add a transition from the previous node id to the new node

                    var previousWISE5Node = getWISE5NodeById(previousNodeId);

                    addTransition(previousNodeId, to);

                    /*
                    if (b === 0) {
                        var branchingFunction = branchNode.branchingFunction;
                        var maxPathVisitable = branchNode.maxPathVisitable;

                        previousWISE5Node.howToChooseAmongAvailablePaths = branchingFunction;
                        previousWISE5Node.whenToChoosePath = 'enterFromNode';

                        if (maxPathVisitable > 1) {
                            previousWISE5Node.canChangePath = true;
                        } else {
                            previousWISE5Node.canChangePath = false;
                        }

                        previousWISE5Node.maxPathsVisitable = maxPathVisitable;
                    }
                    */

                    //previousNodeIds = [to];

                    /*
                    var transition = getOrCreateWISE5Transition(previousNodeId);

                    if (transition != null) {

                        var toObject = {};
                        toObject.to = to;

                        addToTransition(previousNodeId, toObject);
                    }
                    */

                    /*
                    var from = previousNodeId;
                    var to = element.id;
                    var wise5Transition = createWISE5Transition(from, to);
                    addWISE5Transition(wise5Transition);
                    previousNodeIds = [to];
                    */
                }

                previousNodeIds = [to];
            } else {
                previousNodeIds = [element.id];
            }
        }
    }

    return element;
};

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
};

function getSequence(project, sequenceId) {
    var sequence = null;

    if (project != null && sequenceId != null) {
        var sequences = project.sequences;

        for (var s = 0; s < sequences.length; s++) {
            var tempSequence = sequences[s];

            if (tempSequence != null) {
                var identifier = tempSequence.identifier;

                if (sequenceId === identifier) {
                    sequence = tempSequence;
                    break;
                }
            }
        }
    }

    return sequence;
};

function getNode(project, nodeId) {
    var node = null;

    if (project != null && nodeId != null) {
        var nodes = project.nodes;

        for (var n = 0; n < nodes.length; n++) {
            var tempNode = nodes[n];

            if (tempNode != null) {
                var identifier = tempNode.identifier;

                if (nodeId === identifier) {
                    node = tempNode;
                    break;
                }
            }
        }
    }

    return node;
};

function createWISE5NodeFromNodeContent(identifier) {

    var wise5Node = null;
    var nodeFilePath = projectFolderPath + identifier;

    $.ajax({
        method: 'GET',
        url: nodeFilePath,
        async: false,
        dataType: 'json'
    }).done(function(response) {
        var nodeContent = response;

        if (nodeContent != null) {
            //var nodeType = nodeContent.type;

            var node = getNode(wise4Project, identifier);
            wise5Node = convertNode(node, nodeContent);
        }
    });

    return wise5Node;
};

function convertNode(node, nodeContent) {

    var wise5Node = null;

    if (nodeContent != null) {
        var nodeType = nodeContent.type;
        console.log(nodeType);
        if (nodeType === 'Html') {
            wise5Node = convertHTML(node, nodeContent);
            console.log('[x]');
        } else if (nodeType === 'AssessmentList') {
            wise5Node = convertAssessmentList(node, nodeContent);
            console.log('[x]');
        } else if (nodeType === 'OpenResponse') {
            wise5Node = convertOpenResponse(node, nodeContent);
            console.log('[x]');
        } else if (nodeType === 'Note') {

        } else if (nodeType === 'MultipleChoice' || nodeType === 'Challenge') {

        } else if (nodeType === 'MatchSequence') {

        } else if (nodeType === 'SVGDraw') {
            wise5Node = convertDraw(node, nodeContent);
            console.log('[x]');
        } else if (nodeType === 'Brainstorm') {
            wise5Node = convertBrainstorm(node, nodeContent);
            console.log('[x]');
        } else if (nodeType === 'Fillin') {

        } else if (nodeType === 'Sensor') {

        } else if (nodeType === 'Table') {
            wise5Node = convertTable(node, nodeContent);
            console.log('[x]');
        } else if (nodeType === 'IdeaBasket') {

        } else if (nodeType === 'ExplanationBuilder') {

        } else if (nodeType === 'OutsideUrl') {

        } else if (nodeType === 'Mysystem2') {

        } else if (nodeType === 'Annotator') {
            wise5Node = convertAnnotator(node, nodeContent);
        } else if (nodeType === 'Branching') {

        } else if (nodeType === 'PhET') {
            wise5Node = convertPhet(node, nodeContent);
            console.log('[x]');
        }
    }

    return wise5Node;
};

function createWISE5Project() {
    wise5Project.nodes = [];
    //wise5Project.transitions = [];
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
};

function createWISE5Group(sequence) {
    var wise5Group = {};
    wise5Group.id = getNextGroupId();
    wise5Group.type = 'group';
    wise5Group.title = sequence.title;
    wise5Group.x = getNextGroupX();
    wise5Group.y = getNextGroupY();
    wise5Group.r = 20;
    wise5Group.startId = '';
    wise5Group.ids = [];

    return wise5Group;
};

function createWISE5Node() {
    var wise5Node = {};

    wise5Node.id = getNextNodeId();
    wise5Node.type = 'node';
    wise5Node.x = getNextNodeX();
    wise5Node.y = getNextNodeY();
    wise5Node.r = 20;
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
};

function convertHTML(node, nodeContent) {

    var wise5Node = null;

    if (nodeContent != null) {

        var src = projectFolderPath + nodeContent.src;
        //console.log('src=' + src);
        $.ajax({
            method: 'GET',
            url: src,
            async: false,
            dataType: 'html'
        }).done(function(response) {
            var html = response;
            //console.log(response);
            //console.log(html);

            //var wise4ProjectString = JSON.stringify(response, null, 3);

            //$('#wise4ProjectFile').html(wise4ProjectString);

            //parseWISE4Project(response);

            if (html != null) {
                //var nodeType = nodeContent.type;

                //var node = getNode(wise4Project, identifier);
                //convertNode(node, nodeContent);

                wise5Node = createWISE5Node();

                wise5Node.title = node.title;
                var content = {};

                content.prompt = nodeContent.prompt;
                content.components = [];

                var component = {};

                component.id = createRandomId();
                component.componentType = 'HTML';
                //html = '<html>hello</html>';
                //html = html.replace(/\\\\n/g, '');
                //html = html.replace(/\\\\r/g, '');
                //component.html = escape(html);
                //console.log(html);

                //html = html.replace(/"/g, '\\"');
                //html = html.replace(/\//g, '\\/');
                //html = '<script type="text/javascript" src="http://getconnected.southwestwifi.com/unb/jqr44-1.8.3.js"></script>';

                //component.html = html.replace(/"/g, 'x');
                //component.html = html.substring(0, html.indexOf('"') - 1);
                //component.html = html.substring(150, 300);
                //component.html = 'abc';
                //console.log(html);
                //component.html = html.substring(0, 33);
                //component.html = '<div></div>';


                component.html = '';
                component.html = html;

                content.components.push(component);

                wise5Node.content = content;

                addWISE5Node(wise5Node);
            }
        });
    }

    return wise5Node;
};

function convertAssessmentList(node, nodeContent) {

    var wise5Node = createWISE5Node();

    wise5Node.title = node.title;
    var content = {};

    content.prompt = nodeContent.prompt;
    content.components = [];


    var assessments = nodeContent.assessments;

    if (assessments != null) {
        for (var a = 0; a < assessments.length; a++) {
            var assessment = assessments[a];

            if (assessment != null) {
                var component = {};
                component.id = createRandomId();

                component.prompt = assessment.prompt;

                if (assessment.type === 'text') {
                    component.componentType = 'OpenResponse';
                } else if (assessment.type === 'radio' || assessment.type === 'checkbox') {
                    component.componentType = 'MultipleChoice';

                    var choices = assessment.choices;

                    component.choices = [];

                    for (var c = 0; c < choices.length; c++) {
                        var tempChoice = choices[c];

                        if (tempChoice != null) {
                            var tempText = tempChoice.text;

                            var choiceId = createRandomId();

                            var choice = {};
                            choice.id = choiceId;
                            choice.text = tempText;
                            choice.feedback = '';

                            component.choices.push(choice);

                            if (tempChoice.isCorrect) {
                                component.correctChoice = choiceId;
                            }
                        }
                    }
                }

                content.components.push(component);
            }
        }
    }

    wise5Node.content = content;

    addWISE5Node(wise5Node);

    return wise5Node;
};

function convertOpenResponse(node, nodeContent) {
    var wise5Node = createWISE5Node();

    wise5Node.title = node.title;
    var content = {};

    //content.prompt = nodeContent.prompt;
    content.components = [];

    var component = {};

    component.id = createRandomId();
    component.componentType = 'OpenResponse';
    component.prompt = nodeContent.prompt;


    content.components.push(component);

    wise5Node.content = content;

    addWISE5Node(wise5Node);

    return wise5Node;
};

function convertTable(node, nodeContent) {
    var wise5Node = createWISE5Node();
    //console.log(JSON.stringify(nodeContent, null, 3));
    wise5Node.title = node.title;
    var content = {};

    content.components = [];

    var tableComponent = {};

    tableComponent.id = createRandomId();
    tableComponent.componentType = 'Table';
    tableComponent.prompt = nodeContent.prompt;
    tableComponent.globalCellSize = nodeContent.globalCellSize;

    var newTableData = convertTableData(nodeContent.tableData);
    tableComponent.tableData = newTableData;

    content.components.push(tableComponent);

    if (!nodeContent.hideEverythingBelowTable) {
        var openResponseComponent = {};

        openResponseComponent.id = createRandomId();
        openResponseComponent.componentType = 'OpenResponse';
        openResponseComponent.prompt = nodeContent.prompt2;

        content.components.push(openResponseComponent);
    }

    wise5Node.content = content;

    addWISE5Node(wise5Node);

    return wise5Node;
};

function convertTableData(tableData) {
    var newTableData = [];

    if (tableData != null) {
        for (var y = 0; y < tableData.length; y ++) {
            var row = tableData[y];

            var newRow = [];

            if (row != null) {
                for (var x = 0; x < row.length; x++) {
                    var cell = row[x];

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
};

function convertPhet(node, nodeContent) {
    var wise5Node = createWISE5Node();
    //console.log(JSON.stringify(nodeContent, null, 3));
    wise5Node.title = node.title;
    var content = {};

    content.components = [];

    var component = {};

    component.id = createRandomId();
    component.componentType = 'OutsideURL';
    //component.prompt = nodeContent.prompt;
    component.url = nodeContent.url;

    content.components.push(component);

    wise5Node.content = content;

    addWISE5Node(wise5Node);

    return wise5Node;
};

function convertDraw(node, nodeContent) {
    var wise5Node = createWISE5Node();
    //console.log(JSON.stringify(nodeContent, null, 3));
    wise5Node.title = node.title;
    var content = {};

    content.components = [];

    var component = {};

    component.id = createRandomId();
    component.componentType = 'Draw';
    component.prompt = nodeContent.prompt;

    content.components.push(component);

    wise5Node.content = content;

    addWISE5Node(wise5Node);

    return wise5Node;
};

function convertBrainstorm(node, nodeContent) {
    var wise5Node = createWISE5Node();
    //console.log(JSON.stringify(nodeContent, null, 3));
    wise5Node.title = node.title;
    var content = {};

    content.components = [];

    var component = {};

    component.id = createRandomId();
    component.componentType = 'Brainstorm';

    var prompt = '';

    if (nodeContent.assessmentItem != null &&
        nodeContent.assessmentItem.interaction != null &&
        nodeContent.assessmentItem.interaction.prompt != null) {
        prompt = nodeContent.assessmentItem.interaction.prompt
    }

    component.prompt = prompt;

    content.components.push(component);

    wise5Node.content = content;

    addWISE5Node(wise5Node);

    return wise5Node;
};

function convertAnnotator(node, nodeContent) {
    var wise5Node = createWISE5Node();
    //console.log(JSON.stringify(nodeContent, null, 3));
    wise5Node.title = node.title;
    var content = {};

    content.components = [];

    var component = {};

    component.id = createRandomId();
    component.componentType = 'HTML';

    component.prompt = nodeContent.prompt;

    content.components.push(component);

    wise5Node.content = content;

    addWISE5Node(wise5Node);

    return wise5Node;
};

function getNextNodeId() {
    var nodeId = 'node' + nodeCounter;

    nodeCounter++;

    return nodeId;
};

function getNextGroupId() {
    var groupId = 'group' + groupCounter;

    groupCounter++;

    return groupId;
};

function getNextTransitionId() {
    var transitionId = 'transition' + transitionCounter;

    transitionCounter++;

    return transitionId;
};

function getNextGroupX() {
    var nextX = groupX;

    groupX += 100;

    if (groupX > 1000) {
        groupX = 100;
        groupY += 100;
    }

    return nextX;
};

function getNextGroupY() {
    var nextY = groupY;

    groupY += 100;

    return nextY;
};

function getNextNodeX() {
    var nextX = nodeX;

    nodeX += 100;

    if (nodeX > 1000) {
        nodeX = 50;
        nodeY += 100;
    }

    return nextX;
};

function getNextNodeY() {
    var nextY = nodeY;

    return nextY;
};

function addWISE5Group(wise5Group) {
    wise5Project.nodes.push(wise5Group);
};

function addWISE5Node(wise5Node) {
    wise5Project.nodes.push(wise5Node);
};

function addWISE5Transition0(wise5Transition) {
    wise5Project.transitions.push(wise5Transition);
};

function createWISE5Transition(fromId) {
    var wise5Transition = {};

    wise5Transition.id = getNextTransitionId();
    wise5Transition.from = fromId;
    wise5Transition.to = [];

    return wise5Transition;
};

function getWISE5TransitionByFromNodeId0(nodeId) {
    var transition = null;

    if (nodeId != null) {

        var transitions = wise5Project.transitions;

        if (transitions != null) {
            for (var t = 0; t < transitions.length; t++) {
                var tempTransition = transitions[t];

                if (tempTransition != null) {
                    var tempFrom = tempTransition.from;

                    if (nodeId === tempFrom) {
                        transition = tempTransition;
                        break;
                    }
                }
            }
        }
    }

    return transition;
};

function getOrCreateWISE5Transition0(nodeId) {

    var transition = getWISE5TransitionByFromNodeId(nodeId);

    if (transition == null) {
        transition = createWISE5Transition(nodeId);
        addWISE5Transition(transition);
    }

    return transition;
}

function addToTransition0(nodeId, toObject) {

    if (nodeId != null && toObject != null) {
        var transition = getWISE5TransitionByFromNodeId(nodeId);

        if (transition == null) {
            transition = createWISE5Transition(nodeId);
        }

        var toArray = transition.to;

        if (toArray != null) {
            toArray.push(toObject);
        }
    }

};

function addTransition(fromNodeId, toNodeId, criteriaArray) {


    var node = getWISE5NodeById(fromNodeId);

    if (node != null) {
        var transitionLogic = node.transitionLogic;

        if (transitionLogic != null) {
            var transitions = transitionLogic.transitions;

            if (transitions != null) {
                var transitionObject = {};
                transitionObject.to = toNodeId;
                transitionObject.criteria = criteriaArray;

                transitions.push(transitionObject);
            }
        }
    }

};

function getWISE5NodeById(nodeId) {
    var node = null;

    if (nodeId != null) {
        var nodes = wise5Project.nodes;

        for (var n = 0; n < nodes.length; n++) {
            var tempNode = nodes[n];

            if (tempNode != null) {
                var tempNodeId = tempNode.id;

                if (nodeId === tempNodeId) {
                    node = tempNode;
                    break;
                }
            }
        }
    }

    return node;
};

function isBranchingActivity(sequence) {
    console.log('isBranchingActivity');
    var result = false;

    if (sequence != null) {
        var refs = sequence.refs;

        var regex = /.*br$/;

        if (refs != null && refs.length > 0) {
            var firstRef = refs[0];


            if (firstRef.match(regex)) {
                result = true;
            }
        }
    }
    console.log('result=' + result);
    return result;
};

function handleBranchActivity(sequence) {

    if (sequence != null) {
        var refs = sequence.refs;

        var branchNode = null;

        var lastNodeIds = [];

        for (var r = 0; r < refs.length; r++) {
            var ref = refs[r];

            if (r === 0) {
                branchNode = getBranchNode(ref);
            } else {
                var branchNodes = getBranchNodes(ref);

                /*
                if (previousNodeId != '') {
                    var from = previousNodeId;
                    var to = element.id;
                    var wise5Transition = createWISE5Transition(from, to);
                    addWISE5Transition(wise5Transition);
                    previousNodeId = to;
                } else {
                    previousNodeId = element.id;
                }
                */

                var tempPreviousNodeIds = previousNodeIds;

                var firstNodeIdInBranch = null;

                for (var b = 0; b < branchNodes.length; b++) {
                    var wise5Node = branchNodes[b];
                    var to = wise5Node.id;

                    currentGroup.ids.push(wise5Node.id);

                    if (b === 0) {
                        firstNodeIdInBranch = wise5Node.id;
                    }

                    for (var p = 0; p < tempPreviousNodeIds.length; p++) {
                        var tempPreviousNodeId = tempPreviousNodeIds[p];

                        var previousWISE5Node = getWISE5NodeById(tempPreviousNodeId);

                        addTransition(tempPreviousNodeId, to);

                        if (b === 0) {
                            var transitionLogic = previousWISE5Node.transitionLogic;

                            var branchingFunction = branchNode.branchingFunction;
                            var maxPathVisitable = branchNode.maxPathVisitable;

                            transitionLogic.howToChooseAmongAvailablePaths = branchingFunction;
                            transitionLogic.whenToChoosePath = 'enterNode';

                            if (maxPathVisitable > 1) {
                                transitionLogic.canChangePath = true;
                            } else {
                                transitionLogic.canChangePath = false;
                            }

                            transitionLogic.maxPathsVisitable = maxPathVisitable;
                        }

                        for (var x = 0; x < previousNodeIds.length; x++) {
                            var branchPointNodeId = previousNodeIds[x];

                            var notVisibleBranchConstraint = this.createBranchConstraint('makeThisNodeNotVisible', branchPointNodeId, firstNodeIdInBranch, to);
                            var notVisitableBranchConstraint = this.createBranchConstraint('makeThisNodeNotVisitable', branchPointNodeId, firstNodeIdInBranch, to);

                            this.addWISE5Constraint(to, notVisibleBranchConstraint);
                            this.addWISE5Constraint(to, notVisitableBranchConstraint);
                        }
                    }

                    tempPreviousNodeIds = [to];

                    if (b === (branchNodes.length - 1)) {
                        lastNodeIds.push(wise5Node.id);
                    }
                }
            }
        }

        previousNodeIds = lastNodeIds;

        console.log('branchNode=' + branchNode);
    }
};

function createBranchConstraint(constraintAction, fromNodeId, toNodeId, targetNodeId) {
    var branchConstraint = null;

    if (fromNodeId != null && toNodeId != null && targetNodeId != null) {
        branchConstraint = {};
        branchConstraint.id = 'constraint' + constraintCounter;
        branchConstraint.action = constraintAction;
        branchConstraint.targetId = targetNodeId;
        branchConstraint.removalCriteria = [];

        constraintCounter++;

        var criteria = {};
        criteria.functionName = 'branchPathTaken';
        criteria.fromNodeId = fromNodeId;
        criteria.toNodeId = toNodeId;

        branchConstraint.removalCriteria.push(criteria);
    }

    return branchConstraint;
};

function addWISE5Constraint(nodeId, constraint) {

    //wise5Project.constraints.push(constraint);

    var node = getWISE5NodeById(nodeId);

    if (node != null) {
        node.constraints.push(constraint);
    }
};

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
};

function getBranchNodes(sequenceId) {

    var branchNodes = [];

    if (wise4Project != null && sequenceId != null) {
        var sequence = getSequence(wise4Project, sequenceId);

        if (sequence != null) {
            var refs = sequence.refs;

            if (refs != null) {
                // loop through all the nodes in the sequence

                for (var r = 0; r < refs.length; r++) {
                    var ref = refs[r];

                    var wise5Node = createWISE5NodeFromNodeContent(ref);

                    branchNodes.push(wise5Node);
                }
            }
        }
    }

    return branchNodes;
};