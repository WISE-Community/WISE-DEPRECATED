var wiseTargetOrigin = '*';

var mode = getParameterByName(window.location.href, 'mode');
mode = 'student';
var callbackListeners = [];
var navMessageId = 0;

//Called sometime after postMessage is called
function receiveMessage(event) {
    var msg = event.data;
    var viewType = msg.viewType;
    var action = msg.action;
    
    var navMessageId = msg.navMessageId;
    if (navMessageId !== null) {
        for (var i = 0; i < callbackListeners.length; i++) {
            var callbackListener = callbackListeners[i];
            if (callbackListener && callbackListener.navMessageId === navMessageId) {
                callbackListener.callback(callbackListener.callbackArgs);
            }
        }
    }
    
    if (action == "getWISEProjectResponse") {
        var wiseData = msg.wiseData;
        var project = wiseData.project;
        setProject(project);
    } else if (action === 'postWISEProjectContentResponse') {
        
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

function saveProjectContentToWISE(projectContent, callback, callbackArgs) {

    if (projectContent) {
        var wiseData = {};
        wiseData.projectContent = projectContent;
        
        var message = {
            'action': 'postWISEProjectContentRequest', 
            'wiseData': wiseData
        };
        
        postMessageToWISE(message, callback, callbackArgs);
    }
}

function postMessageToWISE(message, callback, callbackArgs) {
    message.navMessageId = navMessageId;
    if (callback != null) {
        callbackListeners.push({navMessageId:navMessageId, callback:callback, callbackArgs:callbackArgs});
    }
    navMessageId++;
    
    var wiseWrapper = window.parent;
    wiseWrapper.postMessage(message, wiseTargetOrigin);
};

window.addEventListener("message", receiveMessage, false);