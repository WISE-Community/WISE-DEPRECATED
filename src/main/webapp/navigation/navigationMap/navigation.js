function getStepState() {
    return null;
}

function setContent(content) {
}

function nodeButtonClicked(nodeId) {
    navigation_moveToNode(nodeId);
}

function setProject(project) {
    //$("#nav").html('');
    $("body").append("starmap navigation");
    var nodes = project.nodes;
    for (var i=0;i<nodes.length;i++) {
    var node = nodes[i];
    $("#nav").append("<button onclick='nodeButtonClicked(\""+node.id+"\")'>"+node.title + " (" + node.type + ")</button>");
    }
}

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