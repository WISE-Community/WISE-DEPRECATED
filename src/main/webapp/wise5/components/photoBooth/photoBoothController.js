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
        
        // field that will hold the component content
        this.componentContent = null;
        
        // holds the text that the student has typed
        this.studentResponse = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
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
            
            // get the component from the scope
            var component = $scope.component;
            
            // get the component state from the scope
            var componentState = $scope.componentState;
            
            // populate the student work into this component
            this.setStudentWork(componentState);
            
            // register this component with the parent node
            $scope.$parent.registerPartController($scope, component);
            
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
                        this.studentDataChanged();
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
            
            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Called when the student changes their text response
         */
        this.studentDataChanged = function() {
            /*
             * set the dirty flag so we will know we need to save the 
             * student work later
             */
            this.isDirty = true;
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved
             */
            
            // get this part id
            var componentId = this.getComponentId();
            
            // create a component state populated with the student data
            var componentState = this.createComponentState();
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved.
             * this will also notify connected parts that this part's
             * student data has changed.
             */
            $scope.$emit('partStudentDataChanged', {componentId: componentId, componentState: componentState});
        };
        
        /**
         * Populate the student work into the node
         * @param componentState the node state to populate into the node
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    this.studentResponse = studentData.response;
                }
            }
        };
        
        /**
         * Get the student response
         */
        this.getStudentResponse = function() {
            return this.studentResponse;
        };
        
        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new node state
            var componentState = NodeService.createNewComponentState();
            
            // get the text the student typed
            var response = this.getStudentResponse();
            
            // set the response into the node state
            var studentData = {}
            studentData.response = response;
            
            // set the student data into the component state
            componentState.studentData = studentData;
            
            if(this.saveTriggeredBy != null) {
                // set the saveTriggeredBy value
                componentState.saveTriggeredBy = this.saveTriggeredBy;
            }
            
            return componentState;
        };
        
        /**
         * Get the component id
         * @return the component id
         */
        this.getComponentId = function() {
            var componentId = this.componentContent.id;
            
            return componentId;
        };
        
        /**
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
            var componentState = null;
            
            if ($scope.photoBoothController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.photoBoothController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.photoBoothController.isDirty = false;
            }
            
            return componentState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
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
               
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
});