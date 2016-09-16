'use strict';

import TableService from './tableService';
import TableController from './tableController';

let tableComponentModule = angular.module('tableComponentModule', [])
    .service(TableService.name, TableService)
    .controller(TableController.name, TableController);

export default tableComponentModule;
