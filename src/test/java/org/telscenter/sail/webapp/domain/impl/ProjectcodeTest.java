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
package org.telscenter.sail.webapp.domain.impl;

import junit.framework.TestCase;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ProjectcodeTest extends TestCase {

	private String runcode = "saphire8886";
	private String period = "6";
	private String projectcodeString = "saphire8886-6";
	private String projectcodeWithWhiteSpace = "  Whale7741-4     ";
	private String projectcodeWithWhiteSpaceRemoved = "Whale7741-4";
	private Projectcode projectcode, projectcode2;
	private final String[] ILLEGAL_PROJECTCODES = {"Owl0896", "Owl0896-", "-3", "-", ""};	
	
	@Override
	public void setUp() {
		// test to make sure that both constructors work
		projectcode = new Projectcode(runcode, period);
		projectcode2 = new Projectcode(projectcodeString);
	}
	
	public void testGetRuncode() {
		String retrievedRuncode = projectcode.getRuncode();
		assertEquals(runcode, retrievedRuncode);
		
		String retrievedRuncode2 = projectcode2.getRuncode();
		assertEquals(runcode, retrievedRuncode2);
	}
	
	public void testGetRunPeriod() {
		String retrievedRunPeriod = projectcode.getRunPeriod();
		assertEquals(period, retrievedRunPeriod);
		
		String retrievedRunPeriod2 = projectcode2.getRunPeriod();
		assertEquals(period, retrievedRunPeriod2);
	}
	
	public void testIsLegalProjectcode() {
		for (String illegalProjectcode : ILLEGAL_PROJECTCODES) {
			Projectcode projectcode = new Projectcode(illegalProjectcode);
			assertFalse(projectcode.isLegalProjectcode());
		}
	}
	
	public void testRemovedWhiteSpace(){
		Projectcode projectcode = new Projectcode(projectcodeWithWhiteSpace);
		assertEquals(projectcodeWithWhiteSpaceRemoved, projectcode.getProjectcode());
		
		projectcode = new Projectcode("  Whale7741", "4  ");
		assertEquals(projectcodeWithWhiteSpaceRemoved, projectcode.getProjectcode());
		
		projectcode.setProjectcode(projectcodeWithWhiteSpace);
		assertEquals(projectcodeWithWhiteSpaceRemoved, projectcode.getProjectcode());
	}
}
