define(['angular'], function(angular) {

    angular.module('PostMessageService', [])
    
    .service('PostMessageService', ['$http', function($http) {
        console.log('PostMessageService');
        this.callbackListeners = [];
        this.wiseMessageId = 0;
        
        this.postMessageToIFrame = function(iFrameId, message, callback) {
            if (callback != null) {
                message.wiseMessageId = this.wiseMessageId;
                this.callbackListeners.push({wiseMessageId:this.wiseMessageId, callback:callback});
                this.wiseMessageId++;
            }
            try {
                var iFrame = $('#' + iFrameId);
                iFrame[0].contentWindow.postMessage(message, '*');
            } catch (error) {
                console.log('error on postmessage, iFrameId: '+ iFrameId);
            }
        };
        
        this.handleMessageIncoming = function(event, data) {
            var msg = data;
            var wiseMessageId = msg.wiseMessageId;
            if (wiseMessageId != null) {
                for (var i = 0; i < this.callbackListeners.length; i++) {
                    var callbackListener = this.callbackListeners[i];
                    if (callbackListener && callbackListener.wiseMessageId === wiseMessageId) {
                        callbackListener.callback(msg, callbackListener.callbackArgs);
                    }
                }
            }
        };
        
        /*
        $scope.$on('$messageIncoming', angular.bind(this, function(event, data) {
            var msg = data;
            var wiseMessageId = msg.wiseMessageId;
            if (wiseMessageId != null) {
                for (var i = 0; i < this.callbackListeners.length; i++) {
                    var callbackListener = this.callbackListeners[i];
                    if (callbackListener && callbackListener.wiseMessageId === wiseMessageId) {
                        callbackListener.callback(callbackListener.callbackArgs);
                    }
                }
            }
        }));
        */
    }])
});