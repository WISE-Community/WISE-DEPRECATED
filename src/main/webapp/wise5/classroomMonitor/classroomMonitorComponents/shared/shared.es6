'use strict';

import AccountMenu from './accountMenu/accountMenu';
import AlertStatusCorner from './alertStatusCorner/alertStatusCorner';
import AlertStatusIcon from './alertStatusIcon/alertStatusIcon';
import PeriodSelect from './periodSelect/periodSelect';
import WorkgroupComponentRevisions from './workgroupComponentRevisions/workgroupComponentRevisions';

let Shared = angular.module('shared', []);

Shared.component('accountMenu', AccountMenu);
Shared.component('alertStatusCorner', AlertStatusCorner);
Shared.component('alertStatusIcon', AlertStatusIcon);
Shared.component('periodSelect', PeriodSelect);
Shared.component('workgroupComponentRevisions', WorkgroupComponentRevisions);

export default Shared;
