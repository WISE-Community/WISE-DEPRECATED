SET DATABASE REFERENTIAL INTEGRITY FALSE


INSERT INTO granted_authorities VALUES (1,'ROLE_USER',0),(2,'ROLE_ADMINISTRATOR',0),(3,'ROLE_TEACHER',0),(4,'ROLE_STUDENT',0),(5,'ROLE_AUTHOR',0),(6,'ROLE_RESEARCHER',0)

INSERT INTO portal (id,settings,sendmail_on_exception,OPTLOCK) VALUES (0,'{isLoginAllowed:true}',1,0);

INSERT INTO teacher_user_details (city,country,curriculumsubjects,displayname,isEmailValid,firstname,lastlogintime,lastname,numberoflogins,schoollevel,schoolname,signupdate,state,id) VALUES ('Berkeley','USA',NULL,'adminuser','0','ad',NULL,'min',0,3,'Berkeley','2010-10-25 15:41:31','CA',1),('Berkeley','USA',NULL,'preview','0','pre',NULL,'view',0,3,'Berkeley','2010-10-25 15:41:31','CA',2)

INSERT INTO users (id, sds_user_fk, OPTLOCK, user_details_fk) VALUES (1,NULL,0,1),(2,NULL,0,2)

INSERT INTO user_details (id, account_not_expired, account_not_locked, credentials_not_expired, email_address, enabled, password, username, OPTLOCK)  VALUES (1,1,1,1,NULL,1,'24c002f26c14d8e087ade986531c7b5d','admin',0),(2,1,1,1,NULL,1,'4cd92091d686b42ec74a29a26432915a','preview',0)

INSERT INTO user_details_related_to_roles VALUES (1,1),(1,2),(1,3),(1,5),(2,1),(2,3),(2,5)


