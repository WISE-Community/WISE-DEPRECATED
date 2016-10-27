'use strict';

import Annotation from './annotation/annotation';
import ComponentAnnotations from './componentAnnotations/componentAnnotations';
import Compile from './compile/compile';
import Component from './component/component';
import DisableDeleteKeypress from './disableDeleteKeypress/disableDeleteKeypress';
import Draggable from './draggable/draggable';
import ComponentGrading from './componentGrading/componentGrading';
import ListenForDeleteKeypress from './listenForDeleteKeypress/listenForDeleteKeypress';
import PossibleScore from './possibleScore/possibleScore';
import Wiselink from './wiselink/wiselink';

let Components = angular.module('components', []);

Components.component('annotation', Annotation);
Components.component('compile', Compile);
Components.component('component', Component);
Components.component('componentAnnotations', ComponentAnnotations);
Components.component('componentGrading', ComponentGrading);
Components.component('disableDeleteKeypress', DisableDeleteKeypress);
Components.component('draggable', Draggable);
Components.component('listenForDeleteKeypress', ListenForDeleteKeypress);
Components.component('possibleScore', PossibleScore);
Components.component('wiselink', Wiselink);

export default Components;
