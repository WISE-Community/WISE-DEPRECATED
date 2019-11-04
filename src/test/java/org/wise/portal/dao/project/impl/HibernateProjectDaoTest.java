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
package org.wise.portal.dao.project.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.dao.user.impl.HibernateUserDao;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * @author Hiroki Terashima
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateProjectDaoTest extends AbstractTransactionalDbTests {

  private Project project;

  @Autowired
  private HibernateProjectDao projectDao;

  @Autowired
  private HibernateUserDao userDao;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    project = new ProjectImpl();
    project.setId(1L);
    project.setName("Airbags");
    project.setDateCreated(new Date());
    User owner = createUser();
    userDao.save(owner);
    toilet.flush();
    project.setOwner(owner);
  }

  @Test
	public void save_NewProject_Success() {
		verifyDataStoreIsEmpty();
	  projectDao.save(project);
    toilet.flush();
		List<?> actualList = retrieveProjectListFromDb();
    assertEquals(1, actualList.size());
    Map<?, ?> projectMap = (Map<?, ?>) actualList.get(0);
    assertEquals(1L, projectMap.get("id"));
    assertEquals("Airbags", projectMap.get("name"));
	}

	private void verifyDataStoreIsEmpty() {
    assertTrue(retrieveProjectListFromDb().isEmpty());
  }

  private List<?> retrieveProjectListFromDb() {
    return jdbcTemplate.queryForList("SELECT * FROM " +
        ProjectImpl.DATA_STORE_NAME, (Object[]) null);
	}
}
