package org.telscenter.sail.webapp.dbmigration;

import java.sql.Connection;
import java.sql.SQLException;

import net.sf.sail.webapp.dbmigration.AbstractMigrationClass;


public class MigrateVersion3 extends AbstractMigrationClass {
	public MigrateVersion3() {
		this.statements = new String[] {
	        "ALTER TABLE tels_t2 ADD COLUMN f3 varchar(255);",
	        "ALTER TABLE tels_t1 DROP COLUMN f3;"
		};
	}
	
    public int doMigration(Connection conn) throws SQLException {
    	super.doMigration(conn);

    	return 0;
	}	
}