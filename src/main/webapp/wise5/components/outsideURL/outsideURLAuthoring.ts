'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';
import { OutsideURLService } from './outsideURLService';

@Directive()
class OutsideURLAuthoringController extends EditComponentController {
  height: string;
  info: string;
  isShowOERs: boolean;
  openEducationalResources: any[];
  outsideURLIFrameId: string;
  subjects: any[];
  searchText: string;
  selectedSubjects: any[];
  url: string;
  width: string;

  static $inject = [
    '$filter',
    '$mdDialog',
    '$sce',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'OutsideURLService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    $mdDialog: any,
    private $sce: any,
    ConfigService,
    NodeService,
    NotificationService,
    private OutsideURLService: OutsideURLService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $filter,
      $mdDialog,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
  }

  $onInit() {
    super.$onInit();
    this.$translate = this.$filter('translate');
    this.isShowOERs = this.componentContent.url === '';
    this.subjects = [
      {
        value: 'Earth and Space Sciences',
        label: this.$translate('outsideURL.ESS')
      },
      {
        value: 'Life Sciences',
        label: this.$translate('outsideURL.LS')
      },
      {
        value: 'Physical Sciences',
        label: this.$translate('outsideURL.PS')
      },
      {
        value: 'Engineering, Technology, and Applications of Science',
        label: this.$translate('outsideURL.ETS')
      }
    ];
    this.searchText = '';
    this.selectedSubjects = [];
    this.OutsideURLService.getOpenEducationalResources().then((openEducationalResources: any) => {
      this.openEducationalResources = openEducationalResources.sort((a, b) =>
        a.metadata.title > b.metadata.title ? 1 : -1
      );
    });
  }

  setURL(url) {
    if (url == null || url === '') {
      this.url = ' ';
    } else {
      this.url = this.$sce.trustAsResourceUrl(url);
    }
  }

  setInfo(info) {
    if (info == null || info === '') {
      this.info = this.url;
    } else {
      this.info = this.$sce.trustAsResourceUrl(info);
    }
  }

  setWidthAndHeight(width, height) {
    this.width = width ? width + 'px' : '100%';
    this.height = height ? height + 'px' : '600px';
  }

  urlInputChanged() {
    this.authoringComponentContent.info = null;
    this.authoringViewComponentChanged();
  }

  populateOpenEducationalResourceURL(openEducationalResource) {
    this.authoringComponentContent.url = openEducationalResource.url;
    this.authoringComponentContent.info = openEducationalResource.info;
    this.authoringViewComponentChanged();
  }

  isResourceSelected(resourceUrl) {
    return resourceUrl === this.authoringComponentContent.url;
  }

  reloadResource() {
    const iframe: any = document.getElementById(this.outsideURLIFrameId);
    iframe.src = '';
    iframe.src = this.authoringComponentContent.url;
  }

  isSubjectMatch(resource) {
    for (const subject of this.selectedSubjects) {
      if (resource.metadata.subjects.includes(subject)) {
        return true;
      }
    }
    return false;
  }

  clearFilters() {
    this.searchText = '';
    this.selectedSubjects = [];
  }
}

const OutsideURLAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: OutsideURLAuthoringController,
  controllerAs: 'outsideURLController',
  templateUrl: 'wise5/components/outsideURL/authoring.html'
}

export default OutsideURLAuthoring;
