package net.sf.sail.webapp.dbmigration;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class MigrateVersion1 extends AbstractMigrationClass {
	public MigrateVersion1() {
		this.statements = new String[] {
			"CREATE TABLE pas_t1 (f1 varchar(255), f2 varchar(255));",
			"CREATE TABLE pas_t2 (f1 varchar(255), f2 varchar(255), f3 varchar(255));"		
		};
	}

    public int doMigration(Connection conn) throws SQLException {
    	super.doMigration(conn);

        doCodeTables(conn);

    	return 0;
	}

	private static void doCodeTables(Connection conn) throws SQLException {
		Statement stmt;
		conn.setAutoCommit(false);

		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t1 (f1, f2)" + "VALUES(1, 1)");
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t1 (f1, f2)" + "VALUES(2, 2)");
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t1 (f1, f2)" + "VALUES(3, 3)");
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t1 (f1, f2)" + "VALUES(4, 4)");		
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t1 (f1, f2)" + "VALUES(5, 5)");		
		
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t2 (f1, f2, f3)" + "VALUES(1, 1, 1)");
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t2 (f1, f2, f3)" + "VALUES(2, 2, 2)");
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t2 (f1, f2, f3)" + "VALUES(3, 3, 3)");
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t2 (f1, f2, f3)" + "VALUES(4, 4, 4)");		
		stmt = conn.createStatement();
		stmt.executeUpdate("INSERT INTO pas_t2 (f1, f2, f3)" + "VALUES(5, 5, 5)");		

		conn.commit();
	}
}