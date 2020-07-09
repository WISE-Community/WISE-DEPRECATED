package org.wise.vle.web.wise5;

import java.util.HashMap;
import java.util.List;

import org.easymock.EasyMockRunner;
import org.easymock.TestSubject;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.presentation.web.controllers.APIControllerTest;

@RunWith(EasyMockRunner.class)
public class TeacherDataControllerTest extends APIControllerTest {

  @TestSubject
  private TeacherDataController controller = new TeacherDataController();

  @Test
  public void getWISE5TeacherData_getStudentWork_shouldReturnHashMap() {
    Boolean getStudentWork = true;
    Boolean getEvents = false;
    Boolean getAnnotations = false;
    Integer id = null;
    Integer runId = runId1.intValue();
    Integer periodId = null;
    Integer workgroupId = null;
    boolean isAutoSave = false;
    boolean isSubmit = false;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String event = null;
    Integer fromWorkgroupId = null;
    Integer toWorkgroupId = null;
    Integer studentWorkId = null;
    String localNotebookItemId = null;
    Integer notebookItemId = null;
    String annotationType = null;
    List<JSONObject> components = null;
    Boolean onlyGetLatest = false;
    HashMap<String, Object> data = controller.getWISE5TeacherData(getStudentWork, getEvents,
        getAnnotations, id, runId, periodId, workgroupId, isAutoSave, isSubmit, nodeId, componentId,
        componentType, context, category, event, fromWorkgroupId, toWorkgroupId, studentWorkId,
        localNotebookItemId, notebookItemId, annotationType, components, onlyGetLatest);
    System.out.println(data);
  }
}