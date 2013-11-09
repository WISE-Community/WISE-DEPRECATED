 package vle;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for handling GETting of vle data
 * @author hirokiterashima
 * @author geoffreykwan
 * @author patricklawler
 */
public class VLEGetJournalData extends VLEJournalServlet {

	private static final long serialVersionUID = 1L;

	
	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		createConnection();
		getData(request, response);
		shutdown();
	}
	
	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		createConnection();
		getData(request, response);
		shutdown();
	}


	/**
	 * Takes in a workgroupId and returns the requested xml data
	 * @param request 
	 * @param response
	 */
	private static void getData(HttpServletRequest request,
			HttpServletResponse response) {
		
		//get the workgroupId of the student
		String workgroupId = request.getParameter("workgroupId");
		debugPrint("workgroupId: " + workgroupId);
		
		/*
		 * get the boolean string to see if the next journal page id is
		 * being requested
		 */
		String getNextJournalPageId = request.getParameter("getNextJournalPageId");

		
		try {
			stmt = conn.createStatement();
		} catch (SQLException e1) {
			e1.printStackTrace();
		}
		
		if(workgroupId == null) {
			debugPrint("ERROR: no workgroupId");
		} else if(getNextJournalPageId != null && getNextJournalPageId.equals("true") && workgroupId != null) {
			//the next journal page id is being requested
			try {
				//get the next journal page id and return it in the response
				response.getWriter().write(getNextJournalPageId(workgroupId));
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			/*
			 * we will select all the journal pages/revisions for the 
			 * workgroupId that haven't been deleted
			 */
			try {
				//timestamp format like Thu, Jul 16, 2009 02:36:17 PM
				@SuppressWarnings("unused")
				String dateFormat = "%a, %b %e, %Y %r";
				
				//the select query
				//String selectQuery = "select id, workgroupId, journalPageId, deleted, date_format(pageCreatedTime, '" + dateFormat + "'), date_format(pageLastEditedTime, '" + dateFormat + "'), location, nodeId, data from journaldata where workgroupid=" + workgroupId + " and deleted=false";
				String selectQuery = "select id, workgroupId, journalPageId, deleted, UNIX_TIMESTAMP(pageCreatedTime), UNIX_TIMESTAMP(pageLastEditedTime), location, nodeId, data from journaldata where workgroupid=" + workgroupId + " and deleted=false";
				debugPrint(selectQuery);
				
				//run the query
				ResultSet results = stmt.executeQuery(selectQuery);
				
				//create the journal xml from the results
				String journalXML = createJournalXML(results);
				
				//write the journal xml into the response
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
	

}
