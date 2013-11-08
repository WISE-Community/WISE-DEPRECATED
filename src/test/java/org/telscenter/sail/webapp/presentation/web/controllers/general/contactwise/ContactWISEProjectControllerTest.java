/**
 * 
 */
package org.telscenter.sail.webapp.presentation.web.controllers.general.contactwise;

/**
 * @author Patrick
 *
 */


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

import static org.easymock.EasyMock.*;

import java.util.Properties;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.mail.IMailFacade;
import net.sf.sail.webapp.mail.JavaMailHelper;
import net.sf.sail.webapp.mail.JavaMailTest;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.UserService;

import org.springframework.context.ApplicationContext;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE;
import org.telscenter.sail.webapp.domain.general.contactwise.IssueType;
import org.telscenter.sail.webapp.domain.general.contactwise.OperatingSystem;
import org.telscenter.sail.webapp.domain.general.contactwise.WebBrowser;
import org.telscenter.sail.webapp.domain.general.contactwise.impl.ContactWISEGeneral;
import org.telscenter.sail.webapp.domain.general.contactwise.impl.ContactWISEProject;
import org.telscenter.sail.webapp.presentation.web.controllers.ContactWiseController;
import org.telscenter.sail.webapp.presentation.web.controllers.ContactWiseProjectController;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 *
 * @version $Id: ContactWISEControllerTest.java 1651 2008-01-28 20:13:43Z geoff $
 */
public class ContactWISEProjectControllerTest extends AbstractModelAndViewTests {

	private static final String NAME = "Spongebob";
	
	private static final String EMAIL = "spongebob@bikinibottom.com";
	
	private static final String PROJECT_NAME = "Airbags";
	
	private IssueType issueType = IssueType.TROUBLE_LOGGING_IN;
	
	private OperatingSystem operatingSystem = OperatingSystem.MAC_OSX_LEOPARD;
	
	private static final WebBrowser WEBBROWSER = WebBrowser.FIREFOX;
	
	private static final String SUMMARY = "Blerg";
	
	private static final String DESCRIPTION = "Where is my spatula?";
	
	private String [] RECIPIENTS = {"WISE3-trouble-logging-in@googlegroups.com"};
	
	private static final String SUCCESS = "WooHoo";

	private static final String FORM = "Form";

	private MockHttpServletRequest request;

	private HttpServletResponse response;

	private BindException errors;
	
	private ContactWiseProjectController contactController; 
	
	private ContactWISEProject contactDetails;
	
	private IMailFacade mockMail;
	
	private Properties emailListeners;
	
	private Properties uiHTMLProperties;
	
	@SuppressWarnings("unchecked")
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		
		contactDetails = new ContactWISEProject();
		
		errors = new BindException(contactDetails, "");
		mockMail = createMock(IMailFacade.class);
		
		emailListeners = new Properties();
		emailListeners.setProperty("trouble_logging_in", "WISE3-trouble-logging-in@googlegroups.com");
		emailListeners.setProperty("need_help_using_wise", "WISE3-need-help-using@googlegroups.com");
		emailListeners.setProperty("project_problems", "WISE3-project-problems@googlegroups.com");
		emailListeners.setProperty("student_management", "WISE3-student-management@googlegroups.com");
		emailListeners.setProperty("authoring", "WISE3-authoring-help@googlegroups.com");
		emailListeners.setProperty("feedback", "WISE3-feedback@googlegroups.com");
		emailListeners.setProperty("other", "WISE3-other@googlegroups.com");

		uiHTMLProperties = new Properties();
		uiHTMLProperties.setProperty("issuetypes.TROUBLE_LOGGING_IN", "Trouble Signing In");
		uiHTMLProperties.setProperty("issuetypes.NEED_HELP_USING_WISE", "Need Help Using WISE");
		uiHTMLProperties.setProperty("issuetypes.PROJECT_PROBLEMS", "Problems with a Project");
		uiHTMLProperties.setProperty("issuetypes.STUDENT_MANAGEMENT", "Student Management");
		uiHTMLProperties.setProperty("issuetypes.AUTHORING", "Need Help with Authoring");
		uiHTMLProperties.setProperty("issuetypes.FEEDBACK", "Feedback to WISE");
		uiHTMLProperties.setProperty("issuetypes.OTHER", "Other Problem");
		uiHTMLProperties.setProperty("operatingsystems.MAC_OS9", "Mac OS 9");
		uiHTMLProperties.setProperty("operatingsystems.MAC_OSX_TIGER", "Mac OS X (10.4) Tiger");
		uiHTMLProperties.setProperty("operatingsystems.MAC_OSX_LEOPARD", "Mac OS X (10.5) Leopard");
		uiHTMLProperties.setProperty("operatingsystems.WINDOWS_VISTA", "Windows Vista");
		uiHTMLProperties.setProperty("operatingsystems.WINDOWS_2K_NT", "Windows 2000/NT");
		uiHTMLProperties.setProperty("operatingsystems.WINDOWS_XP", "Windows XP");
		uiHTMLProperties.setProperty("operatingsystems.WINDOWS_98", "Windows 98");
		uiHTMLProperties.setProperty("operatingsystems.LINUX", "Linux");
		uiHTMLProperties.setProperty("operatingsystems.OTHER", "Other or Not Sure");
		uiHTMLProperties.setProperty("webbrowsers.FIREFOX", "Firefox");
		uiHTMLProperties.setProperty("webbrowsers.IE", "Internet Explorer");
		uiHTMLProperties.setProperty("webbrowsers.SAFARI", "Safari");
		uiHTMLProperties.setProperty("webbrowsers.OPERA", "Opera");
		uiHTMLProperties.setProperty("webbrowsers.NETSCAPE", "Netscape");
		uiHTMLProperties.setProperty("webbrowsers.OTHER", "Other");
		
