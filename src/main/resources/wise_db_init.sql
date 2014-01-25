
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
        announcement text not null,
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

    create table ideaBasket (
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

    create table journal (
        id bigint not null auto_increment,
        data text,
        userInfo_id bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table message_recipient (
        id bigint not null auto_increment,
        isRead bit,
        recipient_fk bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table messages (
        id bigint not null auto_increment,
        body varchar(255) not null,
        date datetime not null,
        subject varchar(255) not null,
        originalMessage bigint,
        sender bigint not null,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table messages_related_to_message_recipients (
        messages_fk bigint not null,
        recipients_fk bigint not null,
        primary key (messages_fk, recipients_fk),
        unique (recipients_fk)
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
        lesson_plan text,
        max_scores text,
        nav_mode varchar(255),
        post_level bigint,
        project_fk bigint,
        standards text,
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
        name varchar(255),
        parentprojectid bigint,
        projecttype integer,
        OPTLOCK integer,
        curnit_fk bigint,
        metadata_fk bigint unique,
        run_fk bigint unique,
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

    create table runStatus (
        id bigint not null auto_increment,
        runId bigint,
        status mediumtext,
        timestamp datetime,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table runs (
        archive_reminder datetime not null,
        end_time datetime,
        extras varchar(255),
        info varchar(255),
        lastRun datetime,
        loggingLevel integer,
        maxWorkgroupSize integer,
        name varchar(255),
        postLevel integer,
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

    create table stepwork (
        id bigint not null auto_increment,
        data mediumtext,
        duplicateId varchar(255),
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
        data mediumtext,
        getRevisions bit,
        userInfo_id bigint,
        primary key (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

    create table studentStatus (
        id bigint not null auto_increment,
        periodId bigint,
        runId bigint,
        status mediumtext,
        timestamp datetime,
        workgroupId bigint,
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

    alter table journal 
        add index FKAB64AF37F572C312 (userInfo_id), 
        add constraint FKAB64AF37F572C312 
        foreign key (userInfo_id) 
        references userinfo (id);

    alter table message_recipient 
        add index FK398E4FE1478EAB69 (recipient_fk), 
        add constraint FK398E4FE1478EAB69 
        foreign key (recipient_fk) 
        references users (id);

    alter table messages 
        add index FKE475014CC630A8F3 (sender), 
        add constraint FKE475014CC630A8F3 
        foreign key (sender) 
        references users (id);

    alter table messages 
        add index FKE475014C4EAC74DE (originalMessage), 
        add constraint FKE475014C4EAC74DE 
        foreign key (originalMessage) 
        references messages (id);

    alter table messages_related_to_message_recipients 
        add index FKB9B5242F605DD860 (messages_fk), 
        add constraint FKB9B5242F605DD860 
        foreign key (messages_fk) 
        references messages (id);

    alter table messages_related_to_message_recipients 
        add index FKB9B5242FC6FF4CDB (recipients_fk), 
        add constraint FKB9B5242FC6FF4CDB 
        foreign key (recipients_fk) 
        references message_recipient (id);

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


INSERT INTO granted_authorities VALUES (1,'ROLE_USER',0),(2,'ROLE_ADMINISTRATOR',0),(3,'ROLE_TEACHER',0),(4,'ROLE_STUDENT',0),(5,'ROLE_AUTHOR',0),(6,'ROLE_RESEARCHER',0);

INSERT INTO portal (id,settings,sendmail_on_exception,OPTLOCK) VALUES (1,'{isLoginAllowed:true}',1,0);

INSERT INTO user_details (id, account_not_expired, account_not_locked, credentials_not_expired, email_address, enabled, password, username, OPTLOCK)  VALUES (1,1,1,1,NULL,1,'24c002f26c14d8e087ade986531c7b5d','admin',0),(2,1,1,1,NULL,1,'4cd92091d686b42ec74a29a26432915a','preview',0);

INSERT INTO users (id, OPTLOCK, user_details_fk) VALUES (1,0,1),(2,0,2);

INSERT INTO teacher_user_details (city,country,curriculumsubjects,displayname,isEmailValid,firstname,lastlogintime,lastname,numberoflogins,schoollevel,schoolname,signupdate,state,id) VALUES ('Berkeley','USA',NULL,'adminuser',0,'ad',NULL,'min',0,3,'Berkeley','2010-10-25 15:41:31','CA',1),('Berkeley','USA',NULL,'preview',0,'pre',NULL,'view',0,3,'Berkeley','2010-10-25 15:41:31','CA',2);

INSERT INTO user_details_related_to_roles VALUES (1,1),(1,2),(1,3),(1,5),(2,1),(2,3),(2,5);


/* Register Plate Tectonics and Cellular Respiration sample projects */
INSERT INTO curnits VALUES (1,NULL,0);
INSERT INTO modules VALUES (NULL,NULL,NULL,NULL,NULL,NULL,NULL,1);
INSERT INTO urlmodules VALUES('/1/wise4.project.json',1);
INSERT INTO project_metadata VALUES(1,'','6-7 hours','Elissa Sato (elissa.sato@berkeley.edu)','6-8','earth science, plate tectonics, convection','English',NULL,NULL,NULL,'General Suggestions: <br><br>\u000aStudents will benefit from signposting before the start of each day, e.g., being asked to reach certain steps and activities.  <br><br>\u000aThere are extra credit steps in the project (Activity 8) for advanced students, but preparing off-line activities and assignments may also be useful for teachers to accommodate the range of students'' abilities and speed.<br><br>\u000a\u000aActivity 1 and Activity 7 are assessment items that may be used by teachers in conjunction with their existing assessments. Most items are completed in pairs, but one item allows for individual completion.<br><br>\u000a\u000aSome suggestions from teachers who have run the project:<br><br>\u000a<ul><li>Step 2.4: A classroom discussion with the map will help students focus on the important parts of the map.\u000a<li>Step 4.8: The simulation may take a while to load depending on the computer/network speed, and there may be several seconds with a blank screen before the active loading screen appears, so students may think there is something wrong. Also, it may take a while for the molecules to come back together in the simulation after clicking "remove cup of hot water," so ask students to be patient.</li></ul>','[]','classic',NULL,NULL,'http://www.cde.ca.gov/be/st/ss/documents/sciencestnd.pdf\u000a6th Grade \u000aPlate Tectonics and Earth''s Structure, 1a-f\u000aEnergy in the Earth System, 4c','Earth Science','Students investigate geologic patterns in the United States, then delve deeper into Earth''s layers to understand how surface features and events arise from invisible inner processes.','{"techDetails":"Molecular Workbench, MySystem, Draw Tool","flash":true,"quickTime":false,"java":true}','wise','Plate Tectonics','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"8jE1yRS1aI","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["Animation or Video","Real-life Observation","Text in this Unit","Visualization or Model","Teacher or Parent","Classmate or Friend","School Textbook","Movie/Book (non-school)"]},{"id":"67VhYQUsyO","allowCustom":false,"isRequired":true,"name":"Sure of this idea?","type":"source","options":["Positive","Fairly Sure","Somewhat Sure","Not Sure"]},{"id":"LPVa3d6OFI","isRequired":true,"name":"Tags","type":"tags","options":["Conduction","Convection","Mountains, Volcanoes","Ocean Floor","Convergent Boundary","Divergent Boundary","Transform Boundary","Density","Heat Energy","None"]}],"basketTerm":"Idea Basket","addIdeaTerm":"Add Idea","ideaTerm":"idea","ebTerm":"Explanation Builder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":true}','6-7 hours',NULL);
INSERT INTO projects VALUES(1,'2013-06-05 14:18:41.292000',NULL,0,'1','0','0',NULL,'Plate Tectonics',NULL,4,0,1,1,NULL);
INSERT INTO acl_sid VALUES(1,TRUE,'admin',NULL);
INSERT INTO acl_class VALUES(1,'org.wise.portal.domain.project.impl.ProjectImpl',NULL);
INSERT INTO acl_object_identity VALUES(1,1,NULL,'1',NULL,1,1,NULL);
DELETE FROM acl_object_identity WHERE ID=1;
INSERT INTO acl_object_identity VALUES(1,1,NULL,'1',NULL,1,1,NULL);
INSERT INTO acl_entry VALUES(1,0,'0','0','1',16,NULL,1,1);
INSERT INTO projects_related_to_owners VALUES(1,1);

INSERT INTO curnits VALUES(2,NULL,0);
INSERT INTO modules VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,2);
INSERT INTO urlmodules VALUES('/2/wise4.project.json',2);
INSERT INTO project_metadata VALUES(2,'','4-5 hours','Kihyun (Kelly) Ryoo, khryoo@berkeley.edu','6-8','Cellular respiration, life science, energy release, energy transfer, energy storage','English',NULL,NULL,NULL,'Activity 1 is designed to review energy concepts learned in the Photosynthesis unit. This step can be skipped.\u000a\u000aStep 4.4 is an experiment step using simulation. A demo or classroom discussion about how to use the simulation can help students conduct experiments in this step.\u000a\u000aStep 5.6 is a MySystem step. Students often forget to choose a type of energy flowing when generating MySystem. \u000a\u000aIt may take a while to load icons. If icons are missing in this step, go back to Step 5.5. and come back to Step 5.6.','[]','classic',NULL,NULL,'Grade Six\u000a\u000aEcology (Life Sciences) \u000a5. Organisms in ecosystems exchange energy and nutrients among themselves and with\u000athe environment. As a basis for understanding this concept: \u000aa. Students know energy entering ecosystems as sunlight is transferred by producers into chemical energy through photosynthesis and then from organism to organism through food webs.\u000ab. Students know matter is transferred over time from one organism to others in the food web and between organisms and the physical environment.\u000a\u000aGrade 7\u000a\u000aCell Biology \u000a1. All living organisms are composed of cells, from just one to many trillions, whose details usually are visible only through a microscope. As a basis for understanding this concept:\u000ab. Students know the characteristics that distinguish plant cells from animal cells, including chloroplasts and cell walls.\u000ad. Students know that mitochondria liberate energy for the work that cells do and that chloroplasts capture sunlight energy for photosynthesis.\u000a','Life Science','Students investigate how plants release the chemical energy stored in glucose as usable energy and use this energy for growth, reproduction, and other energy needs. ','{"techDetails":"MySystem","flash":true,"quickTime":true,"java":false}','wise','Cellular Respiration','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"sGkykLXHoQ","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["Evidence Step","Visualization or Model","Movie/Video","Everyday Observation","School or Teacher"]},{"id":"vEq7S0JZ1W","isRequired":false,"name":"Icon","type":"icon","options":["blank","important","question"]}],"basketTerm":"Idea Basket","addIdeaTerm":"Add Idea","ideaTerm":"idea","ebTerm":"Explanation Builder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":false}','4-5 hours',NULL);
INSERT INTO projects VALUES(2,'2013-06-05 14:20:27.282000',NULL,0,'1','0','0',NULL,'Cellular Respiration',NULL,4,0,2,2,NULL);
INSERT INTO acl_object_identity VALUES(2,2,NULL,'1',NULL,1,1,NULL);
DELETE FROM acl_object_identity WHERE ID=2;
INSERT INTO acl_object_identity VALUES(2,2,NULL,'1',NULL,1,1,NULL);
INSERT INTO acl_entry VALUES(2,0,'0','0','1',16,NULL,1,2);
INSERT INTO projects_related_to_owners VALUES(2,1);

INSERT INTO tags VALUES(1,'public');
INSERT INTO tags VALUES(2,'library');
INSERT INTO projects_related_to_tags VALUES(1,1);
INSERT INTO projects_related_to_tags VALUES(1,2);
INSERT INTO projects_related_to_tags VALUES(2,1);
INSERT INTO projects_related_to_tags VALUES(2,2);

/* Create Sample Runs for the sample teacher using the sample projects */

/* create sample plate tectonics run for preview teacher */
INSERT INTO curnits VALUES(3,NULL,0);
INSERT INTO modules VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,3);
INSERT INTO urlmodules VALUES('/3/wise4.project.json',3);
INSERT INTO project_metadata VALUES(3,'{"username":"admin","fullname":"ad min"}','6-7 hours','Elissa Sato (elissa.sato@berkeley.edu)','6-8','earth science, plate tectonics, convection','English',NULL,NULL,NULL,'General Suggestions: <br><br>\u005cu000aStudents will benefit from signposting before the start of each day, e.g., being asked to reach certain steps and activities.  <br><br>\u005cu000aThere are extra credit steps in the project (Activity 8) for advanced students, but preparing off-line activities and assignments may also be useful for teachers to accommodate the range of students'' abilities and speed.<br><br>\u005cu000a\u005cu000aActivity 1 and Activity 7 are assessment items that may be used by teachers in conjunction with their existing assessments. Most items are completed in pairs, but one item allows for individual completion.<br><br>\u005cu000a\u005cu000aSome suggestions from teachers who have run the project:<br><br>\u005cu000a<ul><li>Step 2.4: A classroom discussion with the map will help students focus on the important parts of the map.\u005cu000a<li>Step 4.8: The simulation may take a while to load depending on the computer/network speed, and there may be several seconds with a blank screen before the active loading screen appears, so students may think there is something wrong. Also, it may take a while for the molecules to come back together in the simulation after clicking "remove cup of hot water," so ask students to be patient.</li></ul>','[]','classic',NULL,NULL,'http://www.cde.ca.gov/be/st/ss/documents/sciencestnd.pdf\u005cu000a6th Grade \u005cu000aPlate Tectonics and Earth''s Structure, 1a-f\u005cu000aEnergy in the Earth System, 4c','Earth Science','Students investigate geologic patterns in the United States, then delve deeper into Earth''s layers to understand how surface features and events arise from invisible inner processes.','{"techDetails":"Molecular Workbench, MySystem, Draw Tool","flash":true,"quickTime":false,"java":true}','wise','Plate Tectonics','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"8jE1yRS1aI","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["Animation or Video","Real-life Observation","Text in this Unit","Visualization or Model","Teacher or Parent","Classmate or Friend","School Textbook","Movie/Book (non-school)"]},{"id":"67VhYQUsyO","allowCustom":false,"isRequired":true,"name":"Sure of this idea?","type":"source","options":["Positive","Fairly Sure","Somewhat Sure","Not Sure"]},{"id":"LPVa3d6OFI","isRequired":true,"name":"Tags","type":"tags","options":["Conduction","Convection","Mountains, Volcanoes","Ocean Floor","Convergent Boundary","Divergent Boundary","Transform Boundary","Density","Heat Energy","None"]}],"basketTerm":"Idea Basket","addIdeaTerm":"Add Idea","ideaTerm":"idea","ebTerm":"Explanation Builder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":true}','6-7 hours',NULL);
INSERT INTO projects VALUES(3,'2013-06-05 15:53:00.070000',NULL,0,'1','0','0',NULL,'Plate Tectonics',1,4,0,3,3,NULL);
INSERT INTO acl_sid VALUES(2,TRUE,'preview',NULL);
INSERT INTO acl_object_identity VALUES(3,3,NULL,'1',NULL,1,2,NULL);
DELETE FROM acl_object_identity WHERE ID=3;
INSERT INTO acl_object_identity VALUES(3,3,NULL,'1',NULL,1,2,NULL);
INSERT INTO acl_entry VALUES(3,0,'0','0','1',16,NULL,2,3);
INSERT INTO projects_related_to_owners VALUES(3,2);
INSERT INTO groups VALUES(1,'1',0,NULL);
INSERT INTO groups VALUES(2,'2',0,NULL);
INSERT INTO groups VALUES(3,'3',0,NULL);
INSERT INTO offerings VALUES(1,0);
INSERT INTO runs VALUES('2013-07-05 15:53:00.142000',NULL,NULL,NULL,NULL,NULL,3,'Plate Tectonics',5,'Snake223','2013-06-05 15:53:00.135000',NULL,NULL,1,3);
INSERT INTO acl_class VALUES(2,'org.wise.portal.domain.run.impl.RunImpl',NULL);
INSERT INTO acl_object_identity VALUES(4,1,NULL,'1',NULL,2,2,NULL);
DELETE FROM acl_object_identity WHERE ID=4;
INSERT INTO acl_object_identity VALUES(4,1,NULL,'1',NULL,2,2,NULL);
INSERT INTO acl_entry VALUES(4,0,'0','0','1',16,NULL,2,4);
INSERT INTO runs_related_to_owners VALUES(1,2);
INSERT INTO runs_related_to_groups VALUES(1,1);
INSERT INTO runs_related_to_groups VALUES(1,2);
INSERT INTO runs_related_to_groups VALUES(1,3);
INSERT INTO groups VALUES(4,' preview',0,NULL);
INSERT INTO workgroups VALUES(1,0,4,1);
INSERT INTO wiseworkgroups VALUES(NULL,'1',1,NULL);
INSERT INTO acl_class VALUES(3,'org.wise.portal.domain.workgroup.impl.WISEWorkgroupImpl',NULL);
INSERT INTO acl_object_identity VALUES(5,1,NULL,'1',NULL,3,2,NULL);
DELETE FROM acl_object_identity WHERE ID=5;
INSERT INTO acl_object_identity VALUES(5,1,NULL,'1',NULL,3,2,NULL);
INSERT INTO acl_entry VALUES(5,0,'0','0','1',16,NULL,2,5);
INSERT INTO groups_related_to_users VALUES(4,2);

/* add test students student0101~0103 to plate tectonics run */
INSERT INTO user_details VALUES(3,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0101',0);
INSERT INTO student_user_details VALUES('wise','QUESTION_ONE','2013-01-01 15:55:51.240000','studen',0,NULL,'t',0,'2013-06-05 15:55:51.240000',3);
INSERT INTO users VALUES(3,0,3);
INSERT INTO user_details_related_to_roles VALUES(3,4);
INSERT INTO user_details_related_to_roles VALUES(3,1);
DELETE FROM groups WHERE ID=1;
INSERT INTO groups VALUES(1,'1',1,NULL);
INSERT INTO groups_related_to_users VALUES(1,3);


INSERT INTO user_details VALUES(4,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0102',0);
INSERT INTO student_user_details VALUES('wise','QUESTION_ONE','2013-01-02 16:01:28.450000','studen',0,NULL,'t',0,'2013-06-05 16:01:28.450000',4);
INSERT INTO users VALUES(4,0,4);
INSERT INTO user_details_related_to_roles VALUES(4,4);
INSERT INTO user_details_related_to_roles VALUES(4,1);
DELETE FROM groups WHERE ID=2;
INSERT INTO groups VALUES(2,'2',1,NULL);
INSERT INTO groups_related_to_users VALUES(2,4);

INSERT INTO user_details VALUES(5,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0103',0);
INSERT INTO student_user_details VALUES('wise','QUESTION_ONE','2013-01-03 16:01:46.941000','studen',0,NULL,'t',0,'2013-06-05 16:01:46.941000',5);
INSERT INTO users VALUES(5,0,5);
INSERT INTO user_details_related_to_roles VALUES(5,4);
INSERT INTO user_details_related_to_roles VALUES(5,1);
DELETE FROM groups WHERE ID=2;
INSERT INTO groups VALUES(2,'2',2,NULL);
INSERT INTO groups_related_to_users VALUES(2,5);


/* Add Chemical Reactions sample project */
INSERT INTO curnits VALUES(4,NULL,0);
INSERT INTO modules VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,4);
INSERT INTO urlmodules VALUES('/4/wise4.project.json',4);
INSERT INTO project_metadata VALUES(4,'','4-5 hours','','6-12','balanced equations, reactants, products, global warming, hydrocarbons','English',NULL,NULL,NULL,'','[{"nodeId":"node_150.or","maxScoreValue":1},{"nodeId":"node_151.or","maxScoreValue":3},{"nodeId":"node_157.or","maxScoreValue":2},{"nodeId":"node_52.al","maxScoreValue":1},{"nodeId":"node_66.or","maxScoreValue":3},{"nodeId":"node_54.al","maxScoreValue":1},{"nodeId":"node_97.al","maxScoreValue":1},{"nodeId":"node_103.or","maxScoreValue":2},{"nodeId":"node_89.al","maxScoreValue":0},{"nodeId":"node_147.or","maxScoreValue":2},{"nodeId":"node_159.my","maxScoreValue":10},{"nodeId":"node_102.al","maxScoreValue":5},{"nodeId":"node_158.fi","maxScoreValue":1},{"nodeId":"node_12.mc","maxScoreValue":0},{"nodeId":"node_160.fi","maxScoreValue":0},{"nodeId":"node_152.my","maxScoreValue":5},{"nodeId":"node_163.al","maxScoreValue":10},{"nodeId":"node_150.al","maxScoreValue":2},{"nodeId":"node_164.or","maxScoreValue":1},{"nodeId":"node_167.mc","maxScoreValue":2},{"nodeId":"node_166.or","maxScoreValue":2},{"nodeId":"node_169.al","maxScoreValue":3},{"nodeId":"node_171.al","maxScoreValue":2},{"nodeId":"node_170.al","maxScoreValue":5},{"nodeId":"node_172.fi","maxScoreValue":0},{"nodeId":"node_173.al","maxScoreValue":2},{"nodeId":"node_161.al","maxScoreValue":0},{"nodeId":"node_165.or","maxScoreValue":1},{"nodeId":"node_168.mc","maxScoreValue":2},{"nodeId":"node_167.or","maxScoreValue":2},{"nodeId":"node_172.al","maxScoreValue":2},{"nodeId":"node_55.al","maxScoreValue":5},{"nodeId":"node_66.al","maxScoreValue":3},{"nodeId":"node_68.al","maxScoreValue":3},{"nodeId":"node_69.al","maxScoreValue":3},{"nodeId":"node_70.al","maxScoreValue":3},{"nodeId":"node_71.al","maxScoreValue":6},{"nodeId":"node_72.al","maxScoreValue":6},{"nodeId":"node_165.al","maxScoreValue":10},{"nodeId":"node_166.al","maxScoreValue":10},{"nodeId":"node_171.or","maxScoreValue":10},{"nodeId":"node_172.mc","maxScoreValue":10},{"nodeId":"node_168.al","maxScoreValue":10},{"nodeId":"node_174.al","maxScoreValue":10},{"nodeId":"node_179.al","maxScoreValue":10},{"nodeId":"node_180.al","maxScoreValue":10},{"nodeId":"node_2.my","maxScoreValue":0},{"nodeId":"node_164.al","maxScoreValue":10},{"nodeId":"node_177.al","maxScoreValue":10},{"nodeId":"node_178.al","maxScoreValue":10},{"nodeId":"node_94.fi","maxScoreValue":5},{"nodeId":"node_8.or","maxScoreValue":5},{"nodeId":"node_86.al","maxScoreValue":5},{"nodeId":"node_88.al","maxScoreValue":10},{"nodeId":"node_95.or","maxScoreValue":5},{"nodeId":"node_82.al","maxScoreValue":10},{"nodeId":"node_106.al","maxScoreValue":5},{"nodeId":"node_96.or","maxScoreValue":10},{"nodeId":"node_79.al","maxScoreValue":10},{"nodeId":"node_105.al","maxScoreValue":10},{"nodeId":"node_40.fi","maxScoreValue":5},{"nodeId":"node_77.al","maxScoreValue":5},{"nodeId":"node_85.al","maxScoreValue":10},{"nodeId":"node_80.al","maxScoreValue":10},{"nodeId":"node_6.mc","maxScoreValue":5},{"nodeId":"node_92.al","maxScoreValue":10},{"nodeId":"node_57.al","maxScoreValue":10},{"nodeId":"node_93.al","maxScoreValue":10},{"nodeId":"node_101.my","maxScoreValue":10}]',NULL,NULL,NULL,'','Physical Science','Students investigate chemical reactions that result in an increase of greenhouse gases in the atmosphere. They then apply the evidence they have gathered to understand the impact of human actions on global climate change.','{"techDetails":""}',NULL,'Chemical Reactions: How Can We Slow Climate Change?','{"isIdeaManagerEnabled":"checked"}','4-5 hours',NULL);
INSERT INTO projects VALUES(4,'2013-06-11 09:34:54.154000',NULL,0,'1','0','0',NULL,'Chemical Reactions: How Can We Slow Climate Change?',NULL,4,0,4,4,NULL);
INSERT INTO acl_object_identity VALUES(6,4,NULL,'1',NULL,1,1,NULL);
DELETE FROM acl_object_identity WHERE ID=6;
INSERT INTO acl_object_identity VALUES(6,4,NULL,'1',NULL,1,1,NULL);
INSERT INTO acl_entry VALUES(6,0,'0','0','1',16,NULL,1,6);
INSERT INTO projects_related_to_owners VALUES(4,1);

INSERT INTO projects_related_to_tags VALUES(4,1);
INSERT INTO projects_related_to_tags VALUES(4,2);


/* Add EPIGAME sample project */
INSERT INTO curnits VALUES(5,NULL,0);
INSERT INTO modules VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,5);
INSERT INTO urlmodules VALUES('/5/wise4.project.json',5);
INSERT INTO project_metadata VALUES(5,'{"username":"DeanneAdams","fullname":"Deanne Adams"}',NULL,'',NULL,'',NULL,NULL,NULL,NULL,'','[]','map',NULL,NULL,'','Physics','','{"techDetails":"","flash":false,"quickTime":false,"java":false}','starmap','EPIGAME Base Warp Version II','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"BFPgy8HPdv","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["EvidenceStep","VisualizationorModel","Movie/Video","EverydayObservation","SchoolorTeacher"]},{"id":"KwE3uMi1jt","isRequired":false,"name":"Icon","type":"icon","options":["blank","important","question"]}],"basketTerm":"IdeaBasket","addIdeaTerm":"AddIdea+","ideaTerm":"idea","ebTerm":"ExplanationBuilder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":false,"themeSettings":[],"navSettings":[{"navMode":"map","theme":"starmap","nodeSettings":{"node_14.ep":{"y":90.65265504123295,"x":702.2863061765547},"node_92.ep":{"y":352.71348399447,"x":572.5690350391425},"node_11.fl":{"y":178.71837873775223,"x":562.260324644418},"node_6.ep":{"y":163.2512303223769,"x":795.9505988823153},"node_56.ep":{"y":244.90401761777682,"x":328.566361747303},"node_12.fl":{"y":287.80177924500373,"x":409.9279131169279},"node_44.ep":{"y":424.2479806657159,"x":502.0110737680059},"node_7.ep":{"y":340.40918063680635,"x":276.7747937233931},"node_5.txt":{"y":250.73270477345153,"x":502.0696419186129},"node_0.ep":{"y":64.89648899999989,"x":556.3216121621413},"node_4.ep":{"y":199.8196375975159,"x":264.2447639050285},"node_3.fl":{"y":438.11295021026984,"x":650.2146045889939},"node_86.ep":{"y":275.15661252341056,"x":738.827649756646},"node_9.ep":{"y":278.72951629149986,"x":634.0146610147365},"node_26.ep":{"y":376.00175060164383,"x":779.9263124655988},"node_50.ep":{"y":443.1878514287957,"x":349.43671391916047},"node_20.ep":{"y":275.15959968420657,"x":819.4340261638574},"node_2.ep":{"y":119.36113729911295,"x":330.09207896503426},"node_62.ep":{"y":167.0162350147504,"x":427.33997076129896},"node_13.ep":{"y":368.1344634296162,"x":439.5871548141363},"node_80.ep":{"y":160.78475544160614,"x":682.6898005034674},"node_1.fl":{"y":99.54926550685084,"x":434.2172578074868}}}]}',NULL,NULL);
INSERT INTO projects VALUES(5,'2013-09-26 11:16:28.337000',NULL,0,'1','0','0',NULL,'EPIGAME',NULL,4,0,5,5,NULL);
INSERT INTO acl_object_identity VALUES(7,5,NULL,'1',NULL,1,1,NULL);
DELETE FROM acl_object_identity WHERE ID=7;
INSERT INTO acl_object_identity VALUES(7,5,NULL,'1',NULL,1,1,NULL);
INSERT INTO acl_entry VALUES(7,0,'0','0','1',16,NULL,1,7);
INSERT INTO projects_related_to_owners VALUES(5,1);

INSERT INTO projects_related_to_tags VALUES(5,1);
INSERT INTO projects_related_to_tags VALUES(5,2);

/* Create run with Epigame project */
INSERT INTO curnits VALUES(6,NULL,0);
INSERT INTO modules VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,6);
INSERT INTO urlmodules VALUES('/6/wise4.project.json',6);
INSERT INTO project_metadata VALUES(6,'{"username":"DeanneAdams","fullname":"Deanne Adams"}',NULL,'',NULL,'',NULL,NULL,NULL,NULL,'','[]','map',NULL,NULL,'','Physics','','{"techDetails":"","flash":false,"quickTime":false,"java":false}','starmap','EPIGAME Base Warp Version II','{"isStudentAssetUploaderEnabled":false,"ideaManagerSettings":{"publicBasketTerm":"N/A","ideaTermPlural":"ideas","ideaAttributes":[{"id":"BFPgy8HPdv","allowCustom":false,"isRequired":true,"name":"Source","type":"source","options":["EvidenceStep","VisualizationorModel","Movie/Video","EverydayObservation","SchoolorTeacher"]},{"id":"KwE3uMi1jt","isRequired":false,"name":"Icon","type":"icon","options":["blank","important","question"]}],"basketTerm":"IdeaBasket","addIdeaTerm":"AddIdea+","ideaTerm":"idea","ebTerm":"ExplanationBuilder","privateBasketTerm":"N/A","version":"2"},"isPublicIdeaManagerEnabled":false,"isIdeaManagerEnabled":false,"themeSettings":[],"navSettings":[{"navMode":"map","theme":"starmap","nodeSettings":{"node_14.ep":{"y":90.65265504123295,"x":702.2863061765547},"node_92.ep":{"y":352.71348399447,"x":572.5690350391425},"node_11.fl":{"y":178.71837873775223,"x":562.260324644418},"node_6.ep":{"y":163.2512303223769,"x":795.9505988823153},"node_56.ep":{"y":244.90401761777682,"x":328.566361747303},"node_12.fl":{"y":287.80177924500373,"x":409.9279131169279},"node_44.ep":{"y":424.2479806657159,"x":502.0110737680059},"node_7.ep":{"y":340.40918063680635,"x":276.7747937233931},"node_5.txt":{"y":250.73270477345153,"x":502.0696419186129},"node_0.ep":{"y":64.89648899999989,"x":556.3216121621413},"node_4.ep":{"y":199.8196375975159,"x":264.2447639050285},"node_3.fl":{"y":438.11295021026984,"x":650.2146045889939},"node_86.ep":{"y":275.15661252341056,"x":738.827649756646},"node_9.ep":{"y":278.72951629149986,"x":634.0146610147365},"node_26.ep":{"y":376.00175060164383,"x":779.9263124655988},"node_50.ep":{"y":443.1878514287957,"x":349.43671391916047},"node_20.ep":{"y":275.15959968420657,"x":819.4340261638574},"node_2.ep":{"y":119.36113729911295,"x":330.09207896503426},"node_62.ep":{"y":167.0162350147504,"x":427.33997076129896},"node_13.ep":{"y":368.1344634296162,"x":439.5871548141363},"node_80.ep":{"y":160.78475544160614,"x":682.6898005034674},"node_1.fl":{"y":99.54926550685084,"x":434.2172578074868}}}]}',NULL,NULL);
INSERT INTO projects VALUES(6,'2013-09-26 11:21:25.553000',NULL,0,'1','0','0',NULL,'EPIGAME',5,4,0,6,6,NULL);
INSERT INTO acl_object_identity VALUES(8,6,NULL,'1',NULL,1,2,NULL);
DELETE FROM acl_object_identity WHERE ID=8;
INSERT INTO acl_object_identity VALUES(8,6,NULL,'1',NULL,1,2,NULL);
INSERT INTO acl_entry VALUES(8,0,'0','0','1',16,NULL,2,8);
INSERT INTO projects_related_to_owners VALUES(6,2);
INSERT INTO groups VALUES(5,'1',0,NULL);
INSERT INTO groups VALUES(6,'2',0,NULL);
INSERT INTO offerings VALUES(2,0);
INSERT INTO runs VALUES('2013-10-26 11:21:25.594000',NULL,NULL,NULL,NULL,NULL,3,'EPIGAME',5,'Tiger796','2013-09-26 11:21:25.588000',NULL,NULL,2,6);
INSERT INTO acl_object_identity VALUES(9,2,NULL,'1',NULL,2,2,NULL);
DELETE FROM acl_object_identity WHERE ID=9;
INSERT INTO acl_object_identity VALUES(9,2,NULL,'1',NULL,2,2,NULL);
INSERT INTO acl_entry VALUES(9,0,'0','0','1',16,NULL,2,9);
INSERT INTO runs_related_to_owners VALUES(2,2);
INSERT INTO runs_related_to_groups VALUES(2,5);
INSERT INTO runs_related_to_groups VALUES(2,6);
INSERT INTO groups VALUES(7,' preview',0,NULL);
INSERT INTO workgroups VALUES(2,0,7,2);
INSERT INTO wiseworkgroups VALUES(NULL,'1',2,NULL);
INSERT INTO acl_object_identity VALUES(10,2,NULL,'1',NULL,3,2,NULL);
DELETE FROM acl_object_identity WHERE ID=10;
INSERT INTO acl_object_identity VALUES(10,2,NULL,'1',NULL,3,2,NULL);
INSERT INTO acl_entry VALUES(10,0,'0','0','1',16,NULL,2,10);
INSERT INTO groups_related_to_users VALUES(7,2);

/* Add student0101~0103 to Epigame run */
DELETE FROM user_details WHERE ID=3;
INSERT INTO user_details VALUES(3,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0101',1);
DELETE FROM student_user_details WHERE ID=3;
INSERT INTO student_user_details VALUES('wise','QUESTION_ONE','2013-01-01 15:55:51.240000','studen',0,'2013-09-26 11:24:03.994000','t',1,'2013-06-05 15:55:51.240000',3);
DELETE FROM groups WHERE ID=5;
INSERT INTO groups VALUES(5,'1',1,NULL);
INSERT INTO groups_related_to_users VALUES(5,3);


DELETE FROM user_details WHERE ID=4;
INSERT INTO user_details VALUES(4,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0102',1);
DELETE FROM student_user_details WHERE ID=4;
INSERT INTO student_user_details VALUES('wise','QUESTION_ONE','2013-01-02 16:01:28.450000','studen',0,'2013-09-26 11:25:24.922000','t',1,'2013-06-05 16:01:28.450000',4);
DELETE FROM groups WHERE ID=5;
INSERT INTO groups VALUES(5,'1',2,NULL);
INSERT INTO groups_related_to_users VALUES(5,4);

DELETE FROM user_details WHERE ID=5;
INSERT INTO user_details VALUES(5,'1','1','1',NULL,'1',0,'4cd92091d686b42ec74a29a26432915a',NULL,NULL,NULL,'student0103',1);
DELETE FROM student_user_details WHERE ID=5;
INSERT INTO student_user_details VALUES('wise','QUESTION_ONE','2013-01-03 16:01:46.941000','studen',0,'2013-09-26 11:25:35.957000','t',1,'2013-06-05 16:01:46.941000',5);
DELETE FROM groups WHERE ID=5;
INSERT INTO groups VALUES(5,'1',3,NULL);
INSERT INTO groups_related_to_users VALUES(5,5);

