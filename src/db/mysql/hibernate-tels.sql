
    create table acl_class (
        id bigint not null auto_increment,
        class varchar(255) not null unique,
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

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
    ) type=InnoDB;

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
    ) type=InnoDB;

    create table acl_sid (
        id bigint not null auto_increment,
        principal boolean not null,
        sid varchar(255) not null,
        OPTLOCK integer,
        primary key (id),
        unique (sid, principal)
    ) type=InnoDB;

    create table annotationbundles (
        id bigint not null auto_increment,
        bundle longtext not null,
        OPTLOCK integer,
        workgroup_fk bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table announcements (
        id bigint not null auto_increment,
        announcement text not null,
        timestamp datetime not null,
        title varchar(255) not null,
        primary key (id)
    ) type=InnoDB;

    create table curnits (
        id bigint not null auto_increment,
        name varchar(255),
        OPTLOCK integer,
        sds_curnit_fk bigint unique,
        primary key (id)
    ) type=InnoDB;

    create table diyprojectcommunicators (
        diyportalhostname varchar(255),
        previewdiyprojectsuffix varchar(255),
        id bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table externalprojects (
        external_id bigint,
        id bigint not null,
        projectcommunicator_fk bigint,
        primary key (id)
    ) type=InnoDB;

    create table granted_authorities (
        id bigint not null auto_increment,
        authority varchar(255) not null unique,
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

    create table groups (
        id bigint not null auto_increment,
        name varchar(255) not null,
        OPTLOCK integer,
        parent_fk bigint,
        primary key (id)
    ) type=InnoDB;

    create table groups_related_to_users (
        group_fk bigint not null,
        user_fk bigint not null,
        primary key (group_fk, user_fk)
    ) type=InnoDB;

    create table jaxbquestions (
        id bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table jnlps (
        id bigint not null auto_increment,
        OPTLOCK integer,
        sds_jnlp_fk bigint unique,
        primary key (id)
    ) type=InnoDB;

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
    ) type=InnoDB;

    create table modules_related_to_owners (
        module_fk bigint not null,
        owners_fk bigint not null,
        primary key (module_fk, owners_fk)
    ) type=InnoDB;

    create table newsitem (
        id bigint not null auto_increment,
        date datetime not null,
        news text not null,
        title varchar(255) not null,
        owner bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table offerings (
        id bigint not null auto_increment,
        OPTLOCK integer,
        sds_offering_fk bigint unique,
        primary key (id)
    ) type=InnoDB;

    create table portal (
        id bigint not null auto_increment,
        address varchar(255),
        comments varchar(255),
        google_map_key varchar(255),
        sendmail_on_exception bit,
        portalname varchar(255),
        sendmail_properties tinyblob,
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

    create table premadecommentlists (
        id bigint not null auto_increment,
        label varchar(255) not null,
        owner bigint,
        run bigint,
        primary key (id)
    ) type=InnoDB;

    create table premadecomments (
        id bigint not null auto_increment,
        comment varchar(255) not null,
        label varchar(255) not null,
        owner bigint,
        run bigint,
        primary key (id)
    ) type=InnoDB;

    create table premadecomments_related_to_premadecommentlists (
        premadecommentslist_fk bigint not null,
        premadecomments_fk bigint not null,
        primary key (premadecommentslist_fk, premadecomments_fk)
    ) type=InnoDB;

    create table project_metadata (
        id bigint not null auto_increment,
        author varchar(255),
        duration varchar(255),
        subject varchar(255),
        summary varchar(255),
        title varchar(255),
        primary key (id)
    ) type=InnoDB;

    create table projectcommunicators (
        id bigint not null auto_increment,
        address varchar(255),
        baseurl varchar(255),
        latitude varchar(255),
        longitude varchar(255),
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

    create table projects (
        id bigint not null auto_increment,
        familytag integer,
        iscurrent bit,
        name varchar(255),
        projecttype integer,
        OPTLOCK integer,
        curnit_fk bigint,
        jnlp_fk bigint,
        metadata_fk bigint,
        run_fk bigint unique,
        primary key (id)
    ) type=InnoDB;

    create table projects_related_to_bookmarkers (
        projects_fk bigint not null,
        bookmarkers bigint not null,
        primary key (projects_fk, bookmarkers)
    ) type=InnoDB;

    create table projects_related_to_owners (
        projects_fk bigint not null,
        owners_fk bigint not null,
        primary key (projects_fk, owners_fk)
    ) type=InnoDB;

    create table projects_related_to_shared_owners (
        projects_fk bigint not null,
        shared_owners_fk bigint not null,
        primary key (projects_fk, shared_owners_fk)
    ) type=InnoDB;

    create table runs (
        archive_reminder datetime not null,
        end_time datetime,
        info varchar(255),
        maxWorkgroupSize integer,
        name varchar(255),
        run_code varchar(255) not null unique,
        start_time datetime not null,
        id bigint not null,
        project_fk bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table runs_related_to_announcements (
        runs_fk bigint not null,
        announcements_fk bigint not null,
        primary key (runs_fk, announcements_fk),
        unique (announcements_fk)
    ) type=InnoDB;

    create table runs_related_to_groups (
        runs_fk bigint not null,
        groups_fk bigint not null,
        primary key (runs_fk, groups_fk),
        unique (groups_fk)
    ) type=InnoDB;

    create table runs_related_to_owners (
        runs_fk bigint not null,
        owners_fk bigint not null,
        primary key (runs_fk, owners_fk)
    ) type=InnoDB;

    create table runs_related_to_shared_owners (
        runs_fk bigint not null,
        shared_owners_fk bigint not null,
        primary key (runs_fk, shared_owners_fk)
    ) type=InnoDB;

    create table sds_curnits (
        id bigint not null auto_increment,
        name varchar(255) not null,
        curnit_id bigint not null unique,
        url varchar(255) not null,
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

    create table sds_jnlps (
        id bigint not null auto_increment,
        name varchar(255) not null,
        jnlp_id bigint not null unique,
        url varchar(255) not null,
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

    create table sds_offerings (
        id bigint not null auto_increment,
        name varchar(255) not null,
        sds_curnitmap longtext,
        offering_id bigint not null unique,
        OPTLOCK integer,
        sds_curnit_fk bigint not null,
        sds_jnlp_fk bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table sds_users (
        id bigint not null auto_increment,
        first_name varchar(255) not null,
        last_name varchar(255) not null,
        user_id bigint not null unique,
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

    create table sds_workgroups (
        id bigint not null auto_increment,
        name varchar(255) not null,
        workgroup_id bigint not null unique,
        sds_sessionbundle longtext,
        OPTLOCK integer,
        sds_offering_fk bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table sds_workgroups_related_to_sds_users (
        sds_workgroup_fk bigint not null,
        sds_user_fk bigint not null,
        primary key (sds_workgroup_fk, sds_user_fk)
    ) type=InnoDB;

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
    ) type=InnoDB;

    create table teacher_user_details (
        city varchar(255),
        country varchar(255) not null,
        curriculumsubjects tinyblob not null,
        displayname varchar(255),
        firstname varchar(255) not null,
        lastlogintime datetime,
        lastname varchar(255) not null,
        numberoflogins integer not null,
        schoollevel integer not null,
        schoolname varchar(255) not null,
        signupdate datetime not null,
        state varchar(255),
        id bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table urlmodules (
        module_url varchar(255),
        id bigint not null,
        primary key (id)
    ) type=InnoDB;

    create table user_details (
        id bigint not null auto_increment,
        account_not_expired bit not null,
        account_not_locked bit not null,
        credentials_not_expired bit not null,
        email_address varchar(255),
        enabled bit not null,
        password varchar(255) not null,
        username varchar(255) not null unique,
        OPTLOCK integer,
        primary key (id)
    ) type=InnoDB;

    create table user_details_related_to_roles (
        user_details_fk bigint not null,
        granted_authorities_fk bigint not null,
        primary key (user_details_fk, granted_authorities_fk)
    ) type=InnoDB;

    create table users (
        id bigint not null auto_increment,
        OPTLOCK integer,
        sds_user_fk bigint unique,
        user_details_fk bigint not null unique,
        primary key (id)
    ) type=InnoDB;

    create table wiseworkgroups (
        externalId bigint,
        is_teacher_workgroup bit,
        id bigint not null,
        period bigint,
        primary key (id)
    ) type=InnoDB;

    create table workgroups (
        id bigint not null auto_increment,
        OPTLOCK integer,
        group_fk bigint not null,
        offering_fk bigint not null,
        sds_workgroup_fk bigint unique,
        primary key (id)
    ) type=InnoDB;

    alter table acl_entry 
        add index FK5302D47DC9975936 (acl_object_identity), 
        add constraint FK5302D47DC9975936 
        foreign key (acl_object_identity) 
        references acl_object_identity (id);

    alter table acl_entry 
        add index FK5302D47D9A4DE79D (sid), 
        add constraint FK5302D47D9A4DE79D 
        foreign key (sid) 
        references acl_sid (id);

    alter table acl_object_identity 
        add index FK2A2BB0099B5E7811 (owner_sid), 
        add constraint FK2A2BB0099B5E7811 
        foreign key (owner_sid) 
        references acl_sid (id);

    alter table acl_object_identity 
        add index FK2A2BB009BDC00DA1 (parent_object), 
        add constraint FK2A2BB009BDC00DA1 
        foreign key (parent_object) 
        references acl_object_identity (id);

    alter table acl_object_identity 
        add index FK2A2BB0092458F1A3 (object_id_class), 
        add constraint FK2A2BB0092458F1A3 
        foreign key (object_id_class) 
        references acl_class (id);

    alter table annotationbundles 
        add index FKAA5FD222F54443B2 (workgroup_fk), 
        add constraint FKAA5FD222F54443B2 
        foreign key (workgroup_fk) 
        references workgroups (id);

    alter table curnits 
        add index FK4329FBBA1B78E061 (sds_curnit_fk), 
        add constraint FK4329FBBA1B78E061 
        foreign key (sds_curnit_fk) 
        references sds_curnits (id);

    alter table diyprojectcommunicators 
        add index FK83FA9ED96FC1637F (id), 
        add constraint FK83FA9ED96FC1637F 
        foreign key (id) 
        references projectcommunicators (id);

    alter table externalprojects 
        add index FKD8238145CE9C471A (projectcommunicator_fk), 
        add constraint FKD8238145CE9C471A 
        foreign key (projectcommunicator_fk) 
        references projectcommunicators (id);

    alter table externalprojects 
        add index FKD8238145E48A3C0A (id), 
        add constraint FKD8238145E48A3C0A 
        foreign key (id) 
        references projects (id);

    alter table groups 
        add index FKB63DD9D4E696E7FF (parent_fk), 
        add constraint FKB63DD9D4E696E7FF 
        foreign key (parent_fk) 
        references groups (id);

    alter table groups_related_to_users 
        add index FK3311F7E356CA53B6 (user_fk), 
        add constraint FK3311F7E356CA53B6 
        foreign key (user_fk) 
        references users (id);

    alter table groups_related_to_users 
        add index FK3311F7E3895EAE0A (group_fk), 
        add constraint FK3311F7E3895EAE0A 
        foreign key (group_fk) 
        references groups (id);

    alter table jnlps 
        add index FK6095FABA532A941 (sds_jnlp_fk), 
        add constraint FK6095FABA532A941 
        foreign key (sds_jnlp_fk) 
        references sds_jnlps (id);

    alter table modules 
        add index FK492927875E6F3BA6 (id), 
        add constraint FK492927875E6F3BA6 
        foreign key (id) 
        references curnits (id);

    alter table modules_related_to_owners 
        add index FKE09C9860AA7F41 (owners_fk), 
        add constraint FKE09C9860AA7F41 
        foreign key (owners_fk) 
        references users (id);

    alter table modules_related_to_owners 
        add index FKE09C9839A4B723 (module_fk), 
        add constraint FKE09C9839A4B723 
        foreign key (module_fk) 
        references modules (id);

    alter table newsitem 
        add index FK532D646665E358B0 (owner), 
        add constraint FK532D646665E358B0 
        foreign key (owner) 
        references users (id);

    alter table offerings 
        add index FK73F0F12DAB4F6201 (sds_offering_fk), 
        add constraint FK73F0F12DAB4F6201 
        foreign key (sds_offering_fk) 
        references sds_offerings (id);

    alter table premadecommentlists 
        add index FKF237B2CEF4421937 (run), 
        add constraint FKF237B2CEF4421937 
        foreign key (run) 
        references runs (id);

    alter table premadecommentlists 
        add index FKF237B2CE65E358B0 (owner), 
        add constraint FKF237B2CE65E358B0 
        foreign key (owner) 
        references users (id);

    alter table premadecomments 
        add index FK7786D42CF4421937 (run), 
        add constraint FK7786D42CF4421937 
        foreign key (run) 
        references runs (id);

    alter table premadecomments 
        add index FK7786D42C65E358B0 (owner), 
        add constraint FK7786D42C65E358B0 
        foreign key (owner) 
        references users (id);

    alter table premadecomments_related_to_premadecommentlists 
        add index FK6958FC11C8153CF5 (premadecomments_fk), 
        add constraint FK6958FC11C8153CF5 
        foreign key (premadecomments_fk) 
        references premadecomments (id);

    alter table premadecomments_related_to_premadecommentlists 
        add index FK6958FC112FC6E4D5 (premadecommentslist_fk), 
        add constraint FK6958FC112FC6E4D5 
        foreign key (premadecommentslist_fk) 
        references premadecommentlists (id);

    alter table projects 
        add index FKC479187A7F08E576 (curnit_fk), 
        add constraint FKC479187A7F08E576 
        foreign key (curnit_fk) 
        references curnits (id);

    alter table projects 
        add index FKC479187ABD6D05A5 (run_fk), 
        add constraint FKC479187ABD6D05A5 
        foreign key (run_fk) 
        references runs (id);

    alter table projects 
        add index FKC479187A6E872393 (metadata_fk), 
        add constraint FKC479187A6E872393 
        foreign key (metadata_fk) 
        references project_metadata (id);

    alter table projects 
        add index FKC479187A9568F016 (jnlp_fk), 
        add constraint FKC479187A9568F016 
        foreign key (jnlp_fk) 
        references jnlps (id);

    alter table projects_related_to_bookmarkers 
        add index FK5AA350A5AC92FD99 (projects_fk), 
        add constraint FK5AA350A5AC92FD99 
        foreign key (projects_fk) 
        references projects (id);

    alter table projects_related_to_bookmarkers 
        add index FK5AA350A531C3B66D (bookmarkers), 
        add constraint FK5AA350A531C3B66D 
        foreign key (bookmarkers) 
        references users (id);

    alter table projects_related_to_owners 
        add index FKDACF56CB60AA7F41 (owners_fk), 
        add constraint FKDACF56CB60AA7F41 
        foreign key (owners_fk) 
        references users (id);

    alter table projects_related_to_owners 
        add index FKDACF56CBAC92FD99 (projects_fk), 
        add constraint FKDACF56CBAC92FD99 
        foreign key (projects_fk) 
        references projects (id);

    alter table projects_related_to_shared_owners 
        add index FK19A2B02FDB63ABE7 (shared_owners_fk), 
        add constraint FK19A2B02FDB63ABE7 
        foreign key (shared_owners_fk) 
        references users (id);

    alter table projects_related_to_shared_owners 
        add index FK19A2B02FAC92FD99 (projects_fk), 
        add constraint FK19A2B02FAC92FD99 
        foreign key (projects_fk) 
        references projects (id);

    alter table runs 
        add index FK3597486F1ED29A (project_fk), 
        add constraint FK3597486F1ED29A 
        foreign key (project_fk) 
        references projects (id);

    alter table runs 
        add index FK3597481834F8D3 (id), 
        add constraint FK3597481834F8D3 
        foreign key (id) 
        references offerings (id);

    alter table runs_related_to_announcements 
        add index FKEDEF47F33BC1BEB5 (announcements_fk), 
        add constraint FKEDEF47F33BC1BEB5 
        foreign key (announcements_fk) 
        references announcements (id);

    alter table runs_related_to_announcements 
        add index FKEDEF47F350B193C8 (runs_fk), 
        add constraint FKEDEF47F350B193C8 
        foreign key (runs_fk) 
        references runs (id);

    alter table runs_related_to_groups 
        add index FK6CD673CD50B193C8 (runs_fk), 
        add constraint FK6CD673CD50B193C8 
        foreign key (runs_fk) 
        references runs (id);

    alter table runs_related_to_groups 
        add index FK6CD673CD12D98E95 (groups_fk), 
        add constraint FK6CD673CD12D98E95 
        foreign key (groups_fk) 
        references groups (id);

    alter table runs_related_to_owners 
        add index FK7AC2FE1960AA7F41 (owners_fk), 
        add constraint FK7AC2FE1960AA7F41 
        foreign key (owners_fk) 
        references users (id);

    alter table runs_related_to_owners 
        add index FK7AC2FE1950B193C8 (runs_fk), 
        add constraint FK7AC2FE1950B193C8 
        foreign key (runs_fk) 
        references runs (id);

    alter table runs_related_to_shared_owners 
        add index FKBD30D52150B193C8 (runs_fk), 
        add constraint FKBD30D52150B193C8 
        foreign key (runs_fk) 
        references runs (id);

    alter table runs_related_to_shared_owners 
        add index FKBD30D521DB63ABE7 (shared_owners_fk), 
        add constraint FKBD30D521DB63ABE7 
        foreign key (shared_owners_fk) 
        references users (id);

    alter table sds_offerings 
        add index FK242EBD70A532A941 (sds_jnlp_fk), 
        add constraint FK242EBD70A532A941 
        foreign key (sds_jnlp_fk) 
        references sds_jnlps (id);

    alter table sds_offerings 
        add index FK242EBD701B78E061 (sds_curnit_fk), 
        add constraint FK242EBD701B78E061 
        foreign key (sds_curnit_fk) 
        references sds_curnits (id);

    alter table sds_workgroups 
        add index FK440A0C42AB4F6201 (sds_offering_fk), 
        add constraint FK440A0C42AB4F6201 
        foreign key (sds_offering_fk) 
        references sds_offerings (id);

    alter table sds_workgroups_related_to_sds_users 
        add index FKA31D36785AAC23E7 (sds_workgroup_fk), 
        add constraint FKA31D36785AAC23E7 
        foreign key (sds_workgroup_fk) 
        references sds_workgroups (id);

    alter table sds_workgroups_related_to_sds_users 
        add index FKA31D3678F342C661 (sds_user_fk), 
        add constraint FKA31D3678F342C661 
        foreign key (sds_user_fk) 
        references sds_users (id);

    alter table student_user_details 
        add index FKC5AA2952D1D25907 (id), 
        add constraint FKC5AA2952D1D25907 
        foreign key (id) 
        references user_details (id);

    alter table teacher_user_details 
        add index FKAC84070BD1D25907 (id), 
        add constraint FKAC84070BD1D25907 
        foreign key (id) 
        references user_details (id);

    alter table urlmodules 
        add index FKC83237389627A0C6 (id), 
        add constraint FKC83237389627A0C6 
        foreign key (id) 
        references modules (id);

    alter table user_details_related_to_roles 
        add index FKE6A5FBDEE3B038C2 (user_details_fk), 
        add constraint FKE6A5FBDEE3B038C2 
        foreign key (user_details_fk) 
        references user_details (id);

    alter table user_details_related_to_roles 
        add index FKE6A5FBDE44F8149A (granted_authorities_fk), 
        add constraint FKE6A5FBDE44F8149A 
        foreign key (granted_authorities_fk) 
        references granted_authorities (id);

    alter table users 
        add index FK6A68E08E3B038C2 (user_details_fk), 
        add constraint FK6A68E08E3B038C2 
        foreign key (user_details_fk) 
        references user_details (id);

    alter table users 
        add index FK6A68E08F342C661 (sds_user_fk), 
        add constraint FK6A68E08F342C661 
        foreign key (sds_user_fk) 
        references sds_users (id);

    alter table wiseworkgroups 
        add index FKF16C83C93013AD46 (period), 
        add constraint FKF16C83C93013AD46 
        foreign key (period) 
        references groups (id);

    alter table wiseworkgroups 
        add index FKF16C83C9F309B437 (id), 
        add constraint FKF16C83C9F309B437 
        foreign key (id) 
        references workgroups (id);

    alter table workgroups 
        add index FKEC8E50255AAC23E7 (sds_workgroup_fk), 
        add constraint FKEC8E50255AAC23E7 
        foreign key (sds_workgroup_fk) 
        references sds_workgroups (id);

    alter table workgroups 
        add index FKEC8E502553AE0756 (offering_fk), 
        add constraint FKEC8E502553AE0756 
        foreign key (offering_fk) 
        references offerings (id);

    alter table workgroups 
        add index FKEC8E5025895EAE0A (group_fk), 
        add constraint FKEC8E5025895EAE0A 
        foreign key (group_fk) 
        references groups (id);
