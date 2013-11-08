/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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

package net.sf.sail.webapp.mail;

import javax.mail.MessagingException;

import net.sf.sail.webapp.junit.AbstractSpringTests;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.internal.runners.TestClassRunner;
import org.junit.runner.RunWith;

/**
 * FUNCTIONAL TEST
 * 
 * Tests sending a message using the information specified in the
 * sendmail.properties file. This is really a functional test and not a unit
 * test. You do not need to run this test every time you run unit tests, but
 * only to check if your sendmail.properties are correct and to confirm that
 * emails are being sent out. Note that this test throws a NullPointerException
 * on setup if the sendmail.properties file is not found. Note also that if you
 * do not receive an email after this test, this may mean many things, which may
 * imply that your sendmail.properties are wrong, or may just imply that your
 * email got lost or your sendmail server is running slowly, etc. You may want
 * to make sure mail.debug=true is set in the properties file so that you can
 * see the debugging messages as the sendmail process is taking place. This can
 * help you debug some problems.
 * 
 * Steps for testing: 
 * (A) in /src/mail/resources, rename sendmail_sample.properties to sendmail.properties. 
 * (B) in src/main/resources/configurations/applicationContexts/pas/javamail.xml
 * uncomment the first line of the following and comment out the second line:
 * <!--util:properties id="javaMailProperties" location="classpath:sendmail.properties" /--> 
 * <util:properties id="javaMailProperties" location="classpath:sendmail_sample.properties" />
 * (C) change the properties in sendmail.properties to meet the requirements of
 * your sendmail server. you can find more information about this by looking at
 * the JavaMail api at http://java.sun.com/products/javamail/javadocs/index.html
 * (D) remove the Ignore annotations from this test 
 * (E) change the RECEIVER and FROM email addresses below to something appropriate (D) Run the tests and
 * ensure that you receive an email (probably you will want to set the receiver
 * email addresses to be yourself).
 * 
 * @author aperritano
 * @author Laurel Williams
 * @version $Id: $
 * 
 */
@RunWith(TestClassRunner.class)
public class JavaMailTest extends AbstractSpringTests {

	private JavaMailHelper mailHelper;

	private static final String RECEIVER = "test@test.ca";
	private static final String RECEIVER2 = "test@test.com";
	private static final String MESSAGE = "test portal message";
	private static final String SUBJECT = "test portal subject";
	private static final String FROM = "test@test.ca";

	private String[] recipients;

	/**
	 * @throws Exception
	 */
	@Before
	public void callSetUp() throws Exception {
		this.setUp();
		this.onSetUp();
	}

	/**
	 * @see org.springframework.test.AbstractSingleSpringContextTests#onSetUp()
	 */
	protected void onSetUp() throws Exception {
		super.onSetUp();
		mailHelper = (JavaMailHelper) this.applicationContext
				.getBean("javaMail");
		recipients = new String[2];
		recipients[0] = RECEIVER;
	}

	@After
	public void callTearDown() throws Exception {
		this.tearDown();
		this.onTearDown();
	}

	/**
	 * @see org.springframework.test.AbstractSingleSpringContextTests#onTearDown()
	 */
	protected void onTearDown() throws Exception {
		super.onTearDown();
		mailHelper = null;
		recipients = null;
	}

	/**
	 * tests sending a basic message.
	 * 
	 * @throws Exception
	 */
	@Test
	@Ignore
	public void testSendBasicMessage() throws Exception {
		try {
			mailHelper.postMail(recipients, SUBJECT, MESSAGE, FROM);
		} catch (MessagingException e) {
			e.printStackTrace();
			fail();
		}
	}

	/**
	 * tests sending a message to multiple email recipients.
	 */
	@Test
	@Ignore
	public void testSendMultiMessage() {
		recipients[1] = RECEIVER2;
		try {
			mailHelper.postMail(recipients, SUBJECT, MESSAGE, FROM);
		} catch (MessagingException e) {
			e.printStackTrace();
			fail();
		}
	}

}
