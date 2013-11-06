/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.presentation.validators;

import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.group.Group;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.presentation.web.StudentAccountForm;
import org.telscenter.sail.webapp.service.offering.RunService;
/**
 * @author patrick lawler
 * @version $Id:
 */
public class StudentAccountFormValidator extends UserAccountFormValidator {

	private RunService runService;
	
	@SuppressWarnings("unchecked")
	@Override
	public boolean supports(Class clazz) {
		return StudentAccountForm.class.isAssignableFrom(clazz);
	}
	
	@Override
	public void validate(Object userAccountFormIn, Errors errors) {
		super.validate(userAccountFormIn, errors);
    
        if (errors.hasErrors())
            return;

        StudentAccountForm studentAccountForm = (StudentAccountForm) userAccountFormIn;
        StudentUserDetails userDetails = (StudentUserDetails) studentAccountForm.getUserDetails();
        
        if (studentAccountForm.isNewAccount()) {
			if (userDetails.getPassword() == null || userDetails.getPassword().length() < 1 ||
					!userDetails.getPassword().equals(studentAccountForm.getRepeatedPassword())) {
				errors.reject("error.passwords-mismatch",
				"Passwords did not match or were not provided. Matching passwords are required.");
			}
			
			String projectCode = studentAccountForm.getProjectCode();	
			if (projectCode == null || projectCode.length() < 1) {
				errors.reject("error.projectcode-empty",
				"Project Code must be specified. Get this from your teacher.");
				return;
			} else {
				Projectcode projectcode = new Projectcode(projectCode);
				if (!projectcode.isLegalProjectcode()) {
					errors.reject("error.projectcode-invalid",
					"Project Code is invalid. Get this from your teacher.");
					return;
				}
				String runcode = projectcode.getRuncode();
				String periodName = projectcode.getRunPeriod();
				Run run = null;
				try {
					run = runService.retrieveRunByRuncode(runcode);
				} catch (ObjectNotFoundException e) {
					errors.reject("error.projectcode-not-in-db",
					"Project Code is invalid. Get this from your teacher.");					
					return;
				}
				if (run == null) {
					errors.reject("error.projectcode-not-in-db",
					"Project Code is invalid. Get this from your teacher.");					
					return;
				} else {
					boolean periodExists = false;
					Set<Group> periods = run.getPeriods();
					for (Group period : periods) {
						if (periodName.equals(period.getName())) {
							periodExists = true;
						}
					}
					if (!periodExists) {
						errors.reject("error.projectcode-not-in-db",
						"Project Code is invalid. Get this from your teacher.");					
						return;
					}
				}
			}
        }
		
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.gender",
                "error.gender-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.accountQuestion",
                "error.no-accountquestion");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.accountAnswer",
                "error.no-accountanswer");
        
        
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "projectCode", 
        		"error.no-projectcode");

        if (errors.hasErrors())
            userDetails.setPassword("");
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
	
}
