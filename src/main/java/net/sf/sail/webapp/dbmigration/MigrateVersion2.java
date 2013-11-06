package net.sf.sail.webapp.dbmigration;

import java.sql.Connection;
import java.sql.SQLException;


public class MigrateVersion2 extends AbstractMigrationClass {
	public MigrateVersion2() {
		this.statements = new String[] {
	        "ALTER TABLE pas_t1 ADD COLUMN f3 varchar(255);",
	        "ALTER TABLE pas_t2 DROP COLUMN f3;"
		};
	}
	
    public int doMigration(Connection conn) throws SQLException {
    	super.doMigration(conn);

    	return 0;
	}	
}