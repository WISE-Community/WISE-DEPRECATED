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
package org.wise.portal.presentation.web.controllers.student;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.StaleObjectStateException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate4.HibernateOptimisticLockingFailureException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.project.impl.AddProjectParameters;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.student.AddProjectParametersValidator;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.student.StudentService;

/**
 * The Controller for Add a Project page for WISE students
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
@Controller
@RequestMapping("/student/addproject.html")
public class AddProjectController {

	@Autowired
	private StudentService studentService;
	
	@Autowired
	private AddProjectParametersValidator addprojectparametersValidator;
	
	/**
     * On submission of the Add a Project form, the logged-in user is added to 
     * the project run.
     */
	@RequestMapping(method=RequestMethod.POST)
    protected synchronized ModelAndView onSubmit(@ModelAttribute("addProjectParameters")AddProjectParameters params, 
    		BindingResult result, HttpServletRequest request,
            HttpServletResponse response)
            throws Exception {
    	
    	addprojectparametersValidator.validate(params, result);
		if (result.hasErrors()) {
			return null;
		}
		
		User user = ControllerUtil.getSignedInUser();

    	ModelAndView modelAndView = new ModelAndView();
    	Projectcode projectcode = new Projectcode(params.getProjectcode());
    	try {
			int maxLoop = 100;  // to ensure that the following while loop gets run at most this many times.
			int currentLoopIndex = 0;
			while (currentLoopIndex < maxLoop) {
				try {
					studentService.addStudentToRun(user, projectcode);  // add student to period
					modelAndView = new ModelAndView("student/addprojectsuccess");
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
    		result.rejectValue("projectcode", "student.index.error.illegalRunCode");
    		return modelAndView;
    	} catch (PeriodNotFoundException e) {
    		result.rejectValue("projectcode", "student.index.error.illegalRunCode");
    		return modelAndView;
    	} catch (StudentUserAlreadyAssociatedWithRunException se) {
    		result.rejectValue("projectcode", "student.index.error.studentAlreadyAssociatedWithRun");
    		return modelAndView;
    	}
		return modelAndView;
    }
    
    @RequestMapping(method=RequestMethod.GET) 
    public ModelAndView initializeForm(ModelMap model) { 
    	ModelAndView mav = new ModelAndView();
    	mav.addObject("addProjectParameters", new AddProjectParameters());
        return mav; 
    } 
}
