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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.FindProjectParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.FindProjectParametersValidator;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.user.UserService;

/**
 * Controller to find project runs for admin users
 * @author patrick lawler
 */
@Controller
@RequestMapping("/admin/run/findprojectruns*")
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
	
	@Autowired
	private FindProjectParametersValidator findProjectParametersValidator;
	
	@RequestMapping(method=RequestMethod.POST)
    protected ModelAndView onSubmit(@ModelAttribute("findProjectParameters")FindProjectParameters param, 
    		BindingResult result) {

		findProjectParametersValidator.validate(param, result);
		if (result.hasErrors()) {
			return null;
		}
		
		boolean isRealTimeEnabled = false;
		
	    String isRealTimeEnabledStr = wiseProperties.getProperty("isRealTimeEnabled");
	    
	    if (isRealTimeEnabledStr != null) {
	    	isRealTimeEnabled = Boolean.valueOf(isRealTimeEnabledStr);
	    }

		ModelAndView modelAndView = new ModelAndView();
		List<Run> runList = new ArrayList<Run>();
		
		/* The validation should have ensured that only one of the parameter
		 * fields has a value, so we will just set the run list based on the
		 * field with a value. */
		if(param.getProjectId() != null && !param.getProjectId().equals("")){
			runList = this.getRunListByProjectId(Long.parseLong(param.getProjectId()));
		}
		
		if(param.getUserName() != null && !param.getUserName().equals("")){
			runList = this.getRunListByUsername(param.getUserName());
		}
		
		if(param.getRunId() != null && !param.getRunId().equals("")){
			runList = this.getRunListByRunId(Long.parseLong(param.getRunId()));
		}

		modelAndView = new ModelAndView(VIEW);
		modelAndView.addObject("runList", runList);
		modelAndView.addObject("isRealTimeEnabled", isRealTimeEnabled);
		
		return modelAndView;
    }
	
    @RequestMapping(method=RequestMethod.GET) 
    public ModelAndView initializeForm(ModelMap model) { 
    	ModelAndView mav = new ModelAndView();
    	mav.addObject("findProjectParameters", new FindProjectParameters());
        return mav; 
    } 
	
    /**
     * Returns a <code>List<Run></code> list of any runs that are
     * associated with the given <code>Long</code> project id.
     * 
     * @param Long - projectId
     * @return List<Run> - list of runs associated with the projectId
     */
    private List<Run> getRunListByProjectId(Long projectId){
		List<Run> runList = new ArrayList<Run>();
		
    	List<Run> run_list = runService.getAllRunList();
    	List<Project> projectCopies = projectService.getProjectCopies(projectId);
		for(Run run: run_list){
			if(run.getProject().getId().equals(projectId)) {
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
     * with the given <code>String</code> username.
     * 
     * @param String - username
     * @return List<Run> - list of runs associated with username
     */
    private List<Run> getRunListByUsername(String username){
    	User user = userService.retrieveUserByUsername(username);
    	return runService.getRunListByOwner(user);
    }
    
    /**
     * Returns a <code>List<Run></code> list of runs that are associated
     * with the given <code>Long</code> run id.
     * 
     * @param Long - runId
     * @return List<Run> - list of runs associated with the runId
     */
    private List<Run> getRunListByRunId(Long runId){
    	List<Run> runList = new ArrayList<Run>();
    	
    	try{
    		Run run = this.runService.retrieveById(runId);
    		
    		if(run != null){
        		runList.add(run);
        	}
    	} catch(ObjectNotFoundException e){
    		e.printStackTrace();
    	}
    	
    	return runList;
    }
}
