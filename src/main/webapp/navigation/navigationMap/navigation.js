var project = null;
var projectContentIsDirty = false;
//var currentNodeId = null;

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
        
        var nodes = project.nodes;
        
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var nodeId = node.id;
            $('#studentView').append("<button id='nodeIdButton_" + nodeId + "' class='nodeButton' onclick='nodeButtonClicked(\""+node.id+"\")' disabled>" + node.title + " (" + node.type + ")</button>");
        }
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
                        
                        if (statusType != null && statusValue != null) {
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