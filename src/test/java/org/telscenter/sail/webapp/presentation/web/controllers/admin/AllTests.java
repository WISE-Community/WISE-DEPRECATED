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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

/**
 * @author patrick lawler
 *
 */

@RunWith(Suite.class)
@Suite.SuiteClasses( {
	org.telscenter.sail.webapp.presentation.web.controllers.admin.ViewAllUsersControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.ListNewsItemsControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.AddNewsItemControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.EditNewsItemControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.FindProjectRunsByTeacherControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.FindProjectRunsControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.InfoControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.ManageAllProjectRunsControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.RemoveNewsItemControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.LookupTeacherControllerTest.class,
	org.telscenter.sail.webapp.presentation.web.controllers.admin.LookupStudentControllerTest.class
})
public class AllTests {

}
