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
package org.wise.portal.presentation.web.controllers.teacher.grading;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.project.impl.ProjectTypeVisitor;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;

/**
 * A Controller for Grading Student Work
 *
 * @author Geoffrey Kwan
 * @author Patrick Lawler
 * @author Anthony Perritano
 * 
 * @version $Id: $
 */
@Controller
public class GradeWorkController {

	@Autowired
	private RunService runService;
	
	@Autowired
	Properties wiseProperties;

	@RequestMapping(value={"/teacher/grading/gradework.html","/teacher/classroomMonitor/classroomMonitor.html"})
	protected ModelAndView handleRequestInternal(
			@RequestParam("runId") String runId,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		Run run = runService.retrieveById(new Long(runId));
		
		//get the grading type (step or team)
		String gradingType = request.getParameter("gradingType");
		
		//get the boolean whether to get revisions
		String getRevisions = request.getParameter("getRevisions");
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
		
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
	
			    	String getGradeWorkUrl = portalurl + contextPath + "/vle/gradework.html";
					String getGradingConfigUrl = portalurl + contextPath + "/request/info.html?action=getVLEConfig&runId=" + run.getId().toString() + "&gradingType=" + gradingType + "&requester=grading&getRevisions=" + getRevisions;
					
					//get the classroom monitor urls
					String getClassroomMonitorUrl = portalurl + contextPath + "/vle/classroomMonitor.html";
					String getClassroomMonitorConfigUrl = portalurl + contextPath + "/request/info.html?action=getVLEConfig&runId=" + run.getId().toString() + "&gradingType=" + gradingType + "&requester=grading&getRevisions=" + getRevisions;
					
					//set the permission variable so that we can access it in the .jsp
					if(this.runService.hasRunPermission(run, user, BasePermission.WRITE)) {
						getGradeWorkUrl += "?loadScriptsIndividually&permission=write";
						getClassroomMonitorUrl += "?loadScriptsIndividually&permission=write";
					} else if(this.runService.hasRunPermission(run, user, BasePermission.READ)) {
						getGradeWorkUrl += "?loadScriptsIndividually&permission=read";
						getClassroomMonitorUrl += "?loadScriptsIndividually&permission=read";
					}
					
					ModelAndView modelAndView = new ModelAndView("vle");
					modelAndView.addObject("runId", runId);
					modelAndView.addObject("run", run);
					if ("monitor".equals(gradingType)) {
						modelAndView.addObject("vleurl", getClassroomMonitorUrl);
						modelAndView.addObject("vleConfigUrl", getClassroomMonitorConfigUrl);
					} else {
						modelAndView.addObject("vleurl", getGradeWorkUrl);
						modelAndView.addObject("vleConfigUrl", getGradingConfigUrl);
					}
					
					return modelAndView;
				} else {
					return new ModelAndView(new RedirectView("../../accessdenied.html"));
				}
			} else if( runId != null ) {
				ModelAndView modelAndView = new ModelAndView();
				modelAndView.addObject("runId", runId);
				
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
}