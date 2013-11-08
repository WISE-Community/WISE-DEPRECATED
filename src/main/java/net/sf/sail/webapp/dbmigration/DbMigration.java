package net.sf.sail.webapp.dbmigration;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.SortedSet;
import java.util.TreeSet;

public class DbMigration {
	private String built = "";
    private String username = "";
    private String password = "";
    private String jdbcDriver = "";
    private String connectionString = "";
    
    private static final String VERSION_DATE_INSERT_SQL = "INSERT INTO codebase_version (version_pk, update_date, built) VALUES(?, ?, ?);";
    private static final String VERSION_QUERY_SQL = "SELECT max(version_pk) FROM codebase_version WHERE built=?;";
    private static final String CREATE_VERSION_TABLE_SQL = "CREATE TABLE codebase_version ( version_pk integer NOT NULL, update_date date NOT NULL, built varchar(20) NOT NULL);";
    
    public void performMigration() {
        Connection connection = null;
        
        try {
            Properties properties = readProperties();
            
            if ((connection = getConnection()) == null) {
                throw new Exception("Unable to get a database connection.");
            }
            
            int dbVersion = getDbVersion(connection);
            
            System.out.println("Current database version: <" + dbVersion + ">");
            if (applyMigration(properties, getSortedKeySet(properties), connection, dbVersion)) {
                System.out.println("Done.");
            } 
            else {
                throw new Exception("Database migration process failed.");
            }
        } 
        catch (Exception e) {
            System.err.println("Error in " + DbMigration.class.getName() + " performMigration(): ");
            
            e.printStackTrace();
            
            System.exit(-1);
        } 
        finally {
            if (connection != null) {
                try {
                    connection.close();
                } 
                catch (SQLException sqlEx) {
                	System.err.println("Failed to close connection.");
                }
            }
        }
    }
    
    public static void main(String args[]) {
    	if (args.length < 4) {
            System.err.println("Usage: DbMigration <built> <jdbcDriver> <connectionString> <username> [password]");
            System.err.println("Only has "+args.length+" arguments.");
            for(int i=0; i<args.length; i++) {
            	System.err.println("args["+i+"]: "+args[i]);
            }
            
            System.exit(-1);
        }
    	else {
	    	DbMigration me = new DbMigration();

	    	me.setBuilt(args[0]);
	    	me.setJdbcDriver(args[1]);
	    	me.setConnectionString(args[2]);
	    	me.setUsername(args[3]);
	    	if (args.length > 4)
	    		me.setPassword(args[4]);
	    
	    	me.performMigration();
    	}
    }

    public final boolean hasTable(Connection con, String tableName) throws SQLException {
        String[] names = {"TABLE"};
        
        DatabaseMetaData md = con.getMetaData();
        ResultSet rs = md.getTables(null, null, tableName, names);
        
        return rs.next();
    }

    public final boolean tableHasColumn(Connection con, String tableName, String columnName) throws SQLException {
        DatabaseMetaData md = con.getMetaData();
        
        ResultSet rs = md.getColumns(null, null, tableName, columnName);
        
        return rs.next();
    }

    public int getDbVersion(Connection connection) throws SQLException {
    	int version = 0;

    	ResultSet tablesResultSet = connection.getMetaData().getTables(null, null, null, new String[] {"TABLE"});
    	boolean found = false;
    	while(tablesResultSet.next()) {
    		String tname = tablesResultSet.getString("TABLE_NAME");
    		
    		if (tname.equalsIgnoreCase("CODEBASE_VERSION")) {
    			found = true;
    			break;
    		}
    	}
    	
        if (found) {
            PreparedStatement preparedStatement = connection.prepareStatement(VERSION_QUERY_SQL);
            
            preparedStatement.setString(1, built);
            
            ResultSet versionResultSet = preparedStatement.executeQuery();
            
            if (!versionResultSet.next()) { 
            	System.out.println("No codebase version number found for the database even though the table exists.");
            }
            else {
            	if (versionResultSet.getString(1) != null)
            		version = Integer.parseInt(versionResultSet.getString(1));            	
            }
            
            connection.commit();
        }
        else {
        	PreparedStatement preparedStatement = connection.prepareStatement(CREATE_VERSION_TABLE_SQL);
        	
        	preparedStatement.execute();
        	
        	connection.commit();
        }
        
        return version;
    }

    private Connection getConnection() throws SQLException {
        Connection connection = null;
        
        try {
	    	Class.forName(getJdbcDriver()).newInstance();
	
	        connection = DriverManager.getConnection(getConnectionString(), getUsername(), getPassword());
	        
	        connection.setAutoCommit(false);
        }
        catch (IllegalAccessException iaEx) {
        	System.err.println("Cannot access JDBC driver: "+getJdbcDriver());
        	iaEx.printStackTrace(System.err);
        }
        catch (InstantiationException iEx) {
        	System.err.println("Cannot instantiate JDBC driver: "+getJdbcDriver());
        	iEx.printStackTrace(System.err);
        }
        catch (ClassNotFoundException cnfEx) {
        	System.err.println("Cannot find JDBC driver: "+getJdbcDriver());
        	cnfEx.printStackTrace(System.err);
        }

        return connection;
    }

