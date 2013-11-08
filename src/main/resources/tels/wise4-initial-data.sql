-- MySQL dump 10.13  Distrib 5.1.50, for apple-darwin10.3.0 (i386)
--
-- Host: localhost    Database: sail_database
-- ------------------------------------------------------
-- Server version	5.1.50-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `acl_class`
--

LOCK TABLES `acl_class` WRITE;
/*!40000 ALTER TABLE `acl_class` DISABLE KEYS */;
/*!40000 ALTER TABLE `acl_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `acl_entry`
--

LOCK TABLES `acl_entry` WRITE;
/*!40000 ALTER TABLE `acl_entry` DISABLE KEYS */;
/*!40000 ALTER TABLE `acl_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `acl_object_identity`
--

LOCK TABLES `acl_object_identity` WRITE;
/*!40000 ALTER TABLE `acl_object_identity` DISABLE KEYS */;
/*!40000 ALTER TABLE `acl_object_identity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `acl_sid`
--

LOCK TABLES `acl_sid` WRITE;
/*!40000 ALTER TABLE `acl_sid` DISABLE KEYS */;
/*!40000 ALTER TABLE `acl_sid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `annotationbundles`
--

LOCK TABLES `annotationbundles` WRITE;
/*!40000 ALTER TABLE `annotationbundles` DISABLE KEYS */;
/*!40000 ALTER TABLE `annotationbundles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `curnits`
--

LOCK TABLES `curnits` WRITE;
/*!40000 ALTER TABLE `curnits` DISABLE KEYS */;
/*!40000 ALTER TABLE `curnits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `diyprojectcommunicators`
--

LOCK TABLES `diyprojectcommunicators` WRITE;
/*!40000 ALTER TABLE `diyprojectcommunicators` DISABLE KEYS */;
/*!40000 ALTER TABLE `diyprojectcommunicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `externalprojects`
--

LOCK TABLES `externalprojects` WRITE;
/*!40000 ALTER TABLE `externalprojects` DISABLE KEYS */;
/*!40000 ALTER TABLE `externalprojects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `granted_authorities`
--

LOCK TABLES `granted_authorities` WRITE;
/*!40000 ALTER TABLE `granted_authorities` DISABLE KEYS */;
INSERT INTO `granted_authorities` VALUES (1,'ROLE_USER',0),(2,'ROLE_ADMINISTRATOR',0),(3,'ROLE_TEACHER',0),(4,'ROLE_STUDENT',0),(5,'ROLE_AUTHOR',0),(6,'ROLE_RESEARCHER',0);
/*!40000 ALTER TABLE `granted_authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `groups_related_to_users`
--

LOCK TABLES `groups_related_to_users` WRITE;
/*!40000 ALTER TABLE `groups_related_to_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups_related_to_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `jnlps`
--

LOCK TABLES `jnlps` WRITE;
/*!40000 ALTER TABLE `jnlps` DISABLE KEYS */;
/*!40000 ALTER TABLE `jnlps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `message_recipient`
--

LOCK TABLES `message_recipient` WRITE;
/*!40000 ALTER TABLE `message_recipient` DISABLE KEYS */;
/*!40000 ALTER TABLE `message_recipient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `messages_related_to_message_recipients`
--

LOCK TABLES `messages_related_to_message_recipients` WRITE;
/*!40000 ALTER TABLE `messages_related_to_message_recipients` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages_related_to_message_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `modules_related_to_owners`
--

LOCK TABLES `modules_related_to_owners` WRITE;
/*!40000 ALTER TABLE `modules_related_to_owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `modules_related_to_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `newsitem`
--

LOCK TABLES `newsitem` WRITE;
/*!40000 ALTER TABLE `newsitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `offerings`
--

LOCK TABLES `offerings` WRITE;
/*!40000 ALTER TABLE `offerings` DISABLE KEYS */;
/*!40000 ALTER TABLE `offerings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `portal`
--

LOCK TABLES `portal` WRITE;
/*!40000 ALTER TABLE `portal` DISABLE KEYS */;
INSERT INTO portal (id,settings,sendmail_on_exception,OPTLOCK) VALUES (0,"{\"isLoginAllowed\":true}",1,0);
/*!40000 ALTER TABLE `portal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `premadecommentlists`
--

LOCK TABLES `premadecommentlists` WRITE;
/*!40000 ALTER TABLE `premadecommentlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `premadecommentlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `premadecomments`
--

LOCK TABLES `premadecomments` WRITE;
/*!40000 ALTER TABLE `premadecomments` DISABLE KEYS */;
/*!40000 ALTER TABLE `premadecomments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `premadecomments_related_to_premadecommentlists`
--

LOCK TABLES `premadecomments_related_to_premadecommentlists` WRITE;
/*!40000 ALTER TABLE `premadecomments_related_to_premadecommentlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `premadecomments_related_to_premadecommentlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `project_metadata`
--

LOCK TABLES `project_metadata` WRITE;
/*!40000 ALTER TABLE `project_metadata` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_metadata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `projectcommunicators`
--

LOCK TABLES `projectcommunicators` WRITE;
/*!40000 ALTER TABLE `projectcommunicators` DISABLE KEYS */;
/*!40000 ALTER TABLE `projectcommunicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `projects_related_to_bookmarkers`
--

LOCK TABLES `projects_related_to_bookmarkers` WRITE;
/*!40000 ALTER TABLE `projects_related_to_bookmarkers` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects_related_to_bookmarkers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `projects_related_to_owners`
--

LOCK TABLES `projects_related_to_owners` WRITE;
/*!40000 ALTER TABLE `projects_related_to_owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects_related_to_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `projects_related_to_shared_owners`
--

LOCK TABLES `projects_related_to_shared_owners` WRITE;
/*!40000 ALTER TABLE `projects_related_to_shared_owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects_related_to_shared_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `projects_related_to_tags`
--

LOCK TABLES `projects_related_to_tags` WRITE;
/*!40000 ALTER TABLE `projects_related_to_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects_related_to_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `runs`
--

LOCK TABLES `runs` WRITE;
/*!40000 ALTER TABLE `runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `runs_related_to_announcements`
--

LOCK TABLES `runs_related_to_announcements` WRITE;
/*!40000 ALTER TABLE `runs_related_to_announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `runs_related_to_announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `runs_related_to_groups`
--

LOCK TABLES `runs_related_to_groups` WRITE;
/*!40000 ALTER TABLE `runs_related_to_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `runs_related_to_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `runs_related_to_owners`
--

LOCK TABLES `runs_related_to_owners` WRITE;
/*!40000 ALTER TABLE `runs_related_to_owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `runs_related_to_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `runs_related_to_shared_owners`
--

LOCK TABLES `runs_related_to_shared_owners` WRITE;
/*!40000 ALTER TABLE `runs_related_to_shared_owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `runs_related_to_shared_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sds_curnits`
--

LOCK TABLES `sds_curnits` WRITE;
/*!40000 ALTER TABLE `sds_curnits` DISABLE KEYS */;
/*!40000 ALTER TABLE `sds_curnits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sds_jnlps`
--

LOCK TABLES `sds_jnlps` WRITE;
/*!40000 ALTER TABLE `sds_jnlps` DISABLE KEYS */;
/*!40000 ALTER TABLE `sds_jnlps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sds_offerings`
--

LOCK TABLES `sds_offerings` WRITE;
/*!40000 ALTER TABLE `sds_offerings` DISABLE KEYS */;
/*!40000 ALTER TABLE `sds_offerings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sds_users`
--

LOCK TABLES `sds_users` WRITE;
/*!40000 ALTER TABLE `sds_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `sds_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sds_workgroups`
--

LOCK TABLES `sds_workgroups` WRITE;
/*!40000 ALTER TABLE `sds_workgroups` DISABLE KEYS */;
/*!40000 ALTER TABLE `sds_workgroups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sds_workgroups_related_to_sds_users`
--

LOCK TABLES `sds_workgroups_related_to_sds_users` WRITE;
/*!40000 ALTER TABLE `sds_workgroups_related_to_sds_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `sds_workgroups_related_to_sds_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `student_user_details`
--

LOCK TABLES `student_user_details` WRITE;
/*!40000 ALTER TABLE `student_user_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_user_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `teacher_user_details`
--

LOCK TABLES `teacher_user_details` WRITE;
/*!40000 ALTER TABLE `teacher_user_details` DISABLE KEYS */;
INSERT INTO `teacher_user_details` (city,country,curriculumsubjects,displayname,firstname,lastlogintime,lastname,numberoflogins,schoollevel,schoolname,signupdate,state,id) VALUES ('Berkeley','USA',NULL,'adminuser','ad',NULL,'min',0,3,'Berkeley','2010-10-25 15:41:31','CA',1),('Berkeley','USA',NULL,'previewuser','preview',NULL,'user',0,3,'Berkeley','2010-10-25 15:41:31','CA',2);
/*!40000 ALTER TABLE `teacher_user_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `urlmodules`
--

LOCK TABLES `urlmodules` WRITE;
/*!40000 ALTER TABLE `urlmodules` DISABLE KEYS */;
/*!40000 ALTER TABLE `urlmodules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_details`
--

LOCK TABLES `user_details` WRITE;
/*!40000 ALTER TABLE `user_details` DISABLE KEYS */;
INSERT INTO `user_details` (id, account_not_expired, account_not_locked, credentials_not_expired, email_address, enabled, password, username, OPTLOCK)  VALUES (1,'','','',NULL,'','24c002f26c14d8e087ade986531c7b5d','admin',0),(2,'','','',NULL,'','2ece21e1cf40509868e5a74a48d49a50','previewuser',0);
/*!40000 ALTER TABLE `user_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_details_related_to_roles`
--

LOCK TABLES `user_details_related_to_roles` WRITE;
/*!40000 ALTER TABLE `user_details_related_to_roles` DISABLE KEYS */;
INSERT INTO `user_details_related_to_roles` VALUES (1,1),(1,2),(1,3),(1,5),(2,1),(2,3),(2,5);
/*!40000 ALTER TABLE `user_details_related_to_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,0,NULL,1),(2,0,NULL,2);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `wiseworkgroups`
--

LOCK TABLES `wiseworkgroups` WRITE;
/*!40000 ALTER TABLE `wiseworkgroups` DISABLE KEYS */;
/*!40000 ALTER TABLE `wiseworkgroups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `workgroups`
--

LOCK TABLES `workgroups` WRITE;
/*!40000 ALTER TABLE `workgroups` DISABLE KEYS */;
/*!40000 ALTER TABLE `workgroups` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2010-10-25 15:44:09
