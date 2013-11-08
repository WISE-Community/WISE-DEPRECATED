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

import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.telscenter.sail.webapp.domain.Run;

import junit.framework.TestCase;

/**
 * @author Hiroki Terashima
 * @version $Id: $
 */
public class RunImplTest extends TestCase {

	private Run run;
	
	private User studentUser = new UserImpl();
	
	private User studentUser_not_associated_with_run;
	
	private static final String[] periodnames = {"1", "2", "3", "6", "9", "10", "sunflower"};
	
	@Override
	protected void setUp() {
		run = new RunImpl();
		Set<Group> periods = new TreeSet<Group>();
		for (String periodname : periodnames) {
			Group period = new PersistentGroup();
			period.setName(periodname);
			if (periodname.equals("1")) {
			    period.addMember(studentUser);
			}
			periods.add(period);
		}
		run.setPeriods(periods);
	}
	
	@Override
	protected void tearDown() {
		run = null;
	}
	
	public void testGetPeriods() {
		// test that the periods appear in alphabetical order by period's name
		TreeSet<Group> periods = (TreeSet<Group>) run.getPeriods();
		int i = 0;
		for (Group period : periods) {
			assertEquals(period.getName(), periodnames[i]);
			i++;
		}
	}
	
	public void testIsStudentAssociatedToThisRun() {
		assertTrue(run.isStudentAssociatedToThisRun(studentUser));
		assertFalse(run.isStudentAssociatedToThisRun(
				studentUser_not_associated_with_run));
	}

}
