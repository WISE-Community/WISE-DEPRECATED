package org.telscenter.sail.webapp.presentation.web.controllers;

import java.io.IOException;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.NotAuthorizedException;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.impl.ProjectMetadataImpl;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.project.ProjectService;

public class ProjectMetadataController extends AbstractController {
	
	private ProjectService projectService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		//get the command
		String command = request.getParameter("command");
		
		//get the project id
		String projectId = request.getParameter("projectId");
		
		if(projectId != null) {
			//get the project
			Project project = projectService.getById(Long.parseLong(projectId));
			
			if(project != null) {
				//get the metadata
				ProjectMetadata metadata = project.getMetadata();
				
				//get the signed in user
				User user = ControllerUtil.getSignedInUser();
				
				if(command.equals("getProjectMetaData")) {
					if(metadata != null) {
						//metadata exists so we will get the metadata as a JSON string
						String metadataJSON = metadata.toJSONString();
						
						//get the JSONObject for the metadata so we can add to it
						JSONObject metadataJSONObj = new JSONObject(metadataJSON);
						
						//get the parent project id
						Long parentProjectId = project.getParentProjectId();
						
						//add the project id and parent project id
						metadataJSONObj.put("projectId", Long.parseLong(projectId));
						
						if(parentProjectId == null) {
							//there is no parent project id so we will set it to null
							metadataJSONObj.put("parentProjectId", JSONObject.NULL);	
						} else {
							metadataJSONObj.put("parentProjectId", parentProjectId);							
						}
						
						/*
						 * get the relative project url
						 * e.g.
						 * /135/wise4.project.json
						 */
						String projectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
						
						if(projectUrl != null) {
							/*
							 * get the project folder
							 * e.g.
							 * /135 
							 */
							String projectFolder = projectUrl.substring(0, projectUrl.lastIndexOf("/"));
							
							//put the project folder into the meta data JSON
							metadataJSONObj.put("projectFolder", projectFolder);
						}
						
						response.getWriter().write(metadataJSONObj.toString());
					} else {
						//metadata does not exist so we will just return an empty JSON object string
						response.getWriter().write("{}");
					}
				} else {
					if(user == null) {
						//the user is not logged in
						response.getWriter().print("ERROR:LoginRequired");
					} else if(!this.projectService.canAuthorProject(project, user)) {
						//the user does not have write access to the proejct
						response.getWriter().print("ERROR:NotAuthorized");
					} else if(this.projectService.canAuthorProject(project, user)) {
						if(command.equals("postMaxScore")) {
							//request is to post a max score
							handlePostMaxScore(request, response);
						} else if(command.equals("postLastMinified")) {
							//request is to post last minified time
							handlePostLastMinified(request, response);
						}
					}
				}
			}			
		}
		
