package vle;

import java.sql.ResultSet;
import java.sql.SQLException;

public class VLEJournalServlet extends VLEServlet {
	
	private static final long serialVersionUID = 1L;
	protected static boolean debug = false; 
	
	/**
	 * Creates the journal xml from a ResultSet
	 * @param resultSet a ResultSet which contains rows of the journal data table
	 * @return an xml string representing the rows fromt the resultSet
	 */
	protected static String createJournalXML(ResultSet resultSet) {
		StringBuffer journalXML = new StringBuffer();
		
		//boolean value used to denote whether there were any rows in the resultset
		boolean hasRows = false;
		
		try {
			//check if there were any rows
			if(resultSet.first()) {
				//start the journal xml
				journalXML.append("<journal workgroupId='" + resultSet.getString("workgroupId") + "'>");
				journalXML.append("<journalPages>");
				
				/*
				 * move the cursor back to before the first row so that we can
				 * call resultSet.next() later
				 */
				resultSet.beforeFirst();
				hasRows = true;
			}
			
			//loop through all the rows in the resultSet
			while(resultSet.next()) {
				//create the xml for the row
				journalXML.append("<journalPage journalPageId='" + resultSet.getString("journalPageId") + "' pageCreatedTime='" + resultSet.getString(5) + "' pageLastEditedTime='" + resultSet.getString(6) + "' location='" + resultSet.getString("location") + "' nodeId='" + resultSet.getString("nodeId") + "'>");
				journalXML.append("<![CDATA[" + resultSet.getString("data") + "]]>");
				journalXML.append("</journalPage>");
			}
			
			//close the journal xml if there were any rows
			if(hasRows) {
				journalXML.append("</journalPages>");
				journalXML.append("</journal>");
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		debugPrint(journalXML.toString());
		
		//return the journal xml
		return journalXML.toString();
	}
	
	/**
	 * Gets the next id to use when creating a new journal page
	 * @param workgroupId the id of the workgroup
	 * @return the next available id to use
	 */
    protected static String getNextJournalPageId(String workgroupId) {
    	try {
    		//select the highest journal page id used by this workgroupId
    		String selectStmt = "select max(journalpageid) from journaldata where workgroupId=" + workgroupId;
    		debugPrint(selectStmt);

    		//run the select query
    		ResultSet results = stmt.executeQuery(selectStmt);
    		
    		/*
    		 * see if there were any results. there will always be a result
    		 * because max() is in the select of the query. if there are no
    		 * matching rows found, the column of max() will still return NULL
    		 */
    		if(results.first()) {
    			//obtain the value of the max()
    			String result = results.getString(1);
    			
    			/*
    			 * if there were no rows found and NULL was returned, we will
    			 * return the id of 1
    			 */
    			if(result == null) {
    				return "<journalId>1</journalId>";
    			} else if(result != null && result.equals("NULL")) {
    				return "<journalId>1</journalId>";
    			} else if(result != null && !result.equals("NULL")){
    				/*
    				 * we have found a value so we will add 1 to it and then
    				 * return the incremented value
    				 */
    				int maxJournalPageId = Integer.parseInt(result);
    				return "<journalId>" + (maxJournalPageId + 1) + "</journalId>";
    			}
    		}
    		
    		results.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
    	return "";
    }
    
    /**
     * Used for testing output. Change the boolean value of debug to
     * true if you want the output printed to the console.
     * @param output
     */
    protected static void debugPrint(String output) {
    	if(debug) {
    		System.out.println(output);
    	}
    }
}