/* Register Plate Tectonics and Cellular Respiration sample projects */
INSERT INTO CURNITS VALUES(1,NULL,0,NULL)
INSERT INTO MODULES VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,1)
INSERT INTO URLMODULES VALUES('/1/wise4.project.json',1)
INSERT INTO PROJECT_METADATA VALUES(1,'','6-7 hours','Elissa Sato (elissa.sato@berkeley.edu)','6-8','earth science, plate tectonics, convection','English',NULL,NULL,NULL,'General Suggestions: <br><br>\u000aStudents will benefit from signposting before the start of each day, e.g., being asked to reach certain steps and activities.  <br><br>\u000aThere are extra credit steps in the project (Activity 8) for advanced students, but preparing off-line activities and assignments may also be useful for teachers to accommodate the range of students'' abilities and speed.<br><br>\u000a\u000aActivity 1 and Activity 7 are assessment items that may be used by teachers in conjunction with their existing assessments. Most items are completed in pairs, but one item allows for individual completion.<br><br>\u000a\u000aSome suggestions from teachers who have run the project:<br><br>\u000a<ul><li>Step 2.4: A classroom discussion with the map will help students focus on the important parts of the map.\u000a<li>Step 4.8: The simulation may take a while to load depending on the computer/network speed, and there may be several seconds with a blank screen before the active loading screen appears, so students may think there is something wrong. Also, it may take a while for the molecules to come back together in the simulation after clicking "remove cup of hot water," so ask students to be patient.</li></ul>','[]','classic',NULL,NULL,'http://www.cde.ca.gov/be/st/ss/documents/sciencestnd.pdf\u000a6th Grade \u000aPlate Tectonics and Earth''s Structure, 1a-f\u000aEnergy in the Earth System, 4c','Earth Science','Students investigate geologic patterns in the United States, then delve deeper into Earth''s layers to understand how surface features and events arise from invisible inner processes.','{"techDetails":"Molecular Workbench, MySystem, Draw Tool","flash":true,"quickTime":false,"java":true}','wise','Plate Tectonics','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"8jE1yRS1aI","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["Animation or Video","Real-life Observation","Text in this Unit","Visualization or Model","Teacher or Parent","Classmate or Friend","School Textbook","Movie/Book (non-school)"]},{"id":"67VhYQUsyO","allowCustom":false,"isRequired":true,"name":"Sure of this idea?","type":"source","options":["Positive","Fairly Sure","Somewhat Sure","Not Sure"]},{"id":"LPVa3d6OFI","isRequired":true,"name":"Tags","type":"tags","options":["Conduction","Convection","Mountains, Volcanoes","Ocean Floor","Convergent Boundary","Divergent Boundary","Transform Boundary","Density","Heat Energy","None"]}],"basketTerm":"Idea Basket","addIdeaTerm":"Add Idea","ideaTerm":"idea","ebTerm":"Explanation Builder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":true}','6-7 hours',NULL)
INSERT INTO PROJECTS VALUES(1,'2013-06-05 14:18:41.292000',NULL,0,'1','0','0',NULL,'Plate Tectonics',NULL,4,0,1,NULL,1,NULL)
INSERT INTO ACL_SID VALUES(1,TRUE,'admin',NULL)
INSERT INTO ACL_CLASS VALUES(1,'org.telscenter.sail.webapp.domain.project.impl.ProjectImpl',NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(1,1,NULL,'1',NULL,1,1,NULL)
INSERT INTO ACL_ENTRY VALUES(1,0,'0','0','1',16,NULL,1,1)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=1
INSERT INTO ACL_OBJECT_IDENTITY VALUES(1,1,NULL,'1',NULL,1,1,NULL)
INSERT INTO PROJECTS_RELATED_TO_OWNERS VALUES(1,1)

INSERT INTO CURNITS VALUES(2,NULL,0,NULL)
INSERT INTO MODULES VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,2)
INSERT INTO URLMODULES VALUES('/2/wise4.project.json',2)
INSERT INTO PROJECT_METADATA VALUES(2,'','4-5 hours','Kihyun (Kelly) Ryoo, khryoo@berkeley.edu','6-8','Cellular respiration, life science, energy release, energy transfer, energy storage','English',NULL,NULL,NULL,'Activity 1 is designed to review energy concepts learned in the Photosynthesis unit. This step can be skipped.\u000a\u000aStep 4.4 is an experiment step using simulation. A demo or classroom discussion about how to use the simulation can help students conduct experiments in this step.\u000a\u000aStep 5.6 is a MySystem step. Students often forget to choose a type of energy flowing when generating MySystem. \u000a\u000aIt may take a while to load icons. If icons are missing in this step, go back to Step 5.5. and come back to Step 5.6.','[]','classic',NULL,NULL,'Grade Six\u000a\u000aEcology (Life Sciences) \u000a5. Organisms in ecosystems exchange energy and nutrients among themselves and with\u000athe environment. As a basis for understanding this concept: \u000aa. Students know energy entering ecosystems as sunlight is transferred by producers into chemical energy through photosynthesis and then from organism to organism through food webs.\u000ab. Students know matter is transferred over time from one organism to others in the food web and between organisms and the physical environment.\u000a\u000aGrade 7\u000a\u000aCell Biology \u000a1. All living organisms are composed of cells, from just one to many trillions, whose details usually are visible only through a microscope. As a basis for understanding this concept:\u000ab. Students know the characteristics that distinguish plant cells from animal cells, including chloroplasts and cell walls.\u000ad. Students know that mitochondria liberate energy for the work that cells do and that chloroplasts capture sunlight energy for photosynthesis.\u000a','Life Science','Students investigate how plants release the chemical energy stored in glucose as usable energy and use this energy for growth, reproduction, and other energy needs. ','{"techDetails":"MySystem","flash":true,"quickTime":true,"java":false}','wise','Cellular Respiration','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"sGkykLXHoQ","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["Evidence Step","Visualization or Model","Movie/Video","Everyday Observation","School or Teacher"]},{"id":"vEq7S0JZ1W","isRequired":false,"name":"Icon","type":"icon","options":["blank","important","question"]}],"basketTerm":"Idea Basket","addIdeaTerm":"Add Idea","ideaTerm":"idea","ebTerm":"Explanation Builder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":false}','4-5 hours',NULL)
INSERT INTO PROJECTS VALUES(2,'2013-06-05 14:20:27.282000',NULL,0,'1','0','0',NULL,'Cellular Respiration',NULL,4,0,2,NULL,2,NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(2,2,NULL,'1',NULL,1,1,NULL)
INSERT INTO ACL_ENTRY VALUES(2,0,'0','0','1',16,NULL,1,2)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=2
INSERT INTO ACL_OBJECT_IDENTITY VALUES(2,2,NULL,'1',NULL,1,1,NULL)
INSERT INTO PROJECTS_RELATED_TO_OWNERS VALUES(2,1)


INSERT INTO TAGS VALUES(1,'public')
INSERT INTO TAGS VALUES(2,'library')
INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(1,1)
INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(1,2)
INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(2,1)
INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(2,2)

/* Create Sample Runs for the sample teacher using the sample projects */

/* create sample plate tectonics run for preview teacher */
INSERT INTO CURNITS VALUES(3,NULL,0,NULL)
INSERT INTO MODULES VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,3)
INSERT INTO URLMODULES VALUES('/3/wise4.project.json',3)
INSERT INTO PROJECT_METADATA VALUES(3,'{"username":"admin","fullname":"ad min"}','6-7 hours','Elissa Sato (elissa.sato@berkeley.edu)','6-8','earth science, plate tectonics, convection','English',NULL,NULL,NULL,'General Suggestions: <br><br>\u005cu000aStudents will benefit from signposting before the start of each day, e.g., being asked to reach certain steps and activities.  <br><br>\u005cu000aThere are extra credit steps in the project (Activity 8) for advanced students, but preparing off-line activities and assignments may also be useful for teachers to accommodate the range of students'' abilities and speed.<br><br>\u005cu000a\u005cu000aActivity 1 and Activity 7 are assessment items that may be used by teachers in conjunction with their existing assessments. Most items are completed in pairs, but one item allows for individual completion.<br><br>\u005cu000a\u005cu000aSome suggestions from teachers who have run the project:<br><br>\u005cu000a<ul><li>Step 2.4: A classroom discussion with the map will help students focus on the important parts of the map.\u005cu000a<li>Step 4.8: The simulation may take a while to load depending on the computer/network speed, and there may be several seconds with a blank screen before the active loading screen appears, so students may think there is something wrong. Also, it may take a while for the molecules to come back together in the simulation after clicking "remove cup of hot water," so ask students to be patient.</li></ul>','[]','classic',NULL,NULL,'http://www.cde.ca.gov/be/st/ss/documents/sciencestnd.pdf\u005cu000a6th Grade \u005cu000aPlate Tectonics and Earth''s Structure, 1a-f\u005cu000aEnergy in the Earth System, 4c','Earth Science','Students investigate geologic patterns in the United States, then delve deeper into Earth''s layers to understand how surface features and events arise from invisible inner processes.','{"techDetails":"Molecular Workbench, MySystem, Draw Tool","flash":true,"quickTime":false,"java":true}','wise','Plate Tectonics','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"8jE1yRS1aI","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["Animation or Video","Real-life Observation","Text in this Unit","Visualization or Model","Teacher or Parent","Classmate or Friend","School Textbook","Movie/Book (non-school)"]},{"id":"67VhYQUsyO","allowCustom":false,"isRequired":true,"name":"Sure of this idea?","type":"source","options":["Positive","Fairly Sure","Somewhat Sure","Not Sure"]},{"id":"LPVa3d6OFI","isRequired":true,"name":"Tags","type":"tags","options":["Conduction","Convection","Mountains, Volcanoes","Ocean Floor","Convergent Boundary","Divergent Boundary","Transform Boundary","Density","Heat Energy","None"]}],"basketTerm":"Idea Basket","addIdeaTerm":"Add Idea","ideaTerm":"idea","ebTerm":"Explanation Builder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":true}','6-7 hours',NULL)
INSERT INTO PROJECTS VALUES(3,'2013-06-05 15:53:00.070000',NULL,0,'1','0','0',NULL,'Plate Tectonics',1,4,0,3,NULL,3,NULL)
INSERT INTO ACL_SID VALUES(2,TRUE,'preview',NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(3,3,NULL,'1',NULL,1,2,NULL)
INSERT INTO ACL_ENTRY VALUES(3,0,'0','0','1',16,NULL,2,3)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=3
INSERT INTO ACL_OBJECT_IDENTITY VALUES(3,3,NULL,'1',NULL,1,2,NULL)
INSERT INTO PROJECTS_RELATED_TO_OWNERS VALUES(3,2)
INSERT INTO GROUPS VALUES(1,'1',0,NULL)
INSERT INTO GROUPS VALUES(2,'2',0,NULL)
INSERT INTO GROUPS VALUES(3,'3',0,NULL)
INSERT INTO OFFERINGS VALUES(1,0,NULL)
INSERT INTO RUNS VALUES('2013-07-05 15:53:00.142000',NULL,NULL,NULL,NULL,NULL,3,'Plate Tectonics',5,'Snake223','2013-06-05 15:53:00.135000',NULL,NULL,1,3)
INSERT INTO ACL_CLASS VALUES(2,'org.telscenter.sail.webapp.domain.impl.RunImpl',NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(4,1,NULL,'1',NULL,2,2,NULL)
INSERT INTO ACL_ENTRY VALUES(4,0,'0','0','1',16,NULL,2,4)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=4
INSERT INTO ACL_OBJECT_IDENTITY VALUES(4,1,NULL,'1',NULL,2,2,NULL)
INSERT INTO RUNS_RELATED_TO_OWNERS VALUES(1,2)
INSERT INTO RUNS_RELATED_TO_GROUPS VALUES(1,1)
INSERT INTO RUNS_RELATED_TO_GROUPS VALUES(1,2)
INSERT INTO RUNS_RELATED_TO_GROUPS VALUES(1,3)
INSERT INTO GROUPS VALUES(4,' preview',0,NULL)
INSERT INTO WORKGROUPS VALUES(1,0,4,1,NULL)
INSERT INTO WISEWORKGROUPS VALUES(NULL,'1',1,NULL)
INSERT INTO ACL_CLASS VALUES(3,'org.telscenter.sail.webapp.domain.workgroup.impl.WISEWorkgroupImpl',NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(5,1,NULL,'1',NULL,3,2,NULL)
INSERT INTO ACL_ENTRY VALUES(5,0,'0','0','1',16,NULL,2,5)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=5
INSERT INTO ACL_OBJECT_IDENTITY VALUES(5,1,NULL,'1',NULL,3,2,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(4,2)

/* add test students student0101~0103 to plate tectonics run */
INSERT INTO USER_DETAILS VALUES(3,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0101',0)
INSERT INTO STUDENT_USER_DETAILS VALUES('wise','QUESTION_ONE','2013-01-01 15:55:51.240000','studen',0,NULL,'t',0,'2013-06-05 15:55:51.240000',3)
INSERT INTO USERS VALUES(3,0,NULL,3)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(3,4)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(3,1)
DELETE FROM GROUPS WHERE ID=1
INSERT INTO GROUPS VALUES(1,'1',1,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(1,3)


INSERT INTO USER_DETAILS VALUES(4,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0102',0)
INSERT INTO STUDENT_USER_DETAILS VALUES('wise','QUESTION_ONE','2013-01-02 16:01:28.450000','studen',0,NULL,'t',0,'2013-06-05 16:01:28.450000',4)
INSERT INTO USERS VALUES(4,0,NULL,4)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(4,4)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(4,1)
DELETE FROM GROUPS WHERE ID=2
INSERT INTO GROUPS VALUES(2,'2',1,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(2,4)

INSERT INTO USER_DETAILS VALUES(5,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0103',0)
INSERT INTO STUDENT_USER_DETAILS VALUES('wise','QUESTION_ONE','2013-01-03 16:01:46.941000','studen',0,NULL,'t',0,'2013-06-05 16:01:46.941000',5)
INSERT INTO USERS VALUES(5,0,NULL,5)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(5,4)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(5,1)
DELETE FROM GROUPS WHERE ID=2
INSERT INTO GROUPS VALUES(2,'2',2,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(2,5)


/* Add Chemical Reactions sample project */
INSERT INTO CURNITS VALUES(4,NULL,0,NULL)
INSERT INTO MODULES VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,4)
INSERT INTO URLMODULES VALUES('/4/wise4.project.json',4)
INSERT INTO PROJECT_METADATA VALUES(4,'','4-5 hours','','6-12','balanced equations, reactants, products, global warming, hydrocarbons','English',NULL,NULL,NULL,'','[{"nodeId":"node_150.or","maxScoreValue":1},{"nodeId":"node_151.or","maxScoreValue":3},{"nodeId":"node_157.or","maxScoreValue":2},{"nodeId":"node_52.al","maxScoreValue":1},{"nodeId":"node_66.or","maxScoreValue":3},{"nodeId":"node_54.al","maxScoreValue":1},{"nodeId":"node_97.al","maxScoreValue":1},{"nodeId":"node_103.or","maxScoreValue":2},{"nodeId":"node_89.al","maxScoreValue":0},{"nodeId":"node_147.or","maxScoreValue":2},{"nodeId":"node_159.my","maxScoreValue":10},{"nodeId":"node_102.al","maxScoreValue":5},{"nodeId":"node_158.fi","maxScoreValue":1},{"nodeId":"node_12.mc","maxScoreValue":0},{"nodeId":"node_160.fi","maxScoreValue":0},{"nodeId":"node_152.my","maxScoreValue":5},{"nodeId":"node_163.al","maxScoreValue":10},{"nodeId":"node_150.al","maxScoreValue":2},{"nodeId":"node_164.or","maxScoreValue":1},{"nodeId":"node_167.mc","maxScoreValue":2},{"nodeId":"node_166.or","maxScoreValue":2},{"nodeId":"node_169.al","maxScoreValue":3},{"nodeId":"node_171.al","maxScoreValue":2},{"nodeId":"node_170.al","maxScoreValue":5},{"nodeId":"node_172.fi","maxScoreValue":0},{"nodeId":"node_173.al","maxScoreValue":2},{"nodeId":"node_161.al","maxScoreValue":0},{"nodeId":"node_165.or","maxScoreValue":1},{"nodeId":"node_168.mc","maxScoreValue":2},{"nodeId":"node_167.or","maxScoreValue":2},{"nodeId":"node_172.al","maxScoreValue":2},{"nodeId":"node_55.al","maxScoreValue":5},{"nodeId":"node_66.al","maxScoreValue":3},{"nodeId":"node_68.al","maxScoreValue":3},{"nodeId":"node_69.al","maxScoreValue":3},{"nodeId":"node_70.al","maxScoreValue":3},{"nodeId":"node_71.al","maxScoreValue":6},{"nodeId":"node_72.al","maxScoreValue":6},{"nodeId":"node_165.al","maxScoreValue":10},{"nodeId":"node_166.al","maxScoreValue":10},{"nodeId":"node_171.or","maxScoreValue":10},{"nodeId":"node_172.mc","maxScoreValue":10},{"nodeId":"node_168.al","maxScoreValue":10},{"nodeId":"node_174.al","maxScoreValue":10},{"nodeId":"node_179.al","maxScoreValue":10},{"nodeId":"node_180.al","maxScoreValue":10},{"nodeId":"node_2.my","maxScoreValue":0},{"nodeId":"node_164.al","maxScoreValue":10},{"nodeId":"node_177.al","maxScoreValue":10},{"nodeId":"node_178.al","maxScoreValue":10},{"nodeId":"node_94.fi","maxScoreValue":5},{"nodeId":"node_8.or","maxScoreValue":5},{"nodeId":"node_86.al","maxScoreValue":5},{"nodeId":"node_88.al","maxScoreValue":10},{"nodeId":"node_95.or","maxScoreValue":5},{"nodeId":"node_82.al","maxScoreValue":10},{"nodeId":"node_106.al","maxScoreValue":5},{"nodeId":"node_96.or","maxScoreValue":10},{"nodeId":"node_79.al","maxScoreValue":10},{"nodeId":"node_105.al","maxScoreValue":10},{"nodeId":"node_40.fi","maxScoreValue":5},{"nodeId":"node_77.al","maxScoreValue":5},{"nodeId":"node_85.al","maxScoreValue":10},{"nodeId":"node_80.al","maxScoreValue":10},{"nodeId":"node_6.mc","maxScoreValue":5},{"nodeId":"node_92.al","maxScoreValue":10},{"nodeId":"node_57.al","maxScoreValue":10},{"nodeId":"node_93.al","maxScoreValue":10},{"nodeId":"node_101.my","maxScoreValue":10}]',NULL,NULL,NULL,'','Physical Science','Students investigate chemical reactions that result in an increase of greenhouse gases in the atmosphere. They then apply the evidence they have gathered to understand the impact of human actions on global climate change.','{"techDetails":""}',NULL,'Chemical Reactions: How Can We Slow Climate Change?','{"isIdeaManagerEnabled":"checked"}','4-5 hours',NULL)
INSERT INTO PROJECTS VALUES(4,'2013-06-11 09:34:54.154000',NULL,0,'1','0','0',NULL,'Chemical Reactions: How Can We Slow Climate Change?',NULL,4,0,4,NULL,4,NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(6,4,NULL,'1',NULL,1,1,NULL)
INSERT INTO ACL_ENTRY VALUES(6,0,'0','0','1',16,NULL,1,6)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=6
INSERT INTO ACL_OBJECT_IDENTITY VALUES(6,4,NULL,'1',NULL,1,1,NULL)
INSERT INTO PROJECTS_RELATED_TO_OWNERS VALUES(4,1)

INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(4,1)
INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(4,2)


/* Add EPIGAME sample project */
INSERT INTO CURNITS VALUES(5,NULL,0,NULL)
INSERT INTO MODULES VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,5)
INSERT INTO URLMODULES VALUES('/5/wise4.project.json',5)
INSERT INTO PROJECT_METADATA VALUES(5,'{"username":"DeanneAdams","fullname":"Deanne Adams"}',NULL,'',NULL,'',NULL,NULL,NULL,NULL,'','[]','map',NULL,NULL,'','Physics','','{"techDetails":"","flash":false,"quickTime":false,"java":false}','starmap','EPIGAME Base Warp Version II','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"BFPgy8HPdv","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["EvidenceStep","VisualizationorModel","Movie/Video","EverydayObservation","SchoolorTeacher"]},{"id":"KwE3uMi1jt","isRequired":false,"name":"Icon","type":"icon","options":["blank","important","question"]}],"basketTerm":"IdeaBasket","addIdeaTerm":"AddIdea+","ideaTerm":"idea","ebTerm":"ExplanationBuilder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":false,"themeSettings":[],"navSettings":[{"navMode":"map","theme":"starmap","nodeSettings":{"node_14.ep":{"y":90.65265504123295,"x":702.2863061765547},"node_92.ep":{"y":352.71348399447,"x":572.5690350391425},"node_11.fl":{"y":178.71837873775223,"x":562.260324644418},"node_6.ep":{"y":163.2512303223769,"x":795.9505988823153},"node_56.ep":{"y":244.90401761777682,"x":328.566361747303},"node_12.fl":{"y":287.80177924500373,"x":409.9279131169279},"node_44.ep":{"y":424.2479806657159,"x":502.0110737680059},"node_7.ep":{"y":340.40918063680635,"x":276.7747937233931},"node_5.txt":{"y":250.73270477345153,"x":502.0696419186129},"node_0.ep":{"y":64.89648899999989,"x":556.3216121621413},"node_4.ep":{"y":199.8196375975159,"x":264.2447639050285},"node_3.fl":{"y":438.11295021026984,"x":650.2146045889939},"node_86.ep":{"y":275.15661252341056,"x":738.827649756646},"node_9.ep":{"y":278.72951629149986,"x":634.0146610147365},"node_26.ep":{"y":376.00175060164383,"x":779.9263124655988},"node_50.ep":{"y":443.1878514287957,"x":349.43671391916047},"node_20.ep":{"y":275.15959968420657,"x":819.4340261638574},"node_2.ep":{"y":119.36113729911295,"x":330.09207896503426},"node_62.ep":{"y":167.0162350147504,"x":427.33997076129896},"node_13.ep":{"y":368.1344634296162,"x":439.5871548141363},"node_80.ep":{"y":160.78475544160614,"x":682.6898005034674},"node_1.fl":{"y":99.54926550685084,"x":434.2172578074868}}}]}',NULL,NULL)
INSERT INTO PROJECTS VALUES(5,'2013-09-26 11:16:28.337000',NULL,0,'1','0','0',NULL,'EPIGAME',NULL,4,0,5,NULL,5,NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(7,5,NULL,'1',NULL,1,1,NULL)
INSERT INTO ACL_ENTRY VALUES(7,0,'0','0','1',16,NULL,1,7)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=7
INSERT INTO ACL_OBJECT_IDENTITY VALUES(7,5,NULL,'1',NULL,1,1,NULL)
INSERT INTO PROJECTS_RELATED_TO_OWNERS VALUES(5,1)

INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(5,1)
INSERT INTO PROJECTS_RELATED_TO_TAGS VALUES(5,2)

/* Create run with Epigame project */
INSERT INTO CURNITS VALUES(6,NULL,0,NULL)
INSERT INTO MODULES VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,6)
INSERT INTO URLMODULES VALUES('/6/wise4.project.json',6)
INSERT INTO PROJECT_METADATA VALUES(6,'{"username":"DeanneAdams","fullname":"Deanne Adams"}',NULL,'',NULL,'',NULL,NULL,NULL,NULL,'','[]','map',NULL,NULL,'','Physics','','{"techDetails":"","flash":false,"quickTime":false,"java":false}','starmap','EPIGAME Base Warp Version II','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"BFPgy8HPdv","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["EvidenceStep","VisualizationorModel","Movie/Video","EverydayObservation","SchoolorTeacher"]},{"id":"KwE3uMi1jt","isRequired":false,"name":"Icon","type":"icon","options":["blank","important","question"]}],"basketTerm":"IdeaBasket","addIdeaTerm":"AddIdea+","ideaTerm":"idea","ebTerm":"ExplanationBuilder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":false,"themeSettings":[],"navSettings":[{"navMode":"map","theme":"starmap","nodeSettings":{"node_14.ep":{"y":90.65265504123295,"x":702.2863061765547},"node_92.ep":{"y":352.71348399447,"x":572.5690350391425},"node_11.fl":{"y":178.71837873775223,"x":562.260324644418},"node_6.ep":{"y":163.2512303223769,"x":795.9505988823153},"node_56.ep":{"y":244.90401761777682,"x":328.566361747303},"node_12.fl":{"y":287.80177924500373,"x":409.9279131169279},"node_44.ep":{"y":424.2479806657159,"x":502.0110737680059},"node_7.ep":{"y":340.40918063680635,"x":276.7747937233931},"node_5.txt":{"y":250.73270477345153,"x":502.0696419186129},"node_0.ep":{"y":64.89648899999989,"x":556.3216121621413},"node_4.ep":{"y":199.8196375975159,"x":264.2447639050285},"node_3.fl":{"y":438.11295021026984,"x":650.2146045889939},"node_86.ep":{"y":275.15661252341056,"x":738.827649756646},"node_9.ep":{"y":278.72951629149986,"x":634.0146610147365},"node_26.ep":{"y":376.00175060164383,"x":779.9263124655988},"node_50.ep":{"y":443.1878514287957,"x":349.43671391916047},"node_20.ep":{"y":275.15959968420657,"x":819.4340261638574},"node_2.ep":{"y":119.36113729911295,"x":330.09207896503426},"node_62.ep":{"y":167.0162350147504,"x":427.33997076129896},"node_13.ep":{"y":368.1344634296162,"x":439.5871548141363},"node_80.ep":{"y":160.78475544160614,"x":682.6898005034674},"node_1.fl":{"y":99.54926550685084,"x":434.2172578074868}}}]}',NULL,NULL)
INSERT INTO PROJECTS VALUES(6,'2013-09-26 11:21:25.553000',NULL,0,'1','0','0',NULL,'EPIGAME',5,4,0,6,NULL,6,NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(8,6,NULL,'1',NULL,1,2,NULL)
INSERT INTO ACL_ENTRY VALUES(8,0,'0','0','1',16,NULL,2,8)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=8
INSERT INTO ACL_OBJECT_IDENTITY VALUES(8,6,NULL,'1',NULL,1,2,NULL)
INSERT INTO PROJECTS_RELATED_TO_OWNERS VALUES(6,2)
INSERT INTO GROUPS VALUES(5,'1',0,NULL)
INSERT INTO GROUPS VALUES(6,'2',0,NULL)
INSERT INTO OFFERINGS VALUES(2,0,NULL)
INSERT INTO RUNS VALUES('2013-10-26 11:21:25.594000',NULL,NULL,NULL,NULL,NULL,3,'EPIGAME',5,'Tiger796','2013-09-26 11:21:25.588000',NULL,NULL,2,6)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(9,2,NULL,'1',NULL,2,2,NULL)
INSERT INTO ACL_ENTRY VALUES(9,0,'0','0','1',16,NULL,2,9)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=9
INSERT INTO ACL_OBJECT_IDENTITY VALUES(9,2,NULL,'1',NULL,2,2,NULL)
INSERT INTO RUNS_RELATED_TO_OWNERS VALUES(2,2)
INSERT INTO RUNS_RELATED_TO_GROUPS VALUES(2,5)
INSERT INTO RUNS_RELATED_TO_GROUPS VALUES(2,6)
INSERT INTO GROUPS VALUES(7,' preview',0,NULL)
INSERT INTO WORKGROUPS VALUES(2,0,7,2,NULL)
INSERT INTO WISEWORKGROUPS VALUES(NULL,'1',2,NULL)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(10,2,NULL,'1',NULL,3,2,NULL)
INSERT INTO ACL_ENTRY VALUES(10,0,'0','0','1',16,NULL,2,10)
DELETE FROM ACL_OBJECT_IDENTITY WHERE ID=10
INSERT INTO ACL_OBJECT_IDENTITY VALUES(10,2,NULL,'1',NULL,3,2,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(7,2)

/* Add student0101~0103 to Epigame run */
DELETE FROM USER_DETAILS WHERE ID=3
INSERT INTO USER_DETAILS VALUES(3,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0101',1)
DELETE FROM STUDENT_USER_DETAILS WHERE ID=3
INSERT INTO STUDENT_USER_DETAILS VALUES('wise','QUESTION_ONE','2013-01-01 15:55:51.240000','studen',0,'2013-09-26 11:24:03.994000','t',1,'2013-06-05 15:55:51.240000',3)
DELETE FROM GROUPS WHERE ID=5
INSERT INTO GROUPS VALUES(5,'1',1,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(5,3)


DELETE FROM USER_DETAILS WHERE ID=4
INSERT INTO USER_DETAILS VALUES(4,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0102',1)
DELETE FROM STUDENT_USER_DETAILS WHERE ID=4
INSERT INTO STUDENT_USER_DETAILS VALUES('wise','QUESTION_ONE','2013-01-02 16:01:28.450000','studen',0,'2013-09-26 11:25:24.922000','t',1,'2013-06-05 16:01:28.450000',4)
DELETE FROM GROUPS WHERE ID=5
INSERT INTO GROUPS VALUES(5,'1',2,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(5,4)

DELETE FROM USER_DETAILS WHERE ID=5
INSERT INTO USER_DETAILS VALUES(5,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0103',1)
DELETE FROM STUDENT_USER_DETAILS WHERE ID=5
INSERT INTO STUDENT_USER_DETAILS VALUES('wise','QUESTION_ONE','2013-01-03 16:01:46.941000','studen',0,'2013-09-26 11:25:35.957000','t',1,'2013-06-05 16:01:46.941000',5)
DELETE FROM GROUPS WHERE ID=5
INSERT INTO GROUPS VALUES(5,'1',3,NULL)
INSERT INTO GROUPS_RELATED_TO_USERS VALUES(5,5)



SET DATABASE REFERENTIAL INTEGRITY TRUE