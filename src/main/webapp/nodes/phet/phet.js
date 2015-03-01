var nodeContentIsDirty = false;

function getStepState() {
        return null;
}

function setContent(content) {
    if (mode === 'author') {
        $('#phetSimURL').html(content.url);
        $('#phetSimURL').change(function() {
            nodeContentIsDirty = true;
            $('#saveNodeContentButton').attr('disabled', false);
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