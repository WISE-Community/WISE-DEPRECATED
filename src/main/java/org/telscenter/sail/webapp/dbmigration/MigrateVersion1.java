package org.telscenter.sail.webapp.dbmigration;

import java.sql.Connection;
import java.sql.SQLException;

import net.sf.sail.webapp.dbmigration.AbstractMigrationClass;

/**
 * This migration is to add three new tables used for the PremadeComments functionality
 * 
 * @author Hiroki Terashima
 * @author Rokham Sadeghnezhadfard
 * @author David Leung
 * @author Geoffrey Kwan
 *
 * @version $Id:$
 */
public class MigrateVersion1 extends AbstractMigrationClass {
	public MigrateVersion1() {
		this.statements = new String[] {
			    "create table premadecommentlists (" +
			            "id bigint not null auto_increment," +
			            "label varchar(255) not null," +
			            "run bigint," +
			            "owner bigint," +
			            "primary key (id)" +
			        ") type=MyISAM;",

			        "create table premadecomments (" +
			            "id bigint not null auto_increment," +
			            "comment varchar(255) not null," +
			            "label varchar(255) not null," +
			            "run bigint," +
			            "owner bigint," +
			            "primary key (id)" +
			        ") type=MyISAM;",

			        "create table premadecomments_related_to_premadecommentlists (" +
			            "premadecommentslist_fk bigint not null," +
			            "premadecomments_fk bigint not null," +
			            "primary key (premadecommentslist_fk, premadecomments_fk)" +
			        ") type=MyISAM;",

			        "alter table premadecommentlists " +
			            "add index FKF237B2CEF4421937 (run), " +
			            "add constraint FKF237B2CEF4421937 " +
			            "foreign key (run) " +
			            "references runs (id);",

			        "alter table premadecommentlists " +
			            "add index FKF237B2CE65E358B0 (owner), " +
			            "add constraint FKF237B2CE65E358B0 " +
			            "foreign key (owner) " +
			            "references users (id);",

			        "alter table premadecomments " +
			            "add index FK7786D42CF4421937 (run), " +
			            "add constraint FK7786D42CF4421937 " +
			            "foreign key (run) " +
			            "references runs (id);",

			        "alter table premadecomments " +
			            "add index FK7786D42C65E358B0 (owner), " +
			            "add constraint FK7786D42C65E358B0 " +
			            "foreign key (owner) " +
			            "references users (id);",

			        "alter table premadecomments_related_to_premadecommentlists " +
			            "add index FK6958FC11C8153CF5 (premadecomments_fk), " +
			            "add constraint FK6958FC11C8153CF5 " +
			            "foreign key (premadecomments_fk) " +
			            "references premadecomments (id);",

			        "alter table premadecomments_related_to_premadecommentlists " +
			            "add index FK6958FC112FC6E4D5 (premadecommentslist_fk), " +
			            "add constraint FK6958FC112FC6E4D5 " +
			            "foreign key (premadecommentslist_fk) " +
			            "references premadecommentlists (id);"
			};
	}

    public int doMigration(Connection conn) throws SQLException {
    	super.doMigration(conn);
    	
    	// call the class that we are going to run
    	
    	return 0;
	}

}