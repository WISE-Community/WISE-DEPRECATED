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
package org.telscenter.sail.webapp.presentation.web.controllers.student;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.hibernate.StaleObjectStateException;
import org.springframework.orm.hibernate3.HibernateOptimisticLockingFailureException;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.PeriodNotFoundException;
import org.telscenter.sail.webapp.domain.StudentUserAlreadyAssociatedWithRunException;
import org.telscenter.sail.webapp.domain.impl.AddProjectParameters;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * The Controller for Add a Project page for WISE students
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class AddProjectController extends SimpleFormController {

	private StudentService studentService;

	/**
     * On submission of the Add a Project form, the logged-in user is added to 
     * the project run.
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected synchronized ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors)
            throws Exception {
		User user = ControllerUtil.getSignedInUser();
		// command contains a legally-formatted projectcode.
    	AddProjectParameters params = (AddProjectParameters) command;

    	ModelAndView modelAndView = null;
    	Projectcode projectcode = new Projectcode(params.getProjectcode());
    	try {
			int maxLoop = 100;  // to ensure that the following while loop gets run at most this many times.
			int currentLoopIndex = 0;
			while (currentLoopIndex < maxLoop) {
				try {
					studentService.addStudentToRun(user, projectcode);  // add student to period
					modelAndView = new ModelAndView(getSuccessView());
				} catch (HibernateOptimisticLockingFailureException holfe) {
					// multiple students tried to create an account at the same time, resulting in this exception. try saving again.
					currentLoopIndex++;
					continue;
				} catch (StaleObjectStateException sose) {
					// multiple students tried to create an account at the same time, resulting in this exception. try saving again.
					currentLoopIndex++;
					continue;
				}
				// if it reaches here, it means that hibernate optimisitic locking exception was not thrown, so we can exit the loop.
				break;
			}
    	} catch (ObjectNotFoundException e) {
    		errors.rejectValue("projectcode", "student.index.error.illegalRunCode");
    		return showForm(request, response, errors);
    	} catch (PeriodNotFoundException e) {
    		errors.rejectValue("projectcode", "student.index.error.illegalRunCode");
    		return showForm(request, response, errors);
    	} catch (StudentUserAlreadyAssociatedWithRunException se) {
    		errors.rejectValue("projectcode", "student.index.error.studentAlreadyAssociatedWithRun");
    		return showForm(request, response, errors);
    	}
		return modelAndView;
    }

	/**
	 * @param studentService the studentService to set
	 */
	public void setStudentService(StudentService studentService) {
		this.studentService = studentService;
	}
}
