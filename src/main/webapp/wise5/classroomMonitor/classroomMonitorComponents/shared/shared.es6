'use strict';

import AlertStatusCorner from './alertStatusCorner/alertStatusCorner';
import AlertStatusIcon from './alertStatusIcon/alertStatusIcon';
import PeriodSelect from './periodSelect/periodSelect';
import WorkgroupComponentRevisions from './workgroupComponentRevisions/workgroupComponentRevisions';
import WorkgroupInfo from './workgroupInfo/workgroupInfo';

let Shared = angular.module('shared', []);

Shared.component('alertStatusCorner', AlertStatusCorner);
Shared.component('alertStatusIcon', AlertStatusIcon);
Shared.component('periodSelect', PeriodSelect);
Shared.component('workgroupComponentRevisions', WorkgroupComponentRevisions);
Shared.component('workgroupInfo', WorkgroupInfo);

export default Shared;
