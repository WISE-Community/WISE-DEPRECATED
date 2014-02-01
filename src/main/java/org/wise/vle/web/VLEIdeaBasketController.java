package org.wise.vle.web;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.ideabasket.IdeaBasket;
import org.wise.vle.utils.SecurityUtils;

public class VLEIdeaBasketController extends AbstractController {

	private static final long serialVersionUID = 1L;
	
	private VLEService vleService;
	
	private RunService runService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		if (request.getMethod() == AbstractController.METHOD_GET) {
			return doGet(request, response);
		} else if (request.getMethod() == AbstractController.METHOD_POST) {
			return doPost(request, response);
		}
		return null;
	}
	
	public ModelAndView doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();

		//get all the params
		String runIdStr = request.getParameter("runId");
		String periodIdStr = request.getParameter("periodId");
		String workgroupIdStr = request.getParameter("workgroupId");
		String ideaWorkgroupIdStr = request.getParameter("ideaWorkgroupId");
		String action = request.getParameter("action");
		String data = request.getParameter("data");
		String ideaString = request.getParameter("ideaString");
		String ideaIdStr = request.getParameter("ideaId");
		
		String projectIdStr = (String) request.getParameter("projectId");
		
		Long projectId = null;
		if(projectIdStr != null) {
			try {
				projectId = new Long(projectIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Long runId = null;
		if(runIdStr != null) {
			try {
				runId = new Long(runIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Long periodId = null;
		if(periodIdStr != null) {
			try {
				periodId = new Long(periodIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Long workgroupId = null;
		if(workgroupIdStr != null) {
			try {
				workgroupId = new Long(workgroupIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Long ideaWorkgroupId = null;
		if(ideaWorkgroupIdStr != null) {
			try {
				ideaWorkgroupId = new Long(ideaWorkgroupIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Long ideaId = null;
		if(ideaIdStr != null) {
			try {
				ideaId = new Long(ideaIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		boolean allowedAccess = false;
		boolean isPrivileged = false;
		
		/*
		 * admins can make a request
		 * teachers can make a request if they are the owner of the run
		 * students can make a request if they are in the run and in the workgroup
		 */
		if(SecurityUtils.isAdmin(signedInUser)) {
			//the user is an admin so we will allow this request
			allowedAccess = true;
			isPrivileged = true;
		} else if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
			//the user is a teacher that is an owner or shared owner of the run so we will allow this request
			allowedAccess = true;
			isPrivileged = true;
		} else if(SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runId) && SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
			//the student is in the run and in the workgroup so we will allow this request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		//get the latest revision of the IdeaBasket for this runId, workgroupId
		IdeaBasket ideaBasket = vleService.getIdeaBasketByRunIdWorkgroupId(runId, workgroupId);

		if(action == null) {
			
		} else if(action.equals("saveIdeaBasket") || action.equals("addPrivateIdea") || action.equals("editPrivateIdea") ||
				 action.equals("deletePrivateIdea") || action.equals("restorePrivateIdea") || action.equals("reOrderPrivateBasket")) {
			boolean savedBasket = false;
			
			if(ideaBasket != null) {
				//the idea basket was created before
				
				//get the idea basket data
				String previousData = ideaBasket.getData();
				
				if(previousData != null && previousData.equals(data)) {
					//data is the same so we do not need to save
				} else {
					try {
						//create a JSON object from the data to make sure it is valid JSON
						@SuppressWarnings("unused")
						JSONObject dataJSONObj = new JSONObject(data);
						
						//data is not the same so we will save a new row
						ideaBasket = new IdeaBasket(runId, periodId, projectId, workgroupId, data, false, action, workgroupId, ideaId, workgroupId);
						vleService.saveIdeaBasket(ideaBasket);
						savedBasket = true;
					} catch (JSONException e) {
						e.printStackTrace();
					} catch (NullPointerException e) {
						e.printStackTrace();
					}
				}
			} else {
				//the idea basket was never created before so we will save a new row
				ideaBasket = new IdeaBasket(runId, periodId, projectId, workgroupId, data, false, action, workgroupId, ideaId, workgroupId);
				vleService.saveIdeaBasket(ideaBasket);
				savedBasket = true;
			}
			
			if(!savedBasket) {
				/*
				 * we failed to save the basket so we will retrieve the
				 * previous revision and send it back to the vle so they
				 * can reload the previous revision.
				 */
				ideaBasket = vleService.getIdeaBasketByRunIdWorkgroupId(runId, workgroupId);
				response.getWriter().print(ideaBasket.toJSONString());
			} else {
				/*
				 * we successfully saved the idea basket. we must send this
				 * message back in order to notify the vle that the idea basket
				 * was successfully saved otherwise it will assume it failed
				 * to save
				 */
				response.getWriter().print("Successfully saved Idea Basket");
			}
		} else if(action.equals("addPublicIdea")) {
			//add a public idea to the public idea basket and save a new revision
			
			//make sure the signed in user is allowed to perform this add public idea request
			if(isAllowedToModifyPublicIdeaBasket(new Boolean(isPrivileged), signedInUser, workgroupId)) {
				JSONObject newIdeaJSON = null;
				long newIdeaId = 0;
				long newIdeaWorkgroupId = 0;
				
				try {
					//get the idea we are going to make public
					newIdeaJSON = new JSONObject(ideaString);
					
					if(newIdeaJSON != null) {
						//get the id and workgroup id of the new idea we are adding
						newIdeaId = newIdeaJSON.getLong("id");
						newIdeaWorkgroupId = newIdeaJSON.getLong("workgroupId");
					}
				} catch (JSONException e1) {
					e1.printStackTrace();
				}
				
				//get the latest revision of the public idea basket
				IdeaBasket publicIdeaBasket = getPublicIdeaBasket(runId, periodId, projectId, action, workgroupId, newIdeaId, newIdeaWorkgroupId);
				
				//get the data from the public idea basket
				String dataString = publicIdeaBasket.getData();
				
				try {
					JSONObject dataJSON = new JSONObject(dataString);
					
					//get the ideas in the public idea basket
					JSONArray ideasJSON = dataJSON.getJSONArray("ideas");

					if(newIdeaJSON != null) {
						//value to see if the idea is already in the public idea basket
						boolean ideaAlreadyAdded = false;
						
						/*
						 * make sure the signed in user workgroup id is the same as the
						 * workgroup id field in the idea JSON  
						 */
						if(workgroupId == newIdeaWorkgroupId) {
							
							/*
							 * loop through all the ideas in the public idea basket
							 * so we can check if this idea is already in the public
							 * idea basket
							 */
							for(int x=0; x<ideasJSON.length(); x++) {
								//get an idea
								JSONObject tempIdea = ideasJSON.getJSONObject(x);
								
								if(tempIdea != null) {
									//get the id and workgroup id
									long tempId = tempIdea.getLong("id");
									long tempWorkgroupId = tempIdea.getLong("workgroupId");
									
									if(newIdeaId == tempId && newIdeaWorkgroupId == tempWorkgroupId) {
										/*
										 * an idea with the same id and workgroup id already exists in the
										 * public idea basket so we will not add it
										 */
										ideaAlreadyAdded = true;
									}
								}
							}
							
							if(!ideaAlreadyAdded) {
								//the idea does not exist in the public idea basket so we will add it
								
								//put the idea into the ideas array of the public idea basket
								ideasJSON.put(newIdeaJSON);
								
								//create a new public idea basket revision
								IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(runId, periodId, projectId, dataJSON.toString(), action, workgroupId, newIdeaId, newIdeaWorkgroupId);
								
								//get the string representation
								String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();
								
								//return the new public idea basket revision
								response.getWriter().print(publicIdeaBasketRevisionString);
							} else {
								//idea already exists in the public idea basket so we will not add it
								JSONObject errorMessageJSONObject = new JSONObject();
								errorMessageJSONObject.put("errorMessage", "Error: Idea already exists in the public idea basket");
								response.getWriter().print(errorMessageJSONObject.toString());
							}
						} else {
							//workgroup id does not match
							JSONObject errorMessageJSONObject = new JSONObject();
							errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup id does not match workgroup id in idea");
							response.getWriter().print(errorMessageJSONObject.toString());
						}
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			} else {
				//workgroup id does not match
				try {
					JSONObject errorMessageJSONObject = new JSONObject();
					errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup id does not match workgroup id they claim to be");
					response.getWriter().print(errorMessageJSONObject.toString());
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		} else if(action.equals("editPublicIdea")) {
			
		} else if(action.equals("deletePublicIdea")) {
			//delete a public idea from the public idea basket and save a new revision
			
			//make sure the signed in user is allowed to perform this delete public idea request
			if(isAllowedToModifyPublicIdeaBasket(new Boolean(isPrivileged), signedInUser, workgroupId)) {
				//get the latest revision of the public idea basket
				IdeaBasket publicIdeaBasket = getPublicIdeaBasket(runId, periodId, projectId, action, workgroupId, ideaId, workgroupId);
				
				//get the data
				String dataString = publicIdeaBasket.getData();
				
				try {
					boolean ideaDeleted = false;
					
					//get the data as a JSON object
					JSONObject dataJSON = new JSONObject(dataString);
					
					//get the ideas
					JSONArray ideasJSON = dataJSON.getJSONArray("ideas");
					
					if(ideasJSON != null) {
						//loop through all the ideas
						for(int x=0; x<ideasJSON.length(); x++) {
							//get an idea
							JSONObject idea = ideasJSON.getJSONObject(x);
							
							//get the id and workgroup id from the idea
							long tempId = idea.getLong("id");
							long tempWorkgroupId = idea.getLong("workgroupId");
							
							if(ideaId == tempId && workgroupId == tempWorkgroupId) {
								//the idea id and workgroup id match so we will remove this idea
								JSONObject removedIdea = (JSONObject) ideasJSON.remove(x);
								
								//get the array of deleted ideas
								JSONArray deleted = dataJSON.getJSONArray("deleted");
								
								//put the removed idea into the deleted array
								deleted.put(removedIdea);
								
								/*
								 * move the counter back one so that it checks every idea.
								 * this will make it so we delete all ideas with the given
								 * idea id and workgroup id just to be safe even though there
								 * shouldn't be multiple ideas with the same idea id and
								 * workgroup id.
								 */
								x--;
								
								ideaDeleted = true;
							}
						}					
					}
					
					if(ideaDeleted) {
						//we have found and deleted the public idea
						
						//create a new public idea basket revision
						IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(runId, periodId, projectId, dataJSON.toString(), action, workgroupId, ideaId, workgroupId);
						
						//get the string representation
						String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();
						
						//return the new public idea basket revision
						response.getWriter().print(publicIdeaBasketRevisionString);
					} else {
						//we did not find the public idea we wanted to delete
						JSONObject errorMessageJSONObject = new JSONObject();
						errorMessageJSONObject.put("errorMessage", "Error: Idea was not found in the public idea basket");
						response.getWriter().print(errorMessageJSONObject.toString());
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			} else {
				//user is not allowed to delete this public idea
				try {
					JSONObject errorMessageJSONObject = new JSONObject();
					errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup is not allowed to delete this public idea");
					response.getWriter().print(errorMessageJSONObject.toString());
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		} else if(action.equals("copyPublicIdea")) {
			/*
			 * a user is copying a public idea so we will add that user to the list of users
			 * who have copied that idea
			 */
			
			//get the latest revision of the public idea basket
			IdeaBasket publicIdeaBasket = getPublicIdeaBasket(runId, periodId, projectId, action, workgroupId, ideaId, ideaWorkgroupId);
			
			//get the data
			String dataString = publicIdeaBasket.getData();
			
			try {
				boolean foundPublicIdea = false;
				boolean ideaCopied = false;
				boolean previouslyCopied = false;
				
				//get the data as a JSON object
				JSONObject dataJSON = new JSONObject(dataString);
				
				//get the ideas
				JSONArray ideasJSON = dataJSON.getJSONArray("ideas");
				
				if(ideasJSON != null) {
					//loop through all the ideas
					for(int x=0; x<ideasJSON.length(); x++) {
						//get an idea
						JSONObject idea = ideasJSON.getJSONObject(x);
						
						//get the id and workgroup id from the idea
						long tempId = idea.getLong("id");
						long tempWorkgroupId = idea.getLong("workgroupId");
						
						if(ideaId == tempId && ideaWorkgroupId == tempWorkgroupId) {
							//we have found the public idea that is being copied
							foundPublicIdea = true;
							
							//create the array of workgroup ids that have copied if it does not exist
							if(idea.isNull("workgroupIdsThatHaveCopied")) {
								idea.put("workgroupIdsThatHaveCopied", new JSONArray());
							}
							
							//get the array of workgroups that have copied this idea
							JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
							
							//check if the signed in workgroup id is already in this array
							for(int y=0; y<workgroupIdsThatHaveCopied.length(); y++) {
								long workgroupIdThatHasCopied = workgroupIdsThatHaveCopied.getLong(y);
								
								if(workgroupId == workgroupIdThatHasCopied) {
									/*
									 * we found the signed in workgroup id in the array which
									 * means the workgroup has previously copied this idea
									 * so we will not need to copy it again
									 */
									previouslyCopied = true;
								}
							}
							
							if(!previouslyCopied) {
								/*
								 * the workgroup has not previously copied this idea so we will
								 * add this workgroup to the array of workgroups that have copied 
								 * this idea 
								 */
								workgroupIdsThatHaveCopied.put(workgroupId);
								ideaCopied = true;								
							}
						}
					}					
				}
				
				if(ideaCopied) {
					//create a new public idea basket revision
					IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(runId, periodId, projectId, dataJSON.toString(), action, workgroupId, ideaId, ideaWorkgroupId);

					//get the string representation
					String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();

					//return the new public idea basket revision
					response.getWriter().print(publicIdeaBasketRevisionString);
				} else if(previouslyCopied) {
					//the signed in workgroup has previously copied the public idea before
					JSONObject publicIdeaBasketJSONObject = publicIdeaBasket.toJSONObject();
					publicIdeaBasketJSONObject.put("errorMessage", "Error: You have already copied this public idea");
					response.getWriter().print(publicIdeaBasketJSONObject.toString());
				} else if(!foundPublicIdea) {
					//the public idea with the given id and workgroupId was not found
					JSONObject errorMessageJSONObject = new JSONObject();
					errorMessageJSONObject.put("errorMessage", "Error: Did not find public idea with id=" + ideaId + " and workgroupId=" + ideaWorkgroupId);
					response.getWriter().print(errorMessageJSONObject.toString());
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else if(action.equals("uncopyPublicIdea")) {
			/*
			 * a user is uncopying a public idea so we will remove that user from the list of users
			 * who have copied that idea
			 */
			
			//get the latest revision of the public idea basket
			IdeaBasket publicIdeaBasket = getPublicIdeaBasket(runId, periodId, projectId, action, workgroupId, ideaId, ideaWorkgroupId);
			
			//get the data
			String dataString = publicIdeaBasket.getData();
			
			try {
				boolean publicIdeaBasketChanged = false;
				boolean foundPublicIdea = false;
				boolean previouslyCopied = false;
				
				//get the data as a JSON object
				JSONObject dataJSON = new JSONObject(dataString);
				
				//get the ideas
				JSONArray ideasJSON = dataJSON.getJSONArray("ideas");
				
				if(ideasJSON != null) {
					//loop through all the ideas
					for(int x=0; x<ideasJSON.length(); x++) {
						//get an idea
						JSONObject idea = ideasJSON.getJSONObject(x);
						
						//get the id and workgroup id from the idea
						long tempId = idea.getLong("id");
						long tempWorkgroupId = idea.getLong("workgroupId");
						
						if(ideaId == tempId && ideaWorkgroupId == tempWorkgroupId) {
							//we have found the public idea that is being uncopied
							foundPublicIdea = true;
							
							//create the array of workgroup ids that have copied if it does not exist
							if(idea.isNull("workgroupIdsThatHaveCopied")) {
								idea.put("workgroupIdsThatHaveCopied", new JSONArray());
							}
							
							//get the array of workgroups that have copied this idea
							JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
							
							//check if the signed in workgroup id is already in this array
							for(int y=0; y<workgroupIdsThatHaveCopied.length(); y++) {
								long workgroupIdThatHasCopied = workgroupIdsThatHaveCopied.getLong(y);
								
								if(workgroupId == workgroupIdThatHasCopied) {
									/*
									 * we found the signed in workgroup id in the array so
									 * we will remove it. we will also move the counter back
									 * one so that it will keep checking the array for all
									 * instances of the workgroup id even though the workgroup
									 * id should never appear more than once in the array.
									 * this is just to be safe.
									 */
									workgroupIdsThatHaveCopied.remove(y);
									y--;
									publicIdeaBasketChanged = true;
									previouslyCopied = true;
								}
							}
						}
					}					
				}
				
				if(publicIdeaBasketChanged) {
					//create a new public idea basket revision
					IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(runId, periodId, projectId, dataJSON.toString(), action, workgroupId, ideaId, ideaWorkgroupId);
					
					//get the string representation
					String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();
					
					//return the new public idea basket revision
					response.getWriter().print(publicIdeaBasketRevisionString);
				} else {
					if(!foundPublicIdea) {
						//the public idea with the given id and workgroupId was not found
						JSONObject errorMessageJSONObject = new JSONObject();
						errorMessageJSONObject.put("errorMessage", "Error: Did not find public idea with id=" + ideaId + " and workgroupId=" + ideaWorkgroupId);
						response.getWriter().print(errorMessageJSONObject.toString());
					} else if(!previouslyCopied) {
						//the signed in workgroup has not previously copied the public idea before
						JSONObject errorMessageJSONObject = new JSONObject();
						errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup has not previously copied this public idea before");
						response.getWriter().print(errorMessageJSONObject.toString());					
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		return null;
	}

	public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		//get all the params
		String runIdStr = request.getParameter("runId");
		String action = request.getParameter("action");
		String periodIdStr = (String) request.getParameter("periodId");
		
		String workgroupIdStr = (String) request.getParameter("workgroupId");
		
		Long runId = null;
		if(runIdStr != null) {
			try {
				runId = new Long(runIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Long periodId = null;
		if(periodIdStr != null) {
			try {
				periodId = new Long(periodIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Long workgroupId = null;
		if(workgroupIdStr != null) {
			try {
				workgroupId = new Long(workgroupIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		boolean isPrivileged = false;
		boolean allowedAccess = false;
		
		/*
		 * admins can make a request
		 * teachers that are owners of the run can make a request
		 * students that are in the run and in the workgroup can make a request
		 */
		if(SecurityUtils.isAdmin(signedInUser)) {
			//the user is an admin so we will allow this request
			allowedAccess = true;
			isPrivileged = true;
		} else if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
			//the user is a teacher that is an owner or shared owner of the run so we will allow this request
			allowedAccess = true;
			isPrivileged = true;
		} else if(SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runId) && SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
			//the student is in the run and in the workgroup so we will allow this request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		Long projectId = null;
		
		try {
			//get the run
			Run run = runService.retrieveById(runId);
			
			//get the project id
			Project project = run.getProject();
			Serializable projectIdSerializable = project.getId();
			
			if(projectIdSerializable != null) {
				try {
					projectId = new Long(projectIdSerializable.toString());
				} catch(NumberFormatException e) {
					e.printStackTrace();
				}
							
			}
		} catch (NumberFormatException e1) {
			e1.printStackTrace();
		} catch (ObjectNotFoundException e1) {
			e1.printStackTrace();
		}
		
		if(action.equals("getIdeaBasket")) {
			if(runId != null && workgroupId != null) {
				//get the IdeaBasket
				IdeaBasket ideaBasket = vleService.getIdeaBasketByRunIdWorkgroupId(runId, workgroupId);
				
				if(ideaBasket == null) {
					//make the IdeaBasket if it does not exist
					ideaBasket = new IdeaBasket(runId, periodId, projectId, workgroupId);
					vleService.saveIdeaBasket(ideaBasket);
				}
				
				//get the IdeaBasket JSONString
				String ideaBasketJSONString = ideaBasket.toJSONString();
				response.getWriter().print(ideaBasketJSONString);
			}
		} else if(action.equals("getAllIdeaBaskets")) {
			if(isPrivileged) {
				//get all the idea baskets for a run
				List<IdeaBasket> latestIdeaBasketsForRunId = vleService.getLatestIdeaBasketsForRunId(runId);
				
				//convert the list to a JSONArray
				JSONArray ideaBaskets = ideaBasketListToJSONArray(latestIdeaBasketsForRunId);
				
				//return the JSONArray of idea baskets as a string
				String ideaBasketsJSONString = ideaBaskets.toString();
				response.getWriter().print(ideaBasketsJSONString);
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "You are not authorized to access this page");
			}
		} else if(action.equals("getIdeaBasketsByWorkgroupIds")) {
			//get the JSONArray of workgroup ids
			String workgroupIdsJSONArrayStr = request.getParameter("workgroupIds");
			
			try {
				JSONArray workgroupIdsJSONArray = new JSONArray(workgroupIdsJSONArrayStr);
				
				List<Long> workgroupIds = new ArrayList<Long>();
				
				//loop through all the workgroup ids
				for(int x=0; x<workgroupIdsJSONArray.length(); x++) {
					//add the workgroup id to the list
					long workgroupIdToGet = workgroupIdsJSONArray.getLong(x);
					workgroupIds.add(workgroupIdToGet);
				}
				
				List<IdeaBasket> latestIdeaBasketsForRunIdWorkgroupIds = new ArrayList<IdeaBasket>();
				
				if(workgroupIds.size() > 0) {
					//query for the baskets with the given run and workgroup ids
					latestIdeaBasketsForRunIdWorkgroupIds = vleService.getLatestIdeaBasketsForRunIdWorkgroupIds(runId, workgroupIds);					
				}
				
				//convert the list to a JSONArray
				JSONArray ideaBaskets = ideaBasketListToJSONArray(latestIdeaBasketsForRunIdWorkgroupIds);
				
				//return the JSONArray of idea baskets as a string
				String ideaBasketsJSONString = ideaBaskets.toString();
				response.getWriter().print(ideaBasketsJSONString);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else if(action.equals("getPublicIdeaBasket")) {
			//get the latest public idea basket revision
			IdeaBasket publicIdeaBasket = getPublicIdeaBasket(runId, periodId, projectId, action, workgroupId, null, null);
			
			//get the JSON string representation of the public idea basket
			String publicIdeaBasketJSONString = publicIdeaBasket.toJSONString();
			
			//return the public idea basket
			response.getWriter().print(publicIdeaBasketJSONString);
		}
		return null;
	}
	
	/**
	 * Check if the signed in user is allowed to modify the public idea basket
	 * @param isPrivileged whether the user is an admin or teacher
	 * @param signedInWorkgroupId the signed in workgroup id retrieved from the server
	 * @param workgroupId the workgroup id retrieved from the user
	 * @return whether the signed in user can modify the public idea basket
	 */
	private boolean isAllowedToModifyPublicIdeaBasket(boolean isPrivileged, User signedInUser, long workgroupId) {
		boolean result = false;
		
		if(isPrivileged || SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
			result = true;
		}
		
		return result;
	}
	
	/**
	 * Get the latest public idea basket revision for the given run id, period id, project id.
	 * If it does not exist it will be created.
	 * @param runId the run id
	 * @param periodId the period id
	 * @param projectId the project id
	 * @return the public idea basket for the given arguments
	 */
	private IdeaBasket getPublicIdeaBasket(Long runId, Long periodId, Long projectId, String action, Long actionPerformer, Long ideaId, Long ideaWorkgroupId) {
		//try to retrieve the latest public idea basket revision from the database
		IdeaBasket publicIdeaBasket = vleService.getPublicIdeaBasketForRunIdPeriodId(runId, periodId);
		
		if(publicIdeaBasket == null) {
			//the public idea basket does not exist so we will make it
			publicIdeaBasket = createPublicIdeaBasket(runId, periodId, projectId, null, action, actionPerformer, ideaId, ideaWorkgroupId);
		}
		
		return publicIdeaBasket;
	}
	
	/**
	 * Create a new public idea basket revision
	 * @param runId the run id
	 * @param periodId the period id
	 * @param projectId the project id
	 * @return a public idea basket revision
	 */
	private IdeaBasket createPublicIdeaBasket(Long runId, Long periodId, Long projectId, String dataString, String action, Long actionPerformer, Long ideaId, Long ideaWorkgroupId) {
		IdeaBasket publicIdeaBasket = null;
		
		if(dataString == null) {
			//the data string was not provided so we will create it with default values
			try {
				//make the data for the public idea basket revision
				JSONObject dataJSONObject = new JSONObject();
				dataJSONObject.put("ideas", new JSONArray());
				dataJSONObject.put("deleted", new JSONArray());
				dataJSONObject.put("nextIdeaId", JSONObject.NULL);
				dataJSONObject.put("version", 2); //might want to set this to 2 or 3
				dataJSONObject.put("settings", JSONObject.NULL);
				
				//get the data as a string
				dataString = dataJSONObject.toString();
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//create the new public idea basket revision
		publicIdeaBasket = new IdeaBasket(runId, periodId, projectId, -1, dataString, true, action, actionPerformer, ideaId, ideaWorkgroupId);
		
		//save the public idea basket revision to the database
		vleService.saveIdeaBasket(publicIdeaBasket);
		
		return publicIdeaBasket;
	}
	
	/**
	 * Turns a list of IdeaBaskets into a JSONArray
	 * @param ideaBasketsList a list containing IdeaBaskets
	 * @return a JSONArray containing the idea baskets
	 */
	private JSONArray ideaBasketListToJSONArray(List<IdeaBasket> ideaBasketsList) {
		JSONArray ideaBaskets = new JSONArray();
		
		//loop through all the idea baskets
		for(int x=0; x<ideaBasketsList.size(); x++) {
			//get an idea basket
			IdeaBasket ideaBasket = ideaBasketsList.get(x);
			
			try {
				//add the idea basket to our JSONArray
				JSONObject ideaBasketJSONObj = new JSONObject(ideaBasket.toJSONString());
				ideaBaskets.put(ideaBasketJSONObj);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		return ideaBaskets;
	}

	public VLEService getVleService() {
		return vleService;
	}

	public void setVleService(VLEService vleService) {
		this.vleService = vleService;
	}

	public RunService getRunService() {
		return runService;
	}

	public void setRunService(RunService runService) {
		this.runService = runService;
	}
}
