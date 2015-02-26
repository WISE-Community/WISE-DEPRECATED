var wiseTargetOrigin = '*';

var nodeId = getParameterByName(window.location.href, 'nodeId');
var mode = getParameterByName(window.location.href, 'mode');

//Called sometime after postMessage is called
function receiveMessage(event) {
    var msg = event.data;
    var viewType = msg.viewType;
    var action = msg.action;
    
   if (action == "getWISEProjectResponse") {
    var wiseData = msg.wiseData;
    var project = wiseData.project;
    setProject(project);
   }
}

// gets parameter by name in the url
function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//call this when step is ready to load WISE step content and student step data
function navigationIsReadyForWISE() {
    // when they get here, assume iframe has loaded completely and are ready to load content and student data
    var wiseWrapper = window.parent;

    // This does nothing, assuming the window hasn't changed its location.
    wiseWrapper.postMessage({'action': 'getWISEProjectRequest'}, wiseTargetOrigin);
}


//call this when step is ready to load WISE step content and student step data
function navigation_moveToNode(nodeId) {
    // when they get here, assume iframe has loaded completely and are ready to load content and student data
    var wiseWrapper = window.parent;

    // This does nothing, assuming the window hasn't changed its location.
    wiseWrapper.postMessage({"action":"navigation_moveToNode","nodeId":nodeId}, wiseTargetOrigin);
}

window.addEventListener("message", receiveMessage, false);