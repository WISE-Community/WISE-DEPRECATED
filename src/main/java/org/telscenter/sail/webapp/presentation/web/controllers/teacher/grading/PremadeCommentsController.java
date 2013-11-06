/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.grading;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.impl.PremadeCommentListParameters;
import org.telscenter.sail.webapp.domain.impl.PremadeCommentParameters;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.premadecomment.PremadeCommentService;

/**
 * TODO: PUT COMMENTS HERE
 * 
 * @author Geoff
 * @version $Id:$
 */
public class PremadeCommentsController extends AbstractController {

	private PremadeCommentService premadeCommentService;

	private static final String PREMADE_COMMENTS_LISTS = "premadeCommentLists";
	private static final String COMMENT_BOX = "commentBox";

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String action = request.getParameter("action");

		if (action != null) {
			if (action.equals("getData")) {
				return handleGetData(request, response);
			} else  if (action.equals("postData")) {
				return handlePostData(request, response);
			}
		}

		return null;
	}

	/**
	 * Handles changes to premade comments
	 * @param request
	 * @param response
	 * @return
	 */
	private ModelAndView handlePostData(HttpServletRequest request,
			HttpServletResponse response) {

		try {
			//get the action
			String premadeCommentAction = request.getParameter("premadeCommentAction");

			//get the premade comment list id
			String premadeCommentListId = request.getParameter("premadeCommentListId");
			if(premadeCommentListId != null && premadeCommentListId.equals("null")) {
				//if the value is 'null' set it to null
				premadeCommentListId = null;
			}

			//get the premade comment name
			String premadeCommentListLabel = request.getParameter("premadeCommentListLabel");
			if(premadeCommentListLabel != null && premadeCommentListLabel.equals("null")) {
				//if the value is 'null' set it to null
				premadeCommentListLabel = null;
			}

			//get the premade comment id
			String premadeCommentId = request.getParameter("premadeCommentId");
			if(premadeCommentId != null && premadeCommentId.equals("null")) {
				//if the value is 'null' set it to null
				premadeCommentId = null;
			}

			//get the premade comment text
			String premadeComment = request.getParameter("premadeComment");
			if(premadeComment == null || (premadeComment != null && premadeComment.equals("null"))) {
				//if the value is null or 'null' set it to empty string
				premadeComment = "";
			}
			
			//get the premade comment text
			String premadeCommentLabels = request.getParameter("premadeCommentLabels");
			if(premadeCommentLabels == null || (premadeCommentLabels != null && premadeCommentLabels.equals("null"))) {
				//if the value is null or 'null' set it to empty string
				premadeCommentLabels = "";
			}

			//the default isGlobal value
			boolean isGlobal = false;

			//get whether the object (premade comment or premade comment list) should be global
			String isGlobalString = request.getParameter("isGlobal");
			if(isGlobalString != null) {
				isGlobal = Boolean.parseBoolean(isGlobalString);
			}

			//get the premade comment list positions
			String premadeCommentListPositions = request.getParameter("premadeCommentListPositions");
			if(premadeCommentListPositions == null || (premadeCommentListPositions != null && premadeCommentListPositions.equals("null"))) {
				//if the value is null or 'null' set it to empty string
				premadeCommentListPositions = "";
			}

			//get the project id if it was passed in
			String projectIdString = request.getParameter("projectId");
			Long projectId = null;
			
			if(projectIdString != null && !projectIdString.equals("null") && projectIdString != "undefined") {
				try {
					//get the project id as a long value
					projectId = new Long(projectIdString);	
				} catch(Exception e) {
					e.printStackTrace();
				}
			}

			/*
			 * this is a security check to see if signed in user is admin since
			 * the only user that can create or modify global premade comment
			 * objects is admin
			 */
			if(!signedInUserIsAdmin()) {
				/*
				 * signed in user is not admin so we will not allow them to make
				 * global premade comments or global premade comment lists
				 */
				isGlobal = false;
			}

			//get the User object of the signed in user
			User signedInUser = ControllerUtil.getSignedInUser();

			//PremadeComment premadeCommentReturn = null;
			String returnValue = "";

			if(premadeCommentListLabel == null) {
				if(signedInUserIsAdmin()) {
					//if the signed in user is admin, we will name the list global
					premadeCommentListLabel = "Global Premade Comment List";
				} else {
					if(projectId != null) {
						//make the premade comment list from the project id
						premadeCommentListLabel = premadeCommentService.makePremadeCommentListNameFromProjectId(projectId);
					} else {
						premadeCommentListLabel = "My New List";
					}
				}
			}

			if(premadeCommentAction == null) {
				//error
			} else if(premadeCommentAction.equals("addComment")) {
				//create a new comment and put it into an existing list

				if(premadeCommentListId != null) {
					//retrieve the existing list
					PremadeCommentList premadeCommentList = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));

					//make sure the signed in user is the owner of the list we are modifying
					if(signedInUser.equals(premadeCommentList.getOwner())) {
						int listSize = premadeCommentList.getPremadeCommentList().size();

						String labels = null;
						
						//create a new comment
						PremadeCommentParameters premadeCommentParameters = new PremadeCommentParameters(premadeComment, signedInUser, isGlobal, listSize + 1, labels); 
						PremadeComment newPremadeComment = premadeCommentService.createPremadeComment(premadeCommentParameters);

						//add the new premade comment to the list
						premadeCommentService.addPremadeCommentToList(premadeCommentList.getId(), newPremadeComment);

						try {
							//get the JSON for the new premade comment
							JSONObject premadeCommentJSON = convertPremadeCommentToJSON(newPremadeComment);

							/*
							 * insert the premade comment list id so the callback function on the client
							 * knows which list the comment was put in
							 */
							premadeCommentJSON.put("premadeCommentListId", premadeCommentList.getId());

							//get the string version of the JSON
							returnValue = premadeCommentJSON.toString();
						} catch (JSONException e) {
							e.printStackTrace();
						}
					} else {
						//error
					}
				} else {
					//error
				}

			} else if(premadeCommentAction.equals("editComment")) {
				//modify an existing comment

				if(premadeCommentId != null) {
					//retrieve the premade comment we are editing
					PremadeComment premadeCommentToUpdate = premadeCommentService.retrievePremadeCommentById(new Long(premadeCommentId));

					//make sure the signed in user is the owner of the premade comment
					if(signedInUser.equals(premadeCommentToUpdate.getOwner())) {
						//update the premade comment
						PremadeComment updatedPremadeComment = premadeCommentService.updatePremadeCommentMessage(new Long(premadeCommentId), premadeComment);

						//get the JSON value of the premade comment in string form
						returnValue = convertPremadeCommentToJSON(updatedPremadeComment).toString();
					}
				}
			} else if(premadeCommentAction.equals("deleteComment")) {
				//remove a comment from an existing list

				if(premadeCommentId != null && premadeCommentListId != null) {
					//get the premade comment we are going to delete
					PremadeComment premadeCommentToDelete = premadeCommentService.retrievePremadeCommentById(new Long(premadeCommentId));

					//get the premade comment list we are going to delete from
					PremadeCommentList premadeCommentListToDeleteFrom = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));

					//make sure the signed in user is the owner of both premade comment and premade comment list
					if(signedInUser.equals(premadeCommentToDelete.getOwner()) && signedInUser.equals(premadeCommentListToDeleteFrom.getOwner())) {
						//remove the premade comment from the list
						premadeCommentListToDeleteFrom = premadeCommentService.removePremadeCommentFromList(new Long(premadeCommentListId), premadeCommentToDelete);

						//delete the premade comment
						premadeCommentService.deletePremadeComment(new Long(premadeCommentId));

						//get the list position of the premade comment we are deleting
						long listPosition = premadeCommentToDelete.getListPosition();

						//shift the list positions since we are deleting one of the premade comments
						shiftListPositionsOnDelete(premadeCommentListToDeleteFrom, listPosition);

						//get the JSON value of the premade comment in string form
						returnValue = convertPremadeCommentToJSON(premadeCommentToDelete).toString();
					}
				}
			} else if(premadeCommentAction.equals("reOrderCommentList")) {
				//re-order a comment list

				try {
					//parse the list positions into a JSONArray
					JSONArray listPositions = new JSONArray(premadeCommentListPositions);
					
					//get the premade comment list id
					long premadeCommentListIdLong = new Long(premadeCommentListId);

					//update the list positions since we have re-ordered the list
					updateListPositionsOnReOrder(premadeCommentListIdLong, listPositions);
					
					//create a JSONObject to hold the premade comment list id and the list positions array
					JSONObject reOrderReturn = new JSONObject();
					reOrderReturn.put("premadeCommentListId", premadeCommentListIdLong);
					reOrderReturn.put("listPositions", listPositions);
					
					//return the JSONObject in string form
					returnValue = reOrderReturn.toString();
				} catch (JSONException e) {
					e.printStackTrace();
				}
			} else if(premadeCommentAction.equals("addCommentList")) {
				//create a new comment list

				//create the new premade comment list
				PremadeCommentListParameters premadeCommentListParameters = new PremadeCommentListParameters(premadeCommentListLabel, signedInUser, isGlobal, projectId);
				PremadeCommentList premadeCommentList = premadeCommentService.createPremadeCommentList(premadeCommentListParameters);

				//get the JSON value of the premade comment list in string form
				returnValue = convertPremadeCommentListToJSON(premadeCommentList).toString();
			} else if(premadeCommentAction.equals("editCommentListLabel")) {
				//modify an existing comment list label
				if(premadeCommentListId != null && premadeCommentListLabel != null) {
					//retrieve the premade comment list we are editing
					PremadeCommentList premadeCommentListToUpdate = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));
					
					//make sure the signed in user is the owner of the premade comment
					if(signedInUser.equals(premadeCommentListToUpdate.getOwner())) {
						//update the premade comment
						premadeCommentListToUpdate.setLabel(premadeCommentListLabel);
						PremadeCommentList updatedPremadeCommentList = premadeCommentService.updatePremadeCommentListLabel(new Long(premadeCommentListId), premadeCommentListLabel);

						//get the JSON value of the premade comment list in string form
						returnValue = convertPremadeCommentListToJSON(updatedPremadeCommentList).toString();
					}
				}
				
			} else if(premadeCommentAction.equals("editCommentList")) {
				//modify an existing comment list
			} else if(premadeCommentAction.equals("deleteCommentList")) {
				//remove a comment list
				//retrieve the premade comment list we are deleting
				PremadeCommentList premadeCommentListToDelete = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));
				
				//make sure the signed in user is the owner of the premade comment
				if(signedInUser.equals(premadeCommentListToDelete.getOwner())) {
					premadeCommentService.deletePremadeCommentList(new Long(premadeCommentListId));
					
					//get the JSON value of the premade comment list in string form...just return the old deleted premade comment list in this case.
					returnValue = convertPremadeCommentListToJSON(premadeCommentListToDelete).toString();
				}
			} else if(premadeCommentAction.equals("editCommentLabels")) {
				//modify a comment's labels

				if(premadeCommentId != null) {
					//retrieve the premade comment we are editing
					PremadeComment premadeCommentToUpdate = premadeCommentService.retrievePremadeCommentById(new Long(premadeCommentId));

					//make sure the signed in user is the owner of the premade comment
					if(signedInUser.equals(premadeCommentToUpdate.getOwner())) {
						//update the premade comment labels
						PremadeComment updatedPremadeComment = premadeCommentService.updatePremadeCommentLabels(new Long(premadeCommentId), premadeCommentLabels);

						//get the JSON value of the premade comment in string form
						returnValue = convertPremadeCommentToJSON(updatedPremadeComment).toString();
					}
				}
			} else {
				//error
			}

			//return JSON string data to the client so it can perform updates if necessary
			response.getWriter().print(returnValue);
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}

		return null;
	}

	/**
	 * Handles retrieval of premade comment lists. Will create a premade
	 * comment list if the user does not have one
	 * @param request
	 * @param response
	 * @return
	 */
	private ModelAndView handleGetData(HttpServletRequest request,
			HttpServletResponse response) {

		try {
			//the array that will hold all the lists
			JSONArray premadeCommentListsJSONArray = new JSONArray();

			//get the signed in user
			User signedInUser = ControllerUtil.getSignedInUser();

			Set<PremadeCommentList> premadeCommentLists = null;
			
			//get the project id if it was passed in
			String projectIdString = request.getParameter("projectId");
			Long projectId = null;
			
			if(projectIdString != null) {
				/*
				 * project id was passed in so we will only retrieve premade
				 * comments lists for this project id
				 */
				projectId = Long.parseLong(projectIdString);
				premadeCommentLists = premadeCommentService.retrieveAllPremadeCommentListsByProject(projectId);
			} else {
				/*
				 * project id was not passed in so we will retrieve all premade
				 * comments lists
				 */
				premadeCommentLists = premadeCommentService.retrieveAllPremadeCommentListsByUser(signedInUser);
			}
			
			//check if the user has any premade comment lists
			if(premadeCommentLists.size() == 0) {
				//the user does not have any premade comment lists so we will create one for them

				String premadeCommentListLabel = "";
				boolean isGlobal = false;

				if(signedInUserIsAdmin()) {
					//if the signed in user is admin, we will name the list global
					premadeCommentListLabel = "Global Premade Comment List";
				} else {
					
					if(projectId == null) {
						//get the user name of the signed in user
						String username = getUsernameFromUser(signedInUser);

						if(username != null && !username.equals("")) {
							//make the premade comment list name
							premadeCommentListLabel = username + "'s Premade Comment List";
						}
					} else {
						//we are making a list for a project
						premadeCommentListLabel = premadeCommentService.makePremadeCommentListNameFromProjectId(projectId);
					}
				}

				//make the list global if the signed in user is admin
				if(signedInUserIsAdmin()) {
					isGlobal = true;
				}

				/*
				 * the user does not have any premade comment lists so we will
				 * create one
				 */
				PremadeCommentList newPremadeCommentList = createPremadeCommentList(premadeCommentListLabel, signedInUser, isGlobal, projectId);

				//add the new premade comment list to the set
				premadeCommentLists.add(newPremadeCommentList);
			}

			//get an iterator for the user premade comment lists
			Iterator<PremadeCommentList> userPremadeCommentListIterator = premadeCommentLists.iterator();

			//loop through all the user premade comment lists
			while(userPremadeCommentListIterator.hasNext()) {
				//get a list
				PremadeCommentList currentPremadeCommentList = userPremadeCommentListIterator.next();

				//get the JSON version of the list
				JSONObject currentPremadeCommentListToJSON = convertPremadeCommentListToJSON(currentPremadeCommentList);

				//put the list into the array of all lists
				premadeCommentListsJSONArray.put(currentPremadeCommentListToJSON);
			}

			//get all global premade comment lists
			Set<PremadeCommentList> allGlobalPremadeCommentLists = premadeCommentService.retrieveAllGlobalPremadeCommentLists();

			//get an iterator for all the global premade comment lists
			Iterator<PremadeCommentList> globalCommentListIterator = allGlobalPremadeCommentLists.iterator();

			//loop through all the global premade comment lists
			while(globalCommentListIterator.hasNext()) {
				//get a global premade comment list
				PremadeCommentList currentPremadeCommentList = globalCommentListIterator.next();

				/*
				 * check if this global list is owned by this user, if it is owned by this
				 * user we do not want to put it into the array again. if it is not owned
				 * by this user we will put it into the array.
				 */
				if(!premadeCommentLists.contains(currentPremadeCommentList)) {
					//get the JSON version of the list
					JSONObject currentPremadeCommentListToJSON = convertPremadeCommentListToJSON(currentPremadeCommentList);

					//put the list into the array of all lists
					premadeCommentListsJSONArray.put(currentPremadeCommentListToJSON);
				}
			}

			//return the JSON array of all lists to the client in string form
			response.getWriter().print(premadeCommentListsJSONArray.toString());
		} catch (IOException e) {
			e.printStackTrace();
		}

		return null;
	}

	/**
	 * Create a new PremadeCommentList
	 * @param premadeCommentListLabel the name of the list
	 * @param signedInUser the signed in user
	 * @param isGlobal whether the list will be global
	 * @return the newly created PremadeCommentList
	 */
	private PremadeCommentList createPremadeCommentList(String premadeCommentListLabel, User signedInUser, boolean isGlobal, Long projectId) {
		//create the new premade comment list
		PremadeCommentListParameters premadeCommentListParameters = new PremadeCommentListParameters(premadeCommentListLabel, signedInUser, isGlobal, projectId);
		PremadeCommentList premadeCommentList = premadeCommentService.createPremadeCommentList(premadeCommentListParameters);

		String labels = null;
		
		/*
		 * create a new blank premade comment so the list will have one
		 * premade comment to start out with
		 */
		PremadeCommentParameters premadeCommentParameters = new PremadeCommentParameters("", signedInUser, isGlobal, 1, labels);
		PremadeComment newPremadeComment = premadeCommentService.createPremadeComment(premadeCommentParameters);

		try {
			//add the new blank premade comment to the list
			premadeCommentService.addPremadeCommentToList(premadeCommentList.getId(), newPremadeComment);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}

		return premadeCommentList;
	}

	/**
	 * Convert a premade comment list into JSON form
	 * @param premadeCommentList a PremadeCommentList object
	 * @return a string containing the JSON form of the premade comment list
	 */
	private JSONObject convertPremadeCommentListToJSON(PremadeCommentList premadeCommentList) {
		//the JSONObject that will represent the premade comment list
		JSONObject premadeCommentListJSON = new JSONObject();

		//get the attributes of the lsit
		Long id = premadeCommentList.getId();
		String label = premadeCommentList.getLabel();
		User owner = premadeCommentList.getOwner();
		String ownerUsername = getUsernameFromUser(owner);
		Long projectId = premadeCommentList.getProjectId();
		Set<PremadeComment> premadeComments = premadeCommentList.getPremadeCommentList();

		try {
			//set the attributes into the JSON object
			premadeCommentListJSON.put("id", id);
			premadeCommentListJSON.put("label", label);
			premadeCommentListJSON.put("owner", ownerUsername);
			premadeCommentListJSON.put("projectId", projectId);

			//the array to hold all the premade comments that are in the premade comment list
			JSONArray premadeCommentsJSON = new JSONArray();

			//an iterator for all the premade comments in the premade comment list
			Iterator<PremadeComment> premadeCommentsIterator = premadeComments.iterator();

			//loop through all the premade comments
			while(premadeCommentsIterator.hasNext()) {
				//get a premade comment object
				PremadeComment premadeComment = premadeCommentsIterator.next();

				//get the JSON value of the premade comment
				JSONObject premadeCommentJSON = convertPremadeCommentToJSON(premadeComment);

				//add the JSON premade comment to the array
				premadeCommentsJSON.put(premadeCommentJSON);
			}

			//put the array of premade comments into the JSON object
			premadeCommentListJSON.put("premadeComments", premadeCommentsJSON);

		} catch (JSONException e) {
			e.printStackTrace();
		}

		//return the JSON object representing the premade comment list
		return premadeCommentListJSON;
	}

	/**
	 * Convert a premade comment into JSON form
	 * @param premadeComment a PremadeComment object
	 * @return a string containing the JSON form of the premade comment
	 */
	private JSONObject convertPremadeCommentToJSON(PremadeComment premadeComment) {
		//the JSON object that will represent the premade comment
		JSONObject premadeCommentJSON = new JSONObject();

		try {
			//obtain all the attributes
			Long premadeCommentId = premadeComment.getId();
			String premadeCommentComment = premadeComment.getComment();
			User premadeCommentOwner = premadeComment.getOwner();
			String premadeCommentOwnerUsername = getUsernameFromUser(premadeCommentOwner);
			Long premadeCommentListPosition = premadeComment.getListPosition();
			String labels = premadeComment.getLabels();

			//put the attributes into the JSON object
			premadeCommentJSON.put("id", premadeCommentId);
			premadeCommentJSON.put("comment", premadeCommentComment);
			premadeCommentJSON.put("owner", premadeCommentOwnerUsername);
			premadeCommentJSON.put("listPosition", premadeCommentListPosition);
			premadeCommentJSON.put("labels", labels);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		//return the JSON object representing the premade comment
		return premadeCommentJSON;
	}

	/**
	 * Get the user name from the User object
	 * @param user a User object
	 * @return a string containing the user name
	 */
	private String getUsernameFromUser(User user) {
		String username = null;

		if(user != null) {
			//get the user details
			MutableUserDetails ownerUserDetails = user.getUserDetails();

			if(ownerUserDetails != null) {
				//get the user name
				username = ownerUserDetails.getUsername();				
			}
		}

		return username;
	}

	/**
	 * Determine whether the signed in user is admin
	 * @return whether the signed in user is admin
	 */
	private boolean signedInUserIsAdmin() {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();

		//get the user name
		String username = signedInUser.getUserDetails().getUsername();
		
		//get the user's authorities
		Collection<? extends GrantedAuthority> authorities = signedInUser.getUserDetails().getAuthorities();

		//loop through the authorities
		for (GrantedAuthority authority : authorities) {
			
			//check if the authority is the admin role
			if (authority.getAuthority().equals(UserDetailsService.ADMIN_ROLE)) {
				
				//check that the user name is "admin" since other teachers may have admin access
				if(username != null && username.equals("admin")) {
					//user is admin
					return true;
				}
			}
		}

		//user is not admin
		return false;
	}

	/**
	 * Shift the list positions since we are deleting one of the premade comments
	 * @param premadeCommentListToDeleteFrom the list we are deleting from
	 * @param listPositionDeleted the list position of the premade comment
	 * we are deleting
	 */
	private void shiftListPositionsOnDelete(PremadeCommentList premadeCommentListToDeleteFrom, long listPositionDeleted) {
		//get the list of premade comments
		Set<PremadeComment> premadeCommentList = premadeCommentListToDeleteFrom.getPremadeCommentList();

		//get an iterator of the list
		Iterator<PremadeComment> premadeCommentListIterator = premadeCommentList.iterator();

		//loop through all the premade comments
		while(premadeCommentListIterator.hasNext()) {
			//get a premade comment
			PremadeComment premadeComment = premadeCommentListIterator.next();

			//get the current list position
			Long currentListPosition = premadeComment.getListPosition();

			/*
			 * check if the current premade comment list position is larger
			 * than the list position we are deleting since we only need
			 * to shift list positions that are higher than the one we
			 * are deleting.
			 */
			if(currentListPosition > listPositionDeleted) {
				//current premade comment list position is higher than position we are deleting

				try {
					//update the list position by decrementing it by 1
					premadeCommentService.updatePremadeCommentListPosition(premadeComment.getId(), currentListPosition - 1);
				} catch (ObjectNotFoundException e) {
					e.printStackTrace();
				}
			}
		}
	}

	/**
	 * Update the list positions since we have re-ordered the list
	 * @param premadeCommentListId the id of the premade comment list
	 * @param listPositions a JSONArray containing the order of the premade comment ids
	 * the index is the list position and the value is the premade comment id
	 * 
	 * e.g.
	 * premade comment 10 = "great job"
	 * premade comment 11 = "needs more facts"
	 * premade comment 12 = "incorrect"
	 * 
	 * are in a list and in the list they are sorted in the order
	 * 
	 * "needs more facts"
	 * "great job"
	 * "incorrect"
	 * 
	 * so the array will contain the premade comment ids in this order
	 * 
	 * 11, 10, 12
	 */
	private void updateListPositionsOnReOrder(Long premadeCommentListId, JSONArray listPositions) {
		//loop through all the premade comments
		for(int x=0; x<listPositions.length(); x++) {
			try {
				//get a premade comment id
				long premadeCommentId = listPositions.getLong(x);
				
				/*
				 * update the list position for the premade comment id. the list position
				 * is the index in the array incremented by 1. from the example above,
				 * the list positions would be
				 * index - premadeCommentId - listPosition
				 * [0] - 11 - 1
				 * [1] - 10 - 2
				 * [2] - 12 - 3
				 * 
				 * note: when we display the premade comments in the teacher UI,
				 * the higher numbered list positions are at the top and the lower 
				 * numbered list positions are at the bottom
				 */
				premadeCommentService.updatePremadeCommentListPosition(premadeCommentId, new Long(x + 1));
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}		
		}
	}

	/**
	 * @return the premadeCommentService
	 */
	public PremadeCommentService getPremadeCommentService() {
		return premadeCommentService;
	}

	/**
	 * @param premadeCommentService the premadeCommentService to set
	 */
	public void setPremadeCommentService(PremadeCommentService premadeCommentService) {
		this.premadeCommentService = premadeCommentService;
	}
}
