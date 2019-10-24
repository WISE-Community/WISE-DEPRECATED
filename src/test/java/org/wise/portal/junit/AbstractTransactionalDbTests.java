/**
 * Copyright (c) 2006-2019 Encore Research Group, University of Toronto
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.junit;

import org.hibernate.SessionFactory;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * Allows testers to perform data store integration tests. Provides transactions and access
 * to the Spring Beans.
 *
 * @author Cynick Young
 * @author Hiroki Terashima
 */
@RunWith(SpringRunner.class)
@WebAppConfiguration
public abstract class AbstractTransactionalDbTests extends
    AbstractTransactionalJUnit4SpringContextTests {

  @Autowired
  protected SessionFactory sessionFactory;

  protected HibernateFlusher toilet;

  public void setUp() throws Exception {
    this.toilet = new HibernateFlusher();
    this.toilet.setSessionFactory(this.sessionFactory);
  }

  public User createUser() {
    PersistentUserDetails userDetails = new PersistentUserDetails();
    userDetails.setUsername("username");
    userDetails.setPassword("password");
    User user = new UserImpl();
    user.setUserDetails(userDetails);
    return user;
  }
}
