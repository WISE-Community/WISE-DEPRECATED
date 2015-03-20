angular.module('multipleChoiceApp')

.controller('MultipleChoiceCtrl', ['$scope', function($scope) {
    console.log('MultipleChoiceCtrl');
    
    $scope.content = null;
    //prompt = null;
    
    loadWISEData();
    
    this.prompt = 'hello1';
    $scope.prompt = 'hello2';
    
    $scope.setContent = function(content) {
        console.log('setContent');
        $scope.content = content;
        
        if ($scope.content != null) {
            $scope.prompt = $scope.content.prompt;
        }
    };
    
    $scope.setStudentData = function() {
        console.log('setStudentData');
    };
}]);