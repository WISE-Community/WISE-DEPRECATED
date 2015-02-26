var nodeContentIsDirty = false;

function getStudentData() {
	var response = document.getElementById("responseTextarea").value;
	return {"response":response};
}

function setContent(content) {
    if (mode === 'author') {
        $('#nodeContentJSON').html(JSON.stringify(content, null, 4));
        $('#nodeContentJSON').keyup(function() {
            nodeContentIsDirty = true;
            $('#saveNodeContentButton').attr('disabled', false);
        });
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
    } else {
        $('#authorView').hide();
        $('#studentView').show();  
        loadWISEData({loadAllNodeStates:true});
    }
});
