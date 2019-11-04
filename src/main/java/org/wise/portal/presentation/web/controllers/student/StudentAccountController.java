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

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.hibernate.StaleObjectStateException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.HttpSessionRequiredException;
import org.springframework.web.bind.ServletRequestDataBinder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.AccountQuestion;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.RunHasEndedException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.StudentAccountFormValidator;
import org.wise.portal.presentation.web.StudentAccountForm;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for creating and updating WISE student accounts
 * @author Hiroki Terashima
 */
@Controller
@SessionAttributes("studentAccountForm")
@RequestMapping(value = "/legacy/student")
public class StudentAccountController {

  @Autowired
  protected StudentService studentService;

  @Autowired
  protected UserService userService;

  @Autowired
  protected Properties appProperties;

  @Autowired
  private StudentAccountFormValidator studentAccountFormValidator;

  protected static final String USERNAME_KEY = "username";

  /**
   * Creates a new student user and saves to data store
   * @param accountForm the model object that contains values for the page to use when
   * rendering the view
   * @param request the http request object
   * @param modelMap the object that contains values to be displayed on the page
   * @return the path of the view to display
   */
  @Transactional(rollbackFor = {
    DuplicateUsernameException.class, ObjectNotFoundException.class,
    PeriodNotFoundException.class, HibernateOptimisticLockingFailureException.class,
    StaleObjectStateException.class})
  @RequestMapping(value = "/join", method = RequestMethod.POST)
  public synchronized String createStudent(
      @ModelAttribute("studentAccountForm") StudentAccountForm accountForm,
      BindingResult result,
      HttpServletRequest request,
      SessionStatus status,
      ModelMap modelMap) {
    StudentUserDetails userDetails = (StudentUserDetails) accountForm.getUserDetails();
    userDetails.setSignupdate(Calendar.getInstance().getTime());
    Calendar birthday       = Calendar.getInstance();
    int birthmonth = Integer.parseInt(accountForm.getBirthmonth());
    int birthdate = Integer.parseInt(accountForm.getBirthdate());
    birthday.set(Calendar.MONTH, birthmonth - 1);  // month is 0-based
    birthday.set(Calendar.DATE, birthdate);
    userDetails.setBirthday(birthday.getTime());
    userDetails.setLanguage(appProperties.getProperty("defaultLocale", "en"));

    studentAccountFormValidator.validate(accountForm, result);
    if (result.hasErrors()) {
      return "student/join";
    }

    try {
      User newStudentUser = userService.createUser(userDetails);
      String view = addNewStudentToRun(accountForm, result, newStudentUser);
      if (view != null) {
        return view;
      }
    } catch (DuplicateUsernameException e) {
      result.rejectValue("userDetails.username", "error.duplicate-username",
          new Object[] { userDetails.getUsername() }, "Duplicate Username.");
      return "student/join";
    }

    status.setComplete();
    modelMap.put(USERNAME_KEY, userDetails.getUsername());
    return "student/joinsuccess";
  }

  /**
   * Adds the new student account to a run
   * @param accountForm the model object that contains values for the page to use when rendering the view
   * @param bindingResult the object used for validation in which errors will be stored
   * @param newStudentUser student account that was just created prior to this call
   * @return the path of the view to display
   */
  public String addNewStudentToRun(
      @ModelAttribute("studentAccountForm") StudentAccountForm accountForm,
      BindingResult bindingResult,
      User newStudentUser) {
    Projectcode projectcode = new Projectcode(accountForm.getProjectCode());
    int maxLoopAllowed = 100;
    int currentLoopIndex = 0;
    while (currentLoopIndex < maxLoopAllowed) {
      try {
        studentService.addStudentToRun(newStudentUser, projectcode);
      } catch (HibernateOptimisticLockingFailureException holfe) {
        // multiple students tried to create an account at the same time, resulting in this exception. try saving again.
        currentLoopIndex++;
        continue;
      } catch (StaleObjectStateException sose) {
        // multiple students tried to create an account at the same time, resulting in this exception. try saving again.
        currentLoopIndex++;
        continue;
      } catch (ObjectNotFoundException e) {
        bindingResult.rejectValue("projectCode", "error.illegal-projectcode");
        return "student/join";
      } catch (PeriodNotFoundException e) {
        bindingResult.rejectValue("projectCode", "error.illegal-projectcode");
        return "student/join";
      } catch (StudentUserAlreadyAssociatedWithRunException e) {
        bindingResult.rejectValue("projectCode",
            "student.index.error.studentAlreadyAssociatedWithRun");
        return "student/join";
      } catch (RunHasEndedException e) {
        bindingResult.rejectValue("projectCode", "student.index.error.RunHasEnded");
        return "student/join";
      }
      // if it reaches here, it means there were no issues, so we can exit the loop.
      break;
    }
    return null;
  }

