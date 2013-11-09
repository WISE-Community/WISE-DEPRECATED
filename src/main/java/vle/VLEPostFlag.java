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

public class VLEPostFlag extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static Connection conn = null;
    private static Statement stmt = null;
	
	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
        createConnection();
        postData(request, response);
        shutdown();
	}
	
	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
        createConnection();
        postData(request, response);
        shutdown();
	}
	
    @SuppressWarnings("unused")
	private static void createTable()
    {
        try
        {
            stmt = conn.createStatement();
            stmt.execute("create table flags(id bigint auto_increment, runId bigint default null, nodeId varchar(20) default null, toWorkgroup bigint default null, fromWorkgroup bigint default null, value longtext, postTime timestamp not null default current_timestamp on update current_timestamp, primary key(id));");
            stmt.close();
        }
        catch (SQLException sqlExcept)
        {
            sqlExcept.printStackTrace();
        }
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
    
    private static void postData(HttpServletRequest request,
			HttpServletResponse response) {
    	try {
    		//obtain the parameters
        	String runId = request.getParameter("runId");
        	String nodeId = request.getParameter("nodeId");
        	String toWorkgroup = request.getParameter("toWorkgroup");
        	String fromWorkgroup = request.getParameter("fromWorkgroup");
        	String studentWork = request.getParameter("studentWork");
        	String action = request.getParameter("action");
        	
        	StringBuffer flagEntry = new StringBuffer();
			flagEntry.append("<flagEntry>");
    		flagEntry.append("<runId>" + runId + "</runId>");
    		flagEntry.append("<nodeId>" + nodeId + "</nodeId>");
    		flagEntry.append("<toWorkgroup>" + toWorkgroup + "</toWorkgroup>");
    		flagEntry.append("<fromWorkgroup>" + fromWorkgroup + "</fromWorkgroup>");
    		flagEntry.append("<studentWork>" + studentWork + "</studentWork>");
        	flagEntry.append("</flagEntry>");
        	
        	stmt = conn.createStatement();
        	@SuppressWarnings("unused")
			ResultSet results = null;
        	
        	if(action != null && action.equals("unflag")) {
        		String deleteStmt = "delete from flags where runId=" + runId + " and nodeId='" + nodeId + "' and toWorkgroup=" + toWorkgroup + " and fromWorkgroup=" + fromWorkgroup + " and value='" + flagEntry + "'";
    			System.out.println(deleteStmt);
    			stmt.execute(deleteStmt);
        	} else {
            	
            	

            	
            	String insertStmt = "insert into flags(runId, nodeId, toWorkgroup, fromWorkgroup, value) values(" + runId + ", '" + nodeId + "', " + toWorkgroup + ", " + fromWorkgroup + ", '" + flagEntry + "')";
    			System.out.println(insertStmt);
    			stmt.execute(insertStmt);
    			response.getWriter().write(flagEntry.toString());
        	}
        	

        	
        	
//        	if(value == null || value.equals("")) {
//        		//if no annotation was provided, do nothing and return
//        		return;
//        	} else {
//        		StringBuffer annotationEntry = new StringBuffer();
//        		annotationEntry.append("<annotationEntry>");
//        		annotationEntry.append("<runId>" + runId + "</runId>");
//        		annotationEntry.append("<nodeId>" + nodeId + "</nodeId>");
//        		annotationEntry.append("<toWorkgroup>" + toWorkgroup + "</toWorkgroup>");
//        		annotationEntry.append("<fromWorkgroup>" + fromWorkgroup + "</fromWorkgroup>");
//        		//annotationBundle.append("<postTime>" +  + "</postTime>");
//        		annotationEntry.append("</annotationEntry>");
//        		
//        		
//        		//the query to see if the row already exists in the table
//        		//String selectStmt = "select * from annotations where runId=" + runId + " and nodeId='" + nodeId + "' and toWorkgroup='" + toWorkgroup + "' and fromWorkgroup='" + fromWorkgroup + "' and type='" + type + "' and value='" + annotationEntry + "'";
//        		String selectStmt = "select * from annotations where runId=" + runId + " and nodeId='" + nodeId + "' and toWorkgroup='" + toWorkgroup + "' and fromWorkgroup='" + fromWorkgroup + "' and type='" + type + "'";
//        		System.out.println(selectStmt);
//        		results = stmt.executeQuery(selectStmt);
//        		
//        		
//        		//check if the row already exists
//        		if(results.last() == false) {
//        			//the row does not exist so we will insert it
//        			String insertStmt = "insert into annotations(runId, nodeId, toWorkgroup, fromWorkgroup, type, value) values(" + runId + ", '" + nodeId + "', " + toWorkgroup + ", " + fromWorkgroup + ", '" + type + "', '" + annotationEntry + "')";
//        			System.out.println(insertStmt);
//        			stmt.execute(insertStmt);
//        		} else {
//        			/*
//        			 * the row does exist so we must check whether the
//        			 * annotation value is the same as the latest value
//        			 */
//        			if(!results.getString("value").equals(annotationEntry.toString())) {
//        				/*
//        				 * the last value was not the same as the current one
//        				 * so we will add the current one into the table. if
//        				 * the last value was the same as the current one, we
//        				 * will just ignore the current one.
//        				 */
//        				String insertStmt = "insert into annotations(runId, nodeId, toWorkgroup, fromWorkgroup, type, value) values(" + runId + ", '" + nodeId + "', " + toWorkgroup + ", " + fromWorkgroup + ", '" + type + "', '" + annotationEntry + "')";
//            			System.out.println(insertStmt);
//            			stmt.execute(insertStmt);
//        			}
//        		}
        		
        		//send the annotationEntry xml to the response so the user can get the xml
        		//response.getWriter().write(annotationEntry.toString());
//        	}
    	} catch (SQLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
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
