'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ProjectService Unit Test', function () {
    beforeEach(_angular2.default.mock.module(_main2.default.name));

    var ConfigService, ProjectService, $rootScope, $httpBackend;

    beforeEach(inject(function (_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
        ConfigService = _ConfigService_;
        ProjectService = _ProjectService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    describe('ProjectService', function () {

        var projectJSON = {
            "nodes": [{
                "id": "group0",
                "type": "group",
                "title": "Master",
                "startId": "group1",
                "ids": ["group1", "group2", "group3", "group4", "group5", "group6"]
            }, {
                "id": "group1",
                "type": "group",
                "title": "Introduction to Newton Scooters",
                "startId": "node1",
                "ids": ["node1", "node2"],
                "icons": {
                    "default": {
                        "color": "#2196F3",
                        "type": "font",
                        "fontSet": "material-icons",
                        "fontName": "info"
                    }
                }
            }, {
                "id": "node1",
                "type": "node",
                "showSaveButton": true,
                "showSubmitButton": false,
                "constraints": [],
                "transitionLogic": {
                    "transitions": [{
                        "to": "node2"
                    }],
                    "howToChooseAmongAvailablePaths": null,
                    "whenToChoosePath": null,
                    "canChangePath": null,
                    "maxPathsVisitable": null
                },
                "title": "Introduction to Newton Scooters",
                "components": [{
                    "id": "ygip12bdtv",
                    "type": "HTML",
                    "html": "<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n<div style=\"background-image: url('background.jpg'); border-radius: 10px 10px 10px 10px; padding: 25px; background-size: cover; font-family: Arial, Helvetica, sans-serif; line-height: 150%;\">\n<div style=\"background-color: rgba(255,255,255,0.85); color: #006; border-radius: 30px 30px 30px 30px; padding: 15px; text-align: center;\">\n<h1>Why Study Newton Scooters?</h1>\n</div>\n<br />\n<div style=\"background-color: rgba(255,255,255,0.85); color: #006; border-radius: 20px 20px 20px 20px; padding: 20px;\">\n<p>YOUR GOAL is to build a scooter that can go farther than the Master Scooter pictured below. Your scooter should look exactly like the one below except for ONE change that you think will improve the scooter's performance.</p>\n<br/><p>In this unit, you will design, build, and test a scooter. We will show you how to make a better scooter by thinking about energy, where it comes from and where it goes.</p>\n<br />\n<p><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"model_rubberbandcar_cropped.jpg\" alt=\"\" height=\"220\" /></p>\n<p style=\"text-align: center;\">Master Scooter</p>\n</div>\n</div>\n</body>\n</html>"
                }],
                "icons": {
                    "default": {
                        "color": "#2196F3",
                        "type": "font",
                        "fontSet": "material-icons",
                        "fontName": "chrome_reader_mode"
                    }
                }
            }, {
                "id": "node2",
                "type": "node",
                "showSaveButton": true,
                "showSubmitButton": false,
                "constraints": [],
                "transitionLogic": {
                    "transitions": [{
                        "to": "node3"
                    }],
                    "howToChooseAmongAvailablePaths": null,
                    "whenToChoosePath": null,
                    "canChangePath": null,
                    "maxPathsVisitable": null
                },
                "title": "Initial Ideas",
                "components": [{
                    "id": "w610e11zej",
                    "type": "HTML",
                    "html": "<div style=\"margin: auto; background-image: url('background.jpg'); border-radius: 20px 20px 20px 20px; padding: 8px; background-size: cover;\"><div style=\"background-color: rgba(255,255,255,0.85); color: #000066; border-radius: 20px 20px 20px 20px; padding: 8px; text-align: center;\"><h2 style=\"text-align: center;\">Your Ideas About How Newton Scooters&nbsp;Work</h2></div></div><p>&nbsp;</p><div style=\"text-align: center;\"><h5>Watch a video of a rubber band car!</h5><object id=\"flashObj\" width=\"480\" height=\"270\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" codebase=\"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,47,0\"><param name=\"movie\" value=\"http://c.brightcove.com/services/viewer/federated_f9?isVid=1&isUI=1\"/><param name=\"bgcolor\" value=\"#FFFFFF\"/><param name=\"flashVars\" value=\"videoId=1785707989001&linkBaseURL=http%3A%2F%2Fvideos.kidspot.com.au%2Fvideos%2Fmsccfimh%2Fhow-to-make-a-rubber-band-cd-car&playerID=1481257918001&playerKey=AQ~~,AAABWOeErfE~,m-zG2cTdbSFPmdIYTvrDXYGmMQGs9zYu&domain=embed&dynamicStreaming=true\"/><param name=\"base\" value=\"http://admin.brightcove.com\"/><param name=\"seamlesstabbing\" value=\"false\"/><param name=\"allowFullScreen\" value=\"true\"/><param name=\"swLiveConnect\" value=\"true\"/><param name=\"allowScriptAccess\" value=\"always\"/><embed src=\"http://c.brightcove.com/services/viewer/federated_f9?isVid=1&isUI=1\" bgcolor=\"#FFFFFF\" flashVars=\"videoId=1785707989001&linkBaseURL=http%3A%2F%2Fvideos.kidspot.com.au%2Fvideos%2Fmsccfimh%2Fhow-to-make-a-rubber-band-cd-car&playerID=1481257918001&playerKey=AQ~~,AAABWOeErfE~,m-zG2cTdbSFPmdIYTvrDXYGmMQGs9zYu&domain=embed&dynamicStreaming=true\" base=\"http://admin.brightcove.com\" name=\"flashObj\" width=\"480\" height=\"270\" seamlesstabbing=\"false\" type=\"application/x-shockwave-flash\" allowFullScreen=\"true\" allowScriptAccess=\"always\" swLiveConnect=\"true\" pluginspage=\"http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash\"></embed></object><p>&nbsp;</p><h5>Here are some other examples of Newton Scooters</h5><div><img src=\"rubber band car_lego wheels.JPG\" alt=\"rubber band car lego wheels\" style=\"height: 130px; width: auto; padding: 10px; display: inline-block;\"/><img src=\"balloon car with flare.JPG\" alt=\"ballon car with flare\" style=\"height: 130px; width: auto; padding: 10px; display: inline-block;\"/><img src=\"inflated balloon car_google.jpg\" alt=\"rubber band car inflated\" style=\"height: 130px; width: auto; padding: 10px; display: inline-block;\"/><img src=\"cds as wheels scooter.JPG\" alt=\"cds as wheels scooter\" style=\"height: 130px; width: auto; padding: 10px; display: inline-block;\"/></div><p>&nbsp;</p><h6>A rubber band car is a type of Newton Scooter. With materials right in your own home, you can build a Newton Scooter!</h6><h6>Write down your <span style=\"font-weight: bold;\">best ideas</span> about what might affect how far a Newton Scooter will travel.</h6></div>"
                }, {
                    "id": "mpt65v012s",
                    "prompt": "What are some factors that are important for a scooter to move?",
                    "type": "OpenResponse"
                }],
                "icons": {
                    "default": {
                        "color": "#2196F3",
                        "type": "font",
                        "fontSet": "material-icons",
                        "fontName": "assignment"
                    }
                }
            }],
            "constraints": [],
            "startGroupId": "group0",
            "startNodeId": "node1",
            "navigationMode": "guided",
            "navigationApplications": ["wiseMap", "wiseList"],
            "layout": {
                "template": "starmap|leftNav|rightNav",
                "studentIsOnGroupNode": "layout3",
                "studentIsOnApplicationNode": "layout4"
            },
            "metadata": {
                "title": "Self-Propelled Vehicles Challenge"
            }
        };

        var projectBaseURL = "http://localhost:8080/curriculum/12345/";
        var projectURL = projectBaseURL + "project.json";
        var registerNewProjectURL = "http://localhost:8080/wise/project/new";

        function createNormalSpy() {
            spyOn(ConfigService, "getConfigParam").and.callFake(function (param) {
                if (param === "projectBaseURL") {
                    return projectBaseURL;
                } else if (param === "projectURL") {
                    return projectURL;
                } else if (param === "registerNewProjectURL") {
                    return registerNewProjectURL;
                }
            });
        }

        beforeEach(function () {});

        it('should replace asset paths in non-html component content', function () {
            createNormalSpy();
            var contentString = "<img src=\'hello.png\' /><style>{background-url:\'background.jpg\'}</style>";
            var contentStringReplacedAssetPathExpected = "<img src=\'" + projectBaseURL + "assets/hello.png\' /><style>{background-url:\'" + projectBaseURL + "assets/background.jpg\'}</style>";
            var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should replace asset paths in html component content', function () {
            createNormalSpy();
            var contentString = "style=\\\"background-image: url(\\\"background.jpg\\\")\\\"";
            var contentStringReplacedAssetPathExpected = "style=\\\"background-image: url(\\\"" + projectBaseURL + "assets/background.jpg\\\")\\\"";
            var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should retrieve project when Config.projectURL is valid', function () {
            createNormalSpy();
            spyOn(ProjectService, "setProject").and.callThrough(); // actually call through the function
            spyOn(ProjectService, "parseProject");
            $httpBackend.when('GET', projectURL).respond(projectJSON);
            $httpBackend.expectGET(projectURL);
            var projectPromise = ProjectService.retrieveProject();
            $httpBackend.flush();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(ProjectService.setProject).toHaveBeenCalledWith(projectJSON);
            expect(ProjectService.parseProject).toHaveBeenCalled();
            expect(ProjectService.project).toEqual(projectJSON);
        });

        it('should not retrieve project when Config.projectURL is undefined', function () {
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            var project = ProjectService.retrieveProject();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(project).toBeNull();
        });

        it('should register new project', function () {
            createNormalSpy();
            var newProjectIdExpected = 1; // Id of new project created on the server
            $httpBackend.when('POST', registerNewProjectURL).respond(newProjectIdExpected);
            var commitMessage = "I moved the mc step to activity 3.";
            var newProjectIdActual;
            var newProjectIdActualPromise = ProjectService.registerNewProject(projectJSON, commitMessage);
            $httpBackend.flush();
            $httpBackend.expectPOST(registerNewProjectURL);
        });
    });
});
//# sourceMappingURL=projectService.spec.js.map