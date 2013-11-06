/**
 * 
 */
package vle.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import utils.SecurityUtils;
import vle.VLEServlet;
import vle.domain.journal.Journal;
import vle.domain.user.UserInfo;

/**
 * @author hirokiterashima
 *
 */
public class VLEJournalController extends VLEServlet {

	private static final long serialVersionUID = 1L;
	
	private boolean standAlone = true;
	
	private boolean modeRetrieved = false;

	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		/* check to see if we are in portal mode */
		if(!this.modeRetrieved){
			this.standAlone = !SecurityUtils.isPortalMode(request);
			this.modeRetrieved = true;
		}
		
		/* make sure that this request is authenticated through the portal before proceeding */
		if(this.standAlone || SecurityUtils.isAuthenticated(request)){
			getData(request, response);
		} else {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}

	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		/* check to see if we are in portal mode */
		if(!this.modeRetrieved){
			this.standAlone = !SecurityUtils.isPortalMode(request);
			this.modeRetrieved = true;
		}
		
		/* make sure that this request is authenticated through the portal before proceeding */
		if(this.standAlone || SecurityUtils.isAuthenticated(request)){
			postData(request, response);
		} else {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}

	private static void getData(HttpServletRequest request,
			HttpServletResponse response) {

		//get the workgroupId of the student
		String workgroupId = request.getParameter("workgroupId");

		if(workgroupId == null) {
			//insufficient arguments
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			System.err.println("ERROR: no workgroupId");
		} else {
			/*
			 * we will select all the journal pages/revisions for the 
			 * workgroupId that haven't been deleted
			 */
			try {
				UserInfo userInfo = UserInfo.getByWorkgroupId(new Long(workgroupId));
				Journal journal = userInfo.getJournal();

				//write the journal xml into the response
				if (journal == null) {
					response.getWriter().write("{}");
				} else {
					response.getWriter().write(journal.getData());
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	private static void postData(HttpServletRequest request,
			HttpServletResponse response) throws IOException {

		//get the journal page data
		String workgroupId = request.getParameter("workgroupId");
		
		//a JSON string containing an array of new revisions to merge into the journal
		String revisionsToSaveJSONString = request.getParameter("revisionsToSave");
		
		//the JSON string and object for the student's journal
		String journalJSONString = "";
		JSONObject journalJSONObj = null;

		if(workgroupId == null || revisionsToSaveJSONString == null) {
			//insufficient arguments
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		} else if (request.getContentLength() > (1024*75)) {  // posted journal data must not exceed 75K
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: too large");
			return;
		} else {
			//get the student info
			UserInfo userInfo = UserInfo.getByWorkgroupId(new Long(workgroupId));
			
			//get the student's journal
			Journal journal = userInfo.getJournal();

			try {
				//check if the student has ever used the journal
				if (journal == null || journal.getData().equals("")) {
					//the student has never used the journal so we will need to make one for them
					if(journal == null) {
						//create a journal row in the db for the student
						journal = new Journal();
						journal.setUserInfo(userInfo);					 
					}

					//create a JSON obj that represents the journal
					journalJSONObj = new JSONObject();
					journalJSONObj.put("workgroupId", userInfo.getWorkgroupId());
					
					//this will be populated later
					journalJSONObj.put("journalPages", new JSONArray());
				} else {
					//the student has used the journal before so we will just retrieve it
					journalJSONString = journal.getData();

					//create a journal JSON object from the JSON string
					journalJSONObj = new JSONObject(journalJSONString);
				}
				
				//create a JSON array of revisions from the string that was passed into the servlet
				JSONArray revisionsToSaveJSONObj = new JSONArray(revisionsToSaveJSONString);
				
				//add the revisions to the journal
				addRevisionsToJournal(journalJSONObj, revisionsToSaveJSONObj);
			} catch (JSONException e) {
				e.printStackTrace();
			}

			if(journalJSONObj != null) {
				//set the data field in the database to the JSON string of the updated journal
				journal.setData(journalJSONObj.toString());

				//save the changes to the db
				journal.saveOrUpdate();				
			}
		}
	}

	/**
	 * Adds the revisions to the journal
	 * @param journalJSONObj a JSONObject representing a journal
	 * @param revisionsToSaveJSONObj an array of journal revisions that we will merge into
	 * the journalJSONObj
	 */
	private static void addRevisionsToJournal(JSONObject journalJSONObj, JSONArray revisionsToSaveJSONObj) {
		try {
			//loop through all the revisions
			for(int x=0; x<revisionsToSaveJSONObj.length(); x++) {
				//get a revision
				JSONObject revisionToSave = (JSONObject) revisionsToSaveJSONObj.get(x);

				//get the journalPageId for the revision
				int revisionToSaveJournalPageId = revisionToSave.getInt("journalPageId");
				
				//check if this revision is for deleting the page
				boolean journalPageDeleted = revisionToSave.has("deleted");

				if(journalPageDeleted) {
					//we need to delete the page with the revisionToSaveJournalPageId
					removeJournalPageFromJournal(journalJSONObj, revisionToSaveJournalPageId);
				} else {
					//we need to update the journal page with the revisionToSaveJournalPageId
					
					/*
					 * get the journal page with the revisionToSaveJournalPageId, if the page
					 * does not exist the function will create one and return it
					 */
					JSONObject journalPageJSONObj = getJournalPageById(journalJSONObj, revisionToSaveJournalPageId);

					//obtain the array of revisions for the journal page
					JSONArray journalPageRevisionJSONArray = journalPageJSONObj.getJSONArray("journalPageRevisionArray");

					if(journalPageRevisionJSONArray.length() == 0) {
						/*
						 * if this is the first revision for the journal page we will set the
						 * pageCreatedTime
						 */
						journalPageJSONObj.put("pageCreatedTime", revisionToSave.get("revisionLastEditedTime"));
					}

					//add the revision to the array of revisions for the journal page
					journalPageRevisionJSONArray.put(revisionToSave);
				}
			}

		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Removes the journal page with the given journalPageId from the journal
	 * @param journal the journal JSONObject
	 * @param journalPageId the journal page id we want to remove 
	 */
	private static void removeJournalPageFromJournal(JSONObject journal, int journalPageId) {
		try {
			//get the journal pages from the journal
			JSONArray journalPages = (JSONArray) journal.get("journalPages");

			//loop thorugh all the journal pages
			for(int x=0; x<journalPages.length(); x++) {
				//get a journal page
				JSONObject tempJournalPage = (JSONObject) journalPages.get(x);

				if(tempJournalPage != null) {
					//get the id of the current journal page
					int tempJournalPageId = tempJournalPage.getInt("id");

					//check if the journal page id is the one we want to remove
					if(journalPageId == tempJournalPageId) {
						//remove the journal page and break because we are done
						journalPages.remove(x);
						break;
					}
				}
			} 
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Get the journal page with the given journalPageId, if it does not exist
	 * we will create a new page and put it into the journal
	 * @param journal the JSONObject representing the journal
	 * @param journalPageId the id of the journal page we want
	 * @return a JSONObject of a journal page with the id requested
	 */
	private static JSONObject getJournalPageById(JSONObject journal, int journalPageId) {
		JSONObject journalPage = null;
		try {
			//get the jounal pages in the journal
			JSONArray journalPages = (JSONArray) journal.get("journalPages");

			//loop through all the journal pages
			for(int x=0; x<journalPages.length(); x++) {
				//get a journal page
				JSONObject tempJournalPage = (JSONObject) journalPages.get(x);

				if(tempJournalPage != null) {
					//get the id of the current journal page
					int tempJournalPageId = tempJournalPage.getInt("id");

					//check if it is the journal page id we are looking for
					if(journalPageId == tempJournalPageId) {
						//it is the one we want
						journalPage = tempJournalPage;
						break;
					}
				}
			}

			/*
			 * if we didn't find the journal page with the id we wanted we
			 * will now create it
			 */
			if(journalPage == null) {
				//create a journal page
				journalPage = new JSONObject();
				
				//set the values in the journal page
				journalPage.put("id", journalPageId);
				journalPage.put("pageCreatedTime", "");
				journalPage.put("journalPageRevisionArray", new JSONArray());
				
				//add the journal page to the journal
				journal.getJSONArray("journalPages").put(journalPage);
			}

		} catch (JSONException e) {
			e.printStackTrace();
		}

		//return the journal page with the id we wanted
		return journalPage;
	}
}
