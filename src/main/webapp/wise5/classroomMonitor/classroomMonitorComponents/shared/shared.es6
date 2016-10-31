'use strict';

import PeriodSelect from './periodSelect/periodSelect';
import WorkgroupInfo from './workgroupInfo/workgroupInfo';
import AlertStatusCorner from './alertStatusCorner/alertStatusCorner';
import AlertStatusIcon from './alertStatusIcon/alertStatusIcon';

let Shared = angular.module('shared', []);

Shared.component('periodSelect', PeriodSelect);
Shared.component('workgroupInfo', WorkgroupInfo);
Shared.component('alertStatusCorner', AlertStatusCorner);
Shared.component('alertStatusIcon', AlertStatusIcon);

export default Shared;
