package net.sf.sail.webapp.dbmigration;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * @author daleung
 *
 */
public abstract class AbstractMigrationClass {
	protected String[] statements;
	
    public int doMigration(Connection conn) throws SQLException {
        PreparedStatement ps = null;

        conn.setAutoCommit(false);
        if (statements != null) {
        	for (int i = 0; i < statements.length; i++) {
        		try {
        			ps = conn.prepareStatement(statements[i]);

        			System.out.println("Executing " + statements[i]);

        			ps.execute();

        			ps.close();
        		}
        		catch (SQLException sqlEx) {
        			System.err.println("SQLException on " + statements[i]);

        			sqlEx.printStackTrace(System.err);

        			conn.rollback();

        			throw sqlEx;
        		}
        		finally {
        			if (ps != null) {
        				ps.close();
        			}
        		}
        	}
        	conn.commit();
        }
        
        return 0;
    }	
}
