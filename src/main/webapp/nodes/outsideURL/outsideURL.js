var content = null;
var nodeContentIsDirty = false;

function getStudentData() {
    return null;
}

function setContent(contentIn) {
    content = contentIn;
    
    if (mode === 'author') {
        
        if (contentIn !== null) {
            var url = contentIn.url;
            
            $('#urlInput').val(url);
        }
        
        $('#urlInput').keyup(function() {
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
        $('#outsideURLIFrame').attr('src',content.url);
    }
}

function setStudentData(studentData) {
}

function saveNodeContent(callback, callbackArgs) {
    if (mode === 'author') {
        var url = $('#urlInput').val();
        
        var nodeContentJSON = {};
        nodeContentJSON.url = url;
        
        saveNodeContentToWISE(nodeContentJSON, callback, callbackArgs);
    }   
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