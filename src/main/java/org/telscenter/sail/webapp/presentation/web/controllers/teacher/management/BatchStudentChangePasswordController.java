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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.management;

import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.acls.domain.BasePermission;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.BatchStudentChangePasswordParameters;
import org.telscenter.sail.webapp.service.offering.RunService;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.NotAuthorizedException;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.group.GroupService;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class BatchStudentChangePasswordController extends SimpleFormController {
	
	private GroupService groupService;
	
	private UserService userService;
	
	private RunService runService;
	
	private AclService<Run> aclService;
	
	private static final String GROUPID_PARAM_NAME = "groupId";
	
	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		Run run = this.runService.retrieveById(Long.parseLong(request.getParameter("runId")));
		
		if(user.isAdmin() ||
				this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(run, BasePermission.WRITE, user)){
			BatchStudentChangePasswordParameters params = new BatchStudentChangePasswordParameters();
			params.setGroupId(Long.parseLong(request.getParameter(GROUPID_PARAM_NAME)));
			params.setTeacherUser(user);
			return params;
		} else {
			throw new NotAuthorizedException("You are not authorized to change these passwords.");
		}
	}
	
	/**
     * On submission of the change student passwords (batch) form,
     * all the students' passwords of the selected group (period)
     * are changed to the new password.
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors) {
    	BatchStudentChangePasswordParameters params = (BatchStudentChangePasswordParameters) command;
    	Long groupId = params.getGroupId();

    	ModelAndView modelAndView = null;
    	Group group = null;
    	try {
			group = groupService.retrieveById(groupId);
//			if (!(group.getMembers().isEmpty())) {
				Iterator<User> membersIter = group.getMembers().iterator();
				while(membersIter.hasNext()) {
					userService.updateUserPassword(membersIter.next(), params.getPasswd1());
				}
	        	modelAndView = new ModelAndView(getSuccessView());
//			} else {
//				modelAndView = new ModelAndView(getFormView());
//			}
		} catch (ObjectNotFoundException e) {
			errors.rejectValue("groupId", "error.illegal-groupId"); // add to error list if not there
			modelAndView = new ModelAndView(getFormView());
		}
    	return modelAndView;
    }
	
	/**
	 * @param groupService the groupService to set
	 */
	public void setGroupService(GroupService groupService) {
		this.groupService = groupService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param aclService the aclService to set
	 */
	public void setAclService(AclService<Run> aclService) {
		this.aclService = aclService;
	}
	
	

}
