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
package org.wise.portal.domain.admin;

import java.text.DateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.mail.MessagingException;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.wise.portal.dao.offering.RunDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.mail.IMailFacade;

/**
 * A cron job for TELS portal.
 * 
 * Currently, it gathers the following info:
 * - Number of Runs started in the last day
 * - Number of Teachers and Students that created accounts in the last day
 * - Number of Users that logged in at least once in the last day
 * 
 * It then sends an email to whomever is listening, defined in wiseProperties.
 * 
 * @author hirokiterashima
 * @version $Id:$
 */
public class AdminJob extends QuartzJobBean {

	private IMailFacade mailService = null;

	private Properties wiseProperties = null;
	
	private RunDao<Run> runDao;
	
	private UserDao<User> userDao;
	
	private Date yesterday = null;
	
	private Date today = null;
	
	{
		Calendar todayCal = Calendar.getInstance();
		today = new java.sql.Date(todayCal.getTimeInMillis());
		todayCal.add(Calendar.DATE, -1);
		yesterday = new java.sql.Date(todayCal.getTimeInMillis());
	}

	/**
	 * @see org.springframework.scheduling.quartz.QuartzJobBean#executeInternal(org.quartz.JobExecutionContext)
	 */
	protected void executeInternal(JobExecutionContext ctx) throws JobExecutionException {
		String messageBody = getSummaryMessage();
		sendEmail(messageBody);
	}


	public String getSummaryMessage() {
		// do the actual work
		String messageBody = "";
		DateFormat df = DateFormat.getDateInstance(DateFormat.LONG);

		List<Run> runsCreatedSinceYesterday = findRunsCreatedSinceYesterday();
		messageBody += "Number of Runs started between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ runsCreatedSinceYesterday.size() + "\n";
		
		// show info about the run
		for (Run run : runsCreatedSinceYesterday) {
			messageBody += "\tProject:" + run.getProject().getName();
			Set<User> owners = run.getOwners();
			User owner = owners.iterator().next();
			TeacherUserDetails teacherUserDetails = (TeacherUserDetails) owner.getUserDetails();
			String schoolName = teacherUserDetails.getSchoolname();
			String schoolCity = teacherUserDetails.getCity();
			String schoolState = teacherUserDetails.getState();
			
			messageBody += "\n\tTeacher Username:" + teacherUserDetails.getUsername();
			messageBody += "\n\tTeacher School Info: " + schoolName + ", " + schoolCity + ", " + schoolState;
			messageBody += "\n\n";
		}
		 
		List<User> teachersJoinedSinceYesterday = findUsersJoinedSinceYesterday("teacherUserDetails");
		messageBody += "\n\n";
		messageBody += "Number of Teachers joined between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ teachersJoinedSinceYesterday.size();

		List<User> studentsJoinedSinceYesterday = findUsersJoinedSinceYesterday("studentUserDetails");
		messageBody += "\n\n";
		messageBody += "Number of Students joined between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ studentsJoinedSinceYesterday.size();
		
		// Number of Users that logged in at least once in the last day
		List<User> studentsWhoLoggedInSinceYesterday = findUsersWhoLoggedInSinceYesterday("studentUserDetails");
		List<User> teachersWhoLoggedInSinceYesterday = findUsersWhoLoggedInSinceYesterday("teacherUserDetails");
		int totalNumUsersLoggedInSinceYesterday = studentsWhoLoggedInSinceYesterday.size() + teachersWhoLoggedInSinceYesterday.size();
		messageBody += "\n\n";
		messageBody += "Number of users who logged in at least once between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ totalNumUsersLoggedInSinceYesterday;
		return messageBody;
	}


	public List<User> findUsersJoinedSinceYesterday(String who) {
		String field = "signupdate";
		String type = ">";
		Object term = yesterday;
		String classVar = who;

		List<User> usersJoinedSinceYesterday =
			userDao.retrieveByField(field, type, term, classVar);
		
		return usersJoinedSinceYesterday;
	}


	/**
	 * Finds number of runs that were created since yesterday
	 */
	public List<Run> findRunsCreatedSinceYesterday() {
		String field = "starttime";
		String type = ">";
		Object term = yesterday;
		List<Run> runsStartedSinceYesterday = 
			runDao.retrieveByField(field, type, term);

		return runsStartedSinceYesterday;
	}

	public List<User> findUsersWhoLoggedInSinceYesterday(String who) {
		String field = "lastLoginTime";
		String type = ">";
		Object term = yesterday;
		String classVar = who;

		List<User> usersJoinedSinceYesterday =
			userDao.retrieveByField(field, type, term, classVar);
		
		return usersJoinedSinceYesterday;		
	}
	
	public void sendEmail(String message) {
		String[] recipients = wiseProperties.getProperty("uber_admin").split(",");
		
		String subject = "Daily Admin Report on Portal: "
		    + " (" + wiseProperties.getProperty("wise.name") + ")";		

		String msg = message;
		
		String fromEmail = "wise_gateway@berkeley.edu";
		
		//sends the email to the recipients
		try {
			mailService.postMail(recipients, subject, msg, fromEmail);
		} catch (MessagingException e) {
		}
	}
	
	
	/**
	 * @param mailService the mailService to set
	 */
	public void setMailService(IMailFacade mailService) {
		this.mailService = mailService;
	}

	/**
	 * @param wiseProperties the wiseProperties to set
	 */
	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}

	/**
	 * @param runDao the runDao to set
	 */
	public void setRunDao(RunDao<Run> runDao) {
		this.runDao = runDao;
	}

	/**
	 * @param userDao the userDao to set
	 */
	public void setUserDao(UserDao<User> userDao) {
		this.userDao = userDao;
	}
	
	/**
	 * @param yesterday the yesterday to set
	 */
	public void setYesterday(Date yesterday) {
		this.yesterday = yesterday;
	}


	/**
	 * @param today the today to set
	 */
	public void setToday(Date today) {
		this.today = today;
	}
}
