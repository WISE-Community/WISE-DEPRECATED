package org.wise.portal.presentation.web.controllers.author.project;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.util.HashMap;

import org.easymock.EasyMock;
import org.easymock.TestSubject;
import org.json.JSONException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.easymock.PowerMock;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

@RunWith(PowerMockRunner.class)
@PrepareForTest({ ControllerUtil.class })
public class WISE5AuthorProjectControllerTest extends APIControllerTest {

  @TestSubject
  private WISE5AuthorProjectController wise5AuthorProjectController =
      new WISE5AuthorProjectController();
  
  @Test
  public void saveProject_whenNotSignedIn_shouldReturnNotSignedInError() {
    try {
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(new ProjectImpl());
      replay(projectService);
      PowerMock.mockStatic(ControllerUtil.class);
      expect(ControllerUtil.getSignedInUser()).andReturn(null);
      PowerMock.replay(ControllerUtil.class);
      String commitMessage = "";
      String projectJSONString = "{}";
      HashMap<String, Object> map = wise5AuthorProjectController.saveProject(teacherAuth, projectId,
          commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("notSignedIn", map.get("messageCode"));
    } catch(Exception e) {
      fail();
    }
  }
  
  @Test
  public void saveProject_whenNotAllowedToEdit_shouldReturnNotAllowedToEditError() {
    try {
      expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
      replay(userService);
      Project project = new ProjectImpl();
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, teacher1)).andReturn(false);
      replay(projectService);
      String commitMessage = "";
      String projectJSONString = "{}";
      HashMap<String, Object> map = wise5AuthorProjectController.saveProject(teacherAuth, projectId,
          commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("notAllowedToEditThisProject", map.get("messageCode"));
    } catch(Exception e) {
      fail();
    }
  }

  @Test
  public void saveProject_whenErrorSavingProjectFile_shouldReturnErrorSavingProject() {
    try {
      expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
      replay(userService);
      Project project = new ProjectImpl();
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, teacher1)).andReturn(true);
      String projectJSONString = "{}";
      projectService.saveProjectFile(project, projectJSONString);
      EasyMock.expectLastCall().andThrow(new IOException());
      replay(projectService);
      String commitMessage = "";
      HashMap<String, Object> map = wise5AuthorProjectController.saveProject(teacherAuth, projectId,
          commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("errorSavingProject", map.get("messageCode"));
    } catch(Exception e) {
      fail();
    }
  }

  @Test
  public void saveProject_whenErrorSavingProjectToDatabase_shouldReturnErrorSavingProject() {
    try {
      expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
      replay(userService);
      Project project = new ProjectImpl();
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, teacher1)).andReturn(true);
      String projectJSONString = "{\"metadata\":{\"title\":\"New Title\"}}";
      projectService.saveProjectFile(project, projectJSONString);
      EasyMock.expectLastCall();
      projectService.updateMetadataAndLicenseIfNecessary(
          EasyMock.anyObject(), EasyMock.anyObject());
      EasyMock.expectLastCall();
      projectService.saveProjectToDatabase(project, teacher1, projectJSONString);
      EasyMock.expectLastCall().andThrow(new JSONException(""));
      replay(projectService);
      String commitMessage = "";
      HashMap<String, Object> map = wise5AuthorProjectController.saveProject(teacherAuth, projectId,
          commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("errorSavingProject", map.get("messageCode"));
    } catch(Exception e) {
      fail();
    }
  }

  @Test
  public void saveProject_NoErrors_shouldReturnProjectSaved() {
    try {
      expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
      replay(userService);
      Project project = new ProjectImpl();
      Long projectId = 1L;
      project.setMetadata("{\"title\":\"Old Title\"}");
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, teacher1)).andReturn(true);
      String projectJSONString = "{\"metadata\":{\"title\":\"New Title\"}}";
      projectService.saveProjectFile(project, projectJSONString);
      EasyMock.expectLastCall();
      projectService.updateMetadataAndLicenseIfNecessary(
          EasyMock.anyObject(), EasyMock.anyObject());
      EasyMock.expectLastCall();
      projectService.saveProjectToDatabase(project, teacher1, projectJSONString);
      EasyMock.expectLastCall();
      replay(projectService);
      String commitMessage = "";
      HashMap<String, Object> map = wise5AuthorProjectController.saveProject(teacherAuth, projectId,
          commitMessage, projectJSONString);
      assertEquals("success", map.get("status"));
      assertEquals("projectSaved", map.get("messageCode"));
    } catch(Exception e) {
      e.printStackTrace();
      fail();
    }
  }
}