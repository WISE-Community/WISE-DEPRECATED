"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeIconController = function NodeIconController(ProjectService) {
    var _this = this;

    _classCallCheck(this, NodeIconController);

    this.ProjectService = ProjectService;

    this.$onInit = function () {
        // get whether the current node is a group
        _this.isGroup = _this.ProjectService.isGroupNode(_this.nodeId);
        // set the icon size
        if (_this.size) {
            _this.sizeClass = 'md-' + _this.size;
        }
    };
};

NodeIconController.$inject = ['ProjectService'];

var NodeIcon = {
    bindings: {
        customClass: '<',
        icon: '<',
        nodeId: '<',
        size: '<'
    },
    controller: NodeIconController,
    template: '<img ng-if="$ctrl.icon.type === \'img\'" ng-animate-ref="{{ $ctrl.nodeId }}" class="{{ $ctrl.isGroup ? \'avatar--square \' : \'\' }}{{ $ctrl.customClass }} {{ $ctrl.sizeClass }} avatar" ng-src="{{ $ctrl.icon.imgSrc }}" alt="{{ $ctrl.icon.imgAlt }}" />\n        <div ng-if="$ctrl.icon.type === \'font\'" ng-animate-ref="{{ $ctrl.nodeId }}" style="background-color: {{ $ctrl.icon.color }};" class="{{ $ctrl.isGroup ? \'avatar--square \' : \'\' }}{{ $ctrl.customClass }} {{ $ctrl.sizeClass }} avatar avatar--icon">\n            <md-icon class="{{ $ctrl.sizeClass }} {{ $ctrl.icon.fontSet }} md-light node-icon">{{ $ctrl.icon.fontName }}</md-icon>\n        </div>'
};

exports.default = NodeIcon;
//# sourceMappingURL=nodeIcon.js.map