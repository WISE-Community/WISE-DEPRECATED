/**
 * Copyright (c) 2008-2018 Regents of the University of California (Regents). Created
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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.List;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.ui.ModelMap;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.service.run.impl.RunServiceImpl;

import junit.framework.TestCase;

/**
 * @author patrick lawler
 */
@RunWith(EasyMockRunner.class)
public class FindProjectRunsControllerTest extends TestCase {

  @TestSubject
  private FindProjectRunsController controller = new FindProjectRunsController();

  @Mock
  private RunServiceImpl runService;

  private ModelMap modelMap = new ModelMap();

  Run run1;
  Long run1Id = 1L;
  String run1Name = "Run 1";

  @Before
  public void setUp() {
    run1 = new RunImpl();
    run1.setName(run1Name);
  }

  @After
  public void tearDown() {
    run1 = null;
  }

  @Test
  public void handleGET_byRunId_OK() throws ObjectNotFoundException {
    EasyMock.expect(runService.retrieveById(run1Id)).andReturn(run1);
    EasyMock.replay(runService);
    String view = controller.findRun("runId", run1Id.toString(), modelMap);
    assertEquals("admin/run/manageprojectruns", view);
    List<Run> resultRunList = (List<Run>) modelMap.get("runList");
    assertEquals(1, resultRunList.size());
    Run resultFirstRun = resultRunList.get(0);
    assertEquals(run1Name, resultFirstRun.getName());
    EasyMock.verify(runService);
  }

  // TODO: test handleGET_byProjectId_OK
  // TODO: test handleGET_byTeacherUsername_OK
  // TODO: test handleGET_byRunTitle_OK
}
