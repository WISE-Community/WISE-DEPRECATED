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

import org.springframework.beans.factory.annotation.Autowired;
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
 */
public class WISESimpleMappingExceptionResolver extends SimpleMappingExceptionResolver {

  @Autowired
  protected IMailFacade mailService;

  @Autowired
  private Properties appProperties;

  private static final String HANDLE_EXCEPTION_PROPERTY_KEY = "handle_exception";

  private static final String HANDLE_EXCEPTION_MAIL_SUBJECT = "WISE Exception Report";

  @Override
  public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response,
      Object handler, Exception exception) {
    exception.printStackTrace();
    String sendEmailOnExceptionStr = appProperties.getProperty("send_email_on_exception");
    boolean sendEmailOnException = sendEmailOnExceptionStr.equalsIgnoreCase("true");

    if (sendEmailOnException) {
      String portalName = appProperties.getProperty("wise.name");
      String[] recipients = appProperties.getProperty(HANDLE_EXCEPTION_PROPERTY_KEY).split(",");
      String subject = HANDLE_EXCEPTION_MAIL_SUBJECT + ": (" + portalName + ")";
      String fromEmail = appProperties.getProperty("mail.from");
      String message = getHandleExceptionMessage(request, exception);

      ExceptionEmailSender emailSender =
          new ExceptionEmailSender(recipients,subject,fromEmail,message);
      Thread thread = new Thread(emailSender);
      thread.start();
    }
    return super.resolveException(request, response, handler, exception);
  }

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
  private String getHandleExceptionMessage(HttpServletRequest request, Exception exception) {
    Date time = Calendar.getInstance().getTime();
    User user = ControllerUtil.getSignedInUser();

    String fullUrl = request.getScheme() + "://" + request.getServerName() + ":" +
        request.getServerPort() + request.getRequestURI() + "?" +
        request.getQueryString();

    Writer result = new StringWriter();
    PrintWriter printWriter = new PrintWriter(result);
    exception.printStackTrace(printWriter);
    String stackTrace = result.toString();
    String username = "";

    if (user != null) {
      username = user.getUserDetails().getUsername();
    } else {
      username = "unknown";
    }

    String message = "The following WISE exception was thrown on " +
        time.toString() + "\n\n" +
        "username: " + username + "\n" +
        "url: " + fullUrl + "\n\n" +
        "exception message: " + exception.toString() + "\n\n" +
        "stacktrace:\n" + stackTrace;

    return message;
  }
}