		contactDetails.setName(NAME);
		contactDetails.setEmail(EMAIL);
		contactDetails.setProjectName(PROJECT_NAME);
		contactDetails.setProjectId(new Long(2));
		contactDetails.setIssuetype(issueType);
		contactDetails.setSummary(SUMMARY);
		contactDetails.setDescription(DESCRIPTION);
		contactDetails.setEmaillisteners(emailListeners);
		contactDetails.setUsersystem("Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11");
		
		
		contactController = new ContactWiseProjectController();
		contactController.setJavaMail(mockMail);
		contactController.setUiHTMLProperties(uiHTMLProperties);
		contactController.setSuccessView(SUCCESS);
		contactController.setFormView(FORM);
	}
	
	public void testOnSubmit_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_leopard_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_tiger_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_os9_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_vista_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_xp_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_2k_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_98_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_linux_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_other_success() throws Exception {
		String[] recipients = RECIPIENTS; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_trouble_logging_in_success() throws Exception {
		issueType = IssueType.TROUBLE_LOGGING_IN;
		contactDetails.setIssuetype(issueType);
		
		String[] recipients = {"WISE3-trouble-logging-in@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_authoring_success() throws Exception {
		issueType = IssueType.AUTHORING;
		contactDetails.setIssuetype(issueType);
		
		String[] recipients = {"WISE3-authoring-help@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_feedback_success() throws Exception {
		issueType = IssueType.FEEDBACK;
		contactDetails.setIssuetype(issueType);
		
		String[] recipients = {"WISE3-feedback@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_help_using_success() throws Exception {
		issueType = IssueType.NEED_HELP_USING_WISE;
		contactDetails.setIssuetype(issueType);
		
		String[] recipients = {"WISE3-need-help-using@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_issue_other_success() throws Exception {
		issueType = IssueType.OTHER;
		contactDetails.setIssuetype(issueType);
		
		String[] recipients = {"WISE3-other@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_project_problems_success() throws Exception {
		issueType = IssueType.PROJECT_PROBLEMS;
		contactDetails.setIssuetype(issueType);
		
		String[] recipients = {"WISE3-project-problems@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_student_management_success() throws Exception {
		issueType = IssueType.STUDENT_MANAGEMENT;
		contactDetails.setIssuetype(issueType);
		
		String[] recipients = {"WISE3-student-management@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + EMAIL + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = EMAIL;
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
	
	public void testOnSubmit_from_student() throws Exception {
		issueType = IssueType.STUDENT_MANAGEMENT;
		contactDetails.setIssuetype(issueType);

		User user = new UserImpl();
		user.setUserDetails(new StudentUserDetails());
		contactDetails.setIsStudent(user);
		String[] recipients = {"WISE3-student-management@googlegroups.com"}; 
		String subject = "[Contact WISE Project] " + issueType + ": " + SUMMARY;
		String message = "Contact WISE Project Request\n" +
		 "=================\n" + 
		 "Name: " + NAME + "\n" + 
		 "Email: " + "student@wise.com" + "\n" + 
		 "Project Name: " + "Airbags" + "\n" +
		 "Project ID: " + "2" + "\n" +
		 "Issue Type: " + issueType + "\n" +
		 "Summary: " + SUMMARY + "\n" + 
		 "Description: " + DESCRIPTION + "\n" + 
		 "User System: " + "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11" + "\n";
		String from = "student@wise.com";
		String[] cc = {from};

		mockMail.postMail(aryEq(recipients), eq(subject), eq(message), eq(from), aryEq(cc));
		replay(mockMail);
		ModelAndView modelAndView = contactController.onSubmit(request,
				response, contactDetails, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		verify(mockMail);
	}
}
