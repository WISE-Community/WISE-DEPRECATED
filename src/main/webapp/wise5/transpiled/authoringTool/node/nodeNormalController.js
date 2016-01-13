'use strict';

define(['../../test/app'], function (app) {
    app.$controllerProvider.register('NodeNormalController', function ($scope, $stateParams, ProjectService, NodeApplicationService) {
        this.nodeId = $stateParams.nodeId;
        var mode = 'author';

        //console.log('nodeId=' + this.nodeId);

        var node = ProjectService.getNodeById(this.nodeId);

        if (node !== null) {
            var nodeType = node.type;
            var nodeIFrameSrc = NodeApplicationService.getNodeURL(nodeType) + '?nodeId=' + this.nodeId + '&mode=' + mode;
            $('#nodeIFrame').attr('src', nodeIFrameSrc);
        };
    });
});