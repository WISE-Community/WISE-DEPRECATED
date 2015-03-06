var nodeContentIsDirty = false;
var phetSimURL = null;

function getStepState() {
    return null;
}

function getStudentData() {
    return null;
}

function setContent(content) {
    phetSimURL = content.url;
    if (mode === 'author') {
        $('#phetSimURL').val(phetSimURL);
        $('#phetSimURL').change(function() {
            nodeContentIsDirty = true;
            phetSimURL =  $('#phetSimURL').val();
            $('#saveNodeContentButton').attr('disabled', false);
            $('#phetSimPreviewIFrame').attr('src', phetSimURL);
            $("#phetSimsIFrame")[0].contentWindow.highlightSelectedPhETSim(phetSimURL);
        });
        $('#phetSimPreviewIFrame').attr('src', phetSimURL);
        $("#phetSimsIFrame")[0].contentWindow.highlightSelectedPhETSim(phetSimURL);
    } else {
        $('#phetIFrame').attr('src', phetSimURL);
    }
}

function setStepState(stepState) {
}

function saveNodeContent(callback, callbackArgs) {
    if (mode === 'author') {
        var phetSimURL = $('#phetSimURL').val();
        var nodeContentJSON = {};
        nodeContentJSON.url = phetSimURL; 
        saveNodeContentToWISE(nodeContentJSON, callback, callbackArgs);
    }   
}

function authorViewOnSimulationSelected(phetSimURL) {
    phetSimURL = phetSimURL;
    $('#phetSimURL').val(phetSimURL);
    $('#phetSimURL').change();
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