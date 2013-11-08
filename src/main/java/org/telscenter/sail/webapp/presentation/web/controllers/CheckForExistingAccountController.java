package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.UserService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;

public class CheckForExistingAccountController extends AbstractController {

	protected UserService userService = null;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		//get the account type 'student' or 'teacher'
		String accountType = request.getParameter("accountType");
		
		if(accountType != null) {
			String[] fields = null;
			String[] values = null;
			String classVar = "";
			
			if(accountType.equals("student")) {
				/*
				 * we are looking for a student so we will look for a student account with
				 * a matching first name, last name, birth month, and birth day 
				 */
				
				String firstName = request.getParameter("firstName");
				String lastName = request.getParameter("lastName");
				String birthMonth = request.getParameter("birthMonth");
				String birthDay = request.getParameter("birthDay");
				
				fields = new String[4];
				fields[0] = "firstname";
				fields[1] = "lastname";
				fields[2] = "birthmonth";
				fields[3] = "birthday";
				
				values = new String[4];
				values[0] = firstName;
				values[1] = lastName;
				values[2] = birthMonth;
				values[3] = birthDay;
				
				classVar = "studentUserDetails";
			} else if(accountType.equals("teacher")) {
				/*
				 * we are looking for a teacher so we will look for a teacher account with
				 * a matching first name, last name 
				 */
				
				String firstName = request.getParameter("firstName");
				String lastName = request.getParameter("lastName");
				
				fields = new String[2];
				fields[0] = "firstname";
				fields[1] = "lastname";
				
				values = new String[2];
				values[0] = firstName;
				values[1] = lastName;
				
				classVar = "teacherUserDetails";
			}
			
			//find all the accounts with matching values
			List<User> accountsThatMatch = userService.retrieveByFields(fields, values, classVar);
			
			//our array to store the user names we have found
			JSONArray existingUserNames = new JSONArray();
			
			//loop through all the accounts that match
			for(int x=0; x<accountsThatMatch.size(); x++) {
				//get an account
				User user = accountsThatMatch.get(x);
				
				//get the user name
				String userName = user.getUserDetails().getUsername();
				
				//add the user name to our array
				existingUserNames.put(userName);
			}
			
			//write the JSONArray to the response
			response.getWriter().write(existingUserNames.toString());
		}
		
		return null;
	}

	public void setUserService(UserService userService) {
        this.userService = userService;
    }
}
