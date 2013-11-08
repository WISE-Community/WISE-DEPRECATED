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
package org.telscenter.sail.webapp.domain.authentication.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import org.telscenter.sail.webapp.domain.authentication.Schoollevel;

import junit.framework.TestCase;

/**
 * @author Sally Ahn
 * @version $Id$
 */
public class TeacherUserDetailsTest extends TestCase {

	private TeacherUserDetails teacherUserDetails = new TeacherUserDetails();
	
	private static final String FIRSTNAME = "test";
	
	private static final String LASTNAME = "teacher";
	
	private static final String CITY = "Berkeley";

	private static final String COUNTRY = "USA";

	private static final String STATE = "CA";

	private static final String[] CURRICULUMSUBJECTS = {"biology"};

	private static final Schoollevel SCHOOLLEVEL = Schoollevel.COLLEGE;

	private static final String SCHOOLNAME = "Berkeley";

	private static final Date SIGNUPDATE = Calendar.getInstance().getTime();
	
	private static final Date LASTLOGIN = Calendar.getInstance().getTime();
	
	private static final int NUMBEROFLOGINS = 3;
	
	private static final String DISPLAYNAME ="Mr. Right";
	
	public void testGetInfo() {
		teacherUserDetails.setCity(CITY);
		teacherUserDetails.setCountry(COUNTRY);
		teacherUserDetails.setState(STATE);
		teacherUserDetails.setCurriculumsubjects(CURRICULUMSUBJECTS);
		teacherUserDetails.setFirstname(FIRSTNAME);
		teacherUserDetails.setLastname(LASTNAME);
		teacherUserDetails.setSchoollevel(SCHOOLLEVEL);
		teacherUserDetails.setSchoolname(SCHOOLNAME);
		teacherUserDetails.setSignupdate(SIGNUPDATE);
		teacherUserDetails.setLastLoginTime(LASTLOGIN);
		teacherUserDetails.setNumberOfLogins(NUMBEROFLOGINS);
		teacherUserDetails.setDisplayname(DISPLAYNAME);
		
		HashMap<String, Object> infoMap = teacherUserDetails.getInfo();
		
		assertEquals(infoMap.get("City"), CITY);
		assertEquals(infoMap.get("Country"), COUNTRY);
		assertEquals(infoMap.get("State"), STATE);
		assertEquals(infoMap.get("Curriculum Subjects"), "biology ");
		assertEquals(infoMap.get("First Name"), FIRSTNAME);
		assertEquals(infoMap.get("Last Name"), LASTNAME);
		assertEquals(infoMap.get("School Level"), SCHOOLLEVEL.toString());
		assertEquals(infoMap.get("School Name"), SCHOOLNAME);
		assertEquals(infoMap.get("Sign Up Date"), SIGNUPDATE);
		assertEquals(infoMap.get("Last Login"), LASTLOGIN);
		assertEquals(infoMap.get("Number of Logins"), Integer.toString(NUMBEROFLOGINS));
		assertEquals(infoMap.get("Display Name"), DISPLAYNAME);
	}

}
