/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.user.UserService;

/**
 * Controller to find project runs for admin users
 * @author Patrick Lawler
 */
@Controller
@RequestMapping("/admin/run/manageprojectruns.html")
public class FindProjectRunsController {
	
	private final static String VIEW = "admin/run/manageprojectruns";
	
	@Autowired
	private RunService runService;
	
	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private Properties wiseProperties;
	
	@RequestMapping(method=RequestMethod.GET)
    protected ModelAndView handleGET(
    		HttpServletRequest request) {

		ModelAndView modelAndView = new ModelAndView();
		List<Run> runList = new ArrayList<Run>();
		
		// check if runLookupType was passed in, can be ["runId","projectId","teacherUsername"]
		String runLookupType = request.getParameter("runLookupType");
		String runLookupValue = request.getParameter("runLookupValue");

		if (runLookupType != null && runLookupValue != null) {
			if ("runId".equals(runLookupType)) {
				runList = this.getRunListByRunId(Long.parseLong(runLookupValue));
			} else if ("projectId".equals(runLookupType)) {
				runList = this.getRunListByProjectId(Long.parseLong(runLookupValue));
			} else if ("teacherUsername".equals(runLookupType)) {
				runList = this.getRunListByUsername(runLookupValue);
			} else if ("runTitle".equals(runLookupType)) {
			    runList = this.getRunListByRunTitle(runLookupValue);
			}
		}
		
		modelAndView = new ModelAndView(VIEW);
		modelAndView.addObject("runList", runList);
		
	    String isRealTimeEnabledStr = wiseProperties.getProperty("isRealTimeEnabled", "false");
		modelAndView.addObject("isRealTimeEnabled", Boolean.valueOf(isRealTimeEnabledStr));
		
		return modelAndView;
    }
	
    /**
     * Returns a <code>List<Run></code> list of any runs that are
     * associated with the given <code>Long</code> project id.
     * 
     * @param projectId
     * @return List<Run> - list of runs associated with the projectId
     */
    private List<Run> getRunListByProjectId(Long projectId) {
		List<Run> runList = new ArrayList<Run>();
    	List<Run> run_list = runService.getAllRunList();
    	List<Project> projectCopies = projectService.getProjectCopies(projectId);
		for (Run run: run_list) {
			if (run.getProject().getId().equals(projectId)) {
				runList.add(run);
			} else {
				for (Project project : projectCopies) {
					if (run.getProject().getId().equals(project.getId())) {
						runList.add(run);
					}
				}
			}
		}		
    	return runList;
    }
    
    /**
     * Returns a <code>List<Run></code> list of runs that are associated
     * with the given <code>String</code> username using the LIKE operator
     * 
     * @param username
     * @return List<Run> - list of runs associated with username using the LIKE operator
     */
    private List<Run> getRunListByUsername(String username) {
        List<Run> allRuns = new ArrayList<Run>();
    	List<User> users = userService.retrieveUsersByUsername(username);
    	for (User user : users) {
    	    List<Run> runListByOwner = runService.getRunListByOwner(user);
    	    allRuns.addAll(runListByOwner);
    	}
    	return allRuns;
    }
    
    /**
     * Returns a <code>List<Run></code> list of runs that are associated
     * with the given <code>Long</code> run id.
     * 
     * @param  runId
     * @return List<Run> - list of runs associated with the runId
     */
    private List<Run> getRunListByRunId(Long runId) {
    	List<Run> runList = new ArrayList<Run>();
    	
    	try {
    		Run run = this.runService.retrieveById(runId);
    		
    		if (run != null) {
        		runList.add(run);
        	}
    	} catch(ObjectNotFoundException e) {
    		e.printStackTrace();
    	}
    	
    	return runList;
    }
    
    /**
     * Returns a <code>List<Run></code> list of runs that have
     * the given run title using the LIKE operator
     * 
     * @param runTitle
     * @return List<Run> - list of runs associated with the runTitle
     */
    private List<Run> getRunListByRunTitle(String runTitle) {
        return this.runService.getRunsByTitle(runTitle);
    }
}