    private boolean applyMigration(Properties properties, SortedSet<Integer> keySet, Connection connection, int dbVersion) {
    	boolean success = false;
    	
        Integer nextVersion = new Integer(++dbVersion);
        
        if (!keySet.contains(nextVersion)) {
        	System.out.println("Nothing to update.");
            success = true;
        }
        else {
            Integer upgradeVersion = null;
            String upgradeProgram = "";
            
        	try {
        		for (Iterator i = keySet.tailSet(nextVersion).iterator(); i.hasNext();) {
        			success = false;
    	            upgradeVersion = (Integer) i.next();
    	            upgradeProgram = properties.getProperty(upgradeVersion.toString());

		            Class migrateClass = Class.forName(upgradeProgram);
		            
		            String[] emptyStringArray = new String[0];
		            try {
		                Method method = migrateClass.getDeclaredMethod("doMigration", new Class[] { Connection.class });
		                method.invoke(migrateClass.newInstance(), new Object[] { connection });
		            }
		            catch (NoSuchMethodException tryMainMethod) {
		            	try {
			                Method method = migrateClass.getDeclaredMethod("main", new Class[] { emptyStringArray.getClass() });
			                method.invoke(null, new Object[] { emptyStringArray });
			                method.invoke(migrateClass.newInstance(), new Object[] { emptyStringArray });
		            	}
		            	catch (NoSuchMethodException nsmEx) {
		            		System.err.println("Cannot find main method for migration class " + upgradeProgram);
		            		nsmEx.printStackTrace(System.err);	
		            		break;
		            	}
		            }
		            logDbUpgrade(connection, upgradeVersion);
		            
		            System.out.println("Migration to version <" + upgradeVersion.toString() + "> using <" + upgradeProgram + "> completed.");
	    	        
		            success = true;
        		}
            }
        	catch (InstantiationException iEx) {
            	System.err.println("Cannot execute doMigration or main method.");
            	iEx.printStackTrace(System.err);
            }       	
            catch (ClassNotFoundException cnfEx) {
            	System.err.println("Cannot find migration program: "+upgradeProgram);
            	cnfEx.printStackTrace(System.err);
            }
            catch (IllegalAccessException iaEx) {
            	System.err.println("Cannot execute doMigration or main method.");
            	iaEx.printStackTrace(System.err);
            }
            catch (InvocationTargetException itEx) {
            	System.err.println("Cannot execute doMigration or main method.");
            	itEx.printStackTrace(System.err);
            }
            catch (SQLException sqlEx) {
            	System.err.println("Cannot update the codebase_version table.");
            	sqlEx.printStackTrace(System.err);
            }
        }
        
        return success;
    }

    private void logDbUpgrade(Connection connection, Integer upgradeVersion) throws SQLException {
        PreparedStatement preparedStatement = connection.prepareStatement(VERSION_DATE_INSERT_SQL);
        
        preparedStatement.setInt(1, upgradeVersion.intValue());
        preparedStatement.setDate(2, new java.sql.Date(new java.util.Date().getTime()));
        preparedStatement.setString(3, built);
        
        preparedStatement.executeUpdate();
        
        preparedStatement.close();
        
        connection.commit();
    }

    private Properties readProperties() throws IOException {
        Properties properties = new Properties();
        InputStream is = getClass().getResourceAsStream("/"+built+"/dbmigration.properties");
        
        if (is != null) {
        	properties.load(is);
        }
        else {
        	System.err.println("Cannot find dbmigration.properties file!");
        	throw new IOException("Cannot find dbmigration.properties file!");
        }
        
        return properties;
    }

    private SortedSet<Integer> getSortedKeySet(Properties properties) {
        List<Integer> list = new ArrayList<Integer>();
        
        for (Iterator i = properties.keySet().iterator(); i.hasNext();) {
            String key = (String) i.next();
        
            try {
                list.add(new Integer(key));
            }
            catch (NumberFormatException nfe) {
                System.err.println("Invalid key: \"" + key + "\".  Check your dbmigration.properties file for the proper format.");
                throw nfe;
            }
        }
        
        return new TreeSet<Integer>(list);
    }

	/**
	 * @return the username
	 */
	public String getUsername() {
		return username;
	}

	/**
	 * @param username the username to set
	 */
	public void setUsername(String username) {
		this.username = username;
	}

	/**
	 * @return the password
	 */
	public String getPassword() {
		return password;
	}

	/**
	 * @param password the password to set
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * @return the jdbcDriver
	 */
	public String getJdbcDriver() {
		return jdbcDriver;
	}

	/**
	 * @param jdbcDriver the jdbcDriver to set
	 */
	public void setJdbcDriver(String jdbcDriver) {
		this.jdbcDriver = jdbcDriver;
	}

	/**
	 * @return the connectionString
	 */
	public String getConnectionString() {
		return connectionString;
	}

	/**
	 * @param connectionString the connectionString to set
	 */
	public void setConnectionString(String connectionString) {
		this.connectionString = connectionString;
	}

	public String getBuilt() {
		return built;
	}

	public void setBuilt(String built) {
		this.built = built;
	}
}
