-- initial data for wise

SET DATABASE REFERENTIAL INTEGRITY FALSE;

INSERT INTO granted_authorities VALUES (1,'ROLE_USER',0),(2,'ROLE_ADMINISTRATOR',0),(3,'ROLE_TEACHER',0),(4,'ROLE_STUDENT',0),(5,'ROLE_AUTHOR',0),(6,'ROLE_RESEARCHER',0),(7,'ROLE_TRUSTED_AUTHOR',0);

INSERT INTO portal (id,settings,sendmail_on_exception,OPTLOCK) VALUES (1,'{isLoginAllowed:true}',1,0);

INSERT INTO user_details (id, account_not_expired, account_not_locked, credentials_not_expired, email_address, enabled, language, password, username, OPTLOCK)  VALUES (1,1,1,1,NULL,1,'en','24c002f26c14d8e087ade986531c7b5d','admin',0),(2,1,1,1,NULL,1,'en','4cd92091d686b42ec74a29a26432915a','preview',0);

INSERT INTO users (id, OPTLOCK, user_details_fk) VALUES (1,0,1),(2,0,2);

INSERT INTO teacher_user_details (city,country,curriculumsubjects,displayname,isEmailValid,firstname,lastlogintime,lastname,numberoflogins,schoollevel,schoolname,signupdate,state,id) VALUES ('Berkeley','USA',NULL,'adminuser',0,'ad',NULL,'min',0,3,'Berkeley','2010-10-25 15:41:31','CA',1),('Berkeley','USA',NULL,'preview',0,'pre',NULL,'view',0,3,'Berkeley','2010-10-25 15:41:31','CA',2);

INSERT INTO user_details_related_to_roles VALUES (1,1),(1,2),(1,3),(1,5),(2,1),(2,3),(2,5);

SET DATABASE REFERENTIAL INTEGRITY TRUE