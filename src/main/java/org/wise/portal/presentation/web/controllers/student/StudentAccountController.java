/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.StaleObjectStateException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.orm.hibernate4.HibernateOptimisticLockingFailureException;
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
 *
 * @author Hiroki Terashima
 */
@Controller
@SessionAttributes("studentAccountForm")
public class StudentAccountController {
	
	@Autowired
	protected StudentService studentService;

	@Autowired
	protected UserService userService;

	@Autowired
	private StudentAccountFormValidator studentAccountFormValidator;
	
	protected static final String USERNAME_KEY = "username";
	
	/**
	 * On submission of the signup form, a user is created and saved to the data
	 * store.
	 */
	@Transactional(rollbackFor = { 
			DuplicateUsernameException.class, ObjectNotFoundException.class, 
			PeriodNotFoundException.class, HibernateOptimisticLockingFailureException.class,
			StaleObjectStateException.class})
	@RequestMapping(value = {"/student/join", "/student/updatestudentaccount.html"}, method = RequestMethod.POST)
	public synchronized String onSubmit(@ModelAttribute("studentAccountForm") StudentAccountForm accountForm, 
			BindingResult result,
			HttpServletRequest request,
			HttpServletResponse response,
			SessionStatus status,			
			ModelMap modelMap)
	throws Exception {
		StudentUserDetails userDetails = (StudentUserDetails) accountForm.getUserDetails();
		if (accountForm.isNewAccount()) {
			userDetails.setSignupdate(Calendar.getInstance().getTime());
			Calendar birthday       = Calendar.getInstance();
			int birthmonth = Integer.parseInt(accountForm.getBirthmonth());
			int birthdate = Integer.parseInt(accountForm.getBirthdate());
			birthday.set(Calendar.MONTH, birthmonth-1);  // month is 0-based
			birthday.set(Calendar.DATE, birthdate);
			userDetails.setBirthday(birthday.getTime());
		}
		
		studentAccountFormValidator.validate(accountForm, result);
		if (result.hasErrors()) {
			return "student/join";
		}

		String referrer = request.getHeader("referer");

		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
		
		String registerUrl = contextPath + "/student/join";
		String updateAccountInfoUrl = contextPath + "/student/updatestudentaccount.html";
		
		if (referrer != null &&
				(referrer.contains(registerUrl) ||
  				 referrer.contains(updateAccountInfoUrl) )) {
	
			if (accountForm.isNewAccount()) {
				try {
					//get the first name and last name
					String firstName = userDetails.getFirstname();
					String lastName = userDetails.getLastname();

					//check if first name and last name only contain letters
					Pattern pattern = Pattern.compile("[a-zA-Z]*");
					Matcher firstNameMatcher = pattern.matcher(firstName);
					Matcher lastNameMatcher = pattern.matcher(lastName);
					
					if(!firstNameMatcher.matches()) {
						//first name contains non letter characters
						result.rejectValue("userDetails.firstname", "error.firstname-illegal-characters");
			    		return "student/join";
					}
					
					if(!lastNameMatcher.matches()) {
						//last name contains non letter characters
						result.rejectValue("userDetails.lastname", "error.lastname-illegal-characters");
			    		return "student/join";
					}
					
					User user = userService.createUser(userDetails);
					Projectcode projectcode = new Projectcode(accountForm.getProjectCode());
					
					int maxLoop = 100;  // to ensure that the following while loop gets run at most this many times.
					int currentLoopIndex = 0;
					while (currentLoopIndex < maxLoop) {
						try {
							studentService.addStudentToRun(user, projectcode);  // add student to period
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
				} catch (DuplicateUsernameException e) {
					result.rejectValue("userDetails.username", "error.duplicate-username",
							new Object[] { userDetails.getUsername() }, "Duplicate Username.");
		    		return "student/join";
				} catch (ObjectNotFoundException e) {
					result.rejectValue("projectCode", "error.illegal-projectcode");
		    		return "student/join";
		    	} catch (PeriodNotFoundException e) {
		    		result.rejectValue("projectCode", "error.illegal-projectcode");
		    		return "student/join";
		    	}
			} else {
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
				// update user in session
				request.getSession().setAttribute(
						User.CURRENT_USER_SESSION_KEY, user);
				
				//clear the command object from the session
				status.setComplete(); 

				return "student/updatestudentaccountsuccess";
			}
			
			//clear the command object from the session
			status.setComplete(); 
	
			modelMap.put(USERNAME_KEY, userDetails.getUsername());
			return "student/joinsuccess";
		} else {
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
	}
	
	/**
	 * When the session is expired, send student back to form page
	 */
	@ExceptionHandler(HttpSessionRequiredException.class)
	public ModelAndView handleRegisterStudentSessionExpired(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		String domain = ControllerUtil.getBaseUrlString(request);
		String domainWithPort = domain + ":" + request.getLocalPort();
		String referrer = request.getHeader("referer");

		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
		
		String registerUrl = contextPath + "/student/join";
		String updateAccountInfoUrl = contextPath + "/student/updatestudentaccount.html";
		
		if(referrer != null && 
				(referrer.contains(domain + registerUrl) || 
				 referrer.contains(domainWithPort + registerUrl))) {
			// if student was on register page, have them re-fill out the form.
			mav.setView(new RedirectView(registerUrl));
		} else if (referrer != null && 
				(referrer.contains(domain + updateAccountInfoUrl) ||
						 referrer.contains(domainWithPort + updateAccountInfoUrl))) {
			// if student was on update account page, redirect them back to home page
			mav.setView(new RedirectView(contextPath+"/index.html"));
		} else {
			// if student was on any other page, redirect them back to home page
			mav.setView(new RedirectView(contextPath+"/index.html"));
		}
		return mav;
	}

    @RequestMapping(value = "/student/join", method = RequestMethod.GET)
    public String initializeFormNewStudent(ModelMap model) { 
		model.put("genders", Gender.values());
		model.put("accountQuestions",AccountQuestion.values());
		model.put("languages", new String[]{"en_US", "zh_TW", "zh_CN", "nl", "he", "ja", "ko", "es"});
		model.addAttribute("studentAccountForm", new StudentAccountForm());
        return "student/join";
    } 
    
    @RequestMapping(value = "/student/updatestudentaccount.html", method = RequestMethod.GET)
    public String initializeFormExistingStudent(ModelMap model) { 
		User user = ControllerUtil.getSignedInUser();
		model.put("genders", Gender.values());
		model.put("accountQuestions",AccountQuestion.values());
		model.put("languages", new String[]{"en_US", "zh_TW", "zh_CN", "nl", "he", "ja", "ko", "es"});
		model.addAttribute("studentAccountForm",  new StudentAccountForm((StudentUserDetails) user.getUserDetails()));
        return "student/updatestudentaccount"; 
    } 
    
	@InitBinder
	protected void initBinder(ServletRequestDataBinder binder) throws Exception
	{
	  binder.registerCustomEditor(Date.class,
	    new CustomDateEditor(new SimpleDateFormat("MM/dd"), false)
	  );
	}
}