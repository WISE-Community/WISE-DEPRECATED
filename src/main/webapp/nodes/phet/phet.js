var nodeContentIsDirty = false;

function getStepState() {
    return null;
}

function setContent(content) {
    if (mode === 'author') {
        $('#phetSimURL').val(content.url);
        $('#phetSimPreviewIFrame').attr('src', content.url);
        $('#phetSimURL').change(function() {
            nodeContentIsDirty = true;
            var newPhETSimURL =  $('#phetSimURL').val();
            $('#saveNodeContentButton').attr('disabled', false);
            $('#phetSimPreviewIFrame').attr('src', newPhETSimURL);
        });
    } else {
        $('#phetIFrame').attr('src', content.url);
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