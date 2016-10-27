'use strict';

import PeriodSelect from './periodSelect/periodSelect';
import WorkgroupInfo from './workgroupInfo/workgroupInfo';
import WorkgroupStatusIcon from './workgroupStatusIcon/workgroupStatusIcon';

let Shared = angular.module('shared', []);

Shared.component('periodSelect', PeriodSelect);
Shared.component('workgroupInfo', WorkgroupInfo);
Shared.component('workgroupStatusIcon', WorkgroupStatusIcon);

export default Shared;
