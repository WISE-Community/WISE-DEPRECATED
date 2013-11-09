package vle;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for handling POSTed journal data
 * @author geoffreykwan
 */
public class VLEPostJournalData extends VLEJournalServlet {

	private static final long serialVersionUID = 1L;
	
	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
        createConnection();
        postData(request, response);
        shutdown();
	}
	
	public void doGet(HttpServletRequest request,
			HttpServletResponse response) {
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
            stmt.execute("create table journaldata (id bigint(11) not null auto_increment, workgroupId bigint(11) default '0', journalPageId bigint(11) default '0', deleted boolean default false, pageCreatedTime datetime default null, pageLastEditedTime datetime default null, location int, nodeId varchar(20), data longtext not null, primary key(id));");
            stmt.close();
        }
        catch (SQLException sqlExcept)
        {
            sqlExcept.printStackTrace();
        }
    }
    
    /**
     * Takes in data for a journal page and inserts it into the db
     * @param request
     * @param response
     */
    private static void postData(HttpServletRequest request,
			HttpServletResponse response) {
    	//get the journal page data
    	String workgroupId = request.getParameter("workgroupId");
    	String journalPageId = request.getParameter("journalPageId");
    	String data = request.getParameter("data");
    	String deletePage = request.getParameter("deletePage");
    	String nodeId = request.getParameter("nodeId");
    	String pageLastEditedTime = request.getParameter("pageLastEditedTime");
    	
    	try {
			stmt = conn.createStatement();
		} catch (SQLException e) {
			e.printStackTrace();
		}
    	
		if(workgroupId != null && journalPageId != null && deletePage != null) {
			//delete was passed as an argument so we will set the delete flag to true for this journal page
			String updateStmt = "update journaldata set deleted=true where workgroupid=" + workgroupId + " and journalpageid=" + journalPageId;
			debugPrint(updateStmt);
			try {
				stmt.execute(updateStmt);
				return;
			} catch (SQLException e) {
				e.printStackTrace();
			}
		} else if(workgroupId == null || data == null) {
			//insufficient arguments
    		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    		return;
    	} else {
    		//we will create a new row in the db and then return that new journal page
    		debugPrint(data);
    		
    		//need to check if journalPageId was passed
    		if(journalPageId == null) {
    			//if no id was given, we will just use the next available id
    			journalPageId = getNextJournalPageId(workgroupId);
    		}
    		
    		if(nodeId == null) {
    			nodeId = "";
    		}

    		Double pageLastEditedTimeEpoch = Double.parseDouble(pageLastEditedTime);
    		
    		//check if the last edited time was in milliseconds
    		if(pageLastEditedTimeEpoch / 1000000000000d > 1) {
    			/*
    			 * the last edited time was in milliseconds so we will convert it
    			 * to seconds by dividing the value by 1000
    			 */
    			pageLastEditedTime = "" + (pageLastEditedTimeEpoch / 1000);
    		}
    		
    		/*
    		 * get the time the first revision was created, all revisions of a
    		 * journal page will have the same creation time. the time returned
    		 * is in epoch seconds value.
    		 */
    		String pageCreatedTime = getPageCreatedTime(workgroupId, journalPageId);
    		
    		//set the creation time
    		if(pageCreatedTime == null) {
    			/*
    			 * there were no previous page revisions so this is a new page 
    			 * and will get a new datetime of now()
    			 */
    			pageCreatedTime = pageLastEditedTime;
    		}
    		
    		//the insert statement to put the revision into the db
    		String insertStmt = "insert into journaldata(workgroupId, journalPageId, data, nodeId, pageCreatedTime, pageLastEditedTime) values(" + workgroupId + ", " + journalPageId + ", '" + data + "', '" + nodeId + "', FROM_UNIXTIME(" + pageCreatedTime + "), FROM_UNIXTIME(" + pageLastEditedTime + "))";
    		debugPrint(insertStmt);
    		
    		try {
    			//run the insert statement
				stmt.execute(insertStmt);
				
				//retrieve the row that we just inserted
				@SuppressWarnings("unused")
				String dateFormat = "%a, %b %e, %Y %r";
				String selectQuery = "select id, workgroupId, journalPageId, deleted, UNIX_TIMESTAMP(pageCreatedTime), UNIX_TIMESTAMP(pageLastEditedTime), location, nodeId, data from journaldata where workgroupid=" + workgroupId + " and journalpageid=" + journalPageId + " and deleted=false order by id desc limit 1";
				debugPrint(selectQuery);
				
				//run the select query
				ResultSet results = stmt.executeQuery(selectQuery);
				
				//create the journal xml for the row
				String journalXML = createJournalXML(results);
				
				//write the journal xml to the response
				response.getWriter().write(journalXML);
				
				results.close();
			} catch (SQLException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
    	}
		
		try {
			stmt.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
    }
    
    /**
     * Get the datetime for the first revision of the page
     * @param workgroupId the id of the workgroup
     * @param journalPageId the id of the journal page
     * @return the datetime epoch value in seconds of the first revision 
     * 		of the page or empty string if there are no previous revisions
     */
    private static String getPageCreatedTime(String workgroupId, String journalPageId) {
    	String createdTime = "";
    	
    	//select the earliest datetime of all the revisions of this page in epoch value
    	String selectStmt = "select UNIX_TIMESTAMP(min(pageCreatedTime)) from journaldata where workgroupId=" + workgroupId + " and journalPageId=" + journalPageId;
    	debugPrint(selectStmt);
		
		try {
			//run the select query
			ResultSet results = stmt.executeQuery(selectStmt);
			if(results.first()) {
				//get the datetime value
				createdTime = results.getString(1);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

		//return the datetime value
		return createdTime;
    }
    
}
