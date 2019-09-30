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
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.impl.ChangeStudentPasswordParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.ChangePasswordParametersValidator;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * @author Patrick Lawler
 * @author Hiroki Terashima
 */
@Controller
@SessionAttributes("changeStudentPasswordParameters")
@RequestMapping(value = {
  "/student/changestudentpassword.html",
  "/**/changepassword.html",
  "/teacher/management/changestudentpassword"})
public class ChangeUserPasswordController {

  @Autowired
  private UserService userService;

  @Autowired
  private StudentService studentService;

  @Autowired
  protected ChangePasswordParametersValidator changePasswordParametersValidator;

  private final static String USER_NAME = "username";

  /**
   * Called before the page is loaded to initialize values
   * @param model the model object that contains values for the page to use when rendering the view
   * @param request the http request
   * @return the path of the view to display
   */
  @RequestMapping(method = RequestMethod.GET)
  public ModelAndView initializeForm(HttpServletRequest request) {
    User signedInUser = ControllerUtil.getSignedInUser();
    String username = request.getParameter(USER_NAME);
    User userToChange;
    User teacherUser = null;
    if (username != null) {
      // the username is provided which means a teacher is changing the password for a student
      userToChange = userService.retrieveUserByUsername(username);
      teacherUser = ControllerUtil.getSignedInUser();
    } else {
      // if username is not specified, assume that logged-in user wants to change his/her own password.
      userToChange = ControllerUtil.getSignedInUser();
    }

    if (canChangePassword(signedInUser, userToChange)) {
      ModelAndView modelAndView = new ModelAndView();
      ChangeStudentPasswordParameters params = new ChangeStudentPasswordParameters();
      params.setUser(userToChange);
      params.setTeacherUser(teacherUser);
      modelAndView.addObject("changeStudentPasswordParameters", params);
      return modelAndView;
    } else {
      ModelAndView modelAndView = new ModelAndView();
      modelAndView.setViewName("errors/accessdenied");
      return modelAndView;
    }
  }

  /**
   * Returns true iff the loggedInUser has permission to change the password
   * of userToChange.
   *  This is true when:
   *  1) loggedInUser is an admin and userToChange is not "admin". (only "admin" can change "admin"'s password)
   *  2) loggedInUser == userToChange
   *  3) loggedInUser is a researcher and userToChange is any student
   *  4) loggedInUser is the teacher of userToChange
   * @param loggedInUser
   * @param userToChange
   * @return
   */
  private boolean canChangePassword(User loggedInUser, User userToChange) {
    return (loggedInUser.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) &&
        !userToChange.getUserDetails().getUsername().equals("admin"))
        || userToChange.equals(loggedInUser)
        || (userToChange.getUserDetails().hasGrantedAuthority(UserDetailsService.STUDENT_ROLE)
        && loggedInUser.getUserDetails().hasGrantedAuthority(UserDetailsService.RESEARCHER_ROLE))
        || (userToChange.getUserDetails().hasGrantedAuthority(UserDetailsService.STUDENT_ROLE)
        && studentService.isStudentAssociatedWithTeacher(userToChange, loggedInUser));
  }

  /**
   * On submission of the Change Student's Password form, the associated student's password
   * in the database gets changed to the submitted password
   * @param params the object that contains values from the form
   * @param bindingResult the object used for validation in which errors will be stored
   * @param sessionStatus the session status object
   * @return the path of the view to display
   *
   */
  @RequestMapping(method = RequestMethod.POST)
  protected ModelAndView onSubmit(
      @ModelAttribute("changeStudentPasswordParameters") ChangeStudentPasswordParameters params,
      HttpServletRequest request,
      BindingResult bindingResult,
      SessionStatus sessionStatus) {
    changePasswordParametersValidator.validate(params, bindingResult);
    if (bindingResult.hasErrors()) {
      return new ModelAndView();
    } else {
      userService.updateUserPassword(params.getUser(), params.getPasswd1());
      sessionStatus.setComplete();
      ModelAndView modelAndView = new ModelAndView();
      String requestPath = getServletPath(request);
      modelAndView.setViewName(requestPath + "success");
      return modelAndView;
    }
  }

  /**
   * Get the servlet path from the request
   * @param request the http request
   * @return the servlet path
   * e.g.
   * /teacher/management/changestudentpassword
   */
  protected String getServletPath(HttpServletRequest request) {
    String servletPath = request.getServletPath();
    int indexOfDotHTML = servletPath.indexOf(".html");
    if (indexOfDotHTML != -1) {
      servletPath = servletPath.substring(0, indexOfDotHTML);
    }
    if (servletPath.indexOf("/") == 0) {
      servletPath = servletPath.substring(1);
    }
    return servletPath;
  }
}
