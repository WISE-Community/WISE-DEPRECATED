package org.wise.portal.presentation.web.controllers.teacher.management;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import org.easymock.EasyMockRunner;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.impl.ChangePeriodParameters;
import org.wise.portal.presentation.web.controllers.APIControllerTest;

@RunWith(EasyMockRunner.class)
public class ManageStudentsControllerTest extends APIControllerTest {

  @TestSubject
  private ManageStudentsController controller = new ManageStudentsController();

  @Test
  public void changeWorkgroupPeriod_TeacherWithNoWritePermission_ReturnAccessDenied()
      throws PeriodNotFoundException, ObjectNotFoundException {
    expect(runService.hasWritePermission(teacherAuth, run3)).andReturn(false);
    replay(runService);
    ChangePeriodParameters params = new ChangePeriodParameters();
    params.setRun(run3);
    String result = controller.changeWorkgroupPeriod(params, workgroup1.getId(), teacherAuth);
    assertEquals("errors/accessdenied", result);
    verify(runService);
  }

  @Test
  public void changeWorkgroupPeriod_TeacherWithPermission_ReturnSuccess()
      throws PeriodNotFoundException, ObjectNotFoundException {
    expect(runService.hasWritePermission(teacherAuth, run1)).andReturn(true);
    replay(runService);
    ChangePeriodParameters params = new ChangePeriodParameters();
    params.setRun(run1);
    params.setNewPeriod("2");
    params.setWorkgroup(workgroup1);
    expect(workgroupService.retrieveById(workgroup1.getId())).andReturn(workgroup1);
    workgroupService.changePeriod(workgroup1, run1Period2);
    expectLastCall();
    replay(workgroupService);
    String result = controller.changeWorkgroupPeriod(params, workgroup1.getId(), teacherAuth);
    assertEquals("teacher/management/changestudentperiodsuccess", result);
    verify(runService, workgroupService);
  }
}
