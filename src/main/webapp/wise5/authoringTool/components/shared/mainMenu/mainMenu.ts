'use strict';

const MainMenu = {
  bindings: {
    state: '<',
    views: '<'
  },
  template: `<md-content>
      <md-toolbar class="md-toolbar--sidenav">
        <div class="md-toolbar-tools" translate="authoringTool"></div>
      </md-toolbar>
      <md-divider></md-divider>
      <md-list class="menu-sidenav">
        <md-list-item ng-repeat="(key, value) in $ctrl.views"
                ng-if="value.type === 'primary' && value.active"
                aria-label="{{::value.label}}"
                ui-sref="{{key}}"
                ng-class="{'active': $ctrl.state.$current.name === key}">
          <md-icon class="menu-sidenav__icon"> {{::value.icon}} </md-icon>
          <p class="menu-sidenav__item">{{::value.name}}</p>
        </md-list-item>
      </md-list>
      <md-divider></md-divider>
      <md-list class="menu-sidenav">
        <md-list-item ng-repeat="(key, value) in $ctrl.views"
                ng-if="value.type === 'secondary' && value.active"
                aria-label="{{::value.label}}"
                ui-sref="{{::key}}"
                ng-class="{'active': $ctrl.state.$current.name === key}">
          <md-icon class="menu-sidenav__icon"> {{::value.icon}} </md-icon>
          <p class="menu-sidenav__item">{{::value.name}}</p>
        </md-list-item>
      </md-list>
    </md-content>`
};

export default MainMenu;
