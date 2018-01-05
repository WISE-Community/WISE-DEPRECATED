/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher.management;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.teacher.management.RemoveStudentFromRunParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.teacher.management.RemoveStudentFromRunParametersValidator;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for removing students from <code>Run</code>, thereby
 * removing any association the student has with the run and its teacher,
 * as well as their work.
 *
 * @author Hiroki Terashima
 */
@Controller
@SessionAttributes("removeStudentFromRunParameters")
@RequestMapping("/teacher/management/removestudentfromrun.html")
public class RemoveStudentFromRunController {

  @Autowired
  private RunService runService;

  @Autowired
  private StudentService studentService;

  @Autowired
  private UserService userService;

  @Autowired
  protected RemoveStudentFromRunParametersValidator removeStudentFromRunParametersValidator;

  protected String formView = "teacher/management/removestudentfromrun";

  protected String successView = "teacher/management/removestudentfromrunsuccess";

  private static final String RUNID_PARAM_NAME = "runId";

  private static final String USERID_PARAM_NAME = "userId";

  /**
   * Called before the page is loaded to initialize values
   * @param model the model object that contains values for the page to use when rendering the view
   * @param request the http request object
   * @return the path of the view to display
   */
  @RequestMapping(method=RequestMethod.GET)
  public String initializeForm(ModelMap model, HttpServletRequest request) {
    RemoveStudentFromRunParameters params = new RemoveStudentFromRunParameters();
    params.setRunId(Long.parseLong(request.getParameter(RUNID_PARAM_NAME)));
    params.setUserId(Long.parseLong(request.getParameter(USERID_PARAM_NAME)));
    model.addAttribute("removeStudentFromRunParameters", params);
    return formView;
  }

  /**
   * On submission of the RemoveStudentFromRun form, the selected user is removed
   * from the specified run. She is also removed from the workgroup that she was in
   * for the run.
   * @param params the object that contains values from the form
   * @param bindingResult the object used for validation in which errors will be stored
   * @param sessionStatus the session status object
   * @return the path of the view to display
   */
  @RequestMapping(method = RequestMethod.POST)
  protected String onSubmit(
      @ModelAttribute("removeStudentFromRunParameters") RemoveStudentFromRunParameters params,
      BindingResult bindingResult, SessionStatus sessionStatus) {
    String view = "";
    Long runId = params.getRunId();
    Long userId = params.getUserId();
    Run run = null;
    User studentUser = null;
    removeStudentFromRunParametersValidator.validate(params, bindingResult);
    if (bindingResult.hasErrors()) {
      view = "errors/accessdenied";
    } else {
      try {
        run = runService.retrieveById(runId);
        studentUser = userService.retrieveById(userId);
        User callingUser = ControllerUtil.getSignedInUser();

        if (callingUser.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) ||
          runService.hasRunPermission(run, callingUser, BasePermission.WRITE)) {
          studentService.removeStudentFromRun(studentUser, run);
          view = successView;
          sessionStatus.setComplete();
        } else {
          view = "errors/accessdenied";
        }
      } catch (ObjectNotFoundException e) {
        bindingResult.rejectValue("runId", "error.illegal-runId");
        view = formView;
      }
    }
    return view;
  }
}
