package org.telscenter.sail.webapp.presentation.web.controllers.teacher.management;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.impl.ChangeStudentPasswordParameters;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * @author patricklawler
 * @author hirokiterashima
 * $Id:$
 */
public class ChangeUserPasswordController extends SimpleFormController {

	private UserService userService;
	
	private StudentService studentService;
	
	private final static String USER_NAME = "userName";
	
	/**
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#showForm(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, org.springframework.validation.BindException)
	 */
    @Override
    protected ModelAndView showForm(HttpServletRequest request,
            HttpServletResponse response,
            BindException errors)
     throws Exception {
    	// first get the logged-in user and check that the user has permission to change the
    	// specified user's password
		User loggedInUser = ControllerUtil.getSignedInUser();
    	String username = request.getParameter(USER_NAME);
    	User userToChange = null;
    	if (username != null) {
    		userToChange = userService.retrieveUserByUsername(username);
    	} else {
    		// if username is not specified, assume that logged-in user wants to change his/her own password.
    		userToChange = loggedInUser;
    	}
    	if (canChangePassword(loggedInUser, userToChange)) {
			return super.showForm(request, response, errors);
		} else {
			// otherwise, the logged-in user does not have permission to change the password.
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}    
	}

    /**
     * Returns true iff the loggedInUser has permission to change the password 
     * of userToChange.
     *  This is true when:
     *  1) loggedInUser is an admin
     *  2) loggedInUser == userToChange
     *  3) loggedInUser is the teacher of userToChange
     * @param loggedInUser
     * @param userToChange
     * @return
     */
    private boolean canChangePassword(User loggedInUser,
			User userToChange) {
		return loggedInUser.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) 
				|| userToChange.equals(loggedInUser)
				|| (userToChange.getUserDetails().hasGrantedAuthority(UserDetailsService.STUDENT_ROLE)
				   && studentService.isStudentAssociatedWithTeacher(userToChange, loggedInUser));
	}

	@Override
    protected Object formBackingObject(HttpServletRequest request) throws Exception {
    	String username = request.getParameter(USER_NAME);
    	User userToChange = null;
    	User teacherUser = null;
    	if (username != null) {
    		//the username is provided which means a teacher is changing the password for a student
    		userToChange = userService.retrieveUserByUsername(username);
    		teacherUser = ControllerUtil.getSignedInUser();
    	} else {
    		// if username is not specified, assume that logged-in user wants to change his/her own password.
    		userToChange = ControllerUtil.getSignedInUser();
    	}
		ChangeStudentPasswordParameters params = new ChangeStudentPasswordParameters();
		params.setUser(userToChange);
		params.setTeacherUser(teacherUser);
		return params;
    }
	
	/**
     * On submission of the Change Student's Password form, the associated student's password
     * in the database gets changed to the submitted password
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors){

    	ChangeStudentPasswordParameters params = (ChangeStudentPasswordParameters) command;

    	ModelAndView modelAndView = null;

   		userService.updateUserPassword(params.getUser(), params.getPasswd1());
    	modelAndView = new ModelAndView(getSuccessView());

    	return modelAndView;
    }
    
	/**
	 * @param userService the userService to set
	 */
    public void setUserService(UserService userService) {
    	this.userService = userService;
    }
    
	/**
	 * @param studentService the studentService to set
	 */
	public void setStudentService(StudentService studentService) {
		this.studentService = studentService;
	}

	/**
	 * @param userService the userService to get
	 */
    public UserService getUserService() {
    	return this.userService;
    }
}
