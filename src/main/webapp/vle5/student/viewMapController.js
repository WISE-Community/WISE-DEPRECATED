define(['app','jquery'], function(app,$) {
    app.$controllerProvider.register('ViewMapController', function() {

        function receiveMessage(event) {
            // Do we trust the sender of this message?  (might be
            // different from what we originally opened, for example).
            //if (event.origin !== "http://example.org")
            //    return;

            console.log('in view map controller, received message: '+event.data+" which is: "+JSON.stringify(event.data));


            var msg = event.data;
            if (msg.messageType == "requestStepContentAndStateAndAnnotationFromWISE") {
                var prompt = "hi<br/><img src=\"https://www.google.com/images/srpr/logo11w.png\"></img><br/><br/><br/>hello<br/><br/><br/><br/><br/><br/><br/><br/>good day<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>to you<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>";
                var nodeIFrameOR = document.getElementById("nodeIFrameOR");
                nodeIFrameOR.contentWindow.postMessage({"viewType":"student","content":{"title":"open response step 1","prompt":prompt,"style":"#title {color:red}"},"globalStyle":"#title {color:purple;} body {background-color:yellow}","stepState":{"response":"my name is bob"}}, "http://10.0.1.4");
            } else if (msg.messageType == "requestNavigationStateFromWISE") {
                var project = ["echo","openResponse"];
                var navigationIFrame = document.getElementById("navigationIFrame");
                navigationIFrame.contentWindow.postMessage({"viewType":"studentNavigation","project":project,"globalStyle":"#title {color:purple;} body {background-color:yellow}"}, "http://wise4.org");
            } else if (msg.messageType == "requestGlobalToolsStateFromWISE") {
                var globalTools = ["hideNavigation", "showNavigation", "next", "prev", "portfolio", "home", "sign out"];
                var globalToolsIFrame = document.getElementById("globalToolsIFrame");
                globalToolsIFrame.contentWindow.postMessage({"viewType":"studentGlobalTools","globalTools":globalTools,"globalStyle":"#title {color:purple;} body {background-color:yellow}"}, "http://wise4.org");
            } else if (msg.messageType == "sendStateToWISE") {
                var nodeIFrameEcho = document.getElementById("nodeIFrameEcho");
                nodeIFrameEcho.contentWindow.postMessage({"viewType":"student","content":null,"globalStyle":null,"stepState":msg}, "http://wise4.org");
            } else if (msg.messageType == "navigation_moveToNode") {
                var nodeName = msg.nodeName;

                // send node name to global tools
                document.getElementById("globalToolsIFrame").contentWindow.postMessage({"viewType":"studentGlobalTools","nodeName":nodeName,"globalStyle":"#title {color:purple;} body {background-color:yellow}"}, "http://wise4.org");


                if (nodeName == "echo") {
                    $("#node").html('<iframe id="nodeIFrameEcho" width="400px" height="600px" src="http://wise4.org/echo/index.html"></iframe>');
                } else {
                    $("#node").html('<iframe id="nodeIFrameOR" width="100%" height="100%" src="http://10.0.1.4/nodes/openResponse/index.html"></iframe>');                    
                }
                $("#navigation").hide();
                $("#node").show();
            } else if(msg.messageType == "globalToolsAction") {
                var actionName = msg.actionName;
                if (actionName == "hideNavigation") {
                    $("#navigation").hide();
                    $("#node").show();
                } else if (actionName == "showNavigation") {
                    $("#navigation").show();
                    $("#node").hide();
                }
            }
        }

        window.addEventListener("message", receiveMessage, false);


        //$("#node").html('<iframe id="nodeIFrameOR" width="400px" height="600px" src="http://10.0.1.4/nodes/openResponse/index.html"></iframe>');
        //$("#node").html('<iframe id="nodeIFrameEcho" width="400px" height="600px" src="http://wise4.org/echo/index.html"></iframe>');
        //$("#navigation").html('<iframe id="navigationIFrame" width="100%" height="100%" src="http://wise4.org/navigation/index.html"></iframe>');
        $("#navigation").html('<iframe id="navigationIFrame" width="100%" height="100%" src="http://wise4.org/navigationMap/index.html"></iframe>');
        $("#globalTools").html('<iframe id="globalToolsIFrame" width="100%" height="100px" src="http://wise4.org/globalTools/index.html"></iframe>');
        this.title = 'Student View';
    });
});
