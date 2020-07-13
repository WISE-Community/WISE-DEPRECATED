package org.wise.portal.presentation.web.controllers.notebook;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;

import org.easymock.EasyMockRunner;
import org.easymock.TestSubject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.vle.domain.work.NotebookItem;

@RunWith(EasyMockRunner.class)
public class NotebookControllerTest extends APIControllerTest {

  @TestSubject
  private NotebookController controller = new NotebookController();

  private List<NotebookItem> notebookItems;

  private NotebookItem item1, item2;

  @Before
  public void setup() {
    notebookItems = new ArrayList<>();
    item1 = new NotebookItem();
    item2 = new NotebookItem();
    notebookItems.add(item1);
    notebookItems.add(item2);
  }

  @Test
  public void getNotebookItems_TeacherHasRunReadPermission_ReturnItemsForRun()
      throws ObjectNotFoundException, AccessDeniedException {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    expect(runService.hasReadPermission(teacherAuth, run1)).andReturn(true);
    expect(vleService.getNotebookItems(run1)).andReturn(notebookItems);
    replay(runService, vleService);
    List<NotebookItem> items = controller.getNotebookItems(runId1, teacherAuth, null);
    assertEquals(items.size(), 2);
    verify(runService, vleService);
  }

  @Test
  public void getAllNotebookItems_TeacherHasRunReadPermissionAllItems_ReturnAllItems()
      throws AccessDeniedException, ObjectNotFoundException {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    expect(runService.hasReadPermission(teacherAuth, run1)).andReturn(true);
    expect(vleService.getNotebookItemsExport(run1)).andReturn(notebookItems);
    replay(runService, vleService);
    List<NotebookItem> items = controller.getNotebookItems(runId1, teacherAuth, "allNotebookItems");
    assertEquals(items.size(), 2);
    verify(runService, vleService);
  }

  @Test
  public void getLatestNotebookItems_TeacherHasRunReadPermissionLatestItems_ReturnLatestItems()
      throws AccessDeniedException, ObjectNotFoundException {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    expect(runService.hasReadPermission(teacherAuth, run1)).andReturn(true);
    expect(vleService.getLatestNotebookItemsExport(run1)).andReturn(notebookItems);
    replay(runService, vleService);
    List<NotebookItem> items = controller.getNotebookItems(runId1, teacherAuth,
        "latestNotebookItems");
    assertEquals(items.size(), 2);
    verify(runService, vleService);
  }

  @Test
  public void getNotebookItems_StudentIsInWorkgroup_ReturnItemsForWorkgroup()
      throws ObjectNotFoundException, AccessDeniedException {
    expect(runService.retrieveById(runId1)).andReturn(run1).times(3);
    expect(workgroupService.retrieveById(workgroup1.getId())).andReturn(workgroup1).times(2);
    expect(userService.retrieveUserByUsername(student1UserDetails.getUsername()))
        .andReturn(student1);
    expect(workgroupService.isUserInWorkgroupForRun(student1, run1, workgroup1)).andReturn(true);
    expect(vleService.getNotebookItems(run1, workgroup1)).andReturn(notebookItems);
    replay(runService, workgroupService, userService, vleService);
    List<NotebookItem> items = controller.getNotebookItems(runId1, workgroup1.getId(), studentAuth);
    assertEquals(items.size(), 2);
    verify(runService, vleService);
  }
}
