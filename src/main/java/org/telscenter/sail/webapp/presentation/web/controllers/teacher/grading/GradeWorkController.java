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
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.security.acls.domain.BasePermission;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.pas.emf.pas.ECurnitmap;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.project.impl.ProjectTypeVisitor;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.grading.GradingService;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * A Controller for TELS's grade by step
 *
 * @author Anthony Perritano
 * @version $Id: $
 */
public class GradeWorkController extends AbstractController {

	public static final String RUN_ID = "runId";
	
	public static final String CURNIT_MAP = "curnitMap";

	private GradingService gradingService;
	
	private RunService runService;
	
	Properties portalProperties;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String runId = request.getParameter(RUN_ID);
		Run run = runService.retrieveById(new Long(runId));
		
		//get the grading type (step or team)
		String gradingType = request.getParameter("gradingType");
		
		//get the boolean whether to get revisions
		String getRevisions = request.getParameter("getRevisions");
		
		String action = request.getParameter("action");
		if(action != null) {
			if(action.equals("postMaxScore")) {
				return handlePostMaxScore(request, response, run);
			}
		} else {
			
			ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
			String result = (String) run.getProject().accept(typeVisitor);
			
			if (result.equals("LDProject")) {
				User user = ControllerUtil.getSignedInUser();
				
				//check that the user has read or write permission on the run
				if(user.isAdmin() ||
						this.runService.hasRunPermission(run, user, BasePermission.WRITE) ||
						this.runService.hasRunPermission(run, user, BasePermission.READ)){
					String portalurl = ControllerUtil.getBaseUrlString(request);
	
			    	String getGradeWorkUrl = portalurl + "/vlewrapper/vle/gradework.html";
					String getGradingConfigUrl = portalurl + "/webapp/request/info.html?action=getVLEConfig&runId=" + run.getId().toString() + "&gradingType=" + gradingType + "&requester=grading&getRevisions=" + getRevisions;
					
					//get the classroom monitor urls
					String getClassroomMonitorUrl = portalurl + "/vlewrapper/vle/classroomMonitor.html";
					String getClassroomMonitorConfigUrl = portalurl + "/webapp/request/info.html?action=getVLEConfig&runId=" + run.getId().toString() + "&gradingType=" + gradingType + "&requester=grading&getRevisions=" + getRevisions;
					
					String curriculumBaseWWW = portalProperties.getProperty("curriculum_base_www");
					String rawProjectUrl = (String) run.getProject().getCurnit().accept(new CurnitGetCurnitUrlVisitor());
					String contentUrl = curriculumBaseWWW + rawProjectUrl;
					
					ModelAndView modelAndView = new ModelAndView();
					modelAndView.addObject(RUN_ID, runId);
					modelAndView.addObject("run", run);
					modelAndView.addObject("getGradeWorkUrl", getGradeWorkUrl);
					modelAndView.addObject("getGradingConfigUrl", getGradingConfigUrl);
					modelAndView.addObject("getClassroomMonitorUrl", getClassroomMonitorUrl);
					modelAndView.addObject("getClassroomMonitorConfigUrl", getClassroomMonitorConfigUrl);
					modelAndView.addObject("contentUrl", contentUrl);
					
					//set the permission variable so that we can access it in the .jsp
					if(this.runService.hasRunPermission(run, user, BasePermission.WRITE)) {
						modelAndView.addObject("permission", "write");						
					} else if(this.runService.hasRunPermission(run, user, BasePermission.READ)) {
						modelAndView.addObject("permission", "read");
					}
					
					// if user requests minified/unminified, set it here. Otherwise, default to minified=false.
					if (request.getParameter("minified") != null) {
						modelAndView.addObject("minified", request.getParameter("minified"));
					} else {
						modelAndView.addObject("minified", "false");
					}
					
					return modelAndView;
				} else {
					return new ModelAndView(new RedirectView("../../accessdenied.html"));
				}
			} else if( runId != null ) {
				ECurnitmap curnitMap = gradingService.getCurnitmap(new Long(runId));
				ModelAndView modelAndView = new ModelAndView();
				modelAndView.addObject(RUN_ID, runId);
				modelAndView.addObject(CURNIT_MAP, curnitMap);
				
				return modelAndView;
			} else {
				//throw error
			}
		}
		
		ModelAndView modelAndView = new ModelAndView();
        return modelAndView;
	}

	/**
	 * Handles the saving of max score POSTs
	 * @param request
	 * @param response
	 * @param run
	 * @return
	 */
	private ModelAndView handlePostMaxScore(HttpServletRequest request,
			HttpServletResponse response, Run run) {
		try {
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
			
			//get the current run extras
			String extras = run.getExtras();
			
			JSONObject jsonExtras;
			JSONArray maxScores;
			
			//check if there are extras
			if(extras == null || extras.equals("")) {
				//there are no extras so we will have to create it
				jsonExtras = new JSONObject("{'summary':'','contact':'','title':'','comptime':'','graderange':'','subject':'','techreqs':'','maxScores':[],'author':'','totaltime':''}");
			} else {
				//create a JSONObject from the run extras
				jsonExtras = new JSONObject(extras);
			}
			
			//get the maxScores from the extras
			maxScores = (JSONArray) jsonExtras.get("maxScores");
			
			/*
			 * value to remember if we have updated an existing entry or
			 * need to add a new entry
			 */
			boolean maxScoreUpdated = false;
			
			//loop through all the max scores in the current run extras
			for(int x=0; x<maxScores.length(); x++) {
				//get a max score entry
				JSONObject maxScoreObj = (JSONObject) maxScores.get(x);
				
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
				maxScores.put(newMaxScore);
			}
			
			//save the run extras back
			runService.setExtras(run, jsonExtras.toString());
			
			//send the new max score entry back to the client
			response.getWriter().print(maxScoreReturnJSON);
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
	 * @param gradingService the gradingService to set
	 */
	public void setGradingService(GradingService gradingService) {
		this.gradingService = gradingService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
	
	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
}