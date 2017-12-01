/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.wise.portal.spring.SpringConfiguration;
import org.wise.portal.spring.impl.SpringConfigurationImpl;

/**
 * Allows testers to perform data store integration tests. Provides transactions and access
 * to the Spring Beans.
 *
 * @author Cynick Young
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = {
  "classpath:configurations/dispatcherServletContexts.xml",
  "classpath:configurations/applicationContexts.xml"
})
public abstract class AbstractTransactionalDbTests extends
    AbstractTransactionalJUnit4SpringContextTests {

  private static final SpringConfiguration SPRING_CONFIG = new SpringConfigurationImpl();

  protected SessionFactory sessionFactory;

  protected HibernateFlusher toilet;

  //@Override
  protected void onSetUpBeforeTransaction() throws Exception {
    //super.onSetUpBeforeTransaction();
    this.toilet = new HibernateFlusher();
    this.toilet.setSessionFactory(this.sessionFactory);
  }

  //@Override
  protected String[] getConfigLocations() {
    return SPRING_CONFIG.getRootApplicationContextConfigLocations();
  }

  public void setSessionFactory(SessionFactory sessionFactory) {
    this.sessionFactory = sessionFactory;
  }
}
