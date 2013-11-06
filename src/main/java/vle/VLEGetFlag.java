package vle;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class VLEGetFlag extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static Connection conn = null;
    private static Statement stmt = null;
    
	/**
	 * Get is implemented for testing purposes so you can just enter
	 * arguments in the url to easily test.
	 */
	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
        createConnection();
        getData(request, response);
        shutdown();
	}
	
    private static void createConnection()
    {
        try
        {
        	//create a connection to the mysql db
        	Class.forName("com.mysql.jdbc.Driver").newInstance();
        	conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/vle_database", "sailuser", "sailpass");
        	//conn = DriverManager.getConnection("jdbc:mysql://uccpdev.berkeley.edu:10086/vle_database", "uccp", "uccp!!!");
        }
        catch (Exception except)
        {
            except.printStackTrace();
        }
    }
    
    private static void getData(HttpServletRequest request,
			HttpServletResponse response) {
    	try {
			stmt = conn.createStatement();
			ResultSet results = null;
			
			//obtain the parameters
	    	String runId = request.getParameter("runId");
	    	String nodeId = request.getParameter("nodeId");
	    	String toWorkgroup = request.getParameter("toWorkgroup");
	    	String fromWorkgroup = request.getParameter("fromWorkgroup");
	    	
	    	//compile the query depending on which parameters were provided
	    	StringBuffer selectStmt = new StringBuffer("select value from flags where");
	    	boolean needAnd = false;
	    	
	    	//check if we need to add runId to where clause
	    	if(runId != null && !runId.equals("")) {
	    		if(needAnd) {
	    			selectStmt.append(" and");
	    		}
	    		selectStmt.append(" runId='" + runId + "'");
	    		needAnd = true;
	    	}
	    	
	    	//check if we need to add nodeId to where clause
	    	if(nodeId != null && !nodeId.equals("")) {
	    		if(needAnd) {
	    			selectStmt.append(" and");
	    		}
	    		selectStmt.append(" nodeId='" + nodeId + "'");
	    		needAnd = true;
	    	}
	    	
	    	//check if we need to add toWorkgroup to where clause
	    	if(toWorkgroup != null && !toWorkgroup.equals("")) {
	    		if(needAnd) {
	    			selectStmt.append(" and");
	    		}
	    		selectStmt.append(" toWorkgroup=" + toWorkgroup);
	    		needAnd = true;
	    	}
	    	
	    	//check if we need to add fromWorkgroup to where clause
	    	if(fromWorkgroup != null && !fromWorkgroup.equals("")) {
	    		if(needAnd) {
	    			selectStmt.append(" and");
	    		}
	    		selectStmt.append(" fromWorkgroup=" + fromWorkgroup);
	    		needAnd = true;
	    	}
	    	
	    	System.out.println(selectStmt);
	    	results = stmt.executeQuery(selectStmt.toString());
	    	
	    	//wrap all the individual annotation tags in a parent annotations tag
	    	response.getWriter().write("<flags>");
	    			
	    	while(results.next()) {
	    		//output all the rows that were returned
	    		response.getWriter().write(results.getString(1));
	    	}
	    	
	    	response.getWriter().write("</flags>");
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

    }
    
	private static void shutdown() {
		try {
			conn.close();
		} catch(SQLException sqlExcept) {
			sqlExcept.printStackTrace();
		}
	}
}