		return null;
	}

	/**
	 * Handles the saving of max score POSTs. Only a user with author permission on the
	 * project can change max scores.
	 * @param request
	 * @param response
	 * @return
	 */
	private ModelAndView handlePostMaxScore(HttpServletRequest request, HttpServletResponse response) {
		try {
			//get the project id
			String projectIdStr = request.getParameter("projectId");
			
			Project project = null;
			
			if(projectIdStr != null) {
				//get the project
				project = projectService.getById(new Long(projectIdStr));
				
				if(project != null) {
					//get the signed in user
					User user = ControllerUtil.getSignedInUser();
					
					//check if the user can author the project
					if(user != null && this.projectService.canAuthorProject(project, user)) {
						//the user has permission to author the project
						
						//get the nodeId
						String nodeId = request.getParameter("nodeId");
						
						//get the new max score value
						String maxScoreValue = request.getParameter("maxScoreValue");
						
						int maxScore = 0;
						
						//check if a max score value was provided
						if(maxScoreValue != null && !maxScoreValue.equals("")) {
							//parse the new max score value
							maxScore = Integer.parseInt(maxScoreValue);	
						}
						
						/*
						 * the string that we will use to return the new max score JSON object
						 * once we have successfully updated it on the server. this is so
						 * that the client can retrieve confirmation that the new max
						 * score has been saved and that it can then update its local copy.
						 */
						String maxScoreReturnJSON = "";
						
						if(project != null) {
							ProjectMetadata projectMetadata = project.getMetadata();
							
							if(projectMetadata != null) {
								String maxScoresString = projectMetadata.getMaxScores();
								JSONArray maxScoresJSONArray = null;
								
								if(maxScoresString == null || maxScoresString.equals("")) {
									maxScoresJSONArray = new JSONArray();
								} else {
									maxScoresJSONArray = new JSONArray(maxScoresString);
								}
								
								boolean maxScoreUpdated = false;
								
								for(int x=0; x<maxScoresJSONArray.length(); x++) {
									//get a max score entry
									JSONObject maxScoreObj = (JSONObject) maxScoresJSONArray.get(x);
									
									//get the node id
									String maxScoreObjNodeId = (String) maxScoreObj.get("nodeId");
									
									//check if the node id matches the one new one we need to save
									if(nodeId.equals(maxScoreObjNodeId)) {
										//it matches so we will update the score
										maxScoreObj.put("maxScoreValue", maxScore);
										
										/*
										 * generate the json string for the updated max score entry
										 * so we can send it back in the response
										 */
										maxScoreReturnJSON = maxScoreObj.toString();
										
										maxScoreUpdated = true;
									}
								}
								
								//check if we were able to find an existing entry to update it
								if(!maxScoreUpdated) {
									/*
									 * we did not find an existing entry to update so we will
									 * create a new entry
									 */
									JSONObject newMaxScore = new JSONObject();
									
									//set the values
									newMaxScore.put("nodeId", nodeId);
									
									//set the max score
									newMaxScore.put("maxScoreValue", maxScore);	
									
									/*
									 * generate the json string for the updated max score entry
									 * so we can send it back in the response
									 */
									maxScoreReturnJSON = newMaxScore.toString();
									
									//put the new entry back into the maxScores JSON object
									maxScoresJSONArray.put(newMaxScore);
								}

								//save the run extras back
								//runService.setExtras(run, jsonExtras.toString());
								projectMetadata.setMaxScores(maxScoresJSONArray.toString());
								projectService.updateProject(project, user);
								
								//send the new max score entry back to the client
								response.getWriter().print(maxScoreReturnJSON);
							}
						}
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
	/**
	 * Handles the saving of the lastMinified timestamp
	 * @param request
	 * @param response
	 * @return
	 */
	private ModelAndView handlePostLastMinified(HttpServletRequest request, HttpServletResponse response) {
		try {
			//get the signed in user
			User user = ControllerUtil.getSignedInUser();
			
			//get the project id
			String projectId = request.getParameter("projectId");
			
			//get the last minified timestamp in milliseconds
			String lastMinifiedStr = request.getParameter("lastMinified");
			
			//convert the string to a long
			long lastMinifiedMilliseconds = Long.parseLong(lastMinifiedStr);
			
			//create a Date object from the milliseconds
			Date lastMinified = new Date(lastMinifiedMilliseconds);
			
			Project project = null;
			
			if(projectId != null) {
				//get the project
				project = projectService.getById(new Long(projectId));

				if(project != null) {
					//get the project metadata
					ProjectMetadata metadata = project.getMetadata();
					
					if(metadata == null) {
						//create a metadata object for the project if it does not have any
						metadata = new ProjectMetadataImpl();
						project.setMetadata(metadata);
					}
					
					//set the last minified value
					metadata.setLastMinified(lastMinified);
					
					//check if last edited is null
					if(metadata.getLastEdited() == null) {
						/*
						 * last edited is null so we will set it to 1 second before
						 * we last minified. this is for time comparison purposes
						 * when we compare the lastEdited to the lastMinified timestamp
						 * in the future to determine if we need to minify it again
						 * to keep the -min version of the project up to date.
						 */
						Date lastEdited = new Date(lastMinified.getTime() - 1000); 
						metadata.setLastEdited(lastEdited);
					}
					
					//push the changes back to the db table
					projectService.updateProject(project, user);
				}
			}
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		} catch (NotAuthorizedException e) {
			e.printStackTrace();
		}

		
		return null;
	}
	
	
	public ProjectService getProjectService() {
		return projectService;
	}

	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
}
