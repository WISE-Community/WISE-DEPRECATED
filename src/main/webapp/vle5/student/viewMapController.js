define(['app', 'jquery', 'configService', 'nodeApplicationService', 'projectService', 'nodeService'], 
        function(app, $, configService, nodeApplicationService, projectService, nodeService) {
    app.$controllerProvider.register('ViewMapController', function(ConfigService, NodeApplicationService, ProjectService, NodeService) {
        this.globalTools = ['hideNavigation', 'showNavigation', 'next', 'prev', 'portfolio', 'home', 'sign out'];
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.NodeApplicationService = NodeApplicationService;
        this.hiroki = "awesome!";

        var currentNodeId;
        this.receiveMessage = angular.bind(this, function(event) {
            // Do we trust the sender of this message?  (might be
            // different from what we originally opened, for example).
            //if (event.origin !== 'http://example.org')
            //    return;
            var msg = event.data;
            console.log('in view map controller, received message:'+JSON.stringify(msg));
            
            if (msg.messageType === 'requestStepContentAndStateAndAnnotationFromWISE') {
                var nodeSrc = this.projectService.getNodeSrcByNodeId(currentNodeId);
                var nodeContent = this.nodeService.getNodeContentByNodeSrc(nodeSrc);
                
                if (currentNodeId === 'OpenResponseNode') {
                    var prompt = 'hi<br/><img src="https://www.google.com/images/srpr/logo11w.png"></img>'+
                    '<br/><br/><br/>hello<br/><br/><br/><br/><br/><br/><br/><br/>good day'+
                    '<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>to you'+
                    '<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>';
                    nodeContent = {'title':'open response step 1','prompt':prompt,'style':'#title {color:red}'};
                } else if (currentNodeId === 'EchoNode') {
                    nodeContent = 'EchoNode content';
                } else if (currentNodeId === 'HTMLNode') {
                    nodeContent = '<html><body><head><base href="http://wise.berkeley.edu"></base></head><h3>heading</h3><b>hello!</b><img src="./assets/smiley.png"></img><br/><br/><i>how are you?</body></html>';
                } else if (currentNodeId === 'OutsideURLNode') {
                    nodeContent = '{"url": "http://berkeley.edu"}';
                }
                var nodeIFrame = document.getElementById('nodeIFrame');
                nodeIFrame.contentWindow.postMessage(
                        {'viewType':'student',
                            'content':nodeContent,
                            'globalStyle':'#title {color:purple;} body {background-color:yellow}',
                            'stepState':{'response':'my name is bob'}
                        }, 
                        '*');
            } else if (msg.messageType === 'requestNavigationStateFromWISE') {
                var project = this.ProjectService.project;
                var navigationIFrame = document.getElementById('navigationIFrame');
                navigationIFrame.contentWindow
                    .postMessage({'viewType':'studentNavigation','project':project,
                        'globalStyle':'#title {color:purple;} body {background-color:yellow}'}, 
                        'http://wise4.org');
            } else if (msg.messageType === 'sendStateToWISE') {
                var nodeIFrame = document.getElementById('nodeIFrame');
                nodeIFrame.contentWindow
                    .postMessage({'viewType':'student','content':null,'globalStyle':null,'stepState':msg}, 
                         'http://wise4.org');
            } else if (msg.messageType === 'navigation_moveToNode') {
                var nodeId = msg.nodeId;
                var nodeType = this.ProjectService.getNodeTypeByNodeId(nodeId);
                this.hiroki = "super!";
                //this.nodeIFrameSrc = this.NodeApplicationService.getNodeURL(nodeName);
                $('#nodeIFrame').attr('src',this.NodeApplicationService.getNodeURL(nodeType));
                currentNodeId = nodeId;
                $('#navigation').hide();
                $('#nodeIFrame').show();
            } 
        });
        
        this.globalToolButtonClicked = function(globalToolName) {
            if (globalToolName === 'hideNavigation') {
                $('#navigation').hide();
                $('#nodeIFrame').show();
            } else if (globalToolName === 'showNavigation') {
                $('#navigation').show();
                $('#nodeIFrame').hide();
            }
        }
        var wiseBaseURL = ConfigService.getConfigParam('wiseBaseURL');
        //angular.element($window).on('messsage',this.receiveMessage);
        window.addEventListener('message', this.receiveMessage, false);

        $('#navigation').html('<iframe id="navigationIFrame" '+ 
                'src="http://wise4.org/navigationMap/index.html"></iframe>');
    });
});