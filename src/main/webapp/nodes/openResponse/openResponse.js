var nodeContentIsDirty = false;

function getStudentData() {
	var response = document.getElementById("responseTextarea").value;
	return {"response":response};
}

function setContent(content) {
    if (mode === 'author') {
        if (content !== null) {
            var prompt = content.prompt;
            var style = content.style;
            
            $('#promptAuthoring').val(prompt);
            $('#cssAuthoring').val(style);
        }
        
        $('#prompt').keyup(function() {
            nodeContentIsDirty = true;
            $('#saveNodeContentButton').attr('disabled', false);
        });
        
        $('#css').keyup(function() {
            nodeContentIsDirty = true;
            $('#saveNodeContentButton').attr('disabled', false);
        });
        
        /*
        $('#nodeContentJSON').html(JSON.stringify(content, null, 4));
        $('#nodeContentJSON').keyup(function() {
            nodeContentIsDirty = true;
            $('#saveNodeContentButton').attr('disabled', false);
        });
        */
    } else {
        $("#title").html(content.title);
        $("#prompt").html(content.prompt);
    }
}

function setStudentData(studentData) {
    
    if (studentData != null && studentData.length > 0) {
        var latestStudentData = studentData[studentData.length - 1];
        
        if (latestStudentData !== null) {
            $("#responseTextarea").html(latestStudentData.response);
        }
    }
}

function saveNodeContent(callback, callbackArgs) {
    if (mode === 'author') {
        var nodeContentJSON = $('#nodeContentJSON').val();
        saveNodeContentToWISE(nodeContentJSON, callback, callbackArgs);
    }   
}

function saveButtonClicked() {
    var studentData = getStudentData();
    saveStudentData(studentData);
}

function nodeOnExit(wiseMessageId) {
    if (mode === 'author') {
        if (nodeContentIsDirty) {
            var doSave = confirm("Save before exiting? OK=YES, Cancel=NO");
            if (doSave) {
                // save, then exit
                saveNodeContent(function(callbackArgs) {
                    sendNodeOnExitResponse(callbackArgs.wiseMessageId);
                },{wiseMessageId:wiseMessageId});
                sendNodeOnExitResponse(wiseMessageId);
            } else {
                // don't save, just exit
                sendNodeOnExitResponse(wiseMessageId);
            }
        } else {
            // don't save, just exit
            sendNodeOnExitResponse(wiseMessageId);
        }
    } else {
        sendNodeOnExitResponse(wiseMessageId);
    }
}

function callFunction(functionName, functionParams) {
    var result = null;
    
    if (functionName === 'wordCountCompare') {
        result = wordCountCompare(functionParams);
    }
    
    return result;
};

function wordCountCompare(params) {
    var result = false;
    
    if (params != null) {
        var operator = params.operator;
        var count = params.count;
        var nodeVisits = params.nodeVisits;
        
        var latestNodeState = getLatestNodeState(nodeVisits);
        
        var wordCount = 0;
        
        if (latestNodeState != null) {
            var response = latestNodeState.response;
            
            if (response != null) {
                wordCount = getWordCount(response);
                
                if (operator == '<') {
                    if (wordCount < count) {
                        result = true;
                    }
                } else if (operator == '>=') {
                    if (wordCount >= count) {
                        result = true;
                    }
                }
            }
        }
    }
    
    return result;
};

function getWordCount(response) {
    var wordCount = 0;
    
    if (response != null) {
        var regex = /\s+/gi;
        wordCount = response.trim().replace(regex, ' ').split(' ').length;
    }
    
    return wordCount;
}

function getLatestNodeState(nodeVisits) {
    var result = null;
    
    if (nodeVisits != null) {
        for (var nv = nodeVisits.length - 1; nv >= 0; nv--) {
            var nodeVisit = nodeVisits[nv];
            
            if (nodeVisit != null) {
                var nodeStates = nodeVisit.nodeStates;
                
                for (var ns = nodeStates.length - 1; ns >= 0; ns--) {
                    var nodeState = nodeStates[ns];
                    
                    if (nodeState != null) {
                        result = nodeState;
                        break;
                    }
                }
                
                if (result != null) {
                    break;
                }
            }
        }
    }
    
    return result;
};

$(document).ready(function() {
    if (mode === 'author') {
        $('#studentView').hide();
        $('#authorView').show(); 
        $('#saveNodeContentButton').click(function() {
            saveNodeContent(function() {
                $('#saveNodeContentButton').attr('disabled', true);
                nodeContentIsDirty = false;
            });
        });
        loadWISEData();
    } else if (mode === 'headless') {
        //$('#authorView').hide();
        //$('#studentView').show();  
        //loadWISEData({loadAllNodeStates:true});
        console.log('headless');
    } else {
        $('#authorView').hide();
        $('#studentView').show();  
        loadWISEData({loadAllNodeStates:true});
    }
});
