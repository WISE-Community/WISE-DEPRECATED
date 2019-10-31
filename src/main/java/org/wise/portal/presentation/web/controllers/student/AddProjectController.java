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
package org.wise.portal.presentation.web.controllers.student;

import org.hibernate.StaleObjectStateException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.RunHasEndedException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.project.impl.AddProjectParameters;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.student.AddProjectParametersValidator;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.student.StudentService;

/**
 * Controller for students to register for a project run
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/student/addproject")
public class AddProjectController {

  @Autowired
  private StudentService studentService;

  @Autowired
  private AddProjectParametersValidator addprojectparametersValidator;

  /**
   * On submission of the Add a Project form, the logged-in user is added to the project run.
   */
  @RequestMapping(method = RequestMethod.POST)
  protected synchronized ModelAndView onSubmit(
      @ModelAttribute("addProjectParameters") AddProjectParameters params,
      BindingResult result) {
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
    } catch (RunHasEndedException e) {
      result.rejectValue("projectcode", "student.index.error.runHasEnded");
    }
    return modelAndView;
  }

  @RequestMapping(method = RequestMethod.GET)
  public ModelAndView initializeForm() {
    ModelAndView mav = new ModelAndView();
    mav.addObject("addProjectParameters", new AddProjectParameters());
    return mav;
  }
}
