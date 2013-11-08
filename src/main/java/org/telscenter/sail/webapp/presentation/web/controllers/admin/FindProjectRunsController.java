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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.UserService;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.FindProjectParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author patrick lawler
 *
 */
public class FindProjectRunsController extends SimpleFormController{
	
	private final static String VIEW = "admin/run/manageallprojectruns";
	
	private RunService runService;
	
	private ProjectService projectService;
	
	private UserService userService;

    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors){

		ModelAndView modelAndView = new ModelAndView();
		FindProjectParameters param = (FindProjectParameters) command;
	
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

		return modelAndView;
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
    	List<Run> runList = new ArrayList<Run>();
    	List<Run> run_list = runService.getAllRunList();
    	User user = userService.retrieveUserByUsername(username);
    	for(Run run : run_list){
    		if(run.getOwners().contains(user)){
    			runList.add(run);
    		}
    	}
    	
    	return runList;
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
    
	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
}
