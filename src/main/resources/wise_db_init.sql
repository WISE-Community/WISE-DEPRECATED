set FOREIGN_KEY_CHECKS=0;

create table achievements (
    id int unsigned not null auto_increment,
    runId bigint null,
    workgroupId bigint null,
    achievementId varchar(255) not null,
    type varchar(32) not null,
    data text not null,
    achievementTime datetime not null,
    index achievementsRunIdIndex (runId),
    index achievementsWorkgroupIdIndex (workgroupId),
    constraint achievementsRunFK foreign key (runId) references runs (id),
    constraint achievementsWorkgroupFK foreign key (workgroupId) references workgroups (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table acl_class (
    id bigint not null auto_increment,
    class varchar(255) not null,
    OPTLOCK integer,
    constraint acl_classClassUnique unique (class),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table acl_entry (
    id bigint not null auto_increment,
    ace_order integer not null,
    audit_failure bit not null,
    audit_success bit not null,
    granting bit not null,
    mask integer not null,
    OPTLOCK integer,
    sid bigint not null,
    acl_object_identity bigint not null,
    constraint acl_entrySidFK foreign key (sid) references acl_sid (id),
    constraint acl_entryAclObjectIdentityFK foreign key (acl_object_identity) references acl_object_identity (id),
    constraint acl_entryIdentifyOrderUnique unique (acl_object_identity, ace_order),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table acl_object_identity (
    id bigint not null auto_increment,
    object_id_identity bigint not null,
    object_id_identity_num integer,
    entries_inheriting bit not null,
    OPTLOCK integer,
    object_id_class bigint not null,
    owner_sid bigint,
    parent_object bigint,
    constraint acl_object_identityObjectIdClassFK foreign key (object_id_class) references acl_class (id),
    constraint acl_object_identityOwnerSidFK foreign key (owner_sid) references acl_sid (id),
    constraint acl_object_identityParentObjectFK foreign key (parent_object) references acl_object_identity (id),
    constraint acl_object_identityIdClassIdIdentityUnique unique (object_id_class, object_id_identity),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table acl_sid (
    id bigint not null auto_increment,
    principal boolean not null,
    sid varchar(255) not null,
    OPTLOCK integer,
    constraint acl_sidSidPrincipalUnique unique (sid, principal),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table annotations (
    id integer not null auto_increment,
    clientSaveTime datetime not null,
    componentId varchar(30),
    data text not null,
    nodeId varchar(30),
    serverSaveTime datetime not null,
    type varchar(30) not null,
    fromWorkgroupId bigint,
    periodId bigint not null,
    runId bigint not null,
    studentWorkId integer,
    localNotebookItemId varchar(30),
    notebookItemId integer,
    toWorkgroupId bigint not null,
    index annotationsRunIdIndex (runId),
    index annotationsToWorkgroupIdIndex (toWorkgroupId),
    constraint annotationsFromWorkgroupIdFK foreign key (fromWorkgroupId) references workgroups (id),
    constraint annotationsPeriodIdFK foreign key (periodId) references `groups` (id),
    constraint annotationsRunIdFK foreign key (runId) references runs (id),
    constraint annotationsStudentWorkIdFK foreign key (studentWorkId) references studentWork (id),
    constraint annotationsToWorkgroupIdFK foreign key (toWorkgroupId) references workgroups (id),
    constraint annotationsNotebookItemIdFK foreign key (notebookItemId) references notebookItems (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table events (
    id integer not null auto_increment,
    category varchar(255) not null,
    clientSaveTime datetime not null,
    componentId varchar(30),
    componentType varchar(30),
    context varchar(30) not null,
    data text,
    event varchar(255) not null,
    nodeId varchar(30),
    serverSaveTime datetime not null,
    periodId bigint,
    runId bigint,
    workgroupId bigint,
    projectId bigint,
    userId bigint,
    index eventsRunIdIndex (runId),
    index eventsWorkgroupIdIndex (workgroupId),
    index eventsProjectIdIndex (projectId),
    index eventsUserIdIndex (userId),
    constraint eventsPeriodIdFK foreign key (periodId) references `groups` (id),
    constraint eventsRunIdFK foreign key (runId) references runs (id),
    constraint eventsWorkgroupIdFK foreign key (workgroupId) references workgroups (id),
    constraint eventsProjectIdFK foreign key (projectId) references projects (id),
    constraint eventsUserIdFK foreign key (userId) references users (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table granted_authorities (
    id bigint not null auto_increment,
    authority varchar(255) not null,
    OPTLOCK integer,
    constraint granted_authoritiesAuthorityUnique unique (authority),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table `groups` (
    id bigint not null auto_increment,
    name varchar(255) not null,
    OPTLOCK integer,
    parent_fk bigint,
    constraint groupsParentFK foreign key (parent_fk) references `groups` (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table groups_related_to_users (
    group_fk bigint not null,
    user_fk bigint not null,
    constraint groups_related_to_usersUserFK foreign key (user_fk) references users (id),
    constraint groups_related_to_usersGroupFK foreign key (group_fk) references `groups` (id),
    primary key (group_fk, user_fk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table newsitem (
    id integer not null auto_increment,
    date datetime not null,
    news text not null,
    title varchar(255) not null,
    type varchar(255) not null,
    owner bigint not null,
    constraint newsitemOwnerFK foreign key (owner) references users (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table notebookItems (
    id integer not null auto_increment,
    clientDeleteTime datetime,
    clientSaveTime datetime not null,
    componentId varchar(30),
    content text,
    localNotebookItemId varchar(30),
    parentNotebookItemId integer,
    nodeId varchar(30),
    serverDeleteTime datetime,
    serverSaveTime datetime not null,
    title varchar(255),
    type varchar(30),
    periodId bigint,
    runId bigint not null,
    studentAssetId integer,
    studentWorkId integer,
    workgroupId bigint not null,
    `groups` text,
    index notebookItemsRunIdIndex (runId),
    index notebookItemsWorkgroupIdIndex (workgroupId),
    constraint notebookItemsPeriodIdFK foreign key (periodId) references `groups` (id),
    constraint notebookItemsRunIdFK foreign key (runId) references runs (id),
    constraint notebookItemsStudentIdFK foreign key (studentAssetId) references studentAssets (id),
    constraint notebookItemsStudentWorkIdFK foreign key (studentWorkId) references studentWork (id),
    constraint notebookItemsWorkgroupIdFK foreign key (workgroupId) references workgroups (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table notification (
    id integer not null auto_increment,
    componentId varchar(30),
    componentType varchar(30),
    data mediumtext,
    message varchar(255) not null,
    groupId varchar(30),
    nodeId varchar(30),
    serverSaveTime datetime not null,
    timeDismissed datetime,
    timeGenerated datetime not null,
    type varchar(255) not null,
    fromWorkgroupId bigint not null,
    periodId bigint not null,
    runId bigint not null,
    toWorkgroupId bigint not null,
    index notificationRunIdIndex (runId),
    index notificationToWorkgroupIdIndex (toWorkgroupId),
    index notificationFromWorkgroupIdIndex (fromWorkgroupId),
    constraint notificationFromWorkgroupIdFK foreign key (fromWorkgroupId) references workgroups (id),
    constraint notificationPeriodIdFK foreign key (periodId) references `groups` (id),
    constraint notificationRunIdFK foreign key (runId) references runs (id),
    constraint notificationToWorkgroupIdFK foreign key (toWorkgroupId) references workgroups (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table portal (
    id tinyint not null auto_increment,
    address varchar(255),
    comments varchar(255),
    google_map_key varchar(255),
    sendmail_on_exception bit,
    portalname varchar(255),
    projectLibraryGroups text,
    projectMetadataSettings text,
    run_survey_template text,
    sendmail_properties tinyblob,
    settings text,
    structures text,
    announcement text,
    OPTLOCK integer,
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table portal_statistics (
    id smallint unsigned not null auto_increment,
    timestamp datetime,
    totalNumberProjects bigint,
    totalNumberProjectsRun bigint,
    totalNumberRuns bigint,
    totalNumberStudentLogins bigint,
    totalNumberStudents bigint,
    totalNumberTeacherLogins bigint,
    totalNumberTeachers bigint,
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table projects (
    id bigint not null auto_increment,
    datecreated datetime not null,
    dateDeleted datetime,
    familytag integer,
    iscurrent bit,
    isDeleted bit,
    ispublic bit,
    maxTotalAssetsSize bigint,
    name varchar(255) not null,
    modulePath varchar(255) not null,
    parentprojectid bigint,
    projecttype integer,
    OPTLOCK integer,
    wiseVersion integer,
    metadata_fk bigint,
    metadata mediumtext,
    owner_fk bigint not null,
    constraint projectsOwnerFK foreign key (owner_fk) references users (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table projects_related_to_bookmarkers (
    projects_fk bigint not null,
    bookmarkers bigint not null,
    constraint projects_related_to_bookmarkersBookmarkersFK foreign key (bookmarkers) references users (id),
    constraint projects_related_to_bookmarkersProjectsFK foreign key (projects_fk) references projects (id),
    primary key (projects_fk, bookmarkers)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table projects_related_to_shared_owners (
    projects_fk bigint not null,
    shared_owners_fk bigint not null,
    constraint projects_related_to_shared_ownersSharedOwnersFK foreign key (shared_owners_fk) references users (id),
    constraint projects_related_to_shared_ownersProjectsFK foreign key (projects_fk) references projects (id),
    primary key (projects_fk, shared_owners_fk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table projects_related_to_tags (
    project_fk bigint not null,
    tag_fk integer not null,
    constraint projects_related_to_tagsTagFK foreign key (tag_fk) references tags (id),
    constraint projects_related_to_tagsProjectFK foreign key (project_fk) references projects (id),
    primary key (project_fk, tag_fk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table workgroups_related_to_tags (
    workgroups_fk bigint not null,
    tags_fk integer not null,
    constraint workgroups_related_to_tagsTagFK foreign key (tags_fk) references tags (id),
    constraint workgroups_related_to_tagsWorkgroupFK foreign key (workgroups_fk) references workgroups (id),
    primary key (workgroups_fk, tags_fk)
);

create table runs (
    archive_reminder datetime not null,
    end_time datetime,
    extras mediumtext,
    info varchar(255),
    lastRun datetime,
    loggingLevel integer,
    maxWorkgroupSize integer,
    name varchar(255),
    postLevel integer not null,
    private_notes text,
    run_code varchar(255) not null,
    start_time datetime not null,
    survey text,
    timesRun integer,
    versionId varchar(255),
    id bigint not null auto_increment,
    owner_fk bigint not null,
    project_fk bigint not null,
    isLockedAfterEndDate bit not null,
    constraint runsOwnerFK foreign key (owner_fk) references users (id),
    constraint runsProjectFK foreign key (project_fk) references projects (id),
    constraint runsRunCodeUnique unique (run_code),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table runs_related_to_groups (
    runs_fk bigint not null,
    groups_fk bigint not null,
    constraint runs_related_to_groupsGroupsFK foreign key (groups_fk) references `groups` (id),
    constraint runs_related_to_groupsRunsFK foreign key (runs_fk) references runs (id),
    constraint runs_related_to_groupsGroupsUnique unique (groups_fk),
    primary key (runs_fk, groups_fk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table runs_related_to_shared_owners (
    runs_fk bigint not null,
    shared_owners_fk bigint not null,
    constraint runs_related_to_shared_ownersSharedOwnersFK foreign key (shared_owners_fk) references users (id),
    constraint runs_related_to_shared_ownersRunsFK foreign key (runs_fk) references runs (id),
    primary key (runs_fk, shared_owners_fk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table runstatus (
    id bigint not null auto_increment,
    runId bigint,
    status mediumtext,
    timestamp datetime,
    index runstatusRunIdIndex (runId),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table studentAssets (
    id integer not null auto_increment,
    clientDeleteTime datetime,
    clientSaveTime datetime not null,
    componentId varchar(30),
    componentType varchar(30),
    fileName varchar(255) not null,
    filePath varchar(255) not null,
    fileSize bigint not null,
    isReferenced bit not null,
    nodeId varchar(30),
    serverDeleteTime datetime,
    serverSaveTime datetime not null,
    periodId bigint not null,
    runId bigint not null,
    workgroupId bigint not null,
    index studentAssetsRunIdIndex (runId),
    index studentAssetsWorkgroupIdIndex (workgroupId),
    constraint studentAssetsPeriodIdFK foreign key (periodId) references `groups` (id),
    constraint studentAssetsRunIdFK foreign key (runId) references runs (id),
    constraint studentAssetsWorkgroupIdFK foreign key (workgroupId) references workgroups (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table studentWork (
    id integer not null auto_increment,
    clientSaveTime datetime not null,
    componentId varchar(30),
    componentType varchar(30),
    isAutoSave bit not null,
    isSubmit bit not null,
    nodeId varchar(30) not null,
    serverSaveTime datetime not null,
    studentData mediumtext not null,
    periodId bigint not null,
    runId bigint not null,
    workgroupId bigint not null,
    index studentWorkRunIdIndex (runId),
    index studentWorkWorkgroupIdIndex (workgroupId),
    constraint studentWorkPeriodIdFK foreign key (periodId) references `groups` (id),
    constraint studentWorkRunIdFK foreign key (runId) references runs (id),
    constraint studentWorkWorkgroupIdFK foreign key (workgroupId) references workgroups (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table student_attendance (
    id int unsigned not null auto_increment,
    absentUserIds varchar(255),
    loginTimestamp datetime,
    presentUserIds varchar(255),
    runId bigint,
    workgroupId bigint,
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table student_user_details (
    accountanswer varchar(255),
    accountquestion varchar(255),
    birthday datetime not null,
    firstname varchar(255) not null,
    gender integer not null,
    lastlogintime datetime,
    lastname varchar(255) not null,
    numberoflogins integer not null,
    signupdate datetime not null,
    id bigint not null,
    constraint student_user_detailsUserDetailsFK foreign key (id) references user_details (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table studentstatus (
    id bigint not null auto_increment,
    periodId bigint,
    runId bigint,
    status mediumtext,
    timestamp datetime,
    workgroupId bigint,
    index studentstatusRunIdIndex (runId),
    index studentstatusWorkgroupIdIndex (workgroupId),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table tags (
    id integer not null auto_increment,
    name varchar(255),
    runId bigint,
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table teacher_user_details (
    city varchar(255),
    country varchar(255) not null,
    curriculumsubjects tinyblob,
    displayname varchar(255),
    isEmailValid bit not null,
    firstname varchar(255) not null,
    howDidYouHearAboutUs varchar(255),
    lastlogintime datetime,
    lastname varchar(255) not null,
    numberoflogins integer not null,
    schoollevel integer not null,
    schoolname varchar(255) not null,
    signupdate datetime not null,
    state varchar(255),
    id bigint not null,
    constraint teacher_user_detailsUserDetailsFK foreign key (id) references user_details (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table user_details (
    id bigint not null auto_increment,
    account_not_expired bit not null,
    account_not_locked bit not null,
    credentials_not_expired bit not null,
    email_address varchar(255),
    enabled bit not null,
    googleUserId varchar(255) null,
    reset_password_verification_code_request_time datetime null,
    reset_password_verification_code varchar(255) null,
    recent_failed_verification_code_attempt_time datetime null,
    recent_number_of_failed_verification_code_attempts integer null,
    language varchar(255),
    recent_number_of_failed_login_attempts integer,
    password varchar(255) not null,
    recent_failed_login_time datetime,
    reset_password_key varchar(255),
    reset_password_request_time datetime,
    username varchar(255) not null,
    OPTLOCK integer,
    constraint user_detailsUsernameUnique unique (username),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table user_details_related_to_roles (
    user_details_fk bigint not null,
    granted_authorities_fk bigint not null,
    constraint user_details_related_to_rolesGrantedAuthoritiesFK foreign key (granted_authorities_fk) references granted_authorities (id),
    constraint user_details_related_to_rolesUserDetailsFK foreign key (user_details_fk) references user_details (id),
    primary key (user_details_fk, granted_authorities_fk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table users (
    id bigint not null auto_increment,
    OPTLOCK integer,
    user_details_fk bigint not null,
    constraint usersUserDetailsFK foreign key (user_details_fk) references user_details (id),
    constraint usersUserDetailsUnique unique (user_details_fk),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table workgroups (
    id bigint not null auto_increment,
    OPTLOCK integer,
    group_fk bigint not null,
    period bigint,
    isTeacherWorkgroup bit,
    run_fk bigint not null,
    constraint workgroupsGroupFK foreign key (group_fk) references `groups` (id),
    constraint workgroupsRunFK foreign key (run_fk) references runs (id),
    constraint workgroupsPeriodFK foreign key (period) references `groups` (id),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- initial data for wise below

INSERT INTO granted_authorities VALUES (1,'ROLE_USER',0),(2,'ROLE_ADMINISTRATOR',0),(3,'ROLE_TEACHER',0),(4,'ROLE_STUDENT',0),(5,'ROLE_AUTHOR',0),(6,'ROLE_RESEARCHER',0),(7,'ROLE_TRUSTED_AUTHOR',0),(8,'ROLE_TRANSLATOR',0);

INSERT INTO portal (id,portalname,settings,announcement,projectLibraryGroups,projectMetadataSettings,run_survey_template,sendmail_on_exception,OPTLOCK) VALUES (1,'My Production WISE Site (change me)','{isLoginAllowed:true}','{"visible":false,"bannerText":"","bannerButton":"","title":"","content":"","buttons":[]}','[]','{"fields":[{"name":"Title","key":"title","type":"input"},{"name":"Summary","key":"summary","type":"textarea"},{"name":"Language","key":"language","type":"radio","choices":["English","Chinese (Simplified)","Chinese (Traditional)","Dutch","German","Greek","Hebrew","Japanese","Korean","Portuguese","Spanish","Thai","Turkish"]},{"name":"Subject","key":"subject","type":"radio","choices":["Life Science","Physical Science","Earth Science","General Science","Biology","Chemistry","Physics","Other"]},{"name":"Time Required to Complete Project","key":"time","type":"input"},{"name":"Supported Devices","key":"supportedDevices","type":"checkbox","choices":["PC","Tablet"]}],"i18n":{"lifeScience":{"en":"Life Science","ja":"ライフサイエンス"},"earthScience":{"en":"Earth Science","ja":"地球科学"},"physicalScience":{"en":"Physical Science","ja":"物理科学","es":"ciencia física"}}}','{"save_time":null,"items":[{"id":"recommendProjectToOtherTeachers","type":"radio","prompt":"How likely would you recommend this project to other teachers?","choices":[{"id":"5","text":"Extremely likely"},{"id":"4","text":"Very likely"},{"id":"3","text":"Moderately likely"},{"id":"2","text":"Slightly likely"},{"id":"1","text":"Not at all likely"}],"answer":null},{"id":"runProjectAgain","type":"radio","prompt":"How likely would you run this project again?","choices":[{"id":"5","text":"Extremely likely"},{"id":"4","text":"Very likely"},{"id":"3","text":"Moderately likely"},{"id":"2","text":"Slightly likely"},{"id":"1","text":"Not at all likely"}],"answer":null},{"id":"useWISEAgain","type":"radio","prompt":"How likely would you use WISE again in your classroom?","choices":[{"id":"5","text":"Extremely likely"},{"id":"4","text":"Very likely"},{"id":"3","text":"Moderately likely"},{"id":"2","text":"Slightly likely"},{"id":"1","text":"Not at all likely"}],"answer":null},{"id":"adviceForOtherTeachers","type":"textarea","prompt":"Please share any advice for other teachers about this project or about WISE in general.","answer":null},{"id":"technicalProblems","type":"textarea","prompt":"Please write about any technical problems that you had while running this project.","answer":null},{"id":"generalFeedback","type":"textarea","prompt":"Please provide any other feedback to WISE staff.","answer":null}]}',1,0);

INSERT INTO user_details (id, account_not_expired, account_not_locked, credentials_not_expired, email_address, enabled, language, password, username, OPTLOCK)  VALUES (1,1,1,1,NULL,1,'en','24c002f26c14d8e087ade986531c7b5d','admin',0),(2,1,1,1,NULL,1,'en','4cd92091d686b42ec74a29a26432915a','preview',0);

INSERT INTO users (id, OPTLOCK, user_details_fk) VALUES (1,0,1),(2,0,2);

INSERT INTO teacher_user_details (city,country,curriculumsubjects,displayname,isEmailValid,firstname,lastlogintime,lastname,numberoflogins,schoollevel,schoolname,signupdate,state,id) VALUES ('Berkeley','USA',NULL,'adminuser',0,'ad',NULL,'min',0,3,'Berkeley','2010-10-25 15:41:31','CA',1),('Berkeley','USA',NULL,'preview',0,'pre',NULL,'view',0,3,'Berkeley','2010-10-25 15:41:31','CA',2);

INSERT INTO user_details_related_to_roles VALUES (1,1),(1,2),(1,3),(1,5),(2,1),(2,3),(2,5);

set FOREIGN_KEY_CHECKS=1;
