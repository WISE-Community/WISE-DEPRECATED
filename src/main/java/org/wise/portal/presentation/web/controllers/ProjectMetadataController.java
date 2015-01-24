/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
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
package org.wise.portal.presentation.web.controllers;

import java.io.IOException;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;

@Controller
public class ProjectMetadataController {
	
	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private RunService runService;
	
	@RequestMapping("/metadata.html")
	protected ModelAndView handleRequestInternal(
			HttpServletRequest request,
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
					} else {
						// check to see if user can author project or the run that it's in
						List<Run> runList = this.runService.getProjectRuns((Long) project.getId());
						Run run = null;
						if (!runList.isEmpty()){
							// since a project can now only be run once, just use the first run in the list
							run = runList.get(0);
						}
						if(this.projectService.canAuthorProject(project, user) ||
								(run != null && runService.hasRunPermission(run, user, BasePermission.WRITE))) {	
							if(command.equals("postMaxScore")) {
								//request is to post a max score
								handlePostMaxScore(request, response);
							} else if(command.equals("postLastMinified")) {
								//request is to post last minified time
								handlePostLastMinified(request, response);
							}
						} else {
							//the user does not have write access to the proejct
							response.getWriter().print("ERROR:NotAuthorized");						
						}
					}			
				}
			}
		}
		
		return null;
	}

	/**
	 * Handles the saving of max score POSTs. Only a user with author permission on the
	 * project or the run that it's used for can change max scores.
	 * Assumes that necessary permisison check has been invoked before calling this method
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
					
					if(user != null) {
						
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
}