  /**
   * Updates an existing student record
   * @param accountForm the model object that contains values for the page to use
   *                    when rendering the view
   * @param bindingResult the object used for validation in which errors will be stored
   * @param request the http request object
   * @param modelMap the object that contains values to be displayed on the page
   * @return the path of the view to display
   */
  @RequestMapping(value = "/updatestudentaccount.html", method = RequestMethod.POST)
  protected String updateExitingStudent(
      @ModelAttribute("studentAccountForm") StudentAccountForm accountForm,
      BindingResult bindingResult,
      HttpServletRequest request,
      SessionStatus status,
      ModelMap modelMap) {
    StudentUserDetails userDetails = (StudentUserDetails) accountForm.getUserDetails();
    User user = userService.retrieveUserByUsername(userDetails.getUsername());
    StudentUserDetails studentUserDetails = (StudentUserDetails) user.getUserDetails();
    studentUserDetails.setLanguage(userDetails.getLanguage());
    String userLanguage = userDetails.getLanguage();
    Locale locale = null;
    if (userLanguage.contains("_")) {
      String language = userLanguage.substring(0, userLanguage.indexOf("_"));
      String country = userLanguage.substring(userLanguage.indexOf("_")+1);
      locale = new Locale(language, country);
    } else {
      locale = new Locale(userLanguage);
    }
    request.getSession().setAttribute(SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME, locale);
    userService.updateUser(user);
    request.getSession().setAttribute(User.CURRENT_USER_SESSION_KEY, user);
    status.setComplete();
    return "student/updatestudentaccountsuccess";
  }

  /**
   * When the session is expired, send student back to form page
   */
  @ExceptionHandler(HttpSessionRequiredException.class)
  public ModelAndView studentSessionExpired(HttpServletRequest request) {
    ModelAndView mav = new ModelAndView();
    String domain = ControllerUtil.getBaseUrlString(request);
    String domainWithPort = domain + ":" + request.getLocalPort();
    String referrer = request.getHeader("referer");
    String contextPath = request.getContextPath();
    String registerUrl = contextPath + "/legacy/student/join";
    String updateAccountInfoUrl = contextPath + "/legacy/student/updatestudentaccount.html";

    if (referrer != null &&
        (referrer.contains(domain + registerUrl) ||
        referrer.contains(domainWithPort + registerUrl))) {
      mav.setView(new RedirectView(registerUrl));
    } else if (referrer != null &&
        (referrer.contains(domain + updateAccountInfoUrl) ||
        referrer.contains(domainWithPort + updateAccountInfoUrl))) {
      mav.setView(new RedirectView(contextPath + "/index.html"));
    } else {
      mav.setView(new RedirectView(contextPath + "/index.html"));
    }
    return mav;
  }

  @RequestMapping(value = "/join", method = RequestMethod.GET)
  public String initializeFormNewStudent(ModelMap model) {
    model.put("genders", Gender.values());
    model.put("accountQuestions",AccountQuestion.values());
    String supportedLocales = appProperties.getProperty(
        "supportedLocales", "en,zh_TW,zh_CN,nl,he,ja,ko,es,pt,tr");
    model.put("languages", supportedLocales.split(","));
    model.addAttribute("studentAccountForm", new StudentAccountForm());
    return "student/join";
  }

  @RequestMapping(value = "/updatestudentaccount.html", method = RequestMethod.GET)
  public String initializeFormExistingStudent(ModelMap model) {
    User user = ControllerUtil.getSignedInUser();
    model.put("genders", Gender.values());
    model.put("accountQuestions",AccountQuestion.values());
    String supportedLocales = appProperties.getProperty(
        "supportedLocales", "en,zh_TW,zh_CN,nl,he,ja,ko,es,pt,tr");
    model.put("languages", supportedLocales.split(","));
    model.addAttribute("studentAccountForm",
        new StudentAccountForm((StudentUserDetails) user.getUserDetails()));
    return "student/updatestudentaccount";
  }

  @InitBinder
  protected void initBinder(ServletRequestDataBinder binder) throws Exception {
    binder.registerCustomEditor(Date.class,
      new CustomDateEditor(new SimpleDateFormat("MM/dd"), false)
    );
  }
}
