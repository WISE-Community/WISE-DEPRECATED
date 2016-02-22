'use strict';

class StudentAssetController {
    constructor($injector,
                $rootScope,
                $scope,
                ConfigService,
                ProjectService,
                StudentAssetService) {

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.mode = this.ConfigService.getMode();
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;

        this.studentAssets = this.StudentAssetService.allAssets;

        this.selectedStudentAsset = null;  // This is used when student choose an asset to attach to a component

        this.itemId = null;
        this.item = null;

        this.logOutListener = $scope.$on('logOut', (event, args) => {
            this.logOutListener();
            this.$rootScope.$broadcast('componentDoneUnloading');
        });

        // retrieve assets when notebook is opened
        if (!this.ConfigService.isPreview()) {
            this.retrieveStudentAssets();
        }
    }

    getTemplateUrl() {
        return this.templateUrl;
    };

    retrieveStudentAssets() {
        // fetch all assets
        this.StudentAssetService.retrieveAssets().then((studentAssets) => {
            this.studentAssets = studentAssets;
        });
    };

    uploadStudentAssets(files) {
        if (files != null) {
            for (var f = 0; f < files.length; f++) {
                var file = files[f];
                this.StudentAssetService.uploadAsset(file).then(() => {
                    this.studentAssets = this.StudentAssetService.allAssets;
                })
            }
        }
    };

    deleteStudentAsset(studentAsset) {
        alert('delete student asset not implemented yet');
        /*
         StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
         // remove studentAsset
         this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
         this.calculateTotalUsage();
         }));
         */
    };

    studentAssetSelected($event, studentAsset) {
        this.selectedStudentAsset = studentAsset;
    };

    attachStudentAssetToComponent($event, studentAsset) {
        this.componentController.attachStudentAsset(studentAsset);
        this.selectedStudentAsset = null;  // reset selected student asset
        // TODO: add some kind of unobtrusive confirmation to let student know that the student asset has been added to current component
        $event.stopPropagation();  // prevents parent student asset list item from getting the onclick event so this item won't be re-selected.
    };
}

StudentAssetController.$inject = [
    "$injector",
    "$rootScope",
    "$scope",
    "ConfigService",
    "ProjectService",
    "StudentAssetService",
];

export default StudentAssetController;