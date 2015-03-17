var project = null;
var projectContentIsDirty = false;
//var currentNodeId = null;


function getProject() {
    return project;
};

function getGroups() {
    var groups = null;
    var project = getProject();
    
    if (project != null) {
        groups = project.groups;
    }
    
    return groups;
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
        
        result = getGroupById(startId);
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
                
                if (node == null) {
                    // child is a group
                    
                    var childGroup = getGroupById(childId);
                    
                    //
                    var groupButton = makeGroupButton(childGroup);
                    groupDiv.append(groupButton);
                    groupDiv.append('<br/>');
                    
                    renderGroup(group, childGroup);
                } else {
                    // child is a node
                    
                    var nodeButton = makeNodeButton(node);
                    groupDiv.append(nodeButton);
                    groupDiv.append('<br/>');
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
    // show the group
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

function getGroupById(id) {
    var result = null;
    
    var groups = project.groups;

    if (groups != null) {
        for (var g = 0; g < groups.length; g++) {
            var group = groups[g];
            
            if (group != null) {
                var groupId = group.id;
                
                if (groupId === id) {
                    result = group;
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
    $('#nodeIdButton_' + nodeId).addClass('currentNode');
};

function handleNodeStatusesChanged(nodeStatuses) {
    console.log('nodeStatuses=' + nodeStatuses);
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