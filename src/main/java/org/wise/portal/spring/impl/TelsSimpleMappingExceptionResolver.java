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
package org.wise.portal.spring.impl;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Calendar;
import java.util.Date;
import java.util.Properties;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.SimpleMappingExceptionResolver;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.mail.IMailFacade;

/**
 * Resolves Exceptions by gathering the following information and
 * sending an email to staff:
 * - Logged-in user
 * - Requested URL
 * - Exception message
 * - Exception Stacktrace
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class TelsSimpleMappingExceptionResolver extends
	SimpleMappingExceptionResolver {
	
	protected IMailFacade mailService;

	private Properties wiseProperties;

	private static final String HANDLE_EXCEPTION_PROPERTY_KEY = "handle_exception";
	
	private static final String HANDLE_EXCEPTION_MAIL_SUBJECT = "WISE 4.0 Exception Report";
	
	private static final String HANDLE_EXCEPTION_FROM_EMAIL = "telsportal@gmail.com";

	/**
	 * @see org.springframework.web.servlet.handler.SimpleMappingExceptionResolver#resolveException(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.lang.Object, java.lang.Exception)
	 */
	@Override
	public ModelAndView resolveException(
			HttpServletRequest request, HttpServletResponse response, Object handler, Exception exception) {
		// send email to programmers
		String sendEmailOnExceptionStr = wiseProperties.getProperty("send_email_on_exception");
		boolean sendEmailOnException = sendEmailOnExceptionStr.equalsIgnoreCase("true");

		if (sendEmailOnException) {
			String portalName = wiseProperties.getProperty("wise.name");
			String[] recipients = wiseProperties.getProperty(HANDLE_EXCEPTION_PROPERTY_KEY).split(",");
			String subject = HANDLE_EXCEPTION_MAIL_SUBJECT + ": (" + portalName + ")";
			String fromEmail = HANDLE_EXCEPTION_FROM_EMAIL;
			String message = getHandleExceptionMessage(request, response, handler, exception);

			ExceptionEmailSender emailSender = 
				new ExceptionEmailSender(recipients,subject,fromEmail,message);
			Thread thread = new Thread(emailSender);
			thread.start();
		}
		return super.resolveException(request, response, handler, exception);
	}
	
	/**
	 * Sends exception email in a new thread.
	 * @author hirokiterashima
	 * @version $Id$
	 */
	class ExceptionEmailSender implements Runnable {
		String[] recipients;
		String subject;
		String fromEmail;
		String message;

		public ExceptionEmailSender(String[] recipients, String subject,
				String fromEmail, String message) {
			this.recipients = recipients;
			this.subject = subject;
			this.fromEmail = fromEmail;
			this.message = message;
		}

		public void run() {
			try {
				mailService.postMail(recipients, subject, message, fromEmail);
			} catch (MessagingException e) {
				e.printStackTrace();
			}
		}
		
	}
	
	/**
	 * Gets the body of the email for this exception. This includes the date
	 * of the exception, the stacktrace of the thrown exception, and other
	 * relevant data for staff to track down the problem.
	 * 
	 * @return A <code>String</code> containing the following:
	 *     - the exception
	 *     - when the exception was thrown
	 *     - user information
	 */
	private String getHandleExceptionMessage(
			HttpServletRequest request, HttpServletResponse response, Object handler, Exception exception) {
		Date time = Calendar.getInstance().getTime();

		User user = ControllerUtil.getSignedInUser();
		
		String fullUrl =
			request.getScheme() + "://" + request.getServerName() + ":" +
			request.getServerPort() + request.getRequestURI() + "?" + 
			request.getQueryString();
		
		// get full stack trace
		Writer result = new StringWriter();
		PrintWriter printWriter = new PrintWriter(result);
		exception.printStackTrace(printWriter);
		String stackTrace = result.toString();
		String username = null;
		
		if (user != null) {
			 username = user.getUserDetails().getUsername();
	    } else {
	    	username = "unknown";
	    }
		
		String message = 
			"The following exception was thrown in the WISE 4.0 Portal on " +
			time.toString() + "\n\n" +
			"username: " + username + "\n" +
			"url: " + fullUrl + "\n\n" +
			"exception message: " + exception.toString() + "\n\n" +
			"stacktrace:\n" + stackTrace;
		
		return message;
	}

	/**
	 * @param mailService is the object that contains the functionality to send
	 * an email. This mailService is set by the contactWiseController bean 
	 * in controllers.xml.
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
}
