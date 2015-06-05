
    create table acl_class (
        id bigint not null auto_increment,
        class varchar(255) not null unique,
        OPTLOCK integer,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

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
        primary key (id),
        unique (acl_object_identity, ace_order)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table acl_object_identity (
        id bigint not null auto_increment,
        object_id_identity bigint not null,
        object_id_identity_num integer,
        entries_inheriting bit not null,
        OPTLOCK integer,
        object_id_class bigint not null,
        owner_sid bigint,
        parent_object bigint,
        primary key (id),
        unique (object_id_class, object_id_identity)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table acl_sid (
        id bigint not null auto_increment,
        principal boolean not null,
        sid varchar(255) not null,
        OPTLOCK integer,
        primary key (id),
        unique (sid, principal)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table annotation (
        id bigint not null auto_increment,
        annotateTime datetime,
        data mediumtext,
        postTime datetime,
        runId bigint,
        type varchar(255),
        fromUser_id bigint,
        stepWork_id bigint,
        toUser_id bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table announcements (
        id bigint not null auto_increment,
        announcement mediumtext not null,
        timestamp datetime not null,
        title varchar(255) not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table chatlog (
        id bigint not null auto_increment,
        chatEventType varchar(255) not null,
        chatRoomId varchar(255),
        data text,
        dataType varchar(255),
        fromWorkgroupId bigint not null,
        fromWorkgroupName varchar(255),
        postTime datetime not null,
        runId bigint not null,
        status varchar(255),
        toWorkgroupId bigint,
        toWorkgroupName varchar(255),
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table craterrequest (
        id bigint not null auto_increment,
        cRaterItemId varchar(255) not null,
        cRaterItemType varchar(255),
        cRaterResponse text,
        failCount integer,
        nodeStateId bigint not null,
        runId bigint not null,
        timeCompleted datetime,
        timeCreated datetime,
        stepWorkId bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table curnits (
        id bigint not null auto_increment,
        name varchar(255),
        OPTLOCK integer,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table granted_authorities (
        id bigint not null auto_increment,
        authority varchar(255) not null unique,
        OPTLOCK integer,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table groups (
        id bigint not null auto_increment,
        name varchar(255) not null,
        OPTLOCK integer,
        parent_fk bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table groups_related_to_users (
        group_fk bigint not null,
        user_fk bigint not null,
        primary key (group_fk, user_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table ideabasket (
        id bigint not null auto_increment,
        action varchar(255),
        actionPerformer bigint,
        data mediumtext,
        ideaId bigint,
        ideaWorkgroupId bigint,
        isPublic bit,
        periodId bigint,
        postTime datetime,
        projectId bigint,
        runId bigint,
        workgroupId bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table message_recipient (
        id bigint not null auto_increment,
        isRead bit,
        recipient_fk bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table modules (
        authors varchar(255),
        computer_time bigint,
        description varchar(255),
        grades varchar(255),
        tech_reqs varchar(255),
        topic_keywords varchar(255),
        total_time bigint,
        id bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table modules_related_to_owners (
        module_fk bigint not null,
        owners_fk bigint not null,
        primary key (module_fk, owners_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table newsitem (
        id bigint not null auto_increment,
        date datetime not null,
        news text not null,
        title varchar(255) not null,
        type varchar(255),
        owner bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table node (
        id bigint not null auto_increment,
        nodeId varchar(255),
        nodeType varchar(255),
        runId varchar(255),
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table offerings (
        id bigint not null auto_increment,
        OPTLOCK integer,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table peerreviewgate (
        id bigint not null auto_increment,
        open bit,
        periodId bigint,
        runId bigint,
        node_id bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table peerreviewwork (
        id bigint not null auto_increment,
        periodId bigint,
        runId bigint,
        annotation_id bigint,
        node_id bigint,
        reviewerUserInfo_id bigint,
        stepWork_id bigint,
        userInfo_id bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table portal (
        id bigint not null auto_increment,
        address varchar(255),
        comments varchar(255),
        google_map_key varchar(255),
        sendmail_on_exception bit,
        portalname varchar(255),
        sendmail_properties tinyblob,
        settings text,
        run_survey_template text,
        OPTLOCK integer,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table portal_statistics (
        id bigint not null auto_increment,
        timestamp datetime,
        totalNumberProjects bigint,
        totalNumberProjectsRun bigint,
        totalNumberRuns bigint,
        totalNumberStudentLogins bigint,
        totalNumberStudents bigint,
        totalNumberTeacherLogins bigint,
        totalNumberTeachers bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table portfolio (
 		id bigint(20) not null auto_increment,
  		workgroupId bigint(20) default null,
  		runId bigint(20) default null,
		metadata mediumtext,
  	    items mediumtext,
  		deletedItems mediumtext,
  		isPublic bit(1) default null,
  		isSubmitted bit(1) default null,
  		tags varchar(255) default null,
  		postTime datetime default null,
  		PRIMARY KEY (id)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table premadecommentlists (
        id bigint not null auto_increment,
        global bit,
        label varchar(255) not null,
        projectId bigint,
        owner bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table premadecomments (
        id bigint not null auto_increment,
        comment varchar(255) not null,
        labels varchar(255),
        listposition bigint,
        owner bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table premadecomments_related_to_premadecommentlists (
        premadecommentslist_fk bigint not null,
        premadecomments_fk bigint not null,
        primary key (premadecommentslist_fk, premadecomments_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table project_metadata (
        id bigint not null auto_increment,
        author varchar(255),
        comp_time varchar(255),
        contact varchar(255),
        grade_range varchar(255),
        keywords varchar(255),
        language varchar(255),
        last_cleaned datetime,
        last_edited datetime,
        last_minified datetime,
        lesson_plan mediumtext,
        max_scores mediumtext,
        nav_mode varchar(255),
        post_level bigint,
        project_fk bigint,
        standards mediumtext,
        subject varchar(255),
        summary varchar(255),
        tech_reqs varchar(255),
        theme varchar(255),
        title varchar(255),
        tools text,
        total_time varchar(255),
        version_id varchar(255),
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

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
        parentprojectid bigint,
        projecttype integer,
        OPTLOCK integer,
        curnit_fk bigint,
        metadata_fk bigint unique,
        run_fk bigint unique,
        wiseVersion integer,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table projects_related_to_bookmarkers (
        projects_fk bigint not null,
        bookmarkers bigint not null,
        primary key (projects_fk, bookmarkers)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table projects_related_to_owners (
        projects_fk bigint not null,
        owners_fk bigint not null,
        primary key (projects_fk, owners_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table projects_related_to_shared_owners (
        projects_fk bigint not null,
        shared_owners_fk bigint not null,
        primary key (projects_fk, shared_owners_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table projects_related_to_tags (
        project_fk bigint not null,
        tag_fk bigint not null,
        primary key (project_fk, tag_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table runs (
        archive_reminder datetime not null,
        end_time datetime,
        extras mediumtext,
        info varchar(255),
        lastRun datetime,
        loggingLevel integer,
        maxWorkgroupSize integer,
        name varchar(255),
        postLevel integer,
        private_notes text,
        survey text,
        run_code varchar(255) not null unique,
        start_time datetime not null,
        timesRun integer,
        versionId varchar(255),
        id bigint not null,
        project_fk bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table runs_related_to_announcements (
        runs_fk bigint not null,
        announcements_fk bigint not null,
        primary key (runs_fk, announcements_fk),
        unique (announcements_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table runs_related_to_groups (
        runs_fk bigint not null,
        groups_fk bigint not null,
        primary key (runs_fk, groups_fk),
        unique (groups_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table runs_related_to_owners (
        runs_fk bigint not null,
        owners_fk bigint not null,
        primary key (runs_fk, owners_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table runs_related_to_shared_owners (
        runs_fk bigint not null,
        shared_owners_fk bigint not null,
        primary key (runs_fk, shared_owners_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table runstatus (
        id bigint not null auto_increment,
        runId bigint,
        status mediumtext,
        timestamp datetime,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table stepwork (
        id bigint not null auto_increment,
        data mediumtext,
        endTime datetime,
        postTime datetime,
        startTime datetime,
        node_id bigint,
        userInfo_id bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table stepwork_cache (
        id bigint not null auto_increment,
        cacheTime datetime,
        data longtext,
        getRevisions bit,
        userInfo_id bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table student_attendance (
        id bigint not null auto_increment,
        absentUserIds varchar(255),
        loginTimestamp datetime,
        presentUserIds varchar(255),
        runId bigint,
        workgroupId bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table student_user_details (
        accountanswer varchar(255) not null,
        accountquestion varchar(255) not null,
        birthday datetime not null,
        firstname varchar(255) not null,
        gender integer not null,
        lastlogintime datetime,
        lastname varchar(255) not null,
        numberoflogins integer not null,
        signupdate datetime not null,
        id bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table studentstatus (
        id bigint not null auto_increment,
        periodId bigint,
        runId bigint,
        status mediumtext,
        timestamp datetime,
        workgroupId bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table tags (
        id bigint not null auto_increment,
        name varchar(255),
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

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
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table urlmodules (
        module_url varchar(255),
        id bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table user_details (
        id bigint not null auto_increment,
        account_not_expired bit not null,
        account_not_locked bit not null,
        credentials_not_expired bit not null,
        email_address varchar(255),
        enabled bit not null,
        language varchar(255),
        recent_number_of_failed_login_attempts integer,
        password varchar(255) not null,
        recent_failed_login_time datetime,
        reset_password_key varchar(255),
        reset_password_request_time datetime,
        username varchar(255) not null unique,
        OPTLOCK integer,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table user_details_related_to_roles (
        user_details_fk bigint not null,
        granted_authorities_fk bigint not null,
        primary key (user_details_fk, granted_authorities_fk)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table userinfo (
        id bigint not null auto_increment,
        workgroupId bigint unique,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table users (
        id bigint not null auto_increment,
        OPTLOCK integer,
        user_details_fk bigint not null unique,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table vle_statistics (
        id bigint not null auto_increment,
        data text,
        timestamp datetime,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table wiseworkgroups (
        externalId bigint,
        is_teacher_workgroup bit,
        id bigint not null,
        period bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table workgroups (
        id bigint not null auto_increment,
        OPTLOCK integer,
        group_fk bigint not null,
        offering_fk bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    alter table acl_entry 
        add index FK5302D47DB5FF700A (acl_object_identity), 
        add constraint FK5302D47DB5FF700A 
        foreign key (acl_object_identity) 
        references acl_object_identity (id);

    alter table acl_entry 
        add index FK5302D47D99A87E49 (sid), 
        add constraint FK5302D47D99A87E49 
        foreign key (sid) 
        references acl_sid (id);

    alter table acl_object_identity 
        add index FK2A2BB009AA282475 (parent_object), 
        add constraint FK2A2BB009AA282475 
        foreign key (parent_object) 
        references acl_object_identity (id);

    alter table acl_object_identity 
        add index FK2A2BB009F3DF1C77 (object_id_class), 
        add constraint FK2A2BB009F3DF1C77 
        foreign key (object_id_class) 
        references acl_class (id);

    alter table acl_object_identity 
        add index FK2A2BB0099AB90EBD (owner_sid), 
        add constraint FK2A2BB0099AB90EBD 
        foreign key (owner_sid) 
        references acl_sid (id);

    alter table annotation 
        add index FKA34FEB2FDC0C5C0C (stepWork_id), 
        add constraint FKA34FEB2FDC0C5C0C 
        foreign key (stepWork_id) 
        references stepwork (id);

    alter table annotation 
        add index FKA34FEB2F27948225 (toUser_id), 
        add constraint FKA34FEB2F27948225 
        foreign key (toUser_id) 
        references userinfo (id);

    alter table annotation 
        add index FKA34FEB2F8E4F9616 (fromUser_id), 
        add constraint FKA34FEB2F8E4F9616 
        foreign key (fromUser_id) 
        references userinfo (id);

    alter table craterrequest 
        add index FKC84ADEA0D9906D07 (stepWorkId), 
        add constraint FKC84ADEA0D9906D07 
        foreign key (stepWorkId) 
        references stepwork (id);

    alter table groups 
        add index FKB63DD9D44D1A5AB (parent_fk), 
        add constraint FKB63DD9D44D1A5AB 
        foreign key (parent_fk) 
        references groups (id);

    alter table groups_related_to_users 
        add index FK3311F7E3A7996BB6 (group_fk), 
        add constraint FK3311F7E3A7996BB6 
        foreign key (group_fk) 
        references groups (id);

    alter table groups_related_to_users 
        add index FK3311F7E3F36B7C77 (user_fk), 
        add constraint FK3311F7E3F36B7C77 
        foreign key (user_fk) 
        references users (id);

    create index runIdAndWorkgroupIdIndex on ideabasket (runId, workgroupId);

    alter table modules 
        add index FK49292787C1DDF6C8 (id), 
        add constraint FK49292787C1DDF6C8 
        foreign key (id) 
        references curnits (id);

    alter table modules_related_to_owners 
        add index FKE09C983EE53238 (module_fk), 
        add constraint FKE09C983EE53238 
        foreign key (module_fk) 
        references modules (id);

    alter table modules_related_to_owners 
        add index FKE09C98FD4BA802 (owners_fk), 
        add constraint FKE09C98FD4BA802 
        foreign key (owners_fk) 
        references users (id);

    alter table newsitem 
        add index FK532D64662848171 (owner), 
        add constraint FK532D64662848171 
        foreign key (owner) 
        references users (id);

    create index runIdIndex on node (runId);

    alter table peerreviewgate 
        add index FKD0AB7705D61E3A7B (node_id), 
        add constraint FKD0AB7705D61E3A7B 
        foreign key (node_id) 
        references node (id);

    alter table peerreviewwork 
        add index FKD0B2F14BD61E3A7B (node_id), 
        add constraint FKD0B2F14BD61E3A7B 
        foreign key (node_id) 
        references node (id);

    alter table peerreviewwork 
        add index FKD0B2F14BC5B238E (annotation_id), 
        add constraint FKD0B2F14BC5B238E 
        foreign key (annotation_id) 
        references annotation (id);

    alter table peerreviewwork 
        add index FKD0B2F14BC477AFED (reviewerUserInfo_id), 
        add constraint FKD0B2F14BC477AFED 
        foreign key (reviewerUserInfo_id) 
        references userinfo (id);

    alter table peerreviewwork 
        add index FKD0B2F14BDC0C5C0C (stepWork_id), 
        add constraint FKD0B2F14BDC0C5C0C 
        foreign key (stepWork_id) 
        references stepwork (id);

    alter table peerreviewwork 
        add index FKD0B2F14BF572C312 (userInfo_id), 
        add constraint FKD0B2F14BF572C312 
        foreign key (userInfo_id) 
        references userinfo (id);

    alter table premadecommentlists 
        add index FKF237B2CE2848171 (owner), 
        add constraint FKF237B2CE2848171 
        foreign key (owner) 
        references users (id);

    alter table premadecomments 
        add index FK7786D42C2848171 (owner), 
        add constraint FK7786D42C2848171 
        foreign key (owner) 
        references users (id);

    alter table premadecomments_related_to_premadecommentlists 
        add index FK6958FC119D46D74E (premadecomments_fk), 
        add constraint FK6958FC119D46D74E 
        foreign key (premadecomments_fk) 
        references premadecomments (id);

    alter table premadecomments_related_to_premadecommentlists 
        add index FK6958FC118381AAAE (premadecommentslist_fk), 
        add constraint FK6958FC118381AAAE 
        foreign key (premadecommentslist_fk) 
        references premadecommentlists (id);

    alter table projects 
        add index FKC479187AB617D3C1 (run_fk), 
        add constraint FKC479187AB617D3C1 
        foreign key (run_fk) 
        references runs (id);

    alter table projects 
        add index FKC479187A862DB4AC (metadata_fk), 
        add constraint FKC479187A862DB4AC 
        foreign key (metadata_fk) 
        references project_metadata (id);

    alter table projects 
        add index FKC479187AE277A098 (curnit_fk), 
        add constraint FKC479187AE277A098 
        foreign key (curnit_fk) 
        references curnits (id);

    alter table projects_related_to_bookmarkers 
        add index FK5AA350A5CE64DF2E (bookmarkers), 
        add constraint FK5AA350A5CE64DF2E 
        foreign key (bookmarkers) 
        references users (id);

    alter table projects_related_to_bookmarkers 
        add index FK5AA350A571E4B7B2 (projects_fk), 
        add constraint FK5AA350A571E4B7B2 
        foreign key (projects_fk) 
        references projects (id);

    alter table projects_related_to_owners 
        add index FKDACF56CBFD4BA802 (owners_fk), 
        add constraint FKDACF56CBFD4BA802 
        foreign key (owners_fk) 
        references users (id);

    alter table projects_related_to_owners 
        add index FKDACF56CB71E4B7B2 (projects_fk), 
        add constraint FKDACF56CB71E4B7B2 
        foreign key (projects_fk) 
        references projects (id);

    alter table projects_related_to_shared_owners 
        add index FK19A2B02F7804D4A8 (shared_owners_fk), 
        add constraint FK19A2B02F7804D4A8 
        foreign key (shared_owners_fk) 
        references users (id);

    alter table projects_related_to_shared_owners 
        add index FK19A2B02F71E4B7B2 (projects_fk), 
        add constraint FK19A2B02F71E4B7B2 
        foreign key (projects_fk) 
        references projects (id);

    alter table projects_related_to_tags 
        add index FK7A3DD5844411F813 (tag_fk), 
        add constraint FK7A3DD5844411F813 
        foreign key (tag_fk) 
        references tags (id);

    alter table projects_related_to_tags 
        add index FK7A3DD58434708CB3 (project_fk), 
        add constraint FK7A3DD58434708CB3 
        foreign key (project_fk) 
        references projects (id);

    alter table runs 
        add index FK3597483B810D04 (id), 
        add constraint FK3597483B810D04 
        foreign key (id) 
        references offerings (id);

    alter table runs 
        add index FK35974834708CB3 (project_fk), 
        add constraint FK35974834708CB3 
        foreign key (project_fk) 
        references projects (id);

    alter table runs_related_to_announcements 
        add index FKEDEF47F34086D8E (announcements_fk), 
        add constraint FKEDEF47F34086D8E 
        foreign key (announcements_fk) 
        references announcements (id);

    alter table runs_related_to_announcements 
        add index FKEDEF47F3495C61E4 (runs_fk), 
        add constraint FKEDEF47F3495C61E4 
        foreign key (runs_fk) 
        references runs (id);

    alter table runs_related_to_groups 
        add index FK6CD673CD495C61E4 (runs_fk), 
        add constraint FK6CD673CD495C61E4 
        foreign key (runs_fk) 
        references runs (id);

    alter table runs_related_to_groups 
        add index FK6CD673CD31144C41 (groups_fk), 
        add constraint FK6CD673CD31144C41 
        foreign key (groups_fk) 
        references groups (id);

    alter table runs_related_to_owners 
        add index FK7AC2FE19495C61E4 (runs_fk), 
        add constraint FK7AC2FE19495C61E4 
        foreign key (runs_fk) 
        references runs (id);

    alter table runs_related_to_owners 
        add index FK7AC2FE19FD4BA802 (owners_fk), 
        add constraint FK7AC2FE19FD4BA802 
        foreign key (owners_fk) 
        references users (id);

    alter table runs_related_to_shared_owners 
        add index FKBD30D5217804D4A8 (shared_owners_fk), 
        add constraint FKBD30D5217804D4A8 
        foreign key (shared_owners_fk) 
        references users (id);

    alter table runs_related_to_shared_owners 
        add index FKBD30D521495C61E4 (runs_fk), 
        add constraint FKBD30D521495C61E4 
        foreign key (runs_fk) 
        references runs (id);

    create index runIdIndex on runstatus (runId);

    alter table stepwork 
        add index FK553587DDD61E3A7B (node_id), 
        add constraint FK553587DDD61E3A7B 
        foreign key (node_id) 
        references node (id);

    alter table stepwork 
        add index FK553587DDF572C312 (userInfo_id), 
        add constraint FK553587DDF572C312 
        foreign key (userInfo_id) 
        references userinfo (id);

    alter table stepwork_cache 
        add index FK953280A0F572C312 (userInfo_id), 
        add constraint FK953280A0F572C312 
        foreign key (userInfo_id) 
        references userinfo (id);

    alter table student_user_details 
        add index FKC5AA295277270DDB (id), 
        add constraint FKC5AA295277270DDB 
        foreign key (id) 
        references user_details (id);

    create index workgroupIdIndex on studentstatus (workgroupId);

    create index runIdIndex on studentstatus (runId);

    alter table teacher_user_details 
        add index FKAC84070B77270DDB (id), 
        add constraint FKAC84070B77270DDB 
        foreign key (id) 
        references user_details (id);

    alter table urlmodules 
        add index FKC83237389B681BDB (id), 
        add constraint FKC83237389B681BDB 
        foreign key (id) 
        references modules (id);

    alter table user_details_related_to_roles 
        add index FKE6A5FBDE8904ED96 (user_details_fk), 
        add constraint FKE6A5FBDE8904ED96 
        foreign key (user_details_fk) 
        references user_details (id);

    alter table user_details_related_to_roles 
        add index FKE6A5FBDE66374446 (granted_authorities_fk), 
        add constraint FKE6A5FBDE66374446 
        foreign key (granted_authorities_fk) 
        references granted_authorities (id);

    create index workgroupIdIndex on userinfo (workgroupId);

    alter table users 
        add index FK6A68E088904ED96 (user_details_fk), 
        add constraint FK6A68E088904ED96 
        foreign key (user_details_fk) 
        references user_details (id);

    alter table wiseworkgroups 
        add index FKF16C83C9EAA673C3 (id), 
        add constraint FKF16C83C9EAA673C3 
        foreign key (id) 
        references workgroups (id);

    alter table wiseworkgroups 
        add index FKF16C83C94E4E6AF2 (period), 
        add constraint FKF16C83C94E4E6AF2 
        foreign key (period) 
        references groups (id);

    alter table workgroups 
        add index FKEC8E5025A7996BB6 (group_fk), 
        add constraint FKEC8E5025A7996BB6 
        foreign key (group_fk) 
        references groups (id);

    alter table workgroups 
        add index FKEC8E502576FA1B87 (offering_fk), 
        add constraint FKEC8E502576FA1B87 
        foreign key (offering_fk) 
        references offerings (id);


-- initial data for wise


INSERT INTO granted_authorities VALUES (1,'ROLE_USER',0),(2,'ROLE_ADMINISTRATOR',0),(3,'ROLE_TEACHER',0),(4,'ROLE_STUDENT',0),(5,'ROLE_AUTHOR',0),(6,'ROLE_RESEARCHER',0),(7,'ROLE_TRUSTED_AUTHOR',0);

INSERT INTO portal (id,settings,run_survey_template,sendmail_on_exception,OPTLOCK) VALUES (1,'{isLoginAllowed:true}','{\"save_time\":null,\"items\":[{\"id\":\"recommendProjectToOtherTeachers\",\"type\":\"radio\",\"prompt\":\"How likely would you recommend this project to other teachers?\",\"choices\":[{\"id\":\"5\",\"text\":\"Extremely likely\"},{\"id\":\"4\",\"text\":\"Very likely\"},{\"id\":\"3\",\"text\":\"Moderately likely\"},{\"id\":\"2\",\"text\":\"Slightly likely\"},{\"id\":\"1\",\"text\":\"Not at all likely\"}],\"answer\":null},{\"id\":\"runProjectAgain\",\"type\":\"radio\",\"prompt\":\"How likely would you run this project again?\",\"choices\":[{\"id\":\"5\",\"text\":\"Extremely likely\"},{\"id\":\"4\",\"text\":\"Very likely\"},{\"id\":\"3\",\"text\":\"Moderately likely\"},{\"id\":\"2\",\"text\":\"Slightly likely\"},{\"id\":\"1\",\"text\":\"Not at all likely\"}],\"answer\":null},{\"id\":\"useWISEAgain\",\"type\":\"radio\",\"prompt\":\"How likely would you use WISE again in your classroom?\",\"choices\":[{\"id\":\"5\",\"text\":\"Extremely likely\"},{\"id\":\"4\",\"text\":\"Very likely\"},{\"id\":\"3\",\"text\":\"Moderately likely\"},{\"id\":\"2\",\"text\":\"Slightly likely\"},{\"id\":\"1\",\"text\":\"Not at all likely\"}],\"answer\":null},{\"id\":\"adviceForOtherTeachers\",\"type\":\"textarea\",\"prompt\":\"Please share any advice for other teachers about this project or about WISE in general.\",\"answer\":null},{\"id\":\"technicalProblems\",\"type\":\"textarea\",\"prompt\":\"Please write about any technical problems that you had while running this project.\",\"answer\":null},{\"id\":\"generalFeedback\",\"type\":\"textarea\",\"prompt\":\"Please provide any other feedback to WISE staff.\",\"answer\":null}]}',1,0);

INSERT INTO user_details (id, account_not_expired, account_not_locked, credentials_not_expired, email_address, enabled, language, password, username, OPTLOCK)  VALUES (1,1,1,1,NULL,1,'en','24c002f26c14d8e087ade986531c7b5d','admin',0),(2,1,1,1,NULL,1,'en','4cd92091d686b42ec74a29a26432915a','preview',0);

INSERT INTO users (id, OPTLOCK, user_details_fk) VALUES (1,0,1),(2,0,2);

INSERT INTO teacher_user_details (city,country,curriculumsubjects,displayname,isEmailValid,firstname,lastlogintime,lastname,numberoflogins,schoollevel,schoolname,signupdate,state,id) VALUES ('Berkeley','USA',NULL,'adminuser',0,'ad',NULL,'min',0,3,'Berkeley','2010-10-25 15:41:31','CA',1),('Berkeley','USA',NULL,'preview',0,'pre',NULL,'view',0,3,'Berkeley','2010-10-25 15:41:31','CA',2);

INSERT INTO user_details_related_to_roles VALUES (1,1),(1,2),(1,3),(1,5),(2,1),(2,3),(2,5);


