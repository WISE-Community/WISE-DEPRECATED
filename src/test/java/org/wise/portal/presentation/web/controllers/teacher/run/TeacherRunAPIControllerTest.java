package org.wise.portal.presentation.web.controllers.teacher.run;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.easymock.EasyMockRunner;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.vle.domain.status.StudentStatus;

@RunWith(EasyMockRunner.class)
public class TeacherRunAPIControllerTest extends APIControllerTest {

  @TestSubject
  private TeacherRunAPIController controller = new TeacherRunAPIController();

  @Test
  public void getStudentStatus_TeacherNotAssociatedWithRun_ReturnEmptyList()
      throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    expect(runService.retrieveById(runId3)).andReturn(run3);
    replay(userService, runService);
    List<StudentStatus> studentStatuses = controller.getStudentStatus(teacherAuth, runId3);
    assertEquals(0, studentStatuses.size());
    verify(userService, runService);
  }

  @Test
  public void getStudentStatus_TeacherIsAssociatedWithRun_ReturnStatuses()
      throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    List<StudentStatus> studentStatuses = new ArrayList<StudentStatus>();
    expect(vleService.getStudentStatusesByRunId(runId1)).andReturn(studentStatuses);
    replay(userService, runService, vleService);
    List<StudentStatus> studentStatusesResponse = controller.getStudentStatus(teacherAuth, runId1);
    assertEquals(studentStatuses, studentStatusesResponse);
    verify(userService, runService, vleService);
  }
}
