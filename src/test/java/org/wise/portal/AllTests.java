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
package org.wise.portal;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

/**
 * This is the all encompassing AllTests that includes all the other test suites
 * from every package. This file needs to be kept up-to-date by hand every time
 * a new package of unit tests is added. This will test the entire application.
 * 
 * @author Cynick Young
 * @author Laurel Williams
 * @author Hiroki Terashima

 * @version $Id$
 */
@RunWith(Suite.class)
@Suite.SuiteClasses({
	   org.wise.portal.dao.authentication.impl.AllTests.class,
	   org.wise.portal.dao.offering.impl.AllTests.class,
	   org.wise.portal.dao.project.impl.AllTests.class,
	   org.wise.portal.dao.premadecomment.impl.AllTests.class,
	   org.wise.portal.domain.impl.AllTests.class,
	   org.wise.portal.domain.authentication.impl.AllTests.class,	   
	   org.wise.portal.domain.webservice.http.AllTests.class,
	   org.wise.portal.domain.run.AllTests.class,
       org.wise.portal.presentation.validators.AllTests.class,
	   org.wise.portal.presentation.web.controllers.AllTests.class,
	   org.wise.portal.service.impl.AllTests.class,
	   org.wise.portal.service.offering.impl.AllTests.class,
	   org.wise.portal.service.module.impl.AllTests.class,
	   org.wise.portal.service.student.impl.AllTests.class,
	   org.wise.portal.service.project.impl.AllTests.class,
	   org.wise.portal.domain.premadecomment.impl.AllTests.class,
	   org.wise.portal.dao.newsitem.impl.AllTests.class,
	   org.wise.portal.domain.newsitem.impl.AllTests.class,
	   org.wise.portal.service.newsitem.impl.AllTests.class,
	   org.wise.portal.service.group.impl.GroupServiceImplTest.class,
	   org.wise.portal.service.workgroup.impl.WorkgroupServiceImplTest.class
})

public class AllTests {
}
