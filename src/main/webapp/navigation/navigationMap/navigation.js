var project = null;
var applicationNodes = null;
var groupNodes = null;
var idToNode = null;
var projectContentIsDirty = false;
//var currentNodeId = null;


function getProject() {
    return project;
};

function getStepState() {
    return null;
}

function setContent(content) {
}

function nodeButtonClicked(nodeId) {
    moveToNode(nodeId);
}

function setProject(projectIn) {
    project = projectIn;
    renderProject();
}

function setApplicationNodes(applicationNodesIn) {
    applicationNodes = applicationNodesIn;
};

function setGroupNodes(groupNodesIn) {
    groupNodes = groupNodesIn;
};

function getGroupNodes() {
    return groupNodes;
};

function setIdToNode(idToNodeIn) {
    idToNode = idToNodeIn;
};

function getNodeById(id) {
    var element = null;
    
    if (id != null) {
        element = idToNode[id];
    }
    
    return element;
};

function isApplicationNode(id) {
    var result = false;
    
    var applicationNode = getNodeById(id);
    
    if (applicationNode != null) {
        var type = applicationNode.type;
        
        if (type === 'application') {
            result = true;
        }
    }
    
    return result;
};

function isGroupNode(id) {
    var result = false;
    
    var groupNode = getNodeById(id);
    
    if (groupNode != null) {
        var type = groupNode.type;
        
        if (type === 'group') {
            result = true;
        }
    }
    
    return result;
};

function getParent(id) {
    var result = null;
    
    var groupNodes = getGroupNodes();
    
    if (groupNodes != null) {
        for (var g = 0; g < groupNodes.length; g++) {
            var group = groupNodes[g];
            
            if (group != null) {
                var groupId = group.id;
                var ids = group.ids;
                
                if (ids != null && ids.indexOf(id) != -1) {
                    result = group;
                    break;
                }
            }
        }
    }
    
    return result;
};

function addNewNode() {
    console.log('add new node');
}

function renderProject() {
    if (mode === 'student') {
        $('#authorView').hide();
        $('#studentView').show();
        
        $("body").append("starmap navigation");
        
        var startGroup = getStartGroup();
        var parentGroup = null;
        
        renderGroup(parentGroup, startGroup);
        
        $('#group0').addClass('activeGroup');
        $('.activeGroup').show();
    } else if (mode === 'author') {
        $('#studentView').hide();
        $('#authorView').show();
        
        var nodes = project.nodes;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            $('#authorView').append("<button onclick='nodeButtonClicked(\""+node.id+"\")'>" + node.title + " (" + node.type + ")</button>");
        }

    } 
}

function getStartGroup() {
    var result = null;
    
    var project = getProject();
    
    if (project != null) {
        var startId = project.startId;
        
        result = getNodeById(startId);
    }
    
    return result;
};

function renderGroup(parentGroup, group) {
    if (group != null) {
        var groupId = group.id;
        var groupName = group.name;
        var childIds = group.ids;
        
        var groupDiv = $('<div></div>');
        groupDiv.attr('id', groupId);
        groupDiv.addClass('group');
        groupDiv.hide();
        
        $('#groups').append(groupDiv);
        
        if (parentGroup != null) {
            var parentGroupButton = makeGroupButton(parentGroup);
            parentGroupButton.html('Parent');
            groupDiv.append(parentGroupButton);
            groupDiv.append('<br/>');
        }
        
        if (childIds != null) {
            for (var c = 0; c < childIds.length; c++) {
                var childId = childIds[c];
                
                var node = getNodeById(childId);
                
                if (node != null) {
                    var nodeType = node.type;
                    if (nodeType === 'application') {
                        
                        // child is a node
                        
                        var nodeButton = makeNodeButton(node);
                        groupDiv.append(nodeButton);
                        groupDiv.append('<br/>');
                    } else if (nodeType === 'group') {
                        // child is a group
                        
                        var childGroup = getNodeById(childId);
                        
                        //
                        var groupButton = makeGroupButton(childGroup);
                        groupDiv.append(groupButton);
                        groupDiv.append('<br/>');
                        
                        renderGroup(group, childGroup);
                    }
                }
            }
        }
    }
};

function makeGroupButton(group) {
    var groupButton = null;
    
    if (group != null) {
        var groupId = group.id;
        
        groupButton = $("<button id='groupIdButton_" + groupId + "' class='groupButton' onclick='groupButtonClicked(\""+group.id+"\")'>" + group.title + "</button>");
    }
    
    return groupButton;
};

function groupButtonClicked(groupId) {
    showGroup(groupId);
    moveToNode(groupId);
};

function showGroup(groupId) {
    $('.group').hide();
    $('#' + groupId).show();
};

function makeNodeButton(node) {
    var nodeButton = null;
    
    if (node != null) {
        var nodeId = node.id;
        
        nodeButton = $("<button id='nodeIdButton_" + nodeId + "' class='nodeButton' onclick='nodeButtonClicked(\""+node.id+"\")'>" + node.title + " (" + node.type + ")</button>");
    }
    
    return nodeButton;
};

function renderNode(group, node) {
    if (group != null && node != null) {
        var groupId = group.id;
        var nodeId = node.id;
        
        var nodeButton = $("<button id='nodeIdButton_" + nodeId + "' class='nodeButton' onclick='nodeButtonClicked(\""+node.id+"\")' disabled>" + node.title + " (" + node.type + ")</button>");
        
        $('#' + groupId).append(nodeButton);
    }
};

function getNodeById(id) {
    var result = null;
    
    var nodes = project.nodes;
    
    if (nodes != null) {
        for (var n = 0; n < nodes.length; n++) {
            var node = nodes[n];
            
            if (node != null) {
                var nodeId = node.id;
                
                if (nodeId === id) {
                    result = node;
                    break;
                }
            }
        }
    }
    
    return result;
};

function saveProjectContent(callback, callbackArgs) {
    if (mode === 'author') {
        var projectContentJSON = $('#projectContentJSON').val();
        saveProjectContentToWISE(projectContentJSON, callback, callbackArgs);
    }
};

function setStepState(stepState) {
    $.ajax({
        type: "POST",
        url:"echo.php",
        data:{"stepState":JSON.stringify(stepState)},
        success:function(data) {
        
        $("#message").html(JSON.stringify(data));
        }
        
    });

}

function handleCurrentNodeIdChanged(nodeId) {
    
    $('.nodeButton').removeClass('currentNode');
    
    if (isApplicationNode(nodeId)) {
        var parent = getParent(nodeId);
        
        if (parent != null) {
            var parentId = parent.id;
            showGroup(parentId);
        }
        
        $('#nodeIdButton_' + nodeId).addClass('currentNode');
    } else if (isGroupNode(nodeId)) {
        showGroup(nodeId);
    }
};

function handleNodeStatusesChanged(nodeStatuses) {
    if (nodeStatuses != null) {
        for (var i = 0; i < nodeStatuses.length; i++) {
            var nodeStatus = nodeStatuses[i];
            
            var nodeId = nodeStatus.nodeId;
            var statuses = nodeStatus.statuses;
            
            if (statuses != null) {
                for (var j = 0; j < statuses.length; j++) {
                    var status = statuses[j];
                    
                    if (status != null) {
                        var statusType = status.statusType;
                        var statusValue = status.statusValue;
                        
                        if (statusType != null) {
                            if (statusType === 'isVisitable') {
                                if (statusValue) {
                                    $('#nodeIdButton_' + nodeId).attr('disabled', false);
                                } else {
                                    $('#nodeIdButton_' + nodeId).attr('disabled', true);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};