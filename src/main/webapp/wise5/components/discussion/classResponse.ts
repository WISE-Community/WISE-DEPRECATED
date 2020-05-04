'use strict';

const ClassResponse = {
  bindings: {
    response: '<',
    mode: '@',
    deletebuttonclicked: '&',
    undodeletebuttonclicked: '&',
    submitbuttonclicked: '&',
    studentdatachanged: '&',
    isdisabled: '<'
  },
  templateUrl: 'wise5/components/discussion/classResponse.html',
  controller: 'ClassResponseController as classResponseCtrl'
};

export default ClassResponse;
