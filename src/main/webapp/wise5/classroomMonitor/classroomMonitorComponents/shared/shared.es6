'use strict';

//import AccountMenu from './accountMenu/accountMenu';
import AlertStatusCorner from './alertStatusCorner/alertStatusCorner';
import AlertStatusIcon from './alertStatusIcon/alertStatusIcon';
import NodeCompletionIcon from './nodeCompletionIcon/nodeCompletionIcon';
import PeriodSelect from './periodSelect/periodSelect';
import WorkgroupComponentRevisions from './workgroupComponentRevisions/workgroupComponentRevisions';
import WorkgroupSelect from './workgroupSelect/workgroupSelect';

let Shared = angular.module('shared', []);

//Shared.component('accountMenu', AccountMenu);
Shared.component('alertStatusCorner', AlertStatusCorner);
Shared.component('alertStatusIcon', AlertStatusIcon);
Shared.component('nodeCompletionIcon', NodeCompletionIcon);
Shared.component('periodSelect', PeriodSelect);
Shared.component('workgroupComponentRevisions', WorkgroupComponentRevisions);
Shared.component('workgroupSelect', WorkgroupSelect);

export default Shared;
