"use strict";

class NodeIconController {
  constructor(ProjectService) {
    this.ProjectService = ProjectService;

    this.$onChanges = () => {
      this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
      this.icon = this.ProjectService.getNodeIconByNodeId(this.nodeId);
      if (this.size) {
        this.sizeClass = `md-${ this.size }`;
      }
    }
    
  }
      
  isFont() {
    return this.icon.type === 'font';
  }

  isImage() {
    return this.icon.type === 'img';
  }
}

NodeIconController.$inject = [
  'ProjectService'
];

const NodeIcon = {
  bindings: {
    customClass: '<',
    nodeId: '<',
    size: '<'
  },
  controller: NodeIconController,
  template:
    `<img ng-if="::$ctrl.isImage()" ng-animate-ref="{{ ::$ctrl.nodeId }}" class="{{ ::$ctrl.isGroup ? 'avatar--square ' : '' }}{{ ::$ctrl.customClass }} {{ ::$ctrl.sizeClass }} avatar" ng-src="{{ ::$ctrl.icon.imgSrc }}" alt="{{ ::$ctrl.icon.imgAlt }}" />
      <div ng-if="::$ctrl.isFont()" ng-animate-ref="{{ ::$ctrl.nodeId }}" style="background-color: {{ ::$ctrl.icon.color }};" class="{{ ::$ctrl.isGroup ? 'avatar--square ' : '' }}{{ ::$ctrl.customClass }} {{ ::$ctrl.sizeClass }} avatar avatar--icon">
        <md-icon class="{{ ::$ctrl.sizeClass }} {{ ::$ctrl.icon.fontSet }} md-light node-icon">{{ ::$ctrl.icon.fontName }}</md-icon>
      </div>`
};

export default NodeIcon;
