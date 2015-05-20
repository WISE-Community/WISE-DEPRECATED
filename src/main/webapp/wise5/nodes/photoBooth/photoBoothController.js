define(['app'], function(app) {
    app.$controllerProvider.register('PhotoBoothController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            NodeService,
            OpenResponseService,
            PhotoBoothService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // holds the text that the student has typed
        this.studentResponse = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        // whether camera is ready for use
        this.isCameraReady = false;
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // this is a regular standalone node
            var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
            
            // get the node content for this node
            NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                
                this.nodeContent = nodeContent;
                
                // get the latest node state
                var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                
                // populate the student work into this node
                this.setStudentWork(nodeState);
                
                // tell the parent controller that this node has loaded
                $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                
                // register this controller to listen for the exit event
                this.registerExitListener();
            }));
            
            //http://coderthoughts.blogspot.co.uk/2013/03/html5-video-fun.html - thanks :)
            navigator.myGetMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);
            navigator.myGetMedia({ video: true }, angular.bind(this, this.connect), function(e) {
                console.log('No live audio input: ' + e);
            });
        };
        
        this.connect = function(stream) {
            video = document.getElementById("video");
            video.src = window.URL ? window.URL.createObjectURL(stream) : stream;
            video.play();
            window.setTimeout(angular.bind(this, function() {this.isCameraReady = true;}), 1000);  // wait for video stream to display
        };
        
        this.takePicture = function() {
            var canvas = document.createElement('canvas');
            canvas.id = 'hiddenCanvas';
            //add canvas to the body element
            document.body.appendChild(canvas);
            //add canvas to #canvasHolder
            document.getElementById('canvasHolder').appendChild(canvas);
            var ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth / 4;
            canvas.height = video.videoHeight / 4;
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);  // flip on Y-axis
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            //save canvas image as data url
            //dataURL = canvas.toDataURL();
            
            //set preview image src to dataURL
            //document.getElementById('preview').src = dataURL;
            // place the image value in the text box
            //document.getElementById('imageToForm').value = dataURL;
            
            var img_b64 = canvas.toDataURL('image/png');
            //var png = img_b64.split(',')[1];
            
            var blob = this.dataURItoBlob(img_b64);
            //var blob = new Blob([window.atob(png)],  {type: 'image/png', encoding: 'utf-8'});
            var now = new Date().getTime();
            var filename = encodeURIComponent('picture_' + now + '.png');
            var pngFile = new File([blob], filename, {
                lastModified: now, // optional - default = now
                type: 'image/png' // optional - default = ''
            });
            this.uploadPictureAsset(pngFile).then(angular.bind(this, function(pngFile) {
                // make a request to copy asset for reference and save for current node visit
                var pngFilename = pngFile.name;
                var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
                var runId = ConfigService.getRunId();
                var workgroupId = ConfigService.getWorkgroupId();
                var assetBaseURL = studentUploadsBaseURL + '/' + runId + '/' + workgroupId + '/unreferenced/';
                var asset = {};
                asset.name = pngFilename;
                asset.url = assetBaseURL + pngFilename;
                asset.type = 'image';
                asset.iconURL = asset.url;
                
                StudentAssetService.copyAssetForReference(asset).then(angular.bind(this, function(copiedAsset) {
                    if (copiedAsset != null) {
                        if (this.studentResponse == null) {
                            this.studentResponse = [];
                        }
                        this.studentResponse.push(copiedAsset);
                        this.studentResponseChanged();
                    }
                }));

                $rootScope.$broadcast('studentAssetsUpdated');
            }, pngFile));
        };
        
        // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
        this.dataURItoBlob = function(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        }
        
        this.uploadPictureAsset = function(pngFile) {
            return StudentAssetService.uploadAsset(pngFile);
        };
                
        /**
         * Get the prompt to show to the student
         */
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.nodeContent != null) {
                prompt = this.nodeContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Called when the student changes their text response
         */
        this.studentResponseChanged = function() {
            /*
             * set the dirty flag so we will know we need to save the 
             * student work later
             */
            this.isDirty = true;
            
            if (this.isNodePart) {
                /*
                 * this step is a node part so we will tell its parent that
                 * the student work is dirty and will need to be saved
                 */
                $scope.$emit('isDirty');
            }
        };
        
        /**
         * Populate the student work into the node
         * @param nodeState the node state to populate into the node
         */
        this.setStudentWork = function(nodeState) {
            
            /*
             * check if the part student data has been passed. this will be
             * used when the node is part of a Questionnaire node
             */
            if ($scope.partStudentData != null) {
                // set the part student data as the node state
                nodeState = $scope.partStudentData;
            }
            
            if (nodeState != null) {
                // populate the text the student previously typed
                this.studentResponse = nodeState.studentData;
            }
        };
        
        /**
         * Save the node visit to the server
         */
        this.saveNodeVisitToServer = function() {
            // save the node visit to the server
            return $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function(nodeVisit) {
                
                /*
                 * set the isDirty flag to false because the student work has 
                 * been saved to the server
                 */
                this.isDirty = false;
            }));
        };
        
        /**
         * Create a node state and add it to the latest node visit
         * @param saveTriggeredBy the reason why we are saving a new node state
         * e.g.
         * 'autoSave'
         * 'saveButton'
         * 'submitButton'
         * 'nodeOnExit'
         * 'logOut'
         */
        this.createAndAddNodeState = function(saveTriggeredBy) {
            
            var nodeState = null;
            
            /*
             * check if this node is part of another node such as a
             * Questionnaire node. if it is part of a Questionnaire node
             * we do not need to create a node state or save anything
             * since the parent Questionnaire node will handle that.
             */
            if (!this.isNodePart) {
                // this is a standalone node
                
                if (saveTriggeredBy != null) {
                    
                    /*
                     * check if the save was triggered by the submit button
                     * or if the student data is dirty
                     */
                    if (saveTriggeredBy === 'submitButton' || this.isDirty) {
                        
                        // create the node state
                        nodeState = NodeService.createNewNodeState();
                        
                        // set the values into the node state
                        nodeState.studentData = this.studentResponse;
                        nodeState.saveTriggeredBy = saveTriggeredBy;
                        
                        if (saveTriggeredBy === 'submitButton') {
                            nodeState.isSubmit = true;
                        } 
                        
                        // add the node state to the latest node visit
                        $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, nodeState);
                    }
                }
            }
            
            return nodeState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
        
            // get the node that is exiting
            var nodeToExit = args.nodeToExit;
            
            /*
             * make sure the node id of the node that is exiting is
             * this node
             */
            if (nodeToExit.id === this.nodeId) {
                var saveTriggeredBy = 'nodeOnExit';

                // create and add a node state to the latest node visit
                this.createAndAddNodeState(saveTriggeredBy);
                
                // save the node visit to the server
                this.saveNodeVisitToServer();

                /*
                 * tell the parent that this node is done performing
                 * everything it needs to do before exiting
                 */
                $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
            }
        }));
        
        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        this.registerExitListener = function() {
            
            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = $scope.$on('exit', angular.bind(this, function(event, args) {
               
                var saveTriggeredBy = 'exit';
                
                // create and add a node state to the latest node visit
                this.createAndAddNodeState(saveTriggeredBy);

                // save the node visit to the server
                this.saveNodeVisitToServer();
                
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                    
                    // call this function to remove the listener
                    this.exitListener();
                    
                    $rootScope.$broadcast('doneExiting');
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
